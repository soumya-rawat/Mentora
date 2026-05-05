import { prisma } from "@/lib/prisma";
import { parseResumeText } from "@/lib/utils/resume-parser";
import { matchKeywords, calculateATSScore, matchSkillsFromList } from "@/lib/utils/keyword-matcher";
import { analyzeBullets } from "@/lib/utils/bullet-analyzer";
import { scoreResumeSections, detectStrengths, detectWeaknesses } from "@/lib/utils/resume-scorer";
import { parseJobDescription } from "@/lib/utils/jd-parser";
import { classifyDomain } from "@/lib/utils/domain-classifier";
import { getAIProvider } from "@/lib/services/ai";
import { getRoleBySlug } from "@/lib/constants/roles";
import {
  ResumeAnalysisResultV2,
  ResumeSectionScore,
  JDMatchResult,
  JDSkillMatch,
} from "@/types";

export async function uploadResume(
  userId: string,
  fileName: string,
  extractedText: string
) {
  const parsed = parseResumeText(extractedText);

  const upload = await prisma.resumeUpload.create({
    data: {
      userId,
      fileName,
      extractedText: parsed.text,
      wordCount: parsed.wordCount,
    },
  });

  return upload;
}

export async function analyzeResume(
  resumeUploadId: string,
  targetRoleSlug: string
): Promise<ResumeAnalysisResultV2 & { id: string }> {
  const upload = await prisma.resumeUpload.findUnique({
    where: { id: resumeUploadId },
  });

  if (!upload) throw new Error("Resume upload not found");

  const role = getRoleBySlug(targetRoleSlug);
  if (!role) throw new Error("Invalid role slug");

  // ── Step 1: Parse resume (enhanced) ──
  const parsed = parseResumeText(upload.extractedText);

  // ── Step 2: Analyze bullet quality ──
  const bulletAnalysis = analyzeBullets(upload.extractedText);

  // ── Step 3: Deep section scoring ──
  const sectionAnalyses = scoreResumeSections(parsed.sections, bulletAnalysis);

  // ── Step 4: Detect strengths & weaknesses ──
  const hasLinks = parsed.links.length > 0;
  const strengths = detectStrengths(
    parsed.sections, sectionAnalyses, bulletAnalysis, parsed.wordCount, hasLinks
  );
  const weaknesses = detectWeaknesses(
    parsed.sections, sectionAnalyses, bulletAnalysis, parsed.wordCount, parsed.detectedSections, upload.extractedText
  );

  // ── Step 5: Keyword matching (enhanced with context) ──
  const keywordMatches = matchKeywords(upload.extractedText, role);

  // ── Step 5b: Domain classification ──
  const foundSkills = keywordMatches.filter((k) => k.found).map((k) => k.skill);
  const domain = classifyDomain(upload.extractedText, foundSkills);

  // ── Step 6: ATS score (with formatting penalties) ──
  const atsScore = calculateATSScore(
    keywordMatches,
    parsed.detectedSections,
    parsed.hasQuantifiedAchievements,
    parsed.hasActionVerbs,
    parsed.hasContactInfo,
    parsed.formatting
  );

  // ── Step 7: Legacy section scores (for backwards-compatible UI) ──
  const sectionScores: ResumeSectionScore[] = sectionAnalyses.map((sa) => ({
    section: sa.section,
    found: sa.found,
    score: sa.score,
    feedback: sa.feedback,
  }));

  // ── Step 8: Generate suggestions (deterministic) ──
  const suggestions: string[] = [];
  const missingKeywords = keywordMatches
    .filter((k) => !k.found)
    .sort((a, b) => b.weight - a.weight);

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Add these high-priority keywords: ${missingKeywords.slice(0, 5).map((k) => k.skill).join(", ")}`
    );
  }
  if (!parsed.hasQuantifiedAchievements) {
    suggestions.push("Add quantified achievements (e.g., 'Improved load time by 40%', 'Served 10K+ users')");
  }
  if (!parsed.hasActionVerbs) {
    suggestions.push("Start bullet points with strong action verbs (Built, Designed, Implemented, Optimized)");
  }
  if (!parsed.hasContactInfo) {
    suggestions.push("Add your email address and LinkedIn/GitHub links");
  }
  const missingSections = ["education", "skills", "projects"].filter(
    (s) => !parsed.detectedSections.includes(s)
  );
  if (missingSections.length > 0) {
    suggestions.push(`Add missing sections: ${missingSections.join(", ")}`);
  }
  if (parsed.wordCount < 200) {
    suggestions.push("Your resume seems too short. Aim for 300-600 words for a fresher resume.");
  } else if (parsed.wordCount > 800) {
    suggestions.push("Your resume might be too long. Try to keep it to 1 page (400-600 words) as a fresher.");
  }

  // ── Step 9: AI-enhanced feedback ──
  const aiProvider = getAIProvider();

  // Get user context for AI
  const user = await prisma.user.findFirst({
    where: { resumeUploads: { some: { id: resumeUploadId } } },
    select: { yearOfStudy: true, collegeTier: true },
  });
  const userContext = {
    yearOfStudy: user?.yearOfStudy || 3,
    collegeTier: user?.collegeTier || "tier-2",
  };

  const feedback = await aiProvider.generateResumeFeedback({
    extractedText: upload.extractedText,
    detectedSections: parsed.detectedSections,
    keywordMatches: keywordMatches.map((k) => ({ skill: k.skill, found: k.found })),
    atsScore,
    targetRole: role,
  });

  // ── Step 10: AI rewrite weak bullets ──
  const weakBullets = bulletAnalysis
    .filter((b) => b.rating === "weak")
    .slice(0, 6)
    .map((b) => ({ text: b.text, issues: b.issues }));

  const rewrittenBullets = weakBullets.length > 0
    ? await aiProvider.rewriteBulletPoints({
        bullets: weakBullets,
        targetRole: role,
        jobDescription: null,
        userContext,
      })
    : [];

  // ── Step 11: AI smart suggestions ──
  const smartSuggestions = await aiProvider.generateSmartSuggestions({
    parsedResume: parsed,
    bulletAnalysis,
    strengths,
    weaknesses,
    keywordMatches,
    targetRole: role,
    jobDescription: null,
    userContext,
  });

  // ── Step 12: Formatting issues summary ──
  const formattingIssues: string[] = [];
  if (parsed.formatting.hasTables) formattingIssues.push("Tables detected — may cause ATS parsing errors");
  if (parsed.formatting.hasSpecialChars) formattingIssues.push(`Special characters found: ${parsed.formatting.specialCharsFound.join(" ")}`);
  if (parsed.formatting.bulletCount < 5) formattingIssues.push("Very few bullet points — use bullets to structure achievements");
  if (parsed.formatting.wordCount > 1500) formattingIssues.push("Resume may be too long — aim for 1 page as a fresher");

  // ── Step 13: Persist to DB ──
  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeUploadId,
      targetRoleSlug,
      atsScore,
      keywordMatches: JSON.parse(JSON.stringify(keywordMatches)),
      sectionScores: JSON.parse(JSON.stringify(sectionScores)),
      suggestions: JSON.parse(JSON.stringify(suggestions)),
      feedback,
      bulletAnalysis: JSON.parse(JSON.stringify(bulletAnalysis)),
      strengths: JSON.parse(JSON.stringify(strengths)),
      weaknesses: JSON.parse(JSON.stringify(weaknesses)),
      rewrittenBullets: JSON.parse(JSON.stringify(rewrittenBullets)),
      smartSuggestions: JSON.parse(JSON.stringify(smartSuggestions)),
      domain: JSON.parse(JSON.stringify(domain)),
      formattingIssues: JSON.parse(JSON.stringify(formattingIssues)),
    },
  });

  return {
    id: analysis.id,
    atsScore,
    keywordMatches,
    sectionScores,
    suggestions,
    feedback,
    bulletAnalysis,
    strengths,
    weaknesses,
    rewrittenBullets,
    smartSuggestions,
    domain,
    formattingIssues,
  };
}

// ── JD Matching ──────────────────────────────────────────────

export async function matchResumeToJD(
  resumeUploadId: string,
  jobDescription: string,
  userId: string
): Promise<JDMatchResult & { aiSuggestions: string; id: string }> {
  const upload = await prisma.resumeUpload.findUnique({
    where: { id: resumeUploadId },
  });

  if (!upload) throw new Error("Resume upload not found");
  if (upload.userId !== userId) throw new Error("Unauthorized");

  // ── Step 1: Parse JD ──
  const parsedJD = parseJobDescription(jobDescription);

  // ── Step 2: Parse resume ──
  const parsedResume = parseResumeText(upload.extractedText);

  // ── Step 3: Match skills ──
  const allJDSkills = [...parsedJD.requiredSkills, ...parsedJD.preferredSkills];
  const skillMatches = matchSkillsFromList(upload.extractedText, allJDSkills);

  const matchedSkills: JDSkillMatch[] = skillMatches.map((m) => ({
    skill: m.skill,
    required: parsedJD.requiredSkills.includes(m.skill),
    found: m.found,
    demonstrated: m.demonstrated,
  }));

  // ── Step 4: Calculate match score ──
  const requiredMatched = matchedSkills.filter((s) => s.required && s.found).length;
  const requiredTotal = matchedSkills.filter((s) => s.required).length;
  const preferredMatched = matchedSkills.filter((s) => !s.required && s.found).length;
  const preferredTotal = matchedSkills.filter((s) => !s.required).length;

  const requiredScore = requiredTotal > 0 ? (requiredMatched / requiredTotal) * 70 : 35;
  const preferredScore = preferredTotal > 0 ? (preferredMatched / preferredTotal) * 30 : 15;
  const matchScore = Math.round(requiredScore + preferredScore);

  // ── Step 5: Identify gaps ──
  const missingSkills = matchedSkills
    .filter((s) => s.required && !s.found)
    .map((s) => s.skill);
  const weakSkills = matchedSkills
    .filter((s) => s.found && !s.demonstrated)
    .map((s) => s.skill);

  // ── Step 6: Experience match ──
  const experienceMatch = parsedJD.experienceLevel
    ? /fresher|entry|0-[12]|junior/i.test(parsedJD.experienceLevel)
    : true; // If no level specified, assume it's fine

  // ── Step 7: Summary ──
  const summary = generateMatchSummary(matchScore, missingSkills, weakSkills, experienceMatch);

  // ── Step 8: AI feedback ──
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { yearOfStudy: true, collegeTier: true },
  });
  const userContext = {
    yearOfStudy: user?.yearOfStudy || 3,
    collegeTier: user?.collegeTier || "tier-2",
  };

  const jdMatchResult: JDMatchResult = {
    matchScore,
    matchedSkills,
    missingSkills,
    weakSkills,
    experienceMatch,
    summary,
  };

  const aiProvider = getAIProvider();
  const aiSuggestions = await aiProvider.generateJDFeedback({
    jdMatchResult,
    parsedResume,
    jobDescription,
    userContext,
  });

  // ── Step 9: Persist ──
  const jdMatch = await prisma.jDMatch.create({
    data: {
      resumeUploadId,
      jobDescription,
      matchScore,
      matchedSkills: JSON.parse(JSON.stringify(matchedSkills)),
      missingSkills: JSON.parse(JSON.stringify(missingSkills)),
      weakSkills: JSON.parse(JSON.stringify(weakSkills)),
      aiSuggestions,
    },
  });

  return {
    ...jdMatchResult,
    aiSuggestions,
    id: jdMatch.id,
  };
}

function generateMatchSummary(
  score: number,
  missing: string[],
  weak: string[],
  expMatch: boolean
): string {
  let summary = "";

  if (score >= 75) {
    summary = "Strong match — your resume covers most of what this JD requires.";
  } else if (score >= 50) {
    summary = "Moderate match — you have a foundation but there are notable gaps.";
  } else {
    summary = "Low match — significant skill gaps exist between your resume and this JD.";
  }

  if (missing.length > 0) {
    summary += ` Missing ${missing.length} required skill${missing.length > 1 ? "s" : ""}.`;
  }
  if (weak.length > 0) {
    summary += ` ${weak.length} skill${weak.length > 1 ? "s are" : " is"} mentioned but not demonstrated with examples.`;
  }
  if (!expMatch) {
    summary += " This role may require more experience than you currently have.";
  }

  return summary;
}
