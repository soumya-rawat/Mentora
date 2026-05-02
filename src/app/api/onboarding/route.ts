import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { generateAndSaveRecommendations } from "@/lib/services/recommendation.service";
import { unauthorized, badRequest, handleApiError } from "@/lib/utils/api-errors";
import { OnboardingAnswers } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const answers = parsed.data;

    // Save or update onboarding response
    await prisma.onboardingResponse.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        answers: JSON.parse(JSON.stringify(answers)),
      },
      update: {
        answers: JSON.parse(JSON.stringify(answers)),
      },
    });

    // Parse year of study
    const yearOfStudy =
      answers.yearOfStudy === "graduated" ? 5 : parseInt(answers.yearOfStudy);

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingComplete: true,
        yearOfStudy,
        collegeTier: answers.collegeTier,
      },
    });

    // Generate recommendations
    const onboardingAnswers: OnboardingAnswers = {
      ...answers,
      yearOfStudy,
    };

    const recommendations =
      await generateAndSaveRecommendations(session.user.id, onboardingAnswers);

    return NextResponse.json({
      message: "Onboarding complete",
      recommendationCount: recommendations.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
