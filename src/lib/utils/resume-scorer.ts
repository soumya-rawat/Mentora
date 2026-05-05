import {
  BulletAnalysis,
  ResumeStrength,
  ResumeWeakness,
  SectionAnalysis,
  SectionContent,
} from "@/types";

/**
 * Deep section-level scoring for resume quality.
 * Evaluates each section's content quality beyond just presence/absence.
 */

// ── Section Scorers ──────────────────────────────────────────

function scoreSkillsSection(section: SectionContent): SectionAnalysis {
  const text = section.rawText;
  const details: string[] = [];
  let score = 50; // base for being present

  // Check if skills are grouped/categorized
  const hasCategories =
    /\b(languages?|frameworks?|tools?|databases?|concepts?|platforms?)\s*[:—\-]/i.test(text);
  if (hasCategories) {
    score += 20;
    details.push("Skills are categorized — good for ATS readability");
  } else {
    details.push("Consider grouping skills by category (Languages, Frameworks, Tools)");
  }

  // Count approximate number of skills
  const commaCount = (text.match(/,/g) || []).length;
  const skillCount = commaCount + 1;
  if (skillCount >= 8 && skillCount <= 20) {
    score += 20;
    details.push(`Good skill count (~${skillCount} skills listed)`);
  } else if (skillCount < 5) {
    score -= 10;
    details.push("Too few skills listed — add relevant technologies");
  } else if (skillCount > 25) {
    score -= 10;
    details.push("Too many skills listed — focus on most relevant ones");
  }

  // Check for proficiency levels
  if (/\b(proficient|familiar|expert|intermediate|advanced|beginner)\b/i.test(text)) {
    score += 10;
    details.push("Includes proficiency levels");
  }

  return {
    section: "skills",
    found: true,
    score: Math.min(100, Math.max(0, score)),
    feedback: score >= 70 ? "Well-structured skills section" : "Skills section needs improvement",
    details,
  };
}

function scoreProjectsSection(
  section: SectionContent,
  bullets: BulletAnalysis[]
): SectionAnalysis {
  const text = section.rawText;
  const details: string[] = [];
  let score = 40; // base

  // Check for project descriptions with tech stacks
  const techStackMentions = (text.match(/\b(using|built\s*with|tech\s*stack|technologies)\b/gi) || []).length;
  if (techStackMentions >= 2) {
    score += 20;
    details.push("Projects mention technology stacks used");
  } else {
    details.push("Add tech stacks used for each project");
  }

  // Check for links (GitHub, live demos)
  if (/github\.com|gitlab\.com|bitbucket|herokuapp|vercel|netlify|live\s*demo/i.test(text)) {
    score += 15;
    details.push("Includes project links — demonstrates real work");
  } else {
    details.push("Add GitHub/live links to projects");
  }

  // Check for outcomes/results in project bullets
  const projectBullets = bullets.filter(
    (b) => section.bullets.some((sb) => b.text === sb)
  );
  const strongBullets = projectBullets.filter((b) => b.rating === "strong").length;
  if (strongBullets >= 2) {
    score += 15;
    details.push("Project descriptions have strong impact statements");
  } else if (projectBullets.length > 0 && strongBullets === 0) {
    details.push("Project bullets lack quantified outcomes — add metrics");
  }

  // Check number of projects
  const projectCount = (text.match(/\b(project|app|application|system|platform|tool|website)\b/gi) || []).length;
  if (projectCount >= 3) {
    score += 10;
    details.push("Good number of projects showcased");
  } else {
    details.push("Consider adding more projects to demonstrate breadth");
  }

  return {
    section: "projects",
    found: true,
    score: Math.min(100, Math.max(0, score)),
    feedback: score >= 65 ? "Projects section is strong" : "Projects section needs more depth",
    details,
  };
}

function scoreExperienceSection(
  section: SectionContent,
  bullets: BulletAnalysis[]
): SectionAnalysis {
  const text = section.rawText;
  const details: string[] = [];
  let score = 40; // base

  // Check for dates/duration
  const hasDates = /\d{4}|present|current|ongoing/i.test(text);
  if (hasDates) {
    score += 15;
    details.push("Includes dates/duration");
  } else {
    details.push("Add employment dates or duration");
  }

  // Check for role titles
  const hasRoleTitle = /\b(intern|developer|engineer|analyst|designer|associate|trainee)\b/i.test(text);
  if (hasRoleTitle) {
    score += 10;
    details.push("Role titles clearly stated");
  } else {
    details.push("Make role titles explicit");
  }

  // Check for company names
  const hasCompany = /\b(at|@)\s+[A-Z]/i.test(text) || /\b(pvt|ltd|inc|llp|technologies|solutions|labs)\b/i.test(text);
  if (hasCompany) {
    score += 10;
  }

  // Bullet quality for experience
  const expBullets = bullets.filter(
    (b) => section.bullets.some((sb) => b.text === sb)
  );
  const avgScore = expBullets.length > 0
    ? expBullets.reduce((s, b) => s + b.overall, 0) / expBullets.length
    : 0;
  if (avgScore >= 60) {
    score += 25;
    details.push("Experience bullets are well-written with impact");
  } else if (avgScore >= 40) {
    score += 15;
    details.push("Experience bullets are adequate but could use more metrics");
  } else if (expBullets.length > 0) {
    details.push("Experience bullets need quantified achievements");
  }

  return {
    section: "experience",
    found: true,
    score: Math.min(100, Math.max(0, score)),
    feedback: score >= 65 ? "Experience section demonstrates value" : "Experience section needs stronger impact statements",
    details,
  };
}

