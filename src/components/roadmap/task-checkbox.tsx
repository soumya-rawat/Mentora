"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskCheckboxProps {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  estimatedHours: number;
  resourceUrl: string | null;
  resourceLabel: string | null;
  onToggle: (taskId: string) => Promise<void>;
}

const typeColors: Record<string, string> = {
  learn: "bg-purple-100 text-purple-700",
  practice: "bg-blue-100 text-blue-700",
  build: "bg-green-100 text-green-700",
  assess: "bg-amber-100 text-amber-700",
};

export function TaskCheckbox({
  id,
  title,
  description,
  type,
  completed,
  estimatedHours,
  resourceUrl,
  resourceLabel,
  onToggle,
}: TaskCheckboxProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await onToggle(id);
    setLoading(false);
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        completed
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      )}
    >
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
          completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-300 hover:border-blue-400",
          loading && "opacity-50"
        )}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : completed ? (
          <Check className="h-3 w-3" />
        ) : null}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              completed ? "text-gray-400 line-through" : "text-gray-900"
            )}
          >
            {title}
          </span>
          <Badge className={cn("text-[10px]", typeColors[type] || typeColors.learn)}>
            {type}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">~{estimatedHours}h</span>
          {resourceUrl && (
            <a
              href={resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {resourceLabel || "Resource"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
