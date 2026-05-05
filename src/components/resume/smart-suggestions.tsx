"use client";

import { SmartSuggestion } from "@/types";
import { Plus, Trash2, Pencil, MoveVertical } from "lucide-react";

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
}

const CATEGORY_CONFIG = {
  add: { icon: Plus, label: "Add", color: "text-green-700 bg-green-50 border-green-200" },
  remove: { icon: Trash2, label: "Remove", color: "text-red-700 bg-red-50 border-red-200" },
  rewrite: { icon: Pencil, label: "Rewrite", color: "text-blue-700 bg-blue-50 border-blue-200" },
  reposition: { icon: MoveVertical, label: "Reposition", color: "text-purple-700 bg-purple-50 border-purple-200" },
};

const PRIORITY_BADGE = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
  if (suggestions.length === 0) return null;

  // Sort by priority: high first
  const sorted = [...suggestions].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
      <p className="mt-1 text-sm text-gray-500">
        AI-powered recommendations to improve your resume
      </p>

      <div className="mt-4 space-y-2">
        {sorted.map((suggestion, i) => {
          const config = CATEGORY_CONFIG[suggestion.category];
          const Icon = config.icon;

          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-md border p-3 ${config.color}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase">{config.label}</span>
                  <span className="text-xs text-gray-500">in {suggestion.section}</span>
                  <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE[suggestion.priority]}`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-sm">{suggestion.suggestion}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
