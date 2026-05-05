"use client";

import { DomainClassification } from "@/types";
import { Briefcase } from "lucide-react";

interface DomainBadgeProps {
  domain: DomainClassification;
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  const confidenceColor =
    domain.confidence >= 0.5
      ? "bg-green-100 text-green-700 border-green-200"
      : domain.confidence >= 0.3
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${confidenceColor}`}>
      <Briefcase className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{domain.primary}</span>
      <span className="text-[10px] opacity-70">
        {Math.round(domain.confidence * 100)}%
      </span>
      {domain.secondary && (
        <span className="text-[10px] opacity-50">/ {domain.secondary}</span>
      )}
    </div>
  );
}
