/**
 * Comprehensive skills database (500+ entries) ported from Resume-ATS.
 * Used for skill extraction, keyword matching, and domain classification.
 */

export const PROGRAMMING_LANGUAGES = [
  "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C", "Ruby", "Go",
  "Golang", "Rust", "Swift", "Kotlin", "Scala", "PHP", "Perl", "R", "MATLAB",
  "Julia", "Dart", "Lua", "Haskell", "Elixir", "Clojure", "F#", "Objective-C",
  "Groovy", "VB.NET", "Assembly", "COBOL", "Shell", "Bash", "PowerShell",
  "SQL", "PL/SQL", "T-SQL", "HTML", "CSS", "Sass", "SCSS", "Less",
];

export const FRAMEWORKS: Record<string, string[]> = {
  frontend: [
    "React", "ReactJS", "React.js", "Angular", "AngularJS", "Vue", "VueJS",
    "Vue.js", "Svelte", "Next.js", "NextJS", "Nuxt", "NuxtJS", "Gatsby",
    "Ember", "Backbone", "jQuery", "Bootstrap", "Tailwind", "TailwindCSS",
    "Material-UI", "MUI", "Chakra", "Ant Design", "Styled-Components",
    "Shadcn", "Radix",
  ],
  backend: [
    "Node.js", "NodeJS", "Express", "ExpressJS", "FastAPI", "Django", "Flask",
    "Spring", "Spring Boot", "SpringBoot", ".NET", "ASP.NET", "Rails",
    "Ruby on Rails", "Laravel", "Symfony", "Fastify", "Koa", "NestJS",
    "Hapi", "Gin", "Echo", "Fiber", "Actix", "Rocket", "Phoenix",
  ],
  mobile: [
    "React Native", "Flutter", "Ionic", "Xamarin", "SwiftUI",
    "Jetpack Compose", "Expo",
  ],
  dataML: [
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Sklearn", "Pandas",
    "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly", "OpenCV", "NLTK",
    "SpaCy", "HuggingFace", "Transformers", "XGBoost", "LightGBM",
    "LangChain", "LlamaIndex",
  ],
  testing: [
    "Jest", "Mocha", "Jasmine", "Pytest", "JUnit", "Selenium", "Cypress",
    "Playwright", "Puppeteer", "TestNG", "RSpec", "Vitest",
  ],
};

export const TOOLS: Record<string, string[]> = {
  devopsCloud: [
    "Docker", "Kubernetes", "K8s", "AWS", "Azure", "GCP", "Google Cloud",
    "Heroku", "Vercel", "Netlify", "DigitalOcean", "Terraform", "Ansible",
    "Jenkins", "CircleCI", "Travis CI", "GitHub Actions", "GitLab CI",
    "ArgoCD", "Helm", "Prometheus", "Grafana", "Datadog", "New Relic",
    "Splunk", "ELK", "Elasticsearch", "Logstash", "Kibana", "CloudWatch",
    "CloudFormation", "Pulumi", "Vagrant", "Nginx", "Apache",
  ],
  versionControl: [
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN",
  ],
  projectManagement: [
    "Jira", "Confluence", "Trello", "Asana", "Notion", "Monday", "Linear",
    "ClickUp", "Azure DevOps",
  ],
  design: [
    "Figma", "Sketch", "Adobe XD", "InVision", "Zeplin", "Photoshop",
    "Illustrator", "Canva", "After Effects", "Premiere Pro",
  ],
  apiTesting: [
    "Postman", "Insomnia", "Swagger", "GraphQL", "gRPC", "SOAP",
  ],
  dataBuild: [
    "Webpack", "Vite", "Parcel", "Rollup", "Babel", "ESLint", "Prettier",
    "Redis", "RabbitMQ", "Kafka", "Celery", "Airflow", "Spark", "Hadoop",
    "Hive", "Databricks", "Snowflake", "dbt", "Looker", "Tableau",
    "Power BI", "Metabase",
  ],
  security: [
    "Wireshark", "Nmap", "Metasploit", "Burp Suite", "CrowdStrike",
    "Palo Alto", "Okta", "Qualys", "Nessus", "OWASP ZAP",
  ],
  communication: [
    "Slack", "Teams", "Discord", "Zoom",
  ],
};

export const DATABASES = [
  "MySQL", "PostgreSQL", "Postgres", "MongoDB", "SQLite", "Oracle",
  "SQL Server", "MSSQL", "MariaDB", "Cassandra", "DynamoDB", "Firebase",
  "Firestore", "CouchDB", "Neo4j", "Redis", "Memcached", "Elasticsearch",
  "Supabase", "PlanetScale", "CockroachDB", "TimescaleDB", "InfluxDB",
  "ArangoDB", "Fauna", "Prisma", "Mongoose", "Sequelize", "TypeORM",
  "SQLAlchemy", "Drizzle", "Knex",
];

