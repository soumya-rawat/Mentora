const SECTION_PATTERNS: Record<string, RegExp> = {
  education: /\b(education|academic|qualification|university|college|degree|b\.?tech|btech|bca|mca)\b/i,
  experience: /\b(experience|employment|work\s*history|internship|professional)\b/i,
  skills: /\b(skills|technical\s*skills|technologies|tech\s*stack|competencies)\b/i,
  projects: /\b(projects?|portfolio|personal\s*projects?|academic\s*projects?)\b/i,
  certifications: /\b(certifications?|certificates?|courses?|training)\b/i,
  contact: /\b(email|phone|linkedin|github|contact|address)\b/i,
};

export interface ParsedResume {
  text: string;
  wordCount: number;
  detectedSections: string[];
  hasQuantifiedAchievements: boolean;
  hasActionVerbs: boolean;
  hasContactInfo: boolean;
}

const ACTION_VERBS = [
  "built", "designed", "developed", "implemented", "created",
  "optimized", "managed", "led", "improved", "deployed",
  "automated", "integrated", "architected", "launched", "reduced",
  "increased", "achieved", "collaborated", "delivered", "maintained",
];

export function parseResumeText(text: string): ParsedResume {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const wordCount = cleanText.split(/\s+/).length;

  // Detect sections
  const detectedSections: string[] = [];
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(cleanText)) {
      detectedSections.push(section);
    }
  }

  // Check for quantified achievements
  const hasQuantifiedAchievements = /\d+%|\d+\s*(users|clients|requests|projects|members|team)|\d+x|\d+\+/i.test(cleanText);

  // Check for action verbs
  const lowerText = cleanText.toLowerCase();
  const hasActionVerbs = ACTION_VERBS.some((verb) => lowerText.includes(verb));

  // Check for contact info
  const hasContactInfo = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(cleanText) || /linkedin\.com/i.test(cleanText);

  return {
    text: cleanText,
    wordCount,
    detectedSections,
    hasQuantifiedAchievements,
    hasActionVerbs,
    hasContactInfo,
  };
}
