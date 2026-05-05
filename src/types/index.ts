export type SkillCategory =
  | "language"
  | "framework"
  | "tool"
  | "concept"
  | "soft";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type SkillLevel = "none" | "beginner" | "intermediate" | "advanced";

export type ReadinessLevel = "ready" | "almost" | "growth-needed";

export type DemandLevel = "high" | "medium" | "low";

export type TaskType = "learn" | "practice" | "build" | "assess";

export type MilestoneStatus = "locked" | "active" | "completed";

export interface SkillRequirement {
  name: string;
  category: SkillCategory;
  weight: number;
  level: DifficultyLevel;
}

export interface RoleDefinition {
  slug: string;
  title: string;
  category: string;
  description: string;
  dayInTheLife: string;
  demandLevel: DemandLevel;
  salaryINR: {
    fresher: string;
    mid: string;
    senior: string;
  };
  skills: SkillRequirement[];
  careerPath: string[];
  indianCompanies: string[];
  idealInterests: string[];
  idealWorkStyle: string[];
  idealProblemSolving: string[];
  idealWorkPreference: string[];
  codingIntensity: number; // 1-5: how code-heavy is this role
  mathIntensity: number;   // 1-5: how math/stats-heavy
}

export interface SkillGap {
  skillName: string;
  currentLevel: SkillLevel;
  requiredLevel: DifficultyLevel;
  gapSize: number;
  priority: number;
  category: SkillCategory;
}

export interface RoleRecommendationResult {
  roleSlug: string;
  roleTitle: string;
  totalScore: number;
  breakdown: {
    skillMatch: number;
    interestAlign: number;
    aptitudeFit: number;
    marketContext: number;
  };
  matchingSkills: string[];
  gapSkills: SkillGap[];
  explanation: string;
  readinessLevel: ReadinessLevel;
  estimatedTimeToReady: string;
}

export interface OnboardingAnswers {
  // Step 1: Background
  degree: string;
  yearOfStudy: number;
  collegeTier: string;
  internships: string;

  // Step 2: Skills
  languages: string[];
  tools: string[];
  codingComfort: number;
  mathComfort: number;

  // Step 3: Interests
  workExcitement: string;
  problemSolvingStyle: string;
  codePreference: string;
  workFocus: string;

  // Step 4: Preferences
  teamPreference: string;
  jobPriority: string;
  companyPreference: string;

  // Step 5: Self-Assessment
  projectCount: string;
  hasPortfolio: string;
  placementReadiness: number;
}

export interface KeywordMatch {
  skill: string;
  found: boolean;
  matchType: "exact" | "synonym" | "related" | "missing";
  weight: number;
  context?: string;
}

export interface ResumeSectionScore {
  section: string;
  found: boolean;
  score: number;
  feedback: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  keywordMatches: KeywordMatch[];
  sectionScores: ResumeSectionScore[];
  suggestions: string[];
  feedback: string;
}

// ── Domain Classification ─────────────────────────────────────

export interface DomainClassification {
  primary: string;
  confidence: number;
  secondary: string | null;
  keywordsMatched: string[];
}

// ── Resume Analysis v2 Types ──────────────────────────────────

export interface BulletAnalysis {
  text: string;
  scores: {
    impact: number;      // 0-100: quantified results, metrics
    specificity: number; // 0-100: names tools/tech, not vague
    action: number;      // 0-100: strong action verb start
    clarity: number;     // 0-100: appropriate length, no filler
  };
  overall: number;
  rating: "strong" | "adequate" | "weak";
  issues: string[];
}

export interface ResumeStrength {
  area: string;
  description: string;
  signal: "strong" | "moderate";
}

export interface ResumeWeakness {
  area: string;
  description: string;
  severity: "critical" | "moderate" | "minor";
  suggestion: string;
}

export interface SectionContent {
  name: string;
  rawText: string;
  bullets: string[];
}

export interface ResumeFormatting {
  hasTables: boolean;
  hasSpecialChars: boolean;
  bulletCount: number;
  specialCharsFound: string[];
  wordCount: number;
}

export interface ParsedResumeV2 {
  text: string;
  wordCount: number;
  detectedSections: string[];
  sections: SectionContent[];
  hasQuantifiedAchievements: boolean;
  hasActionVerbs: boolean;
  hasContactInfo: boolean;
  links: { type: string; url: string }[];
  formatting: ResumeFormatting;
}

export interface SectionAnalysis {
  section: string;
  found: boolean;
  score: number;         // 0-100
  feedback: string;
  details: string[];     // specific observations
}

// ── JD Matching Types ─────────────────────────────────────────

export interface ParsedJobDescription {
  title: string | null;
  company: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string | null;
  responsibilities: string[];
  rawText: string;
}

export interface JDSkillMatch {
  skill: string;
  required: boolean;
  found: boolean;
  demonstrated: boolean;
  context?: string;
}

export interface JDMatchResult {
  matchScore: number;
  matchedSkills: JDSkillMatch[];
  missingSkills: string[];
  weakSkills: string[];
  experienceMatch: boolean;
  summary: string;
}

// ── AI Enhancement Types ──────────────────────────────────────

export interface RewrittenBullet {
  original: string;
  rewritten: string;
  explanation: string;
}

export interface SmartSuggestion {
  category: "add" | "remove" | "rewrite" | "reposition";
  section: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

// ── Enhanced Analysis Result ──────────────────────────────────

export interface ResumeAnalysisResultV2 extends ResumeAnalysisResult {
  bulletAnalysis: BulletAnalysis[];
  strengths: ResumeStrength[];
  weaknesses: ResumeWeakness[];
  rewrittenBullets: RewrittenBullet[];
  smartSuggestions: SmartSuggestion[];
  domain: DomainClassification | null;
  formattingIssues: string[];
}

export interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalTasks: number;
  completionPercentage: number;
  weeklyActivity: number[];
  recentTasks: { title: string; completedAt: string; type: string }[];
}
