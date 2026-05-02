import { KeywordMatch, RoleDefinition } from "@/types";

const SKILL_SYNONYMS: Record<string, string[]> = {
  "React": ["ReactJS", "React.js", "React JS"],
  "Node.js": ["NodeJS", "Node JS", "Node"],
  "PostgreSQL": ["Postgres", "psql"],
  "MongoDB": ["Mongo", "Mongo DB"],
  "Machine Learning": ["ML", "machine-learning"],
  "AWS": ["Amazon Web Services", "Amazon AWS"],
  "CI/CD": ["CICD", "CI CD", "continuous integration", "continuous deployment", "Jenkins", "GitHub Actions"],
  "Docker": ["Containerization", "docker-compose"],
  "Kubernetes": ["K8s", "k8s"],
  "Python": ["python3", "Python3"],
  "JavaScript": ["JS", "ECMAScript", "ES6"],
  "TypeScript": ["TS"],
  "HTML/CSS": ["HTML", "CSS", "HTML5", "CSS3"],
  "SQL": ["MySQL", "PostgreSQL", "Postgres", "SQLite", "MSSQL"],
  "Git": ["GitHub", "GitLab", "Bitbucket", "version control"],
  "REST APIs": ["REST", "RESTful", "API development", "API design"],
  "Testing": ["unit testing", "integration testing", "test automation", "Jest", "Mocha", "pytest"],
  "Selenium": ["Cypress", "Playwright", "test automation"],
  "Figma": ["Adobe XD", "Sketch", "UI design tool"],
  "Tableau": ["Power BI", "data visualization tool", "Looker"],
  "Excel": ["Google Sheets", "spreadsheet"],
  "Linux": ["Ubuntu", "CentOS", "RedHat", "Unix"],
  "Bash/Shell": ["shell scripting", "bash scripting"],
  "Spark": ["Apache Spark", "PySpark"],
  "Airflow": ["Apache Airflow"],
  "TensorFlow/PyTorch": ["TensorFlow", "PyTorch", "Keras", "deep learning framework"],
  "Statistics": ["statistical analysis", "probability", "regression"],
  "Data Visualization": ["data viz", "charts", "dashboards", "visualization"],
  "Communication": ["presentation", "stakeholder management", "client communication"],
  "Networking": ["TCP/IP", "DNS", "HTTP", "network protocols", "OSI model"],
  "Security": ["cybersecurity", "information security", "infosec", "penetration testing", "OWASP"],
  "Firewalls/IDS": ["firewall", "IDS", "IPS", "intrusion detection"],
  "Cryptography": ["encryption", "hashing", "SSL/TLS", "PKI"],
  "Database Design": ["schema design", "data modeling", "ER diagram", "normalization"],
  "ETL": ["data pipeline", "data ingestion", "extract transform load"],
  "A/B Testing": ["experimentation", "split testing"],
  "Business Acumen": ["business analysis", "business intelligence", "BI"],
  "Performance Optimization": ["web performance", "lighthouse", "core web vitals", "lazy loading"],
  "Responsive Design": ["responsive", "mobile-first", "media queries", "adaptive design"],
  "System Design": ["architecture", "scalability", "distributed systems", "microservices"],
  "Authentication": ["auth", "OAuth", "JWT", "SSO", "SAML"],
  "Monitoring": ["Grafana", "Prometheus", "Datadog", "observability", "logging"],
  "Terraform": ["infrastructure as code", "IaC", "CloudFormation"],
  "User Research": ["user interviews", "usability testing", "UX research"],
  "Wireframing": ["wireframes", "mockups", "low-fidelity design"],
  "Visual Design": ["UI design", "graphic design", "typography", "color theory"],
  "Prototyping": ["interactive prototype", "high-fidelity design"],
  "Design Systems": ["component library", "style guide", "design tokens"],
};

export function matchKeywords(
  resumeText: string,
  role: RoleDefinition
): KeywordMatch[] {
  const lowerText = resumeText.toLowerCase();

  return role.skills.map((skill) => {
    // Try exact match
    if (lowerText.includes(skill.name.toLowerCase())) {
      return {
        skill: skill.name,
        found: true,
        matchType: "exact" as const,
        weight: skill.weight,
      };
    }

    // Try synonym match
    const synonyms = SKILL_SYNONYMS[skill.name] || [];
    const synonymMatch = synonyms.find((syn) =>
      lowerText.includes(syn.toLowerCase())
    );

    if (synonymMatch) {
      return {
        skill: skill.name,
        found: true,
        matchType: "synonym" as const,
        weight: skill.weight,
        context: synonymMatch,
      };
    }

    return {
      skill: skill.name,
      found: false,
      matchType: "missing" as const,
      weight: skill.weight,
    };
  });
}

export function calculateATSScore(
  keywordMatches: KeywordMatch[],
  detectedSections: string[],
  hasQuantified: boolean,
  hasActionVerbs: boolean,
  hasContactInfo: boolean
): number {
  // Keyword match score (40%)
  const totalWeight = keywordMatches.reduce((sum, k) => sum + k.weight, 0);
  const matchedWeight = keywordMatches
    .filter((k) => k.found)
    .reduce((sum, k) => sum + k.weight, 0);
  const keywordScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

  // Section presence score (25%)
  const requiredSections = ["education", "skills", "projects"];
  const optionalSections = ["experience", "certifications", "contact"];
  let sectionScore = 0;
  for (const section of requiredSections) {
    if (detectedSections.includes(section)) sectionScore += 25;
  }
  for (const section of optionalSections) {
    if (detectedSections.includes(section)) sectionScore += 8.33;
  }
  sectionScore = Math.min(100, sectionScore);

  // Formatting quality (15%)
  let formatScore = 50;
  if (hasContactInfo) formatScore += 25;
  if (detectedSections.length >= 4) formatScore += 25;
  formatScore = Math.min(100, formatScore);

  // Content quality (20%)
  let contentScore = 40;
  if (hasQuantified) contentScore += 30;
  if (hasActionVerbs) contentScore += 30;
  contentScore = Math.min(100, contentScore);

  // Weighted total
  const total =
    keywordScore * 0.4 +
    sectionScore * 0.25 +
    formatScore * 0.15 +
    contentScore * 0.2;

  return Math.round(Math.min(100, Math.max(0, total)));
}
