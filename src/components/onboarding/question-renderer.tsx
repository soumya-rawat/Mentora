"use client";

import { Question } from "@/lib/constants/questions";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { cn } from "@/lib/utils";

interface QuestionRendererProps {
  question: Question;
}

export function QuestionRenderer({ question }: QuestionRendererProps) {
  const { answers, setAnswer, toggleMultiSelect } = useOnboardingStore();

  if (question.type === "single-select") {
    const currentValue = answers[question.id] as string;
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          {question.label}
        </label>
        {question.description && (
          <p className="text-sm text-gray-500">{question.description}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAnswer(question.id, option.value)}
              className={cn(
                "rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                currentValue === option.value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "multi-select") {
    const currentValues = (answers[question.id] as string[]) || [];
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          {question.label}
        </label>
        {question.description && (
          <p className="text-sm text-gray-500">{question.description}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {question.options?.map((option) => {
            const isSelected = currentValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleMultiSelect(question.id, option.value)}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "slider") {
    const currentValue = (answers[question.id] as number) ?? question.min ?? 1;
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">
          {question.label}
        </label>
        {question.description && (
          <p className="text-sm text-gray-500">{question.description}</p>
        )}
        <div className="flex items-center gap-4">
          <span className="min-w-[80px] text-xs text-gray-400">
            {question.minLabel}
          </span>
          <div className="flex flex-1 justify-between gap-2">
            {Array.from(
              { length: (question.max ?? 5) - (question.min ?? 1) + 1 },
              (_, i) => i + (question.min ?? 1)
            ).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswer(question.id, value)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-all",
                  currentValue === value
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <span className="min-w-[80px] text-right text-xs text-gray-400">
            {question.maxLabel}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
