"use client";

import { ResumeStrength, ResumeWeakness } from "@/types";
import { TrendingUp, AlertTriangle } from "lucide-react";

interface StrengthsWeaknessesProps {
  strengths: ResumeStrength[];
  weaknesses: ResumeWeakness[];
}

export function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Resume Insights</h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Strengths</h4>
          </div>
          {strengths.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="rounded-md border border-green-100 bg-green-50 p-2.5">
                  <p className="text-sm font-medium text-green-800">{s.area}</p>
                  <p className="text-xs text-green-600">{s.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No strong signals detected yet</p>
          )}
        </div>

        {/* Weaknesses */}
        <div>
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Areas to Improve</h4>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {weaknesses.map((w, i) => (
                <li
                  key={i}
                  className={`rounded-md border p-2.5 ${
                    w.severity === "critical"
                      ? "border-red-200 bg-red-50"
                      : w.severity === "moderate"
                        ? "border-amber-200 bg-amber-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{w.area}</p>
                    {w.severity === "critical" && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{w.description}</p>
                  <p className="mt-1 text-xs font-medium text-blue-600">→ {w.suggestion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No critical issues found</p>
          )}
        </div>
      </div>
    </div>
  );
}
