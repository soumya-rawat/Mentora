# Mentora — Resume Analysis Module: Technical Report

## 1. Overview

The Resume Analysis Module is a core feature of Mentora, an AI-powered career guidance platform for Indian tech students. It provides three capabilities:

1. **Deep Resume Analysis** — ATS scoring, bullet point quality assessment, strength/weakness detection, and AI-powered suggestions against a target role.
2. **Job Description Matching** — Paste any JD, get a match score with skill gap analysis.
3. **AI-Powered Improvements** — Gemini LLM rewrites weak bullet points and generates tailored suggestions.

The module follows a **hybrid architecture**: deterministic algorithms handle scoring and pattern matching (reproducible, fast, zero-cost), while a Large Language Model (Google Gemini 2.0 Flash) is layered on top for natural language generation tasks only.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  Next.js React Page (Tabbed: Role Analysis | JD Match)          │
│  Upload PDF → Select Role or Paste JD → View Results → Download │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP POST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                        │
│  /api/resume/upload    — PDF ingestion + OCR fallback           │
│  /api/resume/analyze   — Full analysis pipeline                 │
│  /api/resume/match-jd  — JD matching pipeline                   │
│  /api/resume/report    — PDF report generation                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
│                  resume.service.ts                                │
│                                                                  │
│  Orchestrates the full pipeline:                                 │
│  1. Text Extraction (unpdf + Tesseract.js OCR fallback)          │
│  2. Resume Parsing (section extraction, formatting detection)    │
│  3. Bullet Point Analysis (quality scoring on 4 dimensions)      │
│  4. Section-Level Scoring (skills, projects, experience, edu)    │
│  5. Strength & Weakness Detection                                │
│  6. Keyword Matching (word-boundary regex, 500+ skill DB)        │
│  7. Domain Classification (14 industries, weighted scoring)      │
│  8. ATS Score Calculation (weighted formula with penalties)       │
│  9. AI Enhancement (Gemini: feedback, rewrites, suggestions)     │
│  10. Persistence (PostgreSQL via Prisma ORM)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
    ┌──────────────┐ ┌────────────┐ ┌──────────────┐
    │ Deterministic │ │ AI Provider│ │   Database   │
    │   Utilities   │ │  (Gemini)  │ │ (PostgreSQL) │
    │               │ │            │ │              │
    │ • Parser      │ │ • Feedback │ │ • Uploads    │
    │ • Scorer      │ │ • Rewrites │ │ • Analyses   │
    │ • Matcher     │ │ • Suggest  │ │ • JD Matches │
    │ • Classifier  │ │ • JD Coach │ │ • Streaks    │
    │ • Bullet Anal.│ │            │ │              │
    └──────────────┘ └────────────┘ └──────────────┘
```

---

## 3. Text Extraction Pipeline

### 3.1 Primary Extraction — unpdf

PDF text is extracted server-side using `unpdf`, a lightweight Node.js library that parses PDF page content without requiring a browser or worker threads.

```
PDF Buffer → unpdf.extractText() → Raw Text (per page) → Joined String
```

### 3.2 OCR Fallback — Tesseract.js

For image-based PDFs (scanned resumes), the system detects insufficient text and falls back to Optical Character Recognition:

**Trigger Conditions:**
- Extracted text < 100 characters
- Word count < 30
- No email or phone detected in text with word count < 80

**OCR Engine:** Tesseract.js (pure JavaScript, no system dependencies)
- Language: English
- Processes the PDF as an image
- Returns text with confidence score (low/medium/high)

---

## 4. Natural Language Processing (NLP) Techniques

### 4.1 Section Detection — Rule-Based NER

The parser identifies resume sections using **pattern-based Named Entity Recognition**:

```
Section Headers → Regex Patterns:
  education    → /\b(education|academic|degree|b\.?tech|bca|mca)\b/i
  experience   → /\b(experience|employment|internship|professional)\b/i
  skills       → /\b(skills|technical\s*skills|technologies|competencies)\b/i
  projects     → /\b(projects?|portfolio|academic\s*projects?)\b/i
  certifications → /\b(certifications?|certificates?|courses?|training)\b/i
  contact      → /\b(email|phone|linkedin|github|contact)\b/i
