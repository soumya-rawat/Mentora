import { z } from "zod";

export const onboardingSchema = z.object({
  degree: z.string().min(1, "Please select your degree"),
  yearOfStudy: z.string().min(1, "Please select your year"),
  collegeTier: z.string().min(1, "Please select your college type"),
  internships: z.string().min(1, "Please select your internship experience"),
  languages: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  codingComfort: z.number().min(1).max(5),
  mathComfort: z.number().min(1).max(5),
  workExcitement: z.string().min(1, "Please select what excites you"),
  problemSolvingStyle: z.string().min(1, "Please select your style"),
  codePreference: z.string().min(1, "Please select your preference"),
  workFocus: z.string().min(1, "Please select your focus area"),
  teamPreference: z.string().min(1, "Please select your preference"),
  jobPriority: z.string().min(1, "Please select what matters most"),
  companyPreference: z.string().min(1, "Please select your preference"),
  projectCount: z.string().min(1, "Please select your project count"),
  hasPortfolio: z.string().min(1, "Please select an option"),
  placementReadiness: z.number().min(1).max(5),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// Per-step validation schemas
export const stepSchemas = [
  // Step 0: Background
  z.object({
    degree: z.string().min(1),
    yearOfStudy: z.string().min(1),
    collegeTier: z.string().min(1),
    internships: z.string().min(1),
  }),
  // Step 1: Skills
  z.object({
    languages: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    codingComfort: z.number().min(1).max(5),
    mathComfort: z.number().min(1).max(5),
  }),
  // Step 2: Interests
  z.object({
    workExcitement: z.string().min(1),
    problemSolvingStyle: z.string().min(1),
    codePreference: z.string().min(1),
    workFocus: z.string().min(1),
  }),
  // Step 3: Preferences
  z.object({
    teamPreference: z.string().min(1),
    jobPriority: z.string().min(1),
    companyPreference: z.string().min(1),
  }),
  // Step 4: Self-Assessment
  z.object({
    projectCount: z.string().min(1),
    hasPortfolio: z.string().min(1),
    placementReadiness: z.number().min(1).max(5),
  }),
];
