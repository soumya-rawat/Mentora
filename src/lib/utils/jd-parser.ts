import { ParsedJobDescription } from "@/types";

// Patterns that signal the "requirements" section of a JD
const REQUIRED_SECTION_PATTERNS = [
  /\b(requirements?|must\s*have|required|qualifications?|what\s*you('ll)?\s*need)\b/i,
];

const PREFERRED_SECTION_PATTERNS = [
  /\b(nice\s*to\s*have|preferred|bonus|good\s*to\s*have|plus|desirable)\b/i,
];

const RESPONSIBILITY_SECTION_PATTERNS = [
  /\b(responsibilities|what\s*you('ll)?\s*do|role|about\s*the\s*role|key\s*duties)\b/i,
];

// Common experience level patterns
const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
  /\b(fresher|entry[- ]level|junior|mid[- ]?level|senior|lead)\b/i,
  /\b(0-[12]|1-3|2-4|3-5|5-8|8\+)\s*(?:years?|yrs?)/i,
];

// Skill extraction patterns (tech keywords commonly found in JDs)
const TECH_SKILLS_PATTERN = /\b(React|Angular|Vue|Next\.?js|Node\.?js|Express|Django|Flask|Spring|Rails|Python|Java|JavaScript|TypeScript|Go|Rust|C\+\+|Kotlin|Swift|Ruby|PHP|Scala|R|SQL|NoSQL|PostgreSQL|MySQL|MongoDB|Redis|DynamoDB|Cassandra|AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CI\/CD|Git|Linux|REST|GraphQL|gRPC|Kafka|RabbitMQ|Elasticsearch|TensorFlow|PyTorch|Pandas|NumPy|Spark|Airflow|Tableau|Power BI|Figma|Tailwind|Material UI|Jest|Cypress|Selenium|Playwright|HTML|CSS|Sass|Webpack|Vite|Redux|Zustand|Firebase|Supabase|OAuth|JWT|Microservices|System Design|Data Structures|Algorithms|Machine Learning|Deep Learning|NLP|Computer Vision|DevOps|Agile|Scrum|Jira)\b/gi;

/**
 * Parses a job description text into structured data.
 * Extracts required skills, preferred skills, experience level, and responsibilities.
 */
export function parseJobDescription(text: string): ParsedJobDescription {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // ── Extract title and company ──
  const title = extractTitle(lines);
  const company = extractCompany(text);

  // ── Split text into sections ──
  const { required, preferred, responsibilities } = splitJDSections(lines);

  // ── Extract skills ──
  const requiredSkills = extractSkillsFromLines(required, text);
  const preferredSkills = extractSkillsFromLines(preferred, "");

  // ── Extract experience level ──
  const experienceLevel = extractExperienceLevel(text);

  // ── Extract responsibilities ──
  const responsibilityList = extractBulletItems(responsibilities);

  return {
    title,
    company,
    requiredSkills: [...new Set(requiredSkills)],
    preferredSkills: [...new Set(preferredSkills.filter((s) => !requiredSkills.includes(s)))],
    experienceLevel,
    responsibilities: responsibilityList,
    rawText: text,
  };
}

function extractTitle(lines: string[]): string | null {
  // Title is usually in the first 3 lines and contains role-related keywords
  for (const line of lines.slice(0, 5)) {
    if (/\b(engineer|developer|analyst|designer|manager|architect|scientist|lead|intern)\b/i.test(line)) {
      // Clean up the title
      const cleaned = line.replace(/^(job\s*title|position|role)\s*[:—\-]\s*/i, "").trim();
      if (cleaned.length <= 80) return cleaned;
    }
  }
  return null;
}

function extractCompany(text: string): string | null {
  const patterns = [
    /\b(?:at|@|company)\s*[:—\-]?\s*([A-Z][\w\s&.]+?)(?:\s*[-—|,]|\n)/,
    /\b([\w\s]+?)\s*(?:is\s*(?:looking|hiring|seeking))/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match && match[1] && match[1].length <= 40) {
      return match[1].trim();
    }
  }
  return null;
}

function splitJDSections(lines: string[]): {
  required: string[];
  preferred: string[];
  responsibilities: string[];
} {
  let currentSection: "required" | "preferred" | "responsibilities" | "other" = "other";
  const result = { required: [] as string[], preferred: [] as string[], responsibilities: [] as string[] };

  for (const line of lines) {
    // Check if this line is a section header
    if (REQUIRED_SECTION_PATTERNS.some((p) => p.test(line)) && line.length <= 60) {
      currentSection = "required";
      continue;
    }
    if (PREFERRED_SECTION_PATTERNS.some((p) => p.test(line)) && line.length <= 60) {
      currentSection = "preferred";
      continue;
    }
    if (RESPONSIBILITY_SECTION_PATTERNS.some((p) => p.test(line)) && line.length <= 60) {
      currentSection = "responsibilities";
      continue;
    }

    if (currentSection !== "other") {
      result[currentSection].push(line);
    }
  }

  return result;
}

function extractSkillsFromLines(lines: string[], fullText: string): string[] {
  const skills: string[] = [];
  const textToSearch = lines.length > 0 ? lines.join(" ") : fullText;

  const matches = textToSearch.match(TECH_SKILLS_PATTERN) || [];
  for (const match of matches) {
    // Normalize common variations
    const normalized = normalizeSkill(match);
    if (!skills.includes(normalized)) {
      skills.push(normalized);
    }
  }

  // If no structured sections found, extract from full text
  if (skills.length === 0 && fullText) {
    const fullMatches = fullText.match(TECH_SKILLS_PATTERN) || [];
    for (const match of fullMatches) {
      const normalized = normalizeSkill(match);
      if (!skills.includes(normalized)) {
        skills.push(normalized);
      }
    }
  }

  return skills;
}

function normalizeSkill(skill: string): string {
  const normalizations: Record<string, string> = {
    "reactjs": "React",
    "react.js": "React",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
  };
  return normalizations[skill.toLowerCase()] || skill;
}

function extractExperienceLevel(text: string): string | null {
  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

function extractBulletItems(lines: string[]): string[] {
  const items: string[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[•\-\*▪►>\d.)\s]+/, "").trim();
    if (cleaned.length >= 15 && cleaned.length <= 300) {
      items.push(cleaned);
    }
  }
  return items.slice(0, 10); // cap at 10 responsibilities
}