export const SOFT_SKILLS = [
  "Leadership", "Communication", "Teamwork", "Collaboration",
  "Problem Solving", "Analytical", "Critical Thinking", "Creativity",
  "Adaptability", "Time Management", "Project Management", "Agile",
  "Scrum", "Kanban", "Public Speaking", "Presentation", "Negotiation",
  "Conflict Resolution", "Mentoring", "Coaching", "Decision Making",
  "Strategic Thinking", "Attention to Detail", "Self-Motivated",
  "Customer Service", "Stakeholder Management", "Cross-Functional",
  "Empathy", "Active Listening", "Organizational Skills",
];

export const CERTIFICATIONS = [
  "AWS Certified", "Azure Certified", "GCP Certified", "CKA", "CKAD",
  "CISSP", "CEH", "OSCP", "CompTIA", "CCNA", "CCNP", "PMP", "PRINCE2",
  "CSM", "PSM", "SAFe", "Google Data Analytics", "Databricks Certified",
  "Snowflake Certified", "CFA", "CPA", "Six Sigma", "Lean Six Sigma",
  "Google Ads Certified", "HubSpot Certified",
];

/**
 * All skills flattened into a single array for quick lookups.
 */
export const ALL_SKILLS: string[] = [
  ...PROGRAMMING_LANGUAGES,
  ...Object.values(FRAMEWORKS).flat(),
  ...Object.values(TOOLS).flat(),
  ...DATABASES,
  ...SOFT_SKILLS,
  ...CERTIFICATIONS,
];

/**
 * Skill synonyms map — maps canonical name to variations.
 * Used when matching resume text against known skills.
 */
export const SKILL_SYNONYMS: Record<string, string[]> = {
  "React": ["ReactJS", "React.js", "React JS"],
  "Node.js": ["NodeJS", "Node JS", "Node"],
  "Next.js": ["NextJS", "Next JS"],
  "Vue": ["VueJS", "Vue.js", "Vue JS"],
  "Angular": ["AngularJS", "Angular JS"],
  "PostgreSQL": ["Postgres", "psql"],
  "MongoDB": ["Mongo", "Mongo DB"],
  "Machine Learning": ["ML", "machine-learning"],
  "AWS": ["Amazon Web Services", "Amazon AWS"],
  "GCP": ["Google Cloud", "Google Cloud Platform"],
  "CI/CD": ["CICD", "CI CD", "continuous integration", "continuous deployment"],
  "Docker": ["Containerization", "docker-compose", "Docker Compose"],
  "Kubernetes": ["K8s", "k8s"],
  "Python": ["python3", "Python3"],
  "JavaScript": ["JS", "ECMAScript", "ES6", "ES2015"],
  "TypeScript": ["TS"],
  "Go": ["Golang"],
  "C++": ["CPP", "C Plus Plus"],
  "C#": ["CSharp", "C Sharp"],
  "SQL": ["Structured Query Language"],
  "HTML/CSS": ["HTML", "CSS", "HTML5", "CSS3"],
  "Git": ["GitHub", "GitLab", "Bitbucket", "version control"],
  "REST APIs": ["REST", "RESTful", "API development", "API design"],
  "Testing": ["unit testing", "integration testing", "test automation"],
  "TensorFlow": ["TF", "tensorflow"],
  "PyTorch": ["pytorch", "Torch"],
  "Terraform": ["infrastructure as code", "IaC", "CloudFormation"],
  "System Design": ["architecture", "scalability", "distributed systems", "microservices"],
  "Agile": ["Scrum", "Kanban", "Sprint"],
};

/**
 * Domain-specific skill suggestions for recommendations.
 */
export const DOMAIN_SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Software / IT": ["Python", "JavaScript", "React", "Node.js", "Docker", "AWS", "SQL", "Git", "TypeScript", "Kubernetes"],
  "Data Science / AI": ["Python", "TensorFlow", "PyTorch", "Pandas", "SQL", "Tableau", "Spark", "R", "Statistics", "Machine Learning"],
  "Cybersecurity": ["Linux", "Wireshark", "Nmap", "Python", "CISSP", "Networking", "OWASP", "Penetration Testing"],
  "DevOps": ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "Linux", "Python", "Ansible", "Prometheus", "Git"],
  "Frontend": ["React", "TypeScript", "CSS", "Next.js", "Tailwind", "JavaScript", "Figma", "Jest", "Git", "Performance Optimization"],
  "Backend": ["Node.js", "Python", "PostgreSQL", "Docker", "REST APIs", "System Design", "Redis", "AWS", "Git", "Testing"],
  "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "REST APIs", "Git", "TypeScript"],
  "Design / UX": ["Figma", "Adobe XD", "Sketch", "User Research", "Wireframing", "Prototyping", "HTML/CSS", "Design Systems"],
  "Product Management": ["Jira", "SQL", "A/B Testing", "Analytics", "Agile", "Stakeholder Management", "Roadmapping"],
  "Marketing": ["Google Analytics", "SEO", "Content Strategy", "HubSpot", "Social Media", "Data Analysis", "A/B Testing"],
  "Finance": ["Excel", "SQL", "Python", "Financial Modeling", "Bloomberg", "Tableau", "Risk Analysis"],
  "Student / Fresher": ["Python", "JavaScript", "Git", "SQL", "HTML/CSS", "React", "Data Structures", "Algorithms"],
};
