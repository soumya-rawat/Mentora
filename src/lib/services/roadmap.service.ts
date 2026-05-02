import { prisma } from "@/lib/prisma";
import { getTemplateForRole } from "@/lib/constants/roadmap-templates";
import { SkillGap } from "@/types";

export async function generateRoadmap(userId: string, roleSlug: string) {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { yearOfStudy: true },
  });

  // Get user's recommendation for this role (for skill gap info)
  const recommendation = await prisma.roleRecommendation.findUnique({
    where: { userId_roleSlug: { userId, roleSlug } },
    select: { matchingSkills: true, gapSkills: true, readinessLevel: true },
  });

  const yearOfStudy = user?.yearOfStudy || 3;
  const matchingSkills = (recommendation?.matchingSkills as string[]) || [];
  const readinessLevel = recommendation?.readinessLevel || "growth-needed";

  // Determine user's approximate skill level for filtering
  const skillLevel =
    readinessLevel === "ready"
      ? "advanced"
      : readinessLevel === "almost"
      ? "intermediate"
      : "beginner";

  // Get roadmap template and filter milestones
  const templates = getTemplateForRole(roleSlug);
  const filteredMilestones = templates.filter(
    (m) =>
      m.forLevels.includes(skillLevel) &&
      m.forYears.includes(yearOfStudy)
  );

  // If no milestones match after filtering, use all templates
  const milestonesToUse =
    filteredMilestones.length > 0 ? filteredMilestones : templates;

  // Deactivate any existing roadmaps for this role
  await prisma.roadmap.updateMany({
    where: { userId, roleSlug, isActive: true },
    data: { isActive: false },
  });

  // Create roadmap with milestones and tasks
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      roleSlug,
      isActive: true,
      milestones: {
        create: milestonesToUse.map((m, mIndex) => ({
          order: mIndex,
          title: m.title,
          description: m.description,
          estimatedWeeks: m.estimatedWeeks,
          category: m.category,
          difficulty: m.difficulty,
          status: mIndex === 0 ? "active" : "locked",
          tasks: {
            create: m.tasks.map((t, tIndex) => ({
              title: t.title,
              description: t.description,
              type: t.type,
              resourceUrl: t.resourceUrl || null,
              resourceLabel: t.resourceLabel || null,
              estimatedHours: t.estimatedHours,
              order: tIndex,
            })),
          },
        })),
      },
    },
    include: {
      milestones: {
        include: { tasks: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return roadmap;
}

export async function toggleTaskCompletion(taskId: string, userId: string) {
  // Verify the task belongs to the user
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      milestone: {
        roadmap: { userId },
      },
    },
    include: {
      milestone: {
        include: {
          tasks: true,
          roadmap: {
            include: {
              milestones: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!task) return null;

  const nowCompleted = !task.completed;

  // Update the task
  await prisma.task.update({
    where: { id: taskId },
    data: {
      completed: nowCompleted,
      completedAt: nowCompleted ? new Date() : null,
    },
  });

  // If completing a task, log streak
  if (nowCompleted) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.streakLog.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: { userId, date: today, taskCount: 1 },
      update: { taskCount: { increment: 1 } },
    });
  }

  // Check if all tasks in the milestone are completed
  const milestone = task.milestone;
  const allTasks = milestone.tasks;
  const completedCount = allTasks.filter(
    (t) => (t.id === taskId ? nowCompleted : t.completed)
  ).length;

  if (completedCount === allTasks.length && nowCompleted) {
    // Mark milestone as completed
    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: "completed" },
    });

    // Activate the next milestone
    const roadmap = milestone.roadmap;
    const nextMilestone = roadmap.milestones.find(
      (m) => m.order === milestone.order + 1 && m.status === "locked"
    );

    if (nextMilestone) {
      await prisma.milestone.update({
        where: { id: nextMilestone.id },
        data: { status: "active" },
      });
    }
  } else if (!nowCompleted && milestone.status === "completed") {
    // If unchecking a task in a completed milestone, revert to active
    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: "active" },
    });
  }

  return { completed: nowCompleted };
}