```

Each section's **content** is extracted (text between headers), not just detected. This enables section-level quality analysis.

### 4.2 Skill Extraction — Lexicon-Based Matching with Word Boundaries

The system maintains a curated **lexicon of 500+ technical skills** across categories:

| Category | Count | Examples |
|----------|-------|---------|
| Programming Languages | 45+ | Python, Java, JavaScript, TypeScript, Go, Rust |
| Frameworks | 80+ | React, Django, Spring Boot, TensorFlow, Flutter |
| Tools | 150+ | Docker, AWS, Jenkins, Figma, Jira, Postman |
| Databases | 35+ | PostgreSQL, MongoDB, Redis, DynamoDB, Elasticsearch |
| Soft Skills | 50+ | Leadership, Communication, Agile, Problem Solving |
| Certifications | 40+ | AWS Certified, PMP, CISSP, CKA |

**Matching Algorithm:** Word-boundary regex to prevent false positives:
```
Input:  "Java"
Regex:  /\bJava\b/i
Result: Matches "Java" but NOT "JavaScript"
```

**Synonym Resolution:** Each skill maps to known variations:
```
"React" → ["ReactJS", "React.js", "React JS"]
"Node.js" → ["NodeJS", "Node JS", "Node"]
"CI/CD" → ["CICD", "continuous integration", "continuous deployment"]
```

### 4.3 Context-Aware Proficiency Detection

Beyond presence/absence, the system infers **how strongly** a skill is demonstrated by analyzing surrounding context (±60-80 characters around the mention):

| Signal | Pattern Examples | Classification |
|--------|-----------------|----------------|
| Demonstrated | "built with React", "deployed using Docker" | Moderate proficiency |
| Strong claim | "proficient in Python", "3+ years of Java" | Strong proficiency |
| Surface mention | "familiar with AWS", "basic knowledge of SQL" | Surface-level |
| Listed only | Appears in skills list, no project context | Listed only |

### 4.4 Bullet Point Quality Analysis

Each bullet point is scored on **4 NLP-derived dimensions** (0-100 each):

**Impact Score (35% weight):**
- Detects quantified metrics: `\d+%`, `\d+x`, `$[\d,]+`, `\d+ users/clients/requests`
- 2+ metrics = 100, 1 metric = 70, vague quantifiers ("significantly") = 30

**Specificity Score (25% weight):**
- Detects named technologies via 10+ regex patterns covering frameworks, languages, cloud, databases
- Detects concrete deliverables: "feature", "API", "pipeline", "dashboard"

**Action Score (20% weight):**
- Classifies opening verb into three tiers:
  - **Strong (score=100):** architected, built, deployed, engineered, launched, optimized
  - **Moderate (score=60):** automated, collaborated, configured, improved, integrated
  - **Weak (score=20):** assisted, helped, participated, responsible, worked
- Penalizes filler phrases: "responsible for", "involved in", "worked on"

**Clarity Score (20% weight):**
- Optimal length: 8-25 words (score=90)
- Penalizes vague language: "various", "several", "things", "etc"

**Overall = Impact×0.35 + Specificity×0.25 + Action×0.20 + Clarity×0.20**

Rating: Strong (≥70) | Adequate (40-69) | Weak (<40)

### 4.5 Domain Classification

The system auto-detects the resume's target industry using a **weighted keyword-scoring classifier** across 14 domains:

**Domains:** Software/IT, Data Science/AI, Cybersecurity, Frontend, Backend, DevOps/Cloud, Mobile, Data Engineering, Design/UX, Product Management, QA/Testing, Marketing, Finance, Student/Fresher

**Scoring Algorithm:**
```
For each domain:
  score = 0
  For each keyword in domain.keywords:
    if keyword found in resume text: score += 1    (weight: 1×)
  For each title in domain.titles:
    if title found in resume text: score += 3       (weight: 3×)
  For each skill in domain.skills:
    if skill found in detected skills: score += 2   (weight: 2×)

confidence = primary_domain_score / total_all_scores
```

Job titles are weighted 3× because they are the strongest signal of domain intent.

---

## 5. ATS Scoring Algorithm

The ATS (Applicant Tracking System) readiness score simulates how well the resume would perform in automated screening systems used by Indian companies.

### 5.1 Scoring Formula

```
ATS Score = Keyword Score × 0.40
          + Section Score × 0.25
          + Formatting Score × 0.15
          + Content Score × 0.20
