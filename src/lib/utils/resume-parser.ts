import { ParsedResumeV2, ResumeFormatting, SectionContent } from "@/types";

const SECTION_PATTERNS: Record<string, RegExp> = {
  education: /\b(education|academic|qualification|university|college|degree|b\.?tech|btech|bca|mca)\b/i,
  experience: /\b(experience|employment|work\s*history|internship|professional)\b/i,
  skills: /\b(skills|technical\s*skills|technologies|tech\s*stack|competencies)\b/i,
  projects: /\b(projects?|portfolio|personal\s*projects?|academic\s*projects?)\b/i,
  certifications: /\b(certifications?|certificates?|courses?|training)\b/i,
  contact: /\b(email|phone|linkedin|github|contact|address)\b/i,
};

// Patterns that indicate a section header (typically all caps or followed by colon/line)
const HEADER_PATTERNS = [
  /^(#{1,3}\s+)?(.+?)[:—\-]?\s*$/,      // Markdown-style or colon-terminated
  /^[A-Z][A-Z\s&/]{3,}$/,               // ALL CAPS headers
  /^(.*?)\s*[-=]{3,}\s*$/,              // Underlined with --- or ===
];

const ACTION_VERBS = [
  "built", "designed", "developed", "implemented", "created",
  "optimized", "managed", "led", "improved", "deployed",
  "automated", "integrated", "architected", "launched", "reduced",
  "increased", "achieved", "collaborated", "delivered", "maintained",
  "engineered", "established", "spearheaded", "streamlined", "scaled",
  "configured", "migrated", "resolved", "tested", "contributed",
];

const LINK_PATTERNS = [
  { type: "github", pattern: /https?:\/\/(www\.)?github\.com\/[\w\-./]+/gi },
  { type: "linkedin", pattern: /https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-./]+/gi },
  { type: "portfolio", pattern: /https?:\/\/[\w\-]+\.(vercel|netlify|herokuapp|github\.io|dev|io|me|com)[\w\-./]*/gi },
  { type: "other", pattern: /https?:\/\/[\w\-.]+\.[\w]{2,}[\w\-./]*/gi },
];

/**
 * Enhanced resume parser that extracts section content, bullets, and links.
 * Backwards-compatible: still returns all fields from the original ParsedResume.
 */
export function parseResumeText(text: string): ParsedResumeV2 {
  const cleanText = text.replace(/\r\n/g, "\n").trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const lines = cleanText.split("\n");

  // ── Detect sections (presence check — backwards compatible) ──
  const detectedSections: string[] = [];
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(cleanText)) {
      detectedSections.push(section);
    }
  }

  // ── Extract section content ──
  const sections = extractSectionContent(lines);

  // ── Quality signals (backwards compatible) ──
  const flatText = cleanText.toLowerCase();
  const hasQuantifiedAchievements =
    /\d+%|\d+\s*(users|clients|requests|projects|members|team)|\d+x|\d+\+/i.test(cleanText);
  const hasActionVerbs = ACTION_VERBS.some((verb) => flatText.includes(verb));
  const hasContactInfo =
    /[\w.+-]+@[\w-]+\.[\w.-]+/.test(cleanText) || /linkedin\.com/i.test(cleanText);

  // ── Extract links ──
  const links = extractLinks(cleanText);

  // ── Formatting detection ──
  const formatting = detectFormatting(cleanText, lines, wordCount);

  return {
    text: cleanText,
    wordCount,
    detectedSections,
    sections,
    hasQuantifiedAchievements,
    hasActionVerbs,
    hasContactInfo,
    links,
    formatting,
  };
}

/**
 * Splits resume text into sections by detecting headers.
 * Returns section name + raw text + extracted bullets for each.
 */
function extractSectionContent(lines: string[]): SectionContent[] {
  const sections: SectionContent[] = [];
  let currentSection: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line is a section header
    const sectionName = identifySectionHeader(trimmed);
    if (sectionName) {
      // Save previous section
      if (currentSection && currentLines.length > 0) {
        sections.push(buildSectionContent(currentSection, currentLines));
      }
      currentSection = sectionName;
      currentLines = [];
    } else if (currentSection) {
      currentLines.push(trimmed);
    }
  }

  // Don't forget the last section
  if (currentSection && currentLines.length > 0) {
    sections.push(buildSectionContent(currentSection, currentLines));
  }

  return sections;
}

function identifySectionHeader(line: string): string | null {
  // Check if the line matches a known section pattern
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    // Only treat as header if the line is short (likely a heading, not body text)
    if (line.length <= 60 && pattern.test(line)) {
      // Additional check: is this line likely a header?
      const isHeader =
        /^[A-Z]/.test(line) &&
        (line === line.toUpperCase() ||           // ALL CAPS
          line.endsWith(":") ||                   // Ends with colon
          line.length <= 30 ||                    // Short line
          HEADER_PATTERNS.some((p) => p.test(line)));
      if (isHeader) return section;
    }
  }
  return null;
}

function buildSectionContent(name: string, lines: string[]): SectionContent {
  const rawText = lines.join("\n");
  const bullets: string[] = [];

  for (const line of lines) {
    // Match bullet markers
    if (/^[•\-\*▪►>]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const cleaned = line.replace(/^[•\-\*▪►>\d.)\s]+/, "").trim();
      if (cleaned.length >= 10) {
        bullets.push(cleaned);
      }
    }
  }

  return { name, rawText, bullets };
}

function extractLinks(text: string): { type: string; url: string }[] {
  const links: { type: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const { type, pattern } of LINK_PATTERNS) {
    const matches = text.match(pattern) || [];
    for (const url of matches) {
      if (!seen.has(url)) {
        seen.add(url);
        links.push({ type, url });
      }
    }
  }

  return links;
}

// ── Formatting Detection ─────────────────────────────────────

const SPECIAL_CHARS = ["→", "←", "★", "☆", "✓", "✔", "✗", "✘", "❖", "◆", "◇", "●", "○", "■", "□", "▲", "△"];

function detectFormatting(text: string, lines: string[], wordCount: number): ResumeFormatting {
  // Detect tables (pipe characters or tab-aligned columns)
  const hasTables = lines.some((line) => {
    const pipeCount = (line.match(/\|/g) || []).length;
    return pipeCount >= 3; // Lines with 3+ pipes likely a table
  });

  // Detect special characters that hurt ATS parsing
  const specialCharsFound: string[] = [];
  for (const char of SPECIAL_CHARS) {
    if (text.includes(char)) specialCharsFound.push(char);
  }

  // Count bullet points
  let bulletCount = 0;
  for (const line of lines) {
    if (/^\s*[•\-\*▪►>]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      bulletCount++;
    }
  }

  return {
    hasTables,
    hasSpecialChars: specialCharsFound.length > 0,
    bulletCount,
    specialCharsFound,
    wordCount,
  };
}

// Re-export for backwards compatibility with code that imports ParsedResume
export type ParsedResume = ParsedResumeV2;
