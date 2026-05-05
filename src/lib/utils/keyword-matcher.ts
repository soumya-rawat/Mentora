import { KeywordMatch, RoleDefinition } from "@/types";
import { SKILL_SYNONYMS } from "@/lib/constants/skills-database";

// Phrases that indicate DEMONSTRATED skill (used in context, not just listed)
const DEMONSTRATED_PATTERNS = [
  "built with", "developed using", "implemented in", "deployed with",
  "created using", "architected with", "engineered using", "integrated",
  "configured", "set up", "designed with", "automated using", "migrated to",
];

// Phrases that indicate weak/surface mention
const SURFACE_PATTERNS = [
  "familiar with", "basic knowledge", "learning", "exposure to",
  "awareness of", "introduction to", "beginner in", "some experience",
];

// Phrases that indicate strong proficiency
const PROFICIENCY_PATTERNS = [
  "proficient in", "expert in", "advanced", "extensive experience",
  "strong in", "deep understanding", "3+ years", "2+ years",
];

export interface EnhancedKeywordMatch extends KeywordMatch {
  demonstrated: boolean;
  proficiencySignal: "strong" | "moderate" | "surface" | "listed-only" | "not-found";
}

/**
 * Matches resume keywords against a role definition's skills.
 * Now includes context-aware proficiency detection.
 */
/**
 * Word-boundary safe matching — prevents "Java" matching "JavaScript".
 */
function wordBoundaryMatch(text: string, term: string): boolean {
  try {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  } catch {
    return text.toLowerCase().includes(term.toLowerCase());
  }
}

export function matchKeywords(
  resumeText: string,
  role: RoleDefinition
): EnhancedKeywordMatch[] {
  const lowerText = resumeText.toLowerCase();

  return role.skills.map((skill) => {
    // Try exact match with word boundaries
    const exactFound = wordBoundaryMatch(resumeText, skill.name);

    // Try synonym match with word boundaries
    const synonyms = SKILL_SYNONYMS[skill.name] || [];
    const synonymMatch = synonyms.find((syn) =>
      wordBoundaryMatch(resumeText, syn)
    );

    const found = exactFound || !!synonymMatch;
    const matchType = exactFound
      ? "exact" as const
      : synonymMatch
        ? "synonym" as const
        : "missing" as const;

    if (!found) {
      return {
        skill: skill.name,
        found: false,
        matchType: "missing" as const,
        weight: skill.weight,
        demonstrated: false,
        proficiencySignal: "not-found" as const,
      };
    }

    // Context-aware analysis: is the skill demonstrated or just listed?
    const matchedTerm = exactFound ? skill.name.toLowerCase() : synonymMatch!.toLowerCase();
    const demonstrated = isSkillDemonstrated(lowerText, matchedTerm);
    const proficiencySignal = inferProficiency(lowerText, matchedTerm);

    return {
      skill: skill.name,
      found: true,
      matchType,
      weight: skill.weight,
      context: synonymMatch || undefined,
      demonstrated,
      proficiencySignal,
    };
  });
}

/**
 * Checks if a skill is demonstrated (used in projects/work) vs just listed.
 */
function isSkillDemonstrated(text: string, skillTerm: string): boolean {
  // Check if the skill appears near demonstrated patterns
  const radius = 80; // characters to look around the skill mention
  const idx = text.indexOf(skillTerm);
  if (idx === -1) return false;

  const context = text.slice(Math.max(0, idx - radius), idx + skillTerm.length + radius);

  return DEMONSTRATED_PATTERNS.some((p) => context.includes(p));
}

/**
 * Infers proficiency level from surrounding context.
 */
function inferProficiency(
  text: string,
  skillTerm: string
): "strong" | "moderate" | "surface" | "listed-only" {
  const radius = 60;
  const idx = text.indexOf(skillTerm);
  if (idx === -1) return "listed-only";

  const context = text.slice(Math.max(0, idx - radius), idx + skillTerm.length + radius);

  if (PROFICIENCY_PATTERNS.some((p) => context.includes(p))) return "strong";
  if (SURFACE_PATTERNS.some((p) => context.includes(p))) return "surface";
  if (DEMONSTRATED_PATTERNS.some((p) => context.includes(p))) return "moderate";

  return "listed-only";
}

export interface FormattingInfo {
  hasTables: boolean;
  hasSpecialChars: boolean;
  bulletCount: number;
  specialCharsFound: string[];
  wordCount: number;
}

/**
 * Calculates ATS score from keyword matches, resume quality signals, and formatting.
 * Enhanced with formatting penalties from Resume-ATS.
 */
export function calculateATSScore(
  keywordMatches: KeywordMatch[],
  detectedSections: string[],
  hasQuantified: boolean,
  hasActionVerbs: boolean,
  hasContactInfo: boolean,
  formatting?: FormattingInfo
): number {
  // Keyword match score (40%)
  const totalWeight = keywordMatches.reduce((sum, k) => sum + k.weight, 0);
  const matchedWeight = keywordMatches
    .filter((k) => k.found)
    .reduce((sum, k) => sum + k.weight, 0);
  const keywordScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

  // Section presence score (25%)
  const requiredSections = ["education", "skills", "projects"];
  const optionalSections = ["experience", "certifications", "contact"];
  let sectionScore = 0;
  for (const section of requiredSections) {
    if (detectedSections.includes(section)) sectionScore += 25;
  }
  for (const section of optionalSections) {
    if (detectedSections.includes(section)) sectionScore += 8.33;
  }
  sectionScore = Math.min(100, sectionScore);

  // Formatting quality (15%) — with penalties
  let formatScore = 50;
  if (hasContactInfo) formatScore += 25;
  if (detectedSections.length >= 4) formatScore += 25;

  // Formatting penalties (from Resume-ATS)
  if (formatting) {
    if (formatting.hasTables) formatScore -= 15;
    if (formatting.hasSpecialChars) {
      formatScore -= Math.min(formatting.specialCharsFound.length * 3, 15);
    }
    if (formatting.bulletCount < 5) formatScore -= 10;
    if (formatting.wordCount > 1500) formatScore -= 10;
  }
  formatScore = Math.min(100, Math.max(0, formatScore));

  // Content quality (20%)
  let contentScore = 40;
  if (hasQuantified) contentScore += 30;
  if (hasActionVerbs) contentScore += 30;
  contentScore = Math.min(100, contentScore);

  // Weighted total
  const total =
    keywordScore * 0.4 +
    sectionScore * 0.25 +
    formatScore * 0.15 +
    contentScore * 0.2;

  return Math.round(Math.min(100, Math.max(0, total)));
}

/**
 * Matches resume text against raw skill strings (from a JD, not a RoleDefinition).
 * Used by the JD matching feature.
 */
export function matchSkillsFromList(
  resumeText: string,
  skills: string[]
): { skill: string; found: boolean; demonstrated: boolean }[] {
  const lowerText = resumeText.toLowerCase();

  return skills.map((skill) => {
    // Word-boundary match
    let found = wordBoundaryMatch(resumeText, skill);

    // Synonym match
    if (!found) {
      const synonyms = SKILL_SYNONYMS[skill] || [];
      found = synonyms.some((syn) => wordBoundaryMatch(resumeText, syn));
    }

    const demonstrated = found ? isSkillDemonstrated(lowerText, skill.toLowerCase()) : false;

    return { skill, found, demonstrated };
  });
}
