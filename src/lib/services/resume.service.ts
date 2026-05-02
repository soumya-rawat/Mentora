import { prisma } from "@/lib/prisma";
import { parseResumeText } from "@/lib/utils/resume-parser";
import { matchKeywords, calculateATSScore } from "@/lib/utils/keyword-matcher";
import { getAIProvider } from "@/lib/services/ai";
import { getRoleBySlug } from "@/lib/constants/roles";
import { ResumeAnalysisResult, ResumeSectionScore } from "@/types";

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
): Promise<ResumeAnalysisResult & { id: string }> {
  const upload = await prisma.resumeUpload.findUnique({
    where: { id: resumeUploadId },
  });

  if (!upload) throw new Error("Resume upload not found");

  const role = getRoleBySlug(targetRoleSlug);
  if (!role) throw new Error("Invalid role slug");

  const parsed = parseResumeText(upload.extractedText);
  const keywordMatches = matchKeywords(upload.extractedText, role);

  const atsScore = calculateATSScore(
    keywordMatches,
    parsed.detectedSections,
    parsed.hasQuantifiedAchievements,
    parsed.hasActionVerbs,
    parsed.hasContactInfo
  );

  // Generate section scores
  const sectionScores: ResumeSectionScore[] = [
    "education",
    "experience",
    "skills",
    "projects",
    "contact",
  ].map((section) => {
    const found = parsed.detectedSections.includes(section);
    return {
      section,
      found,
      score: found ? 100 : 0,
      feedback: found
        ? `${section.charAt(0).toUpperCase() + section.slice(1)} section detected.`
        : `Missing ${section} section. Consider adding one.`,
    };
  });

  // Generate suggestions
  const suggestions: string[] = [];

  const missingKeywords = keywordMatches
    .filter((k) => !k.found)
    .sort((a, b) => b.weight - a.weight);

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Add these high-priority keywords: ${missingKeywords
        .slice(0, 5)
        .map((k) => k.skill)
        .join(", ")}`
    );
  }

  if (!parsed.hasQuantifiedAchievements) {
    suggestions.push(
      "Add quantified achievements (e.g., 'Improved load time by 40%', 'Served 10K+ users')"
    );
  }

  if (!parsed.hasActionVerbs) {
    suggestions.push(
      "Start bullet points with strong action verbs (Built, Designed, Implemented, Optimized)"
    );
  }

  if (!parsed.hasContactInfo) {
    suggestions.push("Add your email address and LinkedIn/GitHub links");
  }

  const missingSections = ["education", "skills", "projects"].filter(
    (s) => !parsed.detectedSections.includes(s)
  );
  if (missingSections.length > 0) {
    suggestions.push(
      `Add missing sections: ${missingSections.join(", ")}`
    );
  }

  if (parsed.wordCount < 200) {
    suggestions.push("Your resume seems too short. Aim for 300-600 words for a fresher resume.");
  } else if (parsed.wordCount > 800) {
    suggestions.push("Your resume might be too long. Try to keep it to 1 page (400-600 words) as a fresher.");
  }

  // Generate AI feedback
  const aiProvider = getAIProvider();
  const feedback = await aiProvider.generateResumeFeedback({
    extractedText: upload.extractedText,
    detectedSections: parsed.detectedSections,
    keywordMatches: keywordMatches.map((k) => ({
      skill: k.skill,
      found: k.found,
    })),
    atsScore,
    targetRole: role,
  });

  // Save analysis
  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeUploadId,
      targetRoleSlug,
      atsScore,
      keywordMatches: JSON.parse(JSON.stringify(keywordMatches)),
      sectionScores: JSON.parse(JSON.stringify(sectionScores)),
      suggestions: JSON.parse(JSON.stringify(suggestions)),
      feedback,
    },
  });

  return {
    id: analysis.id,
    atsScore,
    keywordMatches,
    sectionScores,
    suggestions,
    feedback,
  };
}
