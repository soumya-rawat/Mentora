import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const password = await bcrypt.hash("password123", 12);

  // Demo User 1: Arjun - 2nd year CSE student
  const arjun = await prisma.user.upsert({
    where: { email: "arjun@demo.com" },
    update: {},
    create: {
      name: "Arjun Sharma",
      email: "arjun@demo.com",
      hashedPassword: password,
      onboardingComplete: true,
      yearOfStudy: 2,
      college: "Pune Institute of Technology",
      collegeTier: "tier-2",
      branch: "CSE",
    },
  });

  // Demo User 2: Priya - 4th year IT student
  const priya = await prisma.user.upsert({
    where: { email: "priya@demo.com" },
    update: {},
    create: {
      name: "Priya Reddy",
      email: "priya@demo.com",
      hashedPassword: password,
      onboardingComplete: true,
      yearOfStudy: 4,
      college: "IIIT Hyderabad",
      collegeTier: "iit-nit",
      branch: "IT",
    },
  });

  // Demo User 3: Meera - BCA student
  const meera = await prisma.user.upsert({
    where: { email: "meera@demo.com" },
    update: {},
    create: {
      name: "Meera Patel",
      email: "meera@demo.com",
      hashedPassword: password,
      onboardingComplete: true,
      yearOfStudy: 3,
      college: "Christ University",
      collegeTier: "tier-1",
      branch: "BCA",
    },
  });

  // Save onboarding responses
  await prisma.onboardingResponse.upsert({
    where: { userId: arjun.id },
    update: {},
    create: {
      userId: arjun.id,
      answers: {
        degree: "btech-cse",
        yearOfStudy: "2",
        collegeTier: "tier-2",
        internships: "none",
        languages: ["Python", "C/C++", "JavaScript"],
        tools: ["Git"],
        codingComfort: 3,
        mathComfort: 2,
        workExcitement: "Building backend systems",
        problemSolvingStyle: "Algorithmic/logical",
        codePreference: "Writing code all day",
        workFocus: "Consumer-facing products",
        teamPreference: "Small team collaboration",
        jobPriority: "learning",
        companyPreference: "product",
        projectCount: "1-2-academic",
        hasPortfolio: "yes-basic",
        placementReadiness: 2,
      },
    },
  });

  await prisma.onboardingResponse.upsert({
    where: { userId: priya.id },
    update: {},
    create: {
      userId: priya.id,
      answers: {
        degree: "btech-it",
        yearOfStudy: "4",
        collegeTier: "iit-nit",
        internships: "1",
        languages: ["Python", "SQL", "R"],
        tools: ["Git", "Tableau", "Excel"],
        codingComfort: 3,
        mathComfort: 4,
        workExcitement: "Working with data",
        problemSolvingStyle: "Analytical/data-driven",
        codePreference: "More analysis, less code",
        workFocus: "Data pipelines & insights",
        teamPreference: "Small team collaboration",
        jobPriority: "learning",
        companyPreference: "product",
        projectCount: "3+-personal",
        hasPortfolio: "yes-active",
        placementReadiness: 3,
      },
    },
  });

  await prisma.onboardingResponse.upsert({
    where: { userId: meera.id },
    update: {},
    create: {
      userId: meera.id,
      answers: {
        degree: "bca",
        yearOfStudy: "3",
        collegeTier: "tier-1",
        internships: "none",
        languages: ["JavaScript"],
        tools: ["Figma", "Git"],
        codingComfort: 2,
        mathComfort: 2,
        workExcitement: "Designing experiences",
        problemSolvingStyle: "Creative/visual",
        codePreference: "More design, less code",
        workFocus: "Consumer-facing products",
        teamPreference: "Pair programming",
        jobPriority: "learning",
        companyPreference: "startup",
        projectCount: "1-2-academic",
        hasPortfolio: "yes-basic",
        placementReadiness: 2,
      },
    },
  });

  // Create sample recommendations for Arjun
  const arjunRecs = [
    {
      roleSlug: "backend-developer",
      totalScore: 72,
      skillScore: 65,
      interestScore: 100,
      aptitudeScore: 70,
      marketScore: 65,
      matchingSkills: ["Python", "JavaScript", "Git"],
      gapSkills: [
        { skillName: "SQL", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.8, category: "language" },
        { skillName: "Node.js", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.6, category: "framework" },
        { skillName: "REST APIs", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 2.0, category: "concept" },
      ],
      explanation: "You're a strong fit for Backend Developer (72% match). Your experience with Python, JavaScript, Git directly aligns with what this role demands. Backend Developers are in high demand in India's tech market, with freshers earning 5-10 LPA. To strengthen your profile, consider building skills in REST APIs and SQL — these are commonly expected in job postings for this role.",
      readinessLevel: "almost",
    },
    {
      roleSlug: "fullstack-developer",
      totalScore: 68,
      skillScore: 55,
      interestScore: 75,
      aptitudeScore: 70,
      marketScore: 70,
      matchingSkills: ["JavaScript", "Git"],
      gapSkills: [
        { skillName: "React", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.6, category: "framework" },
        { skillName: "Node.js", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.6, category: "framework" },
      ],
      explanation: "You have solid foundations for Full-Stack Developer (68% match). Your skills in JavaScript provide a good starting point for this career path. This role is in high demand across Indian tech companies, with freshers earning 5-10 LPA. To become competitive, focus on developing React and Node.js.",
      readinessLevel: "almost",
    },
    {
      roleSlug: "frontend-developer",
      totalScore: 58,
      skillScore: 45,
      interestScore: 50,
      aptitudeScore: 65,
      marketScore: 70,
      matchingSkills: ["JavaScript", "Git"],
      gapSkills: [
        { skillName: "HTML/CSS", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.8, category: "language" },
        { skillName: "React", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.8, category: "framework" },
      ],
      explanation: "Frontend Developer is an exploratory match for you (58% match). While your current skill set in JavaScript doesn't fully cover this role's requirements, you could build on your coding foundation. Frontend Developers earn 4-8 LPA as freshers in India.",
      readinessLevel: "growth-needed",
    },
  ];

  for (const rec of arjunRecs) {
    await prisma.roleRecommendation.upsert({
      where: { userId_roleSlug: { userId: arjun.id, roleSlug: rec.roleSlug } },
      update: {},
      create: { userId: arjun.id, ...rec },
    });
  }

  // Create sample recommendations for Priya
  const priyaRecs = [
    {
      roleSlug: "data-analyst",
      totalScore: 82,
      skillScore: 75,
      interestScore: 100,
      aptitudeScore: 80,
      marketScore: 80,
      matchingSkills: ["SQL", "Python", "Excel", "Tableau"],
      gapSkills: [
        { skillName: "Statistics", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.6, category: "concept" },
      ],
      explanation: "You're a strong fit for Data Analyst (82% match). Your experience with SQL, Python, Excel, Tableau directly aligns with what this role demands. Data Analysts are in high demand in India's tech market, with freshers earning 4-8 LPA. You already have a solid foundation to start applying for entry-level positions.",
      readinessLevel: "ready",
    },
    {
      roleSlug: "product-analyst",
      totalScore: 75,
      skillScore: 68,
      interestScore: 75,
      aptitudeScore: 80,
      marketScore: 75,
      matchingSkills: ["SQL", "Python", "Excel"],
      gapSkills: [],
      explanation: "You have solid foundations for Product Analyst (75% match). Your data skills combined with your analytical mindset make this a great match. Product Analysts earn 5-9 LPA as freshers in India.",
      readinessLevel: "almost",
    },
  ];

  for (const rec of priyaRecs) {
    await prisma.roleRecommendation.upsert({
      where: { userId_roleSlug: { userId: priya.id, roleSlug: rec.roleSlug } },
      update: {},
      create: { userId: priya.id, ...rec },
    });
  }

  // Create sample recommendations for Meera
  const meeraRecs = [
    {
      roleSlug: "uiux-designer",
      totalScore: 78,
      skillScore: 60,
      interestScore: 100,
      aptitudeScore: 85,
      marketScore: 65,
      matchingSkills: ["Figma"],
      gapSkills: [
        { skillName: "User Research", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.6, category: "concept" },
        { skillName: "Wireframing", currentLevel: "none", requiredLevel: "intermediate", gapSize: 2, priority: 1.8, category: "concept" },
      ],
      explanation: "You're a strong fit for UI/UX Designer (78% match). Your experience with Figma and your creative/visual problem-solving style align perfectly with this career path. UI/UX Designers earn 3.5-7 LPA as freshers in India. To strengthen your profile, consider learning structured User Research and Wireframing techniques.",
      readinessLevel: "almost",
    },
  ];

  for (const rec of meeraRecs) {
    await prisma.roleRecommendation.upsert({
      where: { userId_roleSlug: { userId: meera.id, roleSlug: rec.roleSlug } },
      update: {},
      create: { userId: meera.id, ...rec },
    });
  }

  console.log("Seed complete!");
  console.log("Demo accounts (password: password123):");
  console.log("  arjun@demo.com - 2nd year CSE, Backend Dev path");
  console.log("  priya@demo.com - 4th year IT, Data Analyst path");
  console.log("  meera@demo.com - 3rd year BCA, UI/UX Designer path");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
