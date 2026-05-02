"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  roleSlug: string;
  title: string;
  totalScore: number;
  explanation: string;
  matchingSkills: string[];
  readinessLevel: string;
  rank: number;
}

function getScoreColor(score: number) {
  if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 50) return "text-blue-600 bg-blue-50 border-blue-200";
  return "text-amber-600 bg-amber-50 border-amber-200";
}

function getReadinessBadge(level: string) {
  switch (level) {
    case "ready":
      return { label: "Ready to apply", className: "bg-green-100 text-green-700" };
    case "almost":
      return { label: "Almost there", className: "bg-blue-100 text-blue-700" };
    default:
      return { label: "Growth needed", className: "bg-amber-100 text-amber-700" };
  }
}

export function RoleCard({
  roleSlug,
  title,
  totalScore,
  explanation,
  matchingSkills,
  readinessLevel,
  rank,
}: RoleCardProps) {
  const readiness = getReadinessBadge(readinessLevel);

  return (
    <Card className={cn("transition-shadow hover:shadow-md", rank === 0 && "ring-2 ring-blue-200")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              {rank === 0 && (
                <Badge className="bg-blue-600 text-white">Best Match</Badge>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className={readiness.className}>
                <Clock className="mr-1 h-3 w-3" />
                {readiness.label}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">{explanation}</p>

            {matchingSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(matchingSkills as string[]).slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border-2 text-lg font-bold",
                getScoreColor(totalScore)
              )}
            >
              {totalScore}%
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3" />
              Fit score
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Link href={`/recommendations/${roleSlug}`}>
            <Button variant="outline" size="sm" className="gap-2">
              Explore Role
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
