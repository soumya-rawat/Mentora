export interface TaskTemplate {
  title: string;
  description: string;
  type: "learn" | "practice" | "build" | "assess";
  resourceUrl?: string;
  resourceLabel?: string;
  estimatedHours: number;
}

export interface MilestoneTemplate {
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedWeeks: number;
  forLevels: string[];
  forYears: number[];
  tasks: TaskTemplate[];
}

export const ROADMAP_TEMPLATES: Record<string, MilestoneTemplate[]> = {
  "frontend-developer": [
    {
      title: "HTML & CSS Foundations",
      description: "Master the building blocks of the web — semantic HTML, CSS layout, and responsive design.",
      category: "language",
      difficulty: "beginner",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Complete HTML/CSS course on freeCodeCamp", description: "Work through the Responsive Web Design certification", type: "learn", resourceUrl: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", resourceLabel: "freeCodeCamp", estimatedHours: 8 },
        { title: "Build a personal portfolio page", description: "Create a simple portfolio using only HTML and CSS", type: "build", estimatedHours: 4 },
        { title: "Practice Flexbox and Grid layouts", description: "Complete Flexbox Froggy and Grid Garden exercises", type: "practice", resourceUrl: "https://flexboxfroggy.com/", resourceLabel: "Flexbox Froggy", estimatedHours: 2 },
        { title: "Make your portfolio fully responsive", description: "Ensure it works on mobile, tablet, and desktop", type: "build", estimatedHours: 2 },
      ],
    },
    {
      title: "JavaScript Essentials",
      description: "Learn core JavaScript — variables, functions, DOM manipulation, async programming, and ES6+ features.",
      category: "language",
      difficulty: "beginner",
      estimatedWeeks: 3,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Complete JavaScript basics on freeCodeCamp", description: "Work through the JavaScript Algorithms and Data Structures section", type: "learn", resourceUrl: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", resourceLabel: "freeCodeCamp", estimatedHours: 10 },
        { title: "Build a to-do app with vanilla JS", description: "Practice DOM manipulation with a functional to-do list", type: "build", estimatedHours: 4 },
        { title: "Learn async JS: Promises and fetch", description: "Understand asynchronous programming and API calls", type: "learn", resourceUrl: "https://javascript.info/async", resourceLabel: "JavaScript.info", estimatedHours: 3 },
        { title: "Solve 10 JS problems on LeetCode (Easy)", description: "Practice problem-solving with JavaScript", type: "practice", resourceUrl: "https://leetcode.com/problemset/", resourceLabel: "LeetCode", estimatedHours: 4 },
      ],
    },
    {
      title: "React Fundamentals",
      description: "Learn the most in-demand frontend framework — components, state, props, hooks, and routing.",
      category: "framework",
      difficulty: "intermediate",
      estimatedWeeks: 3,
      forLevels: ["none", "beginner", "intermediate"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Complete React official tutorial", description: "Follow the new React docs interactive tutorial", type: "learn", resourceUrl: "https://react.dev/learn", resourceLabel: "React Docs", estimatedHours: 6 },
        { title: "Build a weather app with React", description: "Create a weather app using fetch API and React hooks", type: "build", estimatedHours: 6 },
        { title: "Learn React Router basics", description: "Add multi-page navigation to your project", type: "learn", resourceUrl: "https://reactrouter.com/en/main/start/tutorial", resourceLabel: "React Router Docs", estimatedHours: 2 },
        { title: "Build a simple CRUD app", description: "Create a notes/contacts app with full CRUD operations", type: "build", estimatedHours: 6 },
      ],
    },
    {
      title: "TypeScript & Modern Tooling",
      description: "Level up with TypeScript, testing basics, and modern frontend tooling.",
      category: "language",
      difficulty: "intermediate",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner", "intermediate"],
      forYears: [2, 3, 4, 5],
      tasks: [
        { title: "Learn TypeScript basics", description: "Types, interfaces, generics — the essentials", type: "learn", resourceUrl: "https://www.typescriptlang.org/docs/handbook/", resourceLabel: "TS Handbook", estimatedHours: 4 },
        { title: "Convert a JS project to TypeScript", description: "Take one of your earlier projects and add types", type: "practice", estimatedHours: 3 },
        { title: "Learn Git & GitHub basics", description: "Branching, PRs, and collaboration workflow", type: "learn", resourceUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk", resourceLabel: "YouTube", estimatedHours: 2 },
        { title: "Write basic unit tests with Jest", description: "Test a few utility functions", type: "practice", estimatedHours: 2 },
      ],
    },
    {
      title: "Portfolio & Placement Prep",
      description: "Build a showcase-ready portfolio and prepare for frontend interviews.",
      category: "concept",
      difficulty: "intermediate",
      estimatedWeeks: 3,
      forLevels: ["beginner", "intermediate", "advanced"],
      forYears: [3, 4, 5],
      tasks: [
        { title: "Build a polished portfolio project", description: "Create a substantial React app (e.g., e-commerce, dashboard)", type: "build", estimatedHours: 12 },
        { title: "Deploy your project on Vercel", description: "Learn deployment and get a shareable URL", type: "practice", resourceUrl: "https://vercel.com/docs", resourceLabel: "Vercel Docs", estimatedHours: 1 },
        { title: "Prepare for frontend interview questions", description: "Study common questions: closures, event loop, React lifecycle", type: "learn", resourceUrl: "https://www.frontendinterviewhandbook.com/", resourceLabel: "FE Interview Handbook", estimatedHours: 4 },
        { title: "Update your resume with projects", description: "Add your portfolio projects with quantified descriptions", type: "assess", estimatedHours: 2 },
      ],
    },
  ],

  "backend-developer": [
    {
      title: "Programming Fundamentals",
      description: "Solidify your foundation in a backend language — Python or Java.",
      category: "language",
      difficulty: "beginner",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Complete Python basics course", description: "Variables, data structures, OOP, file handling", type: "learn", resourceUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", resourceLabel: "YouTube - Mosh", estimatedHours: 6 },
        { title: "Solve 15 Easy problems on LeetCode", description: "Focus on arrays, strings, and hashmaps", type: "practice", resourceUrl: "https://leetcode.com/problemset/", resourceLabel: "LeetCode", estimatedHours: 6 },
        { title: "Build a CLI tool in Python", description: "Create a command-line app (e.g., expense tracker)", type: "build", estimatedHours: 3 },
        { title: "Learn Git fundamentals", description: "Branching, merging, pull requests", type: "learn", resourceUrl: "https://learngitbranching.js.org/", resourceLabel: "Learn Git Branching", estimatedHours: 2 },
      ],
    },
    {
      title: "SQL & Database Design",
      description: "Master relational databases — SQL queries, schema design, and optimization.",
      category: "language",
      difficulty: "beginner",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Complete SQL course on W3Schools", description: "SELECT, JOIN, GROUP BY, subqueries", type: "learn", resourceUrl: "https://www.w3schools.com/sql/", resourceLabel: "W3Schools", estimatedHours: 4 },
        { title: "Practice SQL on HackerRank", description: "Solve 20 SQL challenges", type: "practice", resourceUrl: "https://www.hackerrank.com/domains/sql", resourceLabel: "HackerRank", estimatedHours: 4 },
        { title: "Design a database schema", description: "Create an ERD for a library management system", type: "build", estimatedHours: 2 },
        { title: "Set up PostgreSQL locally", description: "Install and run basic queries on a local DB", type: "practice", estimatedHours: 2 },
      ],
    },
    {
      title: "REST API Development",
      description: "Build APIs using Node.js/Express or Python/Flask. Learn HTTP, routing, middleware.",
      category: "framework",
      difficulty: "intermediate",
      estimatedWeeks: 3,
      forLevels: ["none", "beginner", "intermediate"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Learn REST API concepts", description: "HTTP methods, status codes, request/response cycle", type: "learn", estimatedHours: 2 },
        { title: "Build a CRUD API with Express.js", description: "Create a REST API for a blog or task manager", type: "build", resourceUrl: "https://expressjs.com/en/starter/installing.html", resourceLabel: "Express Docs", estimatedHours: 6 },
        { title: "Add database integration", description: "Connect your API to PostgreSQL", type: "build", estimatedHours: 4 },
        { title: "Add authentication with JWT", description: "Implement login/register with JSON Web Tokens", type: "build", estimatedHours: 4 },
        { title: "Test your API with Postman", description: "Create a Postman collection for all endpoints", type: "practice", estimatedHours: 2 },
      ],
    },
    {
      title: "System Design & DevOps Basics",
      description: "Learn containerization, basic deployment, and system design concepts.",
      category: "concept",
      difficulty: "intermediate",
      estimatedWeeks: 2,
      forLevels: ["beginner", "intermediate"],
      forYears: [3, 4, 5],
      tasks: [
        { title: "Learn Docker basics", description: "Containerize one of your API projects", type: "learn", resourceUrl: "https://docs.docker.com/get-started/", resourceLabel: "Docker Docs", estimatedHours: 4 },
        { title: "Deploy an API to a cloud platform", description: "Use Railway, Render, or Vercel", type: "practice", estimatedHours: 2 },
        { title: "Study basic system design concepts", description: "Load balancing, caching, database scaling", type: "learn", resourceUrl: "https://www.youtube.com/watch?v=UzLMhqg3_Wc", resourceLabel: "YouTube", estimatedHours: 3 },
        { title: "Self-assess: explain your project architecture", description: "Can you diagram and explain your API's architecture?", type: "assess", estimatedHours: 1 },
      ],
    },
  ],

  "data-analyst": [
    {
      title: "SQL Mastery",
      description: "SQL is the #1 skill for data analysts. Master querying, joins, aggregations, and window functions.",
      category: "language",
      difficulty: "beginner",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Complete SQL fundamentals", description: "SELECT, WHERE, JOIN, GROUP BY, HAVING", type: "learn", resourceUrl: "https://mode.com/sql-tutorial/", resourceLabel: "Mode SQL Tutorial", estimatedHours: 6 },
        { title: "Practice 30 SQL problems", description: "Focus on joins, subqueries, and aggregations", type: "practice", resourceUrl: "https://www.hackerrank.com/domains/sql", resourceLabel: "HackerRank", estimatedHours: 6 },
        { title: "Learn window functions", description: "ROW_NUMBER, RANK, LAG, LEAD, running totals", type: "learn", estimatedHours: 3 },
        { title: "Analyze a real dataset with SQL", description: "Download a Kaggle dataset and write 10 analytical queries", type: "build", estimatedHours: 3 },
      ],
    },
    {
      title: "Excel & Data Visualization",
      description: "Learn advanced Excel and create impactful visualizations.",
      category: "tool",
      difficulty: "beginner",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Master Excel pivots and VLOOKUP", description: "Learn pivot tables, charts, and lookup functions", type: "learn", estimatedHours: 4 },
        { title: "Create a dashboard in Excel", description: "Build an interactive dashboard from sample sales data", type: "build", estimatedHours: 3 },
        { title: "Learn Tableau basics", description: "Create 3 visualizations from a public dataset", type: "learn", resourceUrl: "https://public.tableau.com/app/learn/how-to-videos", resourceLabel: "Tableau Public", estimatedHours: 4 },
        { title: "Build a Tableau dashboard", description: "Create a multi-page dashboard and publish it", type: "build", estimatedHours: 4 },
      ],
    },
    {
      title: "Python for Data Analysis",
      description: "Learn pandas, numpy, and matplotlib for programmatic data analysis.",
      category: "language",
      difficulty: "intermediate",
      estimatedWeeks: 3,
      forLevels: ["none", "beginner", "intermediate"],
      forYears: [2, 3, 4, 5],
      tasks: [
        { title: "Learn pandas fundamentals", description: "DataFrames, filtering, groupby, merging", type: "learn", resourceUrl: "https://www.kaggle.com/learn/pandas", resourceLabel: "Kaggle Learn", estimatedHours: 5 },
        { title: "EDA on a Kaggle dataset", description: "Perform exploratory data analysis on a real dataset", type: "build", estimatedHours: 4 },
        { title: "Learn data visualization with matplotlib/seaborn", description: "Create 10 different chart types", type: "learn", resourceUrl: "https://www.kaggle.com/learn/data-visualization", resourceLabel: "Kaggle Learn", estimatedHours: 3 },
        { title: "Complete a data analysis project", description: "End-to-end analysis with insights and recommendations", type: "build", estimatedHours: 6 },
      ],
    },
    {
      title: "Statistics & Business Analysis",
      description: "Learn the statistical foundations needed for analytical thinking.",
      category: "concept",
      difficulty: "intermediate",
      estimatedWeeks: 2,
      forLevels: ["none", "beginner", "intermediate"],
      forYears: [2, 3, 4, 5],
      tasks: [
        { title: "Learn descriptive statistics", description: "Mean, median, mode, standard deviation, distributions", type: "learn", resourceUrl: "https://www.khanacademy.org/math/statistics-probability", resourceLabel: "Khan Academy", estimatedHours: 4 },
        { title: "Learn hypothesis testing basics", description: "p-values, t-tests, chi-square tests", type: "learn", estimatedHours: 3 },
        { title: "Analyze a business problem with data", description: "Frame a business question and answer it with data", type: "build", estimatedHours: 4 },
        { title: "Prepare a data analysis presentation", description: "Create slides telling a data story for a non-technical audience", type: "assess", estimatedHours: 2 },
      ],
    },
  ],
};

