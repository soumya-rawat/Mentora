# Mentora — AI Career Guide

AI-powered career guidance platform for Indian BTech, BCA & MCA students. Get personalized role recommendations, structured roadmaps, and ATS-style resume analysis.

## Features

- **Career Discovery** — Answer 18 questions, get scored matches across 12 tech roles
- **Explainable Fit Scores** — Deterministic scoring with skill, interest, aptitude, and market breakdown
- **Personalized Roadmaps** — Milestone-based learning paths with free resources
- **Resume ATS Analyzer** — Upload PDF, get keyword matching and improvement suggestions
- **Progress Dashboard** — Track tasks, streaks, and readiness over time
- **India-Focused** — Salary in INR, placement-ready framing, free resource emphasis

## Supported Roles

Frontend Developer, Backend Developer, Full-Stack Developer, DevOps Engineer, Cloud Engineer, QA/SDET, Data Analyst, Data Engineer, ML Engineer, UI/UX Designer, Product Analyst, Cybersecurity Analyst

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma v7
- **Auth:** NextAuth v5 (credentials provider)
- **AI:** Mock-first (provider-agnostic interface, no paid API needed)
- **Charts:** Recharts
- **PDF Parsing:** pdf-parse

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or cloud)

### Setup

```bash
# Clone and install
cd careercoach
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

After seeding, you can login with these demo accounts (password: `password123`):

| Email | Profile |
|---|---|
| arjun@demo.com | 2nd year CSE, tier-2 college, Backend Dev path |
| priya@demo.com | 4th year IT, IIT/NIT, Data Analyst path |
| meera@demo.com | 3rd year BCA, UI/UX Designer path |

### Environment Variables

```
DATABASE_URL     — PostgreSQL connection string
AUTH_SECRET      — NextAuth secret (generate with: npx auth secret)
AUTH_URL         — App URL (http://localhost:3000 for dev)
AI_PROVIDER      — "mock" (default) or "openai"
OPENAI_API_KEY   — Only needed when AI_PROVIDER=openai
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (marketing)/        # Public landing page
│   ├── (auth)/             # Login and register pages
│   ├── (app)/              # Authenticated app pages
│   └── api/                # API route handlers
├── components/             # React components (shadcn/ui + feature-specific)
├── lib/
│   ├── constants/          # Role definitions, questions, roadmap templates
│   ├── services/           # Business logic (recommendation, roadmap, resume, AI)
│   ├── utils/              # Pure functions (scoring, parsing, keyword matching)
│   └── validations/        # Zod schemas
├── stores/                 # Zustand stores
└── types/                  # TypeScript type definitions
```

## Architecture

- **Deterministic scoring** for career recommendations (weighted matrix, no AI dependency)
- **Provider-agnostic AI interface** — mock provider for demo, swap in OpenAI/Claude later
- **Service layer pattern** — thin API routes, business logic in services
- **Template-based roadmaps** — filtered by skill level and year of study

## Team (4-person split)

| Member | Modules |
|---|---|
| A (Lead) | Project setup, auth, Prisma schema, AI service interface, deployment |
| B (Frontend) | Landing page, onboarding form, dashboard, UI polish |
| C (Backend) | Scoring engine, role constants, roadmap system |
| D (Full-stack) | Resume analysis, role detail pages, seed data |
