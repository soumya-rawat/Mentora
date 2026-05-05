import { DomainClassification } from "@/types";

interface DomainConfig {
  keywords: string[];
  titles: string[];
  skills: string[];
}

const DOMAINS: Record<string, DomainConfig> = {
  "Software / IT": {
    keywords: ["software", "developer", "engineer", "programming", "web", "app", "application", "api", "backend", "frontend", "full stack", "fullstack", "devops", "cloud", "saas", "microservices", "agile", "sprint", "deployment", "code", "debug"],
    titles: ["software engineer", "developer", "sde", "swe", "full stack", "backend engineer", "frontend engineer", "web developer", "devops engineer", "platform engineer"],
    skills: ["python", "java", "javascript", "react", "node.js", "docker", "aws", "git", "sql", "typescript", "kubernetes", "ci/cd"],
  },
  "Data Science / AI": {
    keywords: ["data", "machine learning", "ml", "ai", "deep learning", "neural network", "nlp", "model", "training", "prediction", "analytics", "dataset", "feature engineering", "pipeline", "accuracy", "precision", "recall"],
    titles: ["data scientist", "ml engineer", "machine learning", "data analyst", "ai engineer", "research scientist", "data engineer"],
    skills: ["python", "tensorflow", "pytorch", "pandas", "numpy", "sql", "spark", "r", "tableau", "scikit-learn", "statistics"],
  },
  "Cybersecurity": {
    keywords: ["security", "penetration", "vulnerability", "threat", "firewall", "encryption", "compliance", "audit", "incident", "forensics", "malware", "intrusion"],
    titles: ["security engineer", "security analyst", "penetration tester", "cybersecurity", "soc analyst", "infosec"],
    skills: ["wireshark", "nmap", "metasploit", "burp suite", "linux", "python", "splunk", "owasp", "cissp"],
  },
  "Frontend Development": {
    keywords: ["frontend", "front-end", "ui", "ux", "responsive", "component", "pixel", "animation", "accessibility", "browser", "dom", "spa"],
    titles: ["frontend developer", "front-end engineer", "ui developer", "ui engineer", "react developer"],
    skills: ["react", "javascript", "typescript", "css", "html", "next.js", "tailwind", "figma", "vue", "angular"],
  },
  "Backend Development": {
    keywords: ["backend", "back-end", "server", "api", "database", "microservices", "scalability", "performance", "caching", "queue", "authentication"],
    titles: ["backend developer", "backend engineer", "server engineer", "api developer", "platform engineer"],
    skills: ["node.js", "python", "java", "postgresql", "docker", "redis", "aws", "rest", "graphql", "system design"],
  },
  "DevOps / Cloud": {
    keywords: ["devops", "infrastructure", "deployment", "ci/cd", "pipeline", "monitoring", "container", "orchestration", "automation", "terraform", "cloud"],
    titles: ["devops engineer", "site reliability", "sre", "cloud engineer", "platform engineer", "infrastructure engineer"],
    skills: ["docker", "kubernetes", "terraform", "aws", "jenkins", "linux", "ansible", "prometheus", "grafana", "ci/cd"],
  },
  "Mobile Development": {
    keywords: ["mobile", "android", "ios", "app store", "play store", "native", "cross-platform", "responsive", "push notification"],
    titles: ["mobile developer", "android developer", "ios developer", "react native developer", "flutter developer"],
    skills: ["react native", "flutter", "swift", "kotlin", "firebase", "dart", "xcode", "android studio"],
  },
  "Data Engineering": {
    keywords: ["etl", "pipeline", "warehouse", "data lake", "batch", "streaming", "ingestion", "transformation", "schema", "partitioning"],
    titles: ["data engineer", "etl developer", "analytics engineer", "data architect", "pipeline engineer"],
    skills: ["spark", "airflow", "sql", "python", "kafka", "snowflake", "dbt", "hadoop", "databricks", "aws"],
  },
  "Design / UX": {
    keywords: ["design", "ux", "ui", "user experience", "wireframe", "prototype", "usability", "interface", "interaction", "visual", "typography"],
    titles: ["ux designer", "ui designer", "product designer", "ux researcher", "interaction designer", "visual designer"],
    skills: ["figma", "sketch", "adobe xd", "prototyping", "wireframing", "user research", "design systems"],
  },
  "Product Management": {
    keywords: ["product", "roadmap", "stakeholder", "requirement", "user story", "backlog", "prioritization", "strategy", "metrics", "kpi", "okr"],
    titles: ["product manager", "product owner", "associate pm", "apm", "group product manager"],
    skills: ["jira", "sql", "analytics", "agile", "a/b testing", "roadmapping", "stakeholder management"],
  },
  "QA / Testing": {
    keywords: ["testing", "qa", "quality", "automation", "bug", "regression", "test case", "test plan", "defect", "coverage"],
    titles: ["qa engineer", "sdet", "test engineer", "quality analyst", "automation engineer", "test lead"],
    skills: ["selenium", "cypress", "jest", "pytest", "playwright", "jira", "postman", "sql"],
  },
  "Marketing": {
    keywords: ["marketing", "campaign", "brand", "seo", "sem", "content", "social media", "engagement", "conversion", "roi", "analytics", "growth"],
    titles: ["marketing manager", "digital marketer", "content strategist", "seo specialist", "growth manager"],
    skills: ["google analytics", "hubspot", "seo", "semrush", "content strategy", "social media"],
  },
  "Finance / Banking": {
    keywords: ["finance", "accounting", "audit", "tax", "investment", "portfolio", "risk", "compliance", "trading", "valuation", "revenue"],
    titles: ["financial analyst", "investment banker", "accountant", "auditor", "risk analyst", "fund manager"],
    skills: ["excel", "sql", "python", "financial modeling", "bloomberg", "tableau", "sap"],
  },
  "Student / Fresher": {
    keywords: ["student", "fresher", "internship", "campus", "college", "university", "academic", "coursework", "gpa", "cgpa", "placement"],
    titles: ["intern", "trainee", "fresher", "graduate", "student"],
    skills: [],
  },
};

/**
 * Classifies a resume into a domain/industry based on content analysis.
 * Uses weighted scoring: keywords×1, titles×3, skills×2.
 */
export function classifyDomain(
  resumeText: string,
  detectedSkills: string[] = []
): DomainClassification {
  const lowerText = resumeText.toLowerCase();
  const scores: { domain: string; score: number; keywords: string[] }[] = [];

  for (const [domain, config] of Object.entries(DOMAINS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Keywords (weight: 1)
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    // Titles (weight: 3)
    for (const title of config.titles) {
      if (lowerText.includes(title)) {
        score += 3;
        matchedKeywords.push(title);
      }
    }

    // Skills (weight: 2)
    for (const skill of config.skills) {
      if (
        detectedSkills.some((s) => s.toLowerCase() === skill) ||
        lowerText.includes(skill)
      ) {
        score += 2;
      }
    }

    scores.push({ domain, score, keywords: matchedKeywords });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const primary = scores[0];
  const secondary = scores[1];
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const confidence = totalScore > 0 ? primary.score / totalScore : 0;

  return {
    primary: primary.domain,
    confidence: Math.round(confidence * 100) / 100,
    secondary: secondary && secondary.score > 0 ? secondary.domain : null,
    keywordsMatched: primary.keywords.slice(0, 10),
  };
}