// Generate a default template for roles that don't have specific templates
function generateDefaultTemplate(roleSlug: string): MilestoneTemplate[] {
  return [
    {
      title: "Foundation Skills",
      description: "Build the core skills needed for this role.",
      category: "concept",
      difficulty: "beginner",
      estimatedWeeks: 3,
      forLevels: ["none", "beginner"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Research the role thoroughly", description: "Read job descriptions, watch day-in-the-life videos, and understand what this role entails", type: "learn", estimatedHours: 2 },
        { title: "Identify top 3 skills to learn first", description: "Based on job postings, pick the highest-priority skills", type: "assess", estimatedHours: 1 },
        { title: "Start learning the primary skill", description: "Find a free course or tutorial for the most important skill", type: "learn", estimatedHours: 8 },
        { title: "Practice with hands-on exercises", description: "Apply what you learned with practical exercises", type: "practice", estimatedHours: 4 },
      ],
    },
    {
      title: "Intermediate Skills & Projects",
      description: "Deepen your knowledge and build portfolio projects.",
      category: "framework",
      difficulty: "intermediate",
      estimatedWeeks: 4,
      forLevels: ["none", "beginner", "intermediate"],
      forYears: [1, 2, 3, 4, 5],
      tasks: [
        { title: "Learn the second most important skill", description: "Continue building your skill set", type: "learn", estimatedHours: 6 },
        { title: "Build a portfolio project", description: "Create a project that demonstrates your skills for this role", type: "build", estimatedHours: 10 },
        { title: "Learn industry tools", description: "Get familiar with tools commonly used in this role", type: "learn", estimatedHours: 4 },
        { title: "Get feedback on your project", description: "Share your project with peers or online communities", type: "assess", estimatedHours: 2 },
      ],
    },
    {
      title: "Job Readiness",
      description: "Prepare for interviews and applications.",
      category: "concept",
      difficulty: "intermediate",
      estimatedWeeks: 3,
      forLevels: ["beginner", "intermediate", "advanced"],
      forYears: [3, 4, 5],
      tasks: [
        { title: "Build a second portfolio project", description: "Create another project showing different skills", type: "build", estimatedHours: 8 },
        { title: "Prepare your resume", description: "Tailor your resume for this role with relevant keywords", type: "practice", estimatedHours: 2 },
        { title: "Practice common interview questions", description: "Study role-specific technical and behavioral questions", type: "learn", estimatedHours: 4 },
        { title: "Apply to 5 entry-level positions", description: "Start applying to build experience with the process", type: "practice", estimatedHours: 3 },
      ],
    },
  ];
}

export function getTemplateForRole(roleSlug: string): MilestoneTemplate[] {
  return ROADMAP_TEMPLATES[roleSlug] || generateDefaultTemplate(roleSlug);
}