function scoreEducationSection(section: SectionContent): SectionAnalysis {
  const text = section.rawText;
  const details: string[] = [];
  let score = 50; // base

  // Check for GPA/CGPA
  if (/\b(gpa|cgpa|percentage|%|marks)\b/i.test(text)) {
    score += 20;
    details.push("Includes academic performance (GPA/CGPA)");
  } else {
    details.push("Consider adding CGPA if above 7.0");
  }

  // Check for relevant coursework
  if (/\b(coursework|courses?|relevant|specialization)\b/i.test(text)) {
    score += 15;
    details.push("Lists relevant coursework");
  }

  // Check for degree and institution
  if (/\b(b\.?tech|btech|b\.?e|mca|bca|m\.?tech|mtech)\b/i.test(text)) {
    score += 10;
    details.push("Degree clearly stated");
  }

  // Check for graduation year
  if (/20\d{2}/i.test(text)) {
    score += 5;
  }

  return {
    section: "education",
    found: true,
    score: Math.min(100, Math.max(0, score)),
    feedback: score >= 70 ? "Education section is complete" : "Education section could include more relevant details",
    details,
  };
}

// ── Main Scorer ──────────────────────────────────────────────

export function scoreResumeSections(
  sections: SectionContent[],
  bullets: BulletAnalysis[]
): SectionAnalysis[] {
  const results: SectionAnalysis[] = [];

  const sectionMap = new Map(sections.map((s) => [s.name, s]));

  // Score each known section
  const skills = sectionMap.get("skills");
  if (skills) {
    results.push(scoreSkillsSection(skills));
  } else {
    results.push({
      section: "skills",
      found: false,
      score: 0,
      feedback: "Missing skills section — critical for ATS",
      details: ["Add a dedicated Technical Skills section"],
    });
  }

  const projects = sectionMap.get("projects");
  if (projects) {
    results.push(scoreProjectsSection(projects, bullets));
  } else {
    results.push({
      section: "projects",
      found: false,
      score: 0,
      feedback: "Missing projects section — essential for freshers",
      details: ["Add 2-4 projects with tech stacks and outcomes"],
    });
  }

  const experience = sectionMap.get("experience");
  if (experience) {
    results.push(scoreExperienceSection(experience, bullets));
  } else {
    results.push({
      section: "experience",
      found: false,
      score: 0,
      feedback: "No experience section detected",
      details: ["Add internships or relevant experience if available"],
    });
  }

  const education = sectionMap.get("education");
  if (education) {
    results.push(scoreEducationSection(education));
  } else {
    results.push({
      section: "education",
      found: false,
      score: 0,
      feedback: "Missing education section",
      details: ["Add your degree, institution, and graduation year"],
    });
  }

  return results;
}

// ── Strengths & Weaknesses Detection ─────────────────────────

export function detectStrengths(
  sections: SectionContent[],
  sectionScores: SectionAnalysis[],
  bullets: BulletAnalysis[],
  wordCount: number,
  hasLinks: boolean
): ResumeStrength[] {
  const strengths: ResumeStrength[] = [];

  // Strong sections
  for (const score of sectionScores) {
    if (score.found && score.score >= 75) {
      strengths.push({
        area: `${score.section} section`,
        description: score.feedback,
        signal: "strong",
      });
    }
  }

  // Bullet quality
  const strongBullets = bullets.filter((b) => b.rating === "strong");
  if (strongBullets.length >= 3) {
    strengths.push({
      area: "Achievement statements",
      description: `${strongBullets.length} strong bullet points with quantified impact`,
      signal: "strong",
    });
  } else if (strongBullets.length >= 1) {
    strengths.push({
      area: "Achievement statements",
      description: "Has some strong bullet points demonstrating impact",
      signal: "moderate",
    });
  }

  // Links presence
  if (hasLinks) {
    strengths.push({
      area: "Online presence",
      description: "Includes links to GitHub/portfolio/LinkedIn",
      signal: "moderate",
    });
  }

  // Good length
  if (wordCount >= 250 && wordCount <= 700) {
    strengths.push({
      area: "Resume length",
      description: "Appropriate length for a fresher resume (1 page)",
      signal: "moderate",
    });
  }

  return strengths;
}

