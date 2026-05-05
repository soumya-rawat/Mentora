import { BulletAnalysis } from "@/types";

// Strong action verbs grouped by impact level
const STRONG_VERBS = [
  "architected", "built", "created", "delivered", "deployed", "designed",
  "developed", "engineered", "established", "implemented", "launched",
  "led", "optimized", "orchestrated", "pioneered", "reduced", "scaled",
  "spearheaded", "streamlined", "transformed",
];

const MODERATE_VERBS = [
  "achieved", "automated", "collaborated", "configured", "contributed",
  "improved", "integrated", "maintained", "managed", "migrated",
  "monitored", "resolved", "supported", "tested", "updated", "utilized",
];

const WEAK_VERBS = [
  "assisted", "did", "got", "had", "helped", "involved", "made",
  "participated", "performed", "responsible", "tried", "used", "was",
  "went", "worked",
];

// Filler phrases that weaken bullets
const FILLER_PHRASES = [
  "responsible for", "involved in", "worked on", "helped with",
  "participated in", "assisted with", "was tasked with", "duties included",
  "played a role in", "contributed to the",
];

// Quantification patterns
const METRIC_PATTERNS = [
  /\d+%/,                                    // percentages
  /\d+x/i,                                   // multipliers
  /\$[\d,]+/,                                // dollar amounts
  /₹[\d,]+/,                                // rupee amounts
  /\d+\s*(users|clients|customers|requests|rps|qps)/i,
  /\d+\s*(team|members|people|engineers|developers)/i,
  /\d+\s*(ms|seconds|minutes|hours)/i,       // time metrics
  /\d+\+?\s*(projects?|features?|modules?|APIs?|endpoints?)/i,
  /\d+\s*(stars?|forks?|downloads?|installs?)/i,
  /\d+\s*(lines?|LOC|commits?)/i,
  /reduced.*by\s*\d+/i,
  /improved.*by\s*\d+/i,
  /increased.*by\s*\d+/i,
];

// Tech/tool patterns (to detect specificity)
const TECH_INDICATORS = [
  /\b(React|Vue|Angular|Next\.?js|Svelte|Express|Django|Flask|Spring|Rails)\b/i,
  /\b(Node\.?js|Python|Java|Go|Rust|TypeScript|JavaScript|C\+\+|Kotlin|Swift)\b/i,
  /\b(AWS|GCP|Azure|Docker|Kubernetes|Terraform|Jenkins|GitHub\s*Actions)\b/i,
  /\b(PostgreSQL|MongoDB|Redis|MySQL|DynamoDB|Firebase|Supabase)\b/i,
  /\b(REST|GraphQL|gRPC|WebSocket|Kafka|RabbitMQ)\b/i,
  /\b(Jest|Cypress|Selenium|Playwright|pytest|JUnit)\b/i,
  /\b(Figma|Tailwind|Material\s*UI|Bootstrap|Sass|styled-components)\b/i,
  /\b(TensorFlow|PyTorch|Scikit-learn|Pandas|NumPy|OpenCV)\b/i,
  /\b(Linux|Nginx|Apache|Prometheus|Grafana|ELK)\b/i,
];

/**
 * Extracts bullet points from resume text.
 * Looks for lines starting with bullet markers or short sentences in context.
 */
export function extractBullets(text: string): string[] {
  const lines = text.split(/\n/);
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match bullet markers: •, -, *, ▪, >, or numbered (1., 2.)
    if (/^[•\-\*▪►>]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      const cleaned = trimmed.replace(/^[•\-\*▪►>\d.)\s]+/, "").trim();
      if (cleaned.length >= 15 && cleaned.length <= 300) {
        bullets.push(cleaned);
      }
    }
  }

  // If few bullets found, also look for short sentences that look like achievements
  if (bullets.length < 3) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length >= 20 &&
        trimmed.length <= 200 &&
        !bullets.includes(trimmed) &&
        /^[A-Z]/.test(trimmed) &&
        (STRONG_VERBS.some((v) => trimmed.toLowerCase().startsWith(v)) ||
          MODERATE_VERBS.some((v) => trimmed.toLowerCase().startsWith(v)))
      ) {
        bullets.push(trimmed);
      }
    }
  }

  return bullets;
}

