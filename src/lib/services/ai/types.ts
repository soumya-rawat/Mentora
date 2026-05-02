import { RoleDefinition, SkillGap } from "@/types";

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

export interface AIProvider {
  generateRoleExplanation(input: RoleExplanationInput): Promise<string>;
  generateResumeFeedback(input: ResumeFeedbackInput): Promise<string>;
}