export function detectWeaknesses(
  sections: SectionContent[],
  sectionScores: SectionAnalysis[],
  bullets: BulletAnalysis[],
  wordCount: number,
  detectedSections: string[],
  resumeText?: string
): ResumeWeakness[] {
  const weaknesses: ResumeWeakness[] = [];

  // Missing critical sections
  if (!detectedSections.includes("skills")) {
    weaknesses.push({
      area: "Missing Skills section",
      description: "ATS systems scan for a dedicated skills section",
      severity: "critical",
      suggestion: "Add a 'Technical Skills' section with categorized skills",
    });
  }
  if (!detectedSections.includes("projects") && !detectedSections.includes("experience")) {
    weaknesses.push({
      area: "No projects or experience",
      description: "Resume lacks evidence of practical work",
      severity: "critical",
      suggestion: "Add at least 2-3 projects with descriptions, tech stacks, and outcomes",
    });
  }

  // Weak bullets
  const weakBullets = bullets.filter((b) => b.rating === "weak");
  if (weakBullets.length >= 3) {
    weaknesses.push({
      area: "Weak bullet points",
      description: `${weakBullets.length} bullets lack metrics, specificity, or strong verbs`,
      severity: "moderate",
      suggestion: "Rewrite using format: [Action Verb] + [What] + [Using/With] + [Result/Impact]",
    });
  }

  // No metrics anywhere
  const hasAnyMetrics = bullets.some((b) => b.scores.impact >= 50);
  if (bullets.length > 0 && !hasAnyMetrics) {
    weaknesses.push({
      area: "No quantified achievements",
      description: "None of your bullet points contain specific numbers or percentages",
      severity: "moderate",
      suggestion: "Add metrics like '40% faster', '1000+ users', '5 team members'",
    });
  }

  // Length issues
  if (wordCount < 150) {
    weaknesses.push({
      area: "Resume too short",
      description: "Very little content — likely won't pass initial screening",
      severity: "critical",
      suggestion: "Expand with more projects, skills, and detailed descriptions",
    });
  } else if (wordCount > 800) {
    weaknesses.push({
      area: "Resume too long",
      description: "Exceeds typical 1-page fresher resume length",
      severity: "minor",
      suggestion: "Trim to most relevant information — keep it to 1 page",
    });
  }

  // Low section scores
  for (const score of sectionScores) {
    if (score.found && score.score < 40) {
      weaknesses.push({
        area: `Weak ${score.section} section`,
        description: score.details[0] || score.feedback,
        severity: "moderate",
        suggestion: score.details.length > 1 ? score.details[1] : "Improve section content quality",
      });
    }
  }

  // ── Enhanced issues from Resume-ATS ──

  if (resumeText) {
    const lowerText = resumeText.toLowerCase();

    // Generic phrases that hurt ATS scoring
    const genericPhrases = ["responsible for", "duties included", "helped with", "worked on", "assisted in"];
    const foundGeneric = genericPhrases.filter((p) => lowerText.includes(p));
    if (foundGeneric.length >= 2) {
      weaknesses.push({
        area: "Generic phrases detected",
        description: `Found weak phrases: "${foundGeneric.slice(0, 3).join('", "')}"`,
        severity: "moderate",
        suggestion: "Replace with action verbs: 'Built', 'Designed', 'Implemented', 'Optimized'",
      });
    }

    // No quantifiable metrics anywhere in resume
    const hasMetrics = /\d+%|\$[\d,]+|\d+\s*(users|customers|clients|employees|projects|requests|team)/i.test(resumeText);
    if (!hasMetrics && wordCount > 100) {
      weaknesses.push({
        area: "No quantifiable metrics",
        description: "Resume has no numbers, percentages, or measurable outcomes",
        severity: "moderate",
        suggestion: "Add metrics: '40% improvement', '$50K revenue', '1000+ users', '5-member team'",
      });
    }

    // Missing email
    if (!/[\w.+-]+@[\w-]+\.[\w.-]+/.test(resumeText)) {
      weaknesses.push({
        area: "Missing email address",
        description: "No clearly formatted email found — recruiters can't contact you",
        severity: "critical",
        suggestion: "Add your email at the top of your resume",
      });
    }

    // Missing phone
    if (!/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText)) {
      weaknesses.push({
        area: "Missing phone number",
        description: "No phone number detected",
        severity: "minor",
        suggestion: "Add your phone number in the contact section",
      });
    }
  }

  return weaknesses;
}