```

### 5.2 Component Breakdown

**Keyword Score (40% weight):**
```
matched_weight = Σ weight(skill) for all found skills
total_weight = Σ weight(skill) for all role skills
keyword_score = (matched_weight / total_weight) × 100
```
Each skill in a role definition has a weight (0.0-1.0) reflecting its importance. A role may have 10-15 skills with different weights.

**Section Score (25% weight):**
```
Required sections (25 pts each): Education, Skills, Projects
Optional sections (8.33 pts each): Experience, Certifications, Contact
Maximum: 100
```

**Formatting Score (15% weight):**
```
Base: 50
+ Contact info present: +25
+ 4+ sections detected: +25
Penalties:
  - Tables detected: -15 (ATS parsers struggle with tables)
  - Special characters (→, ★, ✓, ❖): -3 each, max -15
  - Fewer than 5 bullet points: -10
  - Word count > 1500: -10
```

**Content Score (20% weight):**
```
Base: 40
+ Quantified achievements found: +30
+ Action verbs detected: +30
Maximum: 100
```

### 5.3 Score Categories
- **Excellent (≥75):** Well-optimized, likely to pass ATS
- **Good (50-74):** Moderate, some improvements needed
- **Needs Improvement (40-49):** Significant gaps
- **Poor (<40):** Major restructuring required

---

## 6. Job Description Matching Algorithm

### 6.1 JD Parsing

The system extracts structured data from raw job description text:
- **Required Skills:** From sections matching "requirements", "must have", "qualifications"
- **Preferred Skills:** From "nice to have", "preferred", "bonus" sections
- **Experience Level:** Pattern matching for "X+ years", "fresher", "entry-level", "senior"
- **Role Title & Company:** Heuristic extraction from first 5 lines

Skill extraction uses a regex pattern matching 60+ known tech keywords.

### 6.2 Match Score Calculation

```
required_matched = count(required skills found in resume)
required_total = count(required skills in JD)
preferred_matched = count(preferred skills found in resume)
preferred_total = count(preferred skills in JD)

match_score = (required_matched / required_total) × 70
            + (preferred_matched / preferred_total) × 30
```

Required skills contribute 70% of the score because they are non-negotiable in hiring.

### 6.3 Skill Demonstration Detection

For each matched skill, the system checks whether it is merely **listed** or **demonstrated** through project/experience context:
- "Docker" in skills section → Found, not demonstrated
- "Containerized microservices using Docker" → Found AND demonstrated

This distinction is surfaced to the user as "weak skills" — present but not backed by evidence.

---

## 7. AI Integration — Google Gemini 2.0 Flash

### 7.1 Architecture: Provider-Agnostic Interface

```typescript
interface AIProvider {
  generateResumeFeedback(input): Promise<string>
  rewriteBulletPoints(input): Promise<RewrittenBullet[]>
  generateSmartSuggestions(input): Promise<SmartSuggestion[]>
  generateJDFeedback(input): Promise<string>
}
```

Two implementations:
- **GeminiProvider:** Calls Google Gemini 2.0 Flash API (temperature: 0.6-0.7, max tokens: 300-800)
- **MockProvider:** Template-based fallback (zero cost, works without API key)

Auto-fallback: If Gemini fails (API error, key missing), MockProvider is used silently.

### 7.2 Context-Stuffed Prompting (Not Fine-Tuning)

Instead of training a custom model, we **prompt-engineer** Gemini with rich context from our deterministic analysis:

**System Prompt (India-focused):**
```
You are a senior resume reviewer specializing in Indian tech placements.
You understand:
- Indian fresher hiring: on-campus, off-campus, referrals
- ATS systems used by Indian product companies (Razorpay, Flipkart) 
  and service companies (TCS, Infosys)
- What makes resumes stand out: quantified impact, specific tech
- STAR format: Situation, Task, Action, Result
- Indian salary context: LPA ranges, stock options at startups
```

**Per-Request Context Injection:**
```
Student profile: Year 3, Tier-2 college
Target role: Backend Developer
Our analysis found:
  - ATS Score: 52/100
  - Missing keywords: Docker, CI/CD, PostgreSQL
  - Weak bullets: 4/6 lack metrics
  - Strengths: Good project section, has GitHub
  - Weaknesses: No quantified impact, generic skill listing