/**
 * Scores a single bullet point on 4 dimensions.
 */
function scoreBullet(bullet: string): BulletAnalysis {
  const lower = bullet.toLowerCase();
  const issues: string[] = [];

  // ── Impact Score (metrics, quantified results) ──
  let impact = 0;
  const metricCount = METRIC_PATTERNS.filter((p) => p.test(bullet)).length;
  if (metricCount >= 2) {
    impact = 100;
  } else if (metricCount === 1) {
    impact = 70;
  } else if (/\b(significantly|greatly|substantially|drastically)\b/i.test(bullet)) {
    impact = 30; // vague quantification
    issues.push("uses vague quantifiers instead of specific metrics");
  } else {
    impact = 10;
    issues.push("no quantified impact or metrics");
  }

  // ── Specificity Score (names tools/tech, concrete details) ──
  let specificity = 20; // base
  const techMatches = TECH_INDICATORS.filter((p) => p.test(bullet)).length;
  specificity += Math.min(techMatches * 25, 60);
  // Bonus for naming specific outcomes
  if (/\b(feature|module|API|endpoint|page|dashboard|pipeline|service)\b/i.test(bullet)) {
    specificity += 20;
  }
  specificity = Math.min(100, specificity);
  if (techMatches === 0) {
    issues.push("no specific technologies or tools mentioned");
  }

  // ── Action Score (strong verb start) ──
  let action = 0;
  const firstWord = lower.split(/\s+/)[0];
  if (STRONG_VERBS.includes(firstWord)) {
    action = 100;
  } else if (MODERATE_VERBS.includes(firstWord)) {
    action = 60;
  } else if (WEAK_VERBS.includes(firstWord)) {
    action = 20;
    issues.push("starts with a weak verb");
  } else {
    action = 40; // neutral — might be a noun phrase
    if (!(/^[a-z]/.test(firstWord))) {
      action = 50; // starts with capital, could be a proper noun context
    }
  }
  // Penalty for filler phrases
  if (FILLER_PHRASES.some((f) => lower.includes(f))) {
    action = Math.max(0, action - 30);
    issues.push("contains filler phrase (e.g. 'responsible for')");
  }

  // ── Clarity Score (length, readability, no filler) ──
  let clarity = 50; // base
  const wordCount = bullet.split(/\s+/).length;
  if (wordCount >= 8 && wordCount <= 25) {
    clarity = 90; // ideal range
  } else if (wordCount >= 5 && wordCount <= 35) {
    clarity = 65;
  } else if (wordCount < 5) {
    clarity = 20;
    issues.push("too short to be meaningful");
  } else {
    clarity = 30;
    issues.push("too long — consider splitting into multiple points");
  }
  // Penalty for vague language
  const vagueWords = ["various", "several", "many", "some", "things", "stuff", "etc"];
  if (vagueWords.some((w) => lower.includes(w))) {
    clarity = Math.max(0, clarity - 20);
    issues.push("uses vague language");
  }

  // ── Overall & Rating ──
  const overall = Math.round(
    impact * 0.35 + specificity * 0.25 + action * 0.2 + clarity * 0.2
  );

  let rating: "strong" | "adequate" | "weak";
  if (overall >= 70) {
    rating = "strong";
  } else if (overall >= 40) {
    rating = "adequate";
  } else {
    rating = "weak";
  }

  return {
    text: bullet,
    scores: { impact, specificity, action, clarity },
    overall,
    rating,
    issues,
  };
}

/**
 * Analyzes all bullet points in a resume.
 * Returns quality scores for each bullet.
 */
export function analyzeBullets(resumeText: string): BulletAnalysis[] {
  const bullets = extractBullets(resumeText);
  return bullets.map(scoreBullet);
}
