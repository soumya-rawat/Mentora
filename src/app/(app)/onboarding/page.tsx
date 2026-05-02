"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getQuestionsForStep, STEP_TITLES, TOTAL_STEPS } from "@/lib/constants/questions";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { QuestionRenderer } from "@/components/onboarding/question-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const { currentStep, answers, nextStep, prevStep, reset } = useOnboardingStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questions = getQuestionsForStep(currentStep);
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  async function handleSubmit() {
    if (!isLastStep) {
      nextStep();
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Something went wrong");
        setSubmitting(false);
        return;
      }

      // Update session to reflect onboarding completion
      await update({ onboardingComplete: true });
      reset();
      router.push("/recommendations");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <StepIndicator currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{STEP_TITLES[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Tell us about your academic background"}
            {currentStep === 1 && "What technical skills do you have?"}
            {currentStep === 2 && "What kind of work interests you?"}
            {currentStep === 3 && "Your work and career preferences"}
            {currentStep === 4 && "How ready are you right now?"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((q) => (
              <QuestionRenderer key={q.id} question={q} />
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : isLastStep ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get My Results
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