```

The AI receives the **complete deterministic analysis as structured input**, making its output highly specific rather than generic.

### 7.3 AI Tasks

| Task | Input | Output | Token Limit |
|------|-------|--------|-------------|
| Resume Feedback | ATS score, sections, keywords, resume text | Actionable paragraph | 400 |
| Bullet Rewrites | Weak bullets + issues + role context | JSON: [{original, rewritten, explanation}] | 800 |
| Smart Suggestions | Full analysis + strengths/weaknesses | JSON: [{category, section, suggestion, priority}] | 600 |
| JD Feedback | Match score, gaps, student profile | Actionable paragraph | 400 |

---

## 8. Strength & Weakness Detection

### 8.1 Section-Level Deep Scoring

Each resume section is scored 0-100 based on content quality:

**Skills Section:** Categorization (+20), skill count 8-20 (+20), proficiency levels (+10)
**Projects Section:** Tech stacks mentioned (+20), GitHub/live links (+15), strong bullets (+15), 3+ projects (+10)
**Experience Section:** Dates/duration (+15), role titles (+10), bullet quality based on average score
**Education Section:** GPA/CGPA (+20), relevant coursework (+15), degree stated (+10)

### 8.2 Automated Issue Detection

| Issue | Detection Method | Severity |
|-------|-----------------|----------|
| Missing Skills section | Section not in detected list | Critical |
| No projects or experience | Neither section found | Critical |
| Missing email | No email regex match | Critical |
| Generic phrases | "responsible for", "duties included" etc. | Moderate |
| No quantified metrics | No `\d+%`, `$amount`, `N users` pattern | Moderate |
| Weak bullet points | 3+ bullets rated "weak" | Moderate |
| Resume too short | < 150 words | Critical |
| Resume too long | > 800 words | Minor |
| Tables detected | 3+ pipe characters in a line | Moderate |
| Special characters | ATS-unfriendly symbols found | Minor |

---

## 9. PDF Report Generation

The system generates a downloadable PDF report using **jsPDF** (client-side PDF library running on server):
- Page 1: ATS Score, category, domain classification, strengths, weaknesses
- Page 2: Keyword analysis (found/missing), AI-powered suggestions

---

## 10. Data Model

```
ResumeUpload (1) ──→ (many) ResumeAnalysis
                 ──→ (many) JDMatch

ResumeAnalysis stores:
  - atsScore (Float)
  - keywordMatches (JSON: skill, found, matchType, weight, demonstrated)
  - sectionScores (JSON: section, found, score, feedback)
  - bulletAnalysis (JSON: text, scores, rating, issues)
  - strengths/weaknesses (JSON arrays)
  - rewrittenBullets (JSON: original, rewritten, explanation)
  - smartSuggestions (JSON: category, section, suggestion, priority)
  - domain (JSON: primary, confidence, secondary)
  - formattingIssues (JSON: string[])
  - feedback (Text: AI-generated)
```

---

## 11. Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript 5 | Type safety |
| Database | PostgreSQL + Prisma 7.8 | Data persistence + ORM |
| AI/LLM | Google Gemini 2.0 Flash | Natural language generation |
| PDF Parsing | unpdf | Server-side text extraction |
| OCR | Tesseract.js | Image-based PDF fallback |
| PDF Generation | jsPDF | Downloadable reports |
| Auth | NextAuth 5 (JWT) | Session management |
| UI | Tailwind CSS + shadcn/ui | Component library |
| State | Zustand | Client-side state |
| Validation | Zod | Schema validation |

---

## 12. Key Design Decisions

1. **Deterministic First, AI Second:** Core scoring uses reproducible algorithms. AI only generates text (explanations, rewrites). This ensures consistency, debuggability, and zero-cost operation in mock mode.

2. **Context-Stuffed Prompting over Fine-Tuning:** Instead of training a custom model (prohibitive for a student team), we engineer prompts with rich structured context from our analysis pipeline, achieving domain-specific output without ML infrastructure.

3. **Word-Boundary Matching over NER Models:** Traditional NLP NER models (spaCy, BERT-NER) require training data and compute. Regex word boundaries with a 500+ curated lexicon achieve comparable accuracy for skill extraction at zero compute cost.

4. **Provider-Agnostic AI Interface:** The system works identically with Gemini, a mock provider, or any future LLM. This prevents vendor lock-in and enables cost-free development/demo.

5. **India-Specific Tailoring:** System prompts, salary data, company lists, and college tier awareness are all calibrated for the Indian tech placement ecosystem.