import { prisma } from "@/lib/prisma";
import { generateRecommendations } from "@/lib/utils/scoring";
import { getAIProvider } from "@/lib/services/ai";
import { getRoleBySlug } from "@/lib/constants/roles";
import { OnboardingAnswers, RoleRecommendationResult } from "@/types";

export async function generateAndSaveRecommendations(
  userId: string,
  answers: OnboardingAnswers
): Promise<RoleRecommendationResult[]> {
  // Generate scores
  const recommendations = generateRecommendations(answers);

  // Generate explanations for top results
  const aiProvider = getAIProvider();

  for (const rec of recommendations) {
    const role = getRoleBySlug(rec.roleSlug);
    if (!role) continue;

    const explanation = await aiProvider.generateRoleExplanation({
      role,
      matchScore: rec.totalScore,
      topMatchingSkills: rec.matchingSkills,
      gapSkills: rec.gapSkills.map((g) => g.skillName),
      userInterests: [answers.workExcitement, answers.problemSolvingStyle],
    });

    rec.explanation = explanation;
  }

  // Delete existing recommendations for this user
  await prisma.roleRecommendation.deleteMany({
    where: { userId },
  });

  // Save all recommendations to DB
  await prisma.roleRecommendation.createMany({
    data: recommendations.map((rec) => ({
      userId,
      roleSlug: rec.roleSlug,
      totalScore: rec.totalScore,
      skillScore: rec.breakdown.skillMatch,
      interestScore: rec.breakdown.interestAlign,
      aptitudeScore: rec.breakdown.aptitudeFit,
      marketScore: rec.breakdown.marketContext,
      matchingSkills: JSON.parse(JSON.stringify(rec.matchingSkills)),
      gapSkills: JSON.parse(JSON.stringify(rec.gapSkills)),
      explanation: rec.explanation,
      readinessLevel: rec.readinessLevel,
    })),
  });

  return recommendations;
}
