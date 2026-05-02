import { ROLES } from "@/lib/constants/roles";
import { OnboardingAnswers, RoleDefinition, RoleRecommendationResult, SkillGap, ReadinessLevel } from "@/types";

const WEIGHTS = {
  skillMatch: 0.4,
  interestAlign: 0.25,
  aptitudeFit: 0.2,
  marketContext: 0.15,
};

// Maps user's selected languages/tools to role skill requirements
function calculateSkillMatch(
  answers: OnboardingAnswers,
  role: RoleDefinition
): { score: number; matchingSkills: string[]; gapSkills: SkillGap[] } {
  const userSkills = new Set([
    ...answers.languages,
    ...answers.tools,
  ]);

  let totalWeight = 0;
  let matchedWeight = 0;
  const matchingSkills: string[] = [];
  const gapSkills: SkillGap[] = [];

  for (const skill of role.skills) {
    totalWeight += skill.weight;

    const hasSkill = userSkills.has(skill.name) ||
      // Check common synonyms
      (skill.name === "HTML/CSS" && (userSkills.has("HTML") || userSkills.has("CSS"))) ||
      (skill.name === "Bash/Shell" && userSkills.has("Bash/Shell")) ||
      (skill.name === "TensorFlow/PyTorch" && (userSkills.has("TensorFlow") || userSkills.has("PyTorch")));

    if (hasSkill) {
      matchedWeight += skill.weight;
      matchingSkills.push(skill.name);
    } else {
      gapSkills.push({
        skillName: skill.name,
        currentLevel: "none",
        requiredLevel: skill.level,
        gapSize: skill.level === "advanced" ? 3 : skill.level === "intermediate" ? 2 : 1,
        priority: skill.weight * (skill.level === "advanced" ? 3 : skill.level === "intermediate" ? 2 : 1),
        category: skill.category,
      });
    }
  }

  // Factor in coding/math comfort for relevant roles
  let comfortBonus = 0;
  if (role.codingIntensity >= 4) {
    comfortBonus += (answers.codingComfort / 5) * 10;
  }
  if (role.mathIntensity >= 4) {
    comfortBonus += (answers.mathComfort / 5) * 10;
  }
  // Penalize low comfort for high-intensity roles
  if (role.codingIntensity >= 4 && answers.codingComfort <= 2) {
    comfortBonus -= 15;
  }
  if (role.mathIntensity >= 4 && answers.mathComfort <= 2) {
    comfortBonus -= 15;
  }

  const rawScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
  const score = Math.min(100, Math.max(0, rawScore + comfortBonus));

  // Sort gap skills by priority (highest first)
  gapSkills.sort((a, b) => b.priority - a.priority);

  return { score, matchingSkills, gapSkills };
}

function calculateInterestAlignment(
  answers: OnboardingAnswers,
  role: RoleDefinition
): number {
  let matchCount = 0;
  let totalChecks = 0;

  // Check work excitement match
  totalChecks++;
  if (role.idealInterests.includes(answers.workExcitement)) {
    matchCount++;
  }

  // Check problem-solving style
  totalChecks++;
  if (role.idealProblemSolving.includes(answers.problemSolvingStyle)) {
    matchCount++;
  }

  // Check work preference
  totalChecks++;
  if (role.idealWorkPreference.includes(answers.workFocus)) {
    matchCount++;
  }

  // Check code preference alignment with role's coding intensity
  totalChecks++;
  const codeHeavy = answers.codePreference === "Writing code all day";
  const codeMix = answers.codePreference === "Mix of code and communication";
  const lessCode = answers.codePreference === "More analysis, less code";
  const moreDesign = answers.codePreference === "More design, less code";

  if (role.codingIntensity >= 4 && codeHeavy) matchCount++;
  else if (role.codingIntensity === 3 && codeMix) matchCount++;
  else if (role.codingIntensity <= 2 && (lessCode || moreDesign)) matchCount++;
  else if (role.codingIntensity === 1 && moreDesign) matchCount++;

  return (matchCount / totalChecks) * 100;
}

