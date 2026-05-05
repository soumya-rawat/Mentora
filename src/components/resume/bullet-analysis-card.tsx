"use client";

import { BulletAnalysis } from "@/types";
import { AlertCircle, CheckCircle2, MinusCircle } from "lucide-react";

interface BulletAnalysisCardProps {
  bullets: BulletAnalysis[];
}

export function BulletAnalysisCard({ bullets }: BulletAnalysisCardProps) {
  if (bullets.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Bullet Point Analysis</h3>
        <p className="mt-2 text-sm text-gray-500">
          No bullet points detected in your resume. Use bullet markers (•, -, *) to format your achievements.
        </p>
      </div>
    );
  }

  const strong = bullets.filter((b) => b.rating === "strong").length;
  const weak = bullets.filter((b) => b.rating === "weak").length;

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bullet Point Analysis</h3>
        <div className="flex gap-3 text-sm">
          <span className="text-green-600">{strong} strong</span>
          <span className="text-amber-600">{bullets.length - strong - weak} adequate</span>
          <span className="text-red-600">{weak} weak</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {bullets.map((bullet, i) => (
          <div
            key={i}
            className={`rounded-md border p-3 ${
              bullet.rating === "strong"
                ? "border-green-200 bg-green-50"
                : bullet.rating === "weak"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-2">
              {bullet.rating === "strong" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              ) : bullet.rating === "weak" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">{bullet.text}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ScorePill label="Impact" score={bullet.scores.impact} />
                  <ScorePill label="Specificity" score={bullet.scores.specificity} />
                  <ScorePill label="Action" score={bullet.scores.action} />
                  <ScorePill label="Clarity" score={bullet.scores.clarity} />
                </div>
                {bullet.issues.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {bullet.issues.map((issue, j) => (
                      <li key={j} className="text-xs text-gray-500">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  const color =
    score >= 70
      ? "bg-green-100 text-green-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}: {score}
    </span>
  );
}
