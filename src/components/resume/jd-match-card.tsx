"use client";

import { JDMatchResult, JDSkillMatch } from "@/types";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface JDMatchCardProps {
  result: JDMatchResult & { aiSuggestions: string };
}

export function JDMatchCard({ result }: JDMatchCardProps) {
  const { matchScore, matchedSkills, missingSkills, weakSkills, aiSuggestions } = result;

  const scoreColor =
    matchScore >= 75
      ? "text-green-600 border-green-200"
      : matchScore >= 50
        ? "text-blue-600 border-blue-200"
        : "text-amber-600 border-amber-200";

  return (
    <div className="space-y-4">
      {/* Score + Summary */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-6">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 ${scoreColor}`}>
            <span className="text-2xl font-bold">{matchScore}%</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">JD Match Score</h3>
            <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="rounded-lg border bg-white p-6">
        <h4 className="text-sm font-semibold text-gray-900">Skill Breakdown</h4>
        <div className="mt-3 space-y-2">
          {matchedSkills.map((skill, i) => (
            <SkillRow key={i} skill={skill} />
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <XCircle className="h-4 w-4" />
            Missing Required Skills ({missingSkills.length})
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {missingSkills.map((skill, i) => (
              <span key={i} className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak Skills */}
      {weakSkills.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertCircle className="h-4 w-4" />
            Listed But Not Demonstrated ({weakSkills.length})
          </h4>
          <p className="mt-1 text-xs text-amber-600">
            These skills appear in your resume but aren&apos;t backed by project/experience examples.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {weakSkills.map((skill, i) => (
              <span key={i} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {aiSuggestions && (
        <div className="rounded-lg border bg-white p-6">
          <h4 className="text-sm font-semibold text-gray-900">AI Feedback</h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{aiSuggestions}</p>
        </div>
      )}
    </div>
  );
}

function SkillRow({ skill }: { skill: JDSkillMatch }) {
  return (
    <div className="flex items-center gap-2">
      {skill.found ? (
        skill.demonstrated ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        )
      ) : (
        <XCircle className="h-4 w-4 text-red-400" />
      )}
      <span className="text-sm text-gray-700">{skill.skill}</span>
      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
        skill.required ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
      }`}>
        {skill.required ? "Required" : "Preferred"}
      </span>
      {skill.found && !skill.demonstrated && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">
          Not demonstrated
        </span>
      )}
    </div>
  );
}