function calculateAptitudeFit(
  answers: OnboardingAnswers,
  role: RoleDefinition
): number {
  let score = 50; // Start neutral

  // Work style preference
  if (role.idealWorkStyle.includes(answers.teamPreference)) {
    score += 20;
  }

  // Company preference alignment
  if (answers.companyPreference === "product" && role.demandLevel === "high") {
    score += 10;
  }
  if (answers.companyPreference === "service" && role.category === "Quality") {
    score += 10;
  }
  if (answers.companyPreference === "startup" && role.category === "Engineering") {
    score += 10;
  }

  // Project readiness
  if (answers.projectCount === "3+-personal" || answers.projectCount === "open-source") {
    score += 10;
  }
  if (answers.hasPortfolio === "yes-active") {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

function calculateMarketContext(
  answers: OnboardingAnswers,
  role: RoleDefinition
): number {
  let score = 50;
  const year = typeof answers.yearOfStudy === "string" ? parseInt(answers.yearOfStudy) : answers.yearOfStudy || 4;

  // High-demand role bonus
  if (role.demandLevel === "high") {
    score += 10;
  }

  // Year-based adjustments
  if (year <= 2 && role.demandLevel === "high") {
    score += 10; // Early years + high demand = good time to start
  }
  if (year >= 4 && role.demandLevel === "high") {
    score += 15; // Final year + high demand = strong hiring market
  }

  // College tier adjustments
  if (answers.collegeTier === "iit-nit" && role.category === "Engineering") {
    score += 5;
  }
  if ((answers.collegeTier === "tier-2" || answers.collegeTier === "tier-3") &&
      (role.category === "Quality" || role.slug === "data-analyst")) {
    score += 10; // These roles have strong service-company demand accessible to all tiers
  }

  // Internship bonus
  if (answers.internships === "2+") {
    score += 10;
  } else if (answers.internships === "1") {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

function getReadinessLevel(skillMatch: number): ReadinessLevel {
  if (skillMatch >= 70) return "ready";
  if (skillMatch >= 40) return "almost";
  return "growth-needed";
}

function getEstimatedTime(readiness: ReadinessLevel, gapCount: number): string {
  if (readiness === "ready") return "0-2 months";
  if (readiness === "almost") {
    return gapCount <= 3 ? "2-4 months" : "3-6 months";
  }
  return gapCount <= 5 ? "6-9 months" : "9-12 months";
}

export function generateRecommendations(
  answers: OnboardingAnswers
): RoleRecommendationResult[] {
  const results: RoleRecommendationResult[] = [];

  for (const role of ROLES) {
    const { score: skillMatch, matchingSkills, gapSkills } = calculateSkillMatch(answers, role);
    const interestAlign = calculateInterestAlignment(answers, role);
    const aptitudeFit = calculateAptitudeFit(answers, role);
    const marketContext = calculateMarketContext(answers, role);

    const totalScore = Math.round(
      skillMatch * WEIGHTS.skillMatch +
      interestAlign * WEIGHTS.interestAlign +
      aptitudeFit * WEIGHTS.aptitudeFit +
      marketContext * WEIGHTS.marketContext
    );

    const readinessLevel = getReadinessLevel(skillMatch);

    results.push({
      roleSlug: role.slug,
      roleTitle: role.title,
      totalScore: Math.min(100, Math.max(0, totalScore)),
      breakdown: {
        skillMatch: Math.round(skillMatch),
        interestAlign: Math.round(interestAlign),
        aptitudeFit: Math.round(aptitudeFit),
        marketContext: Math.round(marketContext),
      },
      matchingSkills,
      gapSkills,
      explanation: "", // Filled by AI provider
      readinessLevel,
      estimatedTimeToReady: getEstimatedTime(readinessLevel, gapSkills.length),
    });
  }

  // Sort by total score descending
  results.sort((a, b) => b.totalScore - a.totalScore);
  return results;
}
