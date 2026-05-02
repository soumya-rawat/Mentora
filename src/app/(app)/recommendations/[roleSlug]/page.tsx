import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoleBySlug } from "@/lib/constants/roles";
import { redirect, notFound } from "next/navigation";
import { ScoreBar } from "@/components/recommendations/score-bar";
import { GenerateRoadmapButton } from "@/components/recommendations/generate-roadmap-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Building2,
  Route,
  Target,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { SkillGap } from "@/types";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleSlug: string }>;
}) {
  const { roleSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = getRoleBySlug(roleSlug);
  if (!role) notFound();

  const recommendation = await prisma.roleRecommendation.findUnique({
    where: {
      userId_roleSlug: {
        userId: session.user.id,
        roleSlug,
      },
    },
  });

  // Check if user has an active roadmap for this role
  const existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId: session.user.id,
      roleSlug,
      isActive: true,
    },
  });

  const gapSkills = (recommendation?.gapSkills as unknown as SkillGap[]) || [];

  return (
    <div className="space-y-6">
      <Link
        href="/recommendations"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all matches
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{role.category}</Badge>
            <Badge
              variant="outline"
              className={
                role.demandLevel === "high"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }
            >
              <TrendingUp className="mr-1 h-3 w-3" />
              {role.demandLevel} demand
            </Badge>
          </div>
        </div>
        {recommendation && (
          <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-blue-200 bg-blue-50">
            <span className="text-xl font-bold text-blue-700">
              {Math.round(recommendation.totalScore)}%
            </span>
            <span className="text-[10px] text-blue-500">fit</span>
          </div>
        )}
      </div>

      {/* Why this fits you */}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-blue-600" />
              Why This Fits You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">{recommendation.explanation}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ScoreBar label="Skill Match" score={Math.round(recommendation.skillScore)} />
              <ScoreBar label="Interest Alignment" score={Math.round(recommendation.interestScore)} />
              <ScoreBar label="Aptitude Fit" score={Math.round(recommendation.aptitudeScore)} />
              <ScoreBar label="Market Context" score={Math.round(recommendation.marketScore)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* What you'll do */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-5 w-5 text-gray-600" />
            What You&apos;ll Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{role.dayInTheLife}</p>
        </CardContent>
      </Card>

      {/* Skills Required */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {role.skills.map((skill) => {
              const matchingSkills = (recommendation?.matchingSkills as string[]) || [];
              const hasSkill = matchingSkills.includes(skill.name);
              return (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        hasSkill ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm text-gray-700">{skill.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {skill.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{skill.level}</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${
                          hasSkill ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{ width: `${skill.weight * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      {gapSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Skills to Develop ({gapSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gapSkills.slice(0, 8).map((gap) => (
                <div
                  key={gap.skillName}
                  className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-amber-800">
                    {gap.skillName}
                  </span>
                  <span className="text-xs text-amber-600">
                    Target: {gap.requiredLevel}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salary & Career */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="h-5 w-5 text-green-600" />
              Salary in India (CTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fresher</span>
                <span className="text-sm font-semibold text-gray-900">
                  {role.salaryINR.fresher}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">1-3 years</span>
                <span className="text-sm font-semibold text-gray-900">
                  {role.salaryINR.mid}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">3-5 years</span>
                <span className="text-sm font-semibold text-gray-900">
                  {role.salaryINR.senior}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-purple-600" />
              Companies Hiring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {role.indianCompanies.map((company) => (
                <Badge key={company} variant="secondary">
                  {company}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Path */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {role.careerPath.map((level, i) => (
              <div key={level} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    i === 0
                      ? "bg-blue-100 font-medium text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {level}
                </span>
                {i < role.careerPath.length - 1 && (
                  <span className="text-gray-300">→</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center gap-4 pb-8">
        {existingRoadmap ? (
          <Link href="/roadmap">
            <Button size="lg" className="gap-2">
              <Route className="h-5 w-5" />
              View My Roadmap
            </Button>
          </Link>
        ) : (
          <GenerateRoadmapButton roleSlug={roleSlug} />
        )}
      </div>
    </div>
  );
}
