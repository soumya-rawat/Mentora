import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
  currentStep: number;
  answers: Record<string, string | string[] | number>;
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  toggleMultiSelect: (questionId: string, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      answers: {
        codingComfort: 3,
        mathComfort: 3,
        placementReadiness: 3,
        languages: [],
        tools: [],
      },

      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),

      toggleMultiSelect: (questionId, value) =>
        set((state) => {
          const current = (state.answers[questionId] as string[]) || [];
          const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { answers: { ...state.answers, [questionId]: updated } };
        }),

      nextStep: () =>
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),

      prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

      reset: () =>
        set({
          currentStep: 0,
          answers: {
            codingComfort: 3,
            mathComfort: 3,
            placementReadiness: 3,
            languages: [],
            tools: [],
          },
        }),
    }),
    {
      name: "mentora-onboarding",
    }
  )
);
