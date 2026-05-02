import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RoleCard } from "@/components/recommendations/role-card";
import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const recommendations = await prisma.roleRecommendation.findMany({
    where: { userId: session.user.id },
    orderBy: { totalScore: "desc" },
  });

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Compass className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900">
          No recommendations yet
        </h2>
        <p className="mt-2 text-gray-500">
          Complete your profile assessment to get personalized career matches.
        </p>
        <Link href="/onboarding" className="mt-4">
          <Button>Start Assessment</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Your Career Matches
        </h1>
        <p className="mt-1 text-gray-500">
          Based on your skills, interests, and preferences. Higher scores mean
          stronger fit.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <RoleCard
            key={rec.id}
            roleSlug={rec.roleSlug}
            title={rec.roleSlug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
            totalScore={Math.round(rec.totalScore)}
            explanation={rec.explanation}
            matchingSkills={rec.matchingSkills as string[]}
            readinessLevel={rec.readinessLevel}
            rank={index}
          />
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
        Want different results?{" "}
        <Link href="/onboarding" className="text-blue-600 hover:underline">
          Retake the assessment
        </Link>
      </div>
    </div>
  );
}
