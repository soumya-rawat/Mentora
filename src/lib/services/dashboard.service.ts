import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/types";

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  // Get active roadmap with tasks
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId, isActive: true },
    include: {
      milestones: {
        include: {
          tasks: {
            orderBy: { completedAt: "desc" },
          },
        },
      },
    },
  });

  const allTasks = roadmap?.milestones.flatMap((m) => m.tasks) || [];
  const completedTasks = allTasks.filter((t) => t.completed);
  const totalTasks = allTasks.length;
  const totalTasksCompleted = completedTasks.length;

  // Calculate streak from StreakLog
  const streakLogs = await prisma.streakLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60, // Last 60 days max
  });

  let currentStreak = 0;
  let longestStreak = 0;

  if (streakLogs.length > 0) {
    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    for (const log of streakLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round(
        (checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 1) {
        currentStreak++;
        checkDate = logDate;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let streak = 1;
    for (let i = 1; i < streakLogs.length; i++) {
      const prev = new Date(streakLogs[i - 1].date);
      const curr = new Date(streakLogs[i].date);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);

      const diff = Math.round(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak, currentStreak);
  }

  // Weekly activity (last 7 days)
  const weeklyActivity: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const log = streakLogs.find((l) => {
      const ld = new Date(l.date);
      ld.setHours(0, 0, 0, 0);
      return ld.getTime() === date.getTime();
    });

    weeklyActivity.push(log?.taskCount || 0);
  }

  // Recent completed tasks
  const recentTasks = completedTasks
    .filter((t) => t.completedAt)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )
    .slice(0, 5)
    .map((t) => ({
      title: t.title,
      completedAt: t.completedAt!.toISOString(),
      type: t.type,
    }));

  return {
    currentStreak,
    longestStreak,
    totalTasksCompleted,
    totalTasks,
    completionPercentage:
      totalTasks > 0 ? Math.round((totalTasksCompleted / totalTasks) * 100) : 0,
    weeklyActivity,
    recentTasks,
  };
}
