import {
  BulletAnalysis,
  KeywordMatch,
  ParsedResumeV2,
  ResumeStrength,
  ResumeWeakness,
  RewrittenBullet,
  RoleDefinition,
  JDMatchResult,
  SkillGap,
  SmartSuggestion,
} from "@/types";

export interface RoleExplanationInput {
  role: RoleDefinition;
  matchScore: number;
  topMatchingSkills: string[];
  gapSkills: string[];
  userInterests: string[];
}

export interface RoadmapSuggestionInput {
  role: RoleDefinition;
  yearOfStudy: number;
  existingSkills: string[];
  gapSkills: SkillGap[];
}

export interface ResumeFeedbackInput {
  extractedText: string;
  detectedSections: string[];
  keywordMatches: { skill: string; found: boolean }[];
  atsScore: number;
  targetRole: RoleDefinition;
}

// ── New v2 inputs ─────────────────────────────────────────────

export interface BulletRewriteInput {
  bullets: { text: string; issues: string[] }[];
  targetRole: RoleDefinition | null;
  jobDescription: string | null;
  userContext: { yearOfStudy: number; collegeTier: string };
}

export interface SmartSuggestionInput {
  parsedResume: ParsedResumeV2;
  bulletAnalysis: BulletAnalysis[];
  strengths: ResumeStrength[];
  weaknesses: ResumeWeakness[];
  keywordMatches: KeywordMatch[];
  targetRole: RoleDefinition | null;
  jobDescription: string | null;
  userContext: { yearOfStudy: number; collegeTier: string };
}

export interface JDFeedbackInput {
  jdMatchResult: JDMatchResult;
  parsedResume: ParsedResumeV2;
  jobDescription: string;
  userContext: { yearOfStudy: number; collegeTier: string };
}

// ── Provider interface ────────────────────────────────────────

export interface AIProvider {
  generateRoleExplanation(input: RoleExplanationInput): Promise<string>;
  generateResumeFeedback(input: ResumeFeedbackInput): Promise<string>;
  rewriteBulletPoints(input: BulletRewriteInput): Promise<RewrittenBullet[]>;
  generateSmartSuggestions(input: SmartSuggestionInput): Promise<SmartSuggestion[]>;
  generateJDFeedback(input: JDFeedbackInput): Promise<string>;
}
