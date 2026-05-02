import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Route,
  FileText,
  BarChart3,
  Target,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Career Discovery",
    description:
      "Answer a 5-minute questionnaire and discover which of 12 tech roles match your skills, interests, and goals.",
  },
  {
    icon: Target,
    title: "Explainable Fit Scores",
    description:
      "See exactly why each role is recommended — with skill matching, interest alignment, and market demand scoring.",
  },
  {
    icon: Route,
    title: "Personalized Roadmap",
    description:
      "Get a step-by-step learning roadmap with free resources, tailored to your current level and target role.",
  },
  {
    icon: FileText,
    title: "Resume ATS Analyzer",
    description:
      "Upload your resume and get feedback on keyword coverage, structure, and how well it matches your target role.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track task completion, maintain streaks, and see your readiness grow with visual dashboards.",
  },
  {
    icon: GraduationCap,
    title: "India-Focused",
    description:
      "Built for BTech, BCA & MCA students. Salary data in INR, free learning resources, and placement-ready advice.",
  },
];

const steps = [
  { number: "1", title: "Complete Profile", description: "Answer 18 quick questions about your background, skills, and interests." },
  { number: "2", title: "Get Recommendations", description: "See your top tech career matches with detailed fit scores and explanations." },
  { number: "3", title: "Follow Your Roadmap", description: "Pick a role, get a personalized roadmap, and start completing tasks." },
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "QA / SDET",
  "Data Analyst",
  "Data Engineer",
  "ML Engineer",
  "UI/UX Designer",
  "Product Analyst",
  "Cybersecurity Analyst",
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              <GraduationCap className="h-4 w-4" />
              Built for Indian Tech Students
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Discover Your Perfect{" "}
              <span className="text-blue-600">Tech Career Path</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Stop guessing. Get personalized career recommendations, structured
              roadmaps, and resume feedback — built specifically for BTech, BCA
              &amp; MCA students preparing for placements.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base">
                  Start Free Assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Takes 5 minutes. No payment required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Roles */}
      <section className="border-y bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-gray-500">
            12 Tech Roles We Help You Explore
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-gray-600">
              Three simple steps to a clearer career direction
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-xl border bg-white p-8 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              More Than a Chatbot
            </h2>
            <p className="mt-4 text-gray-600">
              A structured system with deterministic scoring, personalized
              roadmaps, and real resume analysis
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Why Mentora is Different
            </h2>
            <div className="mt-10 space-y-4">
              {[
                "Deterministic scoring — consistent, explainable results, not random chatbot output",
                "India-specific — salary in INR, placement-focused, tier-2/3 college aware",
                "12 validated tech roles — not generic 'any career' advice",
                "Free resources only — YouTube, docs, freeCodeCamp, NPTEL",
                "Resume analysis against your target role — not generic templates",
                "Progress tracking with streaks — accountability, not just advice",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to find your tech career path?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of Indian students building their career with confidence.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-base"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
