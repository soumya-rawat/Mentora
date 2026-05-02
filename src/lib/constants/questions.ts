export type QuestionType = "single-select" | "multi-select" | "slider";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  step: number;
  type: QuestionType;
  label: string;
  description?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

export const STEP_TITLES = [
  "Your Background",
  "Your Skills",
  "Your Interests",
  "Your Preferences",
  "Self-Assessment",
];

export const QUESTIONS: Question[] = [
  // Step 1: Background
  {
    id: "degree",
    step: 0,
    type: "single-select",
    label: "What degree are you pursuing?",
    options: [
      { value: "btech-cse", label: "BTech CSE" },
      { value: "btech-it", label: "BTech IT" },
      { value: "btech-ece", label: "BTech ECE" },
      { value: "btech-other", label: "BTech (Other branch)" },
      { value: "bca", label: "BCA" },
      { value: "mca", label: "MCA" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "yearOfStudy",
    step: 0,
    type: "single-select",
    label: "What year are you in?",
    options: [
      { value: "1", label: "1st Year" },
      { value: "2", label: "2nd Year" },
      { value: "3", label: "3rd Year" },
      { value: "4", label: "4th Year" },
      { value: "graduated", label: "Graduated / Fresher" },
    ],
  },
  {
    id: "collegeTier",
    step: 0,
    type: "single-select",
    label: "What type of college are you in?",
    description: "This helps us tailor placement-specific advice",
    options: [
      { value: "iit-nit", label: "IIT / NIT / IIIT" },
      { value: "tier-1", label: "Tier-1 Private (BITS, VIT, etc.)" },
      { value: "tier-2", label: "Tier-2 College" },
      { value: "tier-3", label: "Tier-3 College" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "internships",
    step: 0,
    type: "single-select",
    label: "Have you done any tech internships?",
    options: [
      { value: "none", label: "None yet" },
      { value: "1", label: "1 internship" },
      { value: "2+", label: "2 or more" },
    ],
  },

  // Step 2: Skills
  {
    id: "languages",
    step: 1,
    type: "multi-select",
    label: "Which programming languages have you used?",
    description: "Select all that apply, even if you're a beginner",
    options: [
      { value: "Python", label: "Python" },
      { value: "Java", label: "Java" },
      { value: "C/C++", label: "C / C++" },
      { value: "JavaScript", label: "JavaScript" },
      { value: "TypeScript", label: "TypeScript" },
      { value: "Go", label: "Go" },
      { value: "SQL", label: "SQL" },
      { value: "R", label: "R" },
      { value: "Bash/Shell", label: "Bash / Shell" },
    ],
  },
  {
    id: "tools",
    step: 1,
    type: "multi-select",
    label: "Which tools and frameworks have you used?",
    description: "Select all that apply",
    options: [
      { value: "React", label: "React" },
      { value: "Node.js", label: "Node.js" },
      { value: "Django", label: "Django / Flask" },
      { value: "Spring", label: "Spring Boot" },
      { value: "Docker", label: "Docker" },
      { value: "AWS", label: "AWS / GCP / Azure" },
      { value: "Git", label: "Git / GitHub" },
      { value: "Figma", label: "Figma" },
      { value: "Tableau", label: "Tableau / Power BI" },
      { value: "Linux", label: "Linux" },
      { value: "Selenium", label: "Selenium / Cypress" },
      { value: "Excel", label: "Excel / Google Sheets" },
    ],
  },
  {
    id: "codingComfort",
    step: 1,
    type: "slider",
    label: "How comfortable are you with coding?",
    description: "1 = just started, 5 = very confident",
    min: 1,
    max: 5,
    minLabel: "Just started",
    maxLabel: "Very confident",
  },
  {
    id: "mathComfort",
    step: 1,
    type: "slider",
    label: "How comfortable are you with math and statistics?",
    description: "1 = not at all, 5 = very comfortable",
    min: 1,
    max: 5,
    minLabel: "Not comfortable",
    maxLabel: "Very comfortable",
  },

  // Step 3: Interests
  {
    id: "workExcitement",
    step: 2,
    type: "single-select",
    label: "What kind of work excites you the most?",
    options: [
      { value: "Building user interfaces", label: "Building user interfaces" },
      { value: "Building backend systems", label: "Building backend systems & APIs" },
      { value: "Working with data", label: "Working with data & finding insights" },
      { value: "Automating infrastructure", label: "Automating infrastructure & deployments" },
      { value: "Ensuring quality", label: "Ensuring software quality & testing" },
      { value: "Designing experiences", label: "Designing user experiences" },
    ],
  },
  {
    id: "problemSolvingStyle",
    step: 2,
    type: "single-select",
    label: "Which problem-solving style fits you best?",
    options: [
      { value: "Algorithmic/logical", label: "Algorithmic / Logical thinking" },
      { value: "Creative/visual", label: "Creative / Visual thinking" },
      { value: "Analytical/data-driven", label: "Analytical / Data-driven thinking" },
      { value: "Systematic/process-oriented", label: "Systematic / Process-oriented thinking" },
    ],
  },
  {
    id: "codePreference",
    step: 2,
    type: "single-select",
    label: "What's your ideal work day?",
    options: [
      { value: "Writing code all day", label: "Writing code all day" },
      { value: "Mix of code and communication", label: "Mix of coding and communication" },
      { value: "More analysis, less code", label: "More analysis, less coding" },
      { value: "More design, less code", label: "More design, less coding" },
    ],
  },
  {
    id: "workFocus",
    step: 2,
    type: "single-select",
    label: "What would you rather work on?",
    options: [
      { value: "Consumer-facing products", label: "Consumer-facing products (apps, websites)" },
      { value: "Internal tools & infrastructure", label: "Internal tools & infrastructure" },
      { value: "Data pipelines & insights", label: "Data pipelines & analytics" },
      { value: "Security & reliability", label: "Security & system reliability" },
    ],
  },

  // Step 4: Preferences
  {
    id: "teamPreference",
    step: 3,
    type: "single-select",
    label: "How do you prefer to work?",
    options: [
      { value: "Solo deep work", label: "Solo deep work" },
      { value: "Pair programming", label: "Pair programming / collaboration" },
      { value: "Small team collaboration", label: "Small team (3-5 people)" },
      { value: "Large cross-functional team", label: "Large cross-functional team" },
    ],
  },
  {
    id: "jobPriority",
    step: 3,
    type: "single-select",
    label: "What matters most in your first job?",
    options: [
      { value: "salary", label: "High salary / CTC" },
      { value: "learning", label: "Learning & growth opportunities" },
      { value: "balance", label: "Work-life balance" },
      { value: "brand", label: "Brand name company" },
    ],
  },
  {
    id: "companyPreference",
    step: 3,
    type: "single-select",
    label: "What type of company interests you?",
    options: [
      { value: "product", label: "Product-based company" },
      { value: "service", label: "Service-based / IT consulting" },
      { value: "startup", label: "Startup" },
      { value: "no-preference", label: "No preference / Not sure" },
    ],
  },

  // Step 5: Self-Assessment
  {
    id: "projectCount",
    step: 4,
    type: "single-select",
    label: "How many tech projects have you built?",
    options: [
      { value: "none", label: "None yet" },
      { value: "1-2-academic", label: "1-2 academic projects" },
      { value: "3+-personal", label: "3+ including personal projects" },
      { value: "open-source", label: "Contributed to open source" },
    ],
  },
  {
    id: "hasPortfolio",
    step: 4,
    type: "single-select",
    label: "Do you have a portfolio or active GitHub?",
    options: [
      { value: "yes-active", label: "Yes, actively maintained" },
      { value: "yes-basic", label: "Yes, but basic / inactive" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "placementReadiness",
    step: 4,
    type: "slider",
    label: "How placement-ready do you feel right now?",
    description: "1 = not at all, 5 = very ready",
    min: 1,
    max: 5,
    minLabel: "Not ready at all",
    maxLabel: "Very ready",
  },
];

export function getQuestionsForStep(step: number): Question[] {
  return QUESTIONS.filter((q) => q.step === step);
}

export const TOTAL_STEPS = STEP_TITLES.length;
