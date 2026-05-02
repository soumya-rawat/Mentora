"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskCheckbox } from "@/components/roadmap/task-checkbox";
import {
  Route,
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
  Loader2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  estimatedHours: number;
  resourceUrl: string | null;
  resourceLabel: string | null;
  order: number;
}

interface Milestone {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedWeeks: number;
  category: string;
  difficulty: string;
  status: string;
  tasks: Task[];
}

interface Roadmap {
  id: string;
  roleSlug: string;
  milestones: Milestone[];
}

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchRoadmap();
  }, []);

  async function fetchRoadmap() {
    const res = await fetch("/api/roadmap");
    const data = await res.json();
    setRoadmap(data.data);
    setLoading(false);

    // Auto-expand active milestones
    if (data.data) {
      const activeMilestones = data.data.milestones
        .filter((m: Milestone) => m.status === "active")
        .map((m: Milestone) => m.id);
      setExpandedMilestones(new Set(activeMilestones));
    }
  }

  async function handleToggleTask(taskId: string) {
    await fetch(`/api/roadmap/${taskId}`, { method: "PATCH" });
    await fetchRoadmap();
  }

  function toggleMilestoneExpand(milestoneId: string) {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(milestoneId)) next.delete(milestoneId);
      else next.add(milestoneId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Route className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900">No roadmap yet</h2>
        <p className="mt-2 text-gray-500">
          Get your career recommendations first, then generate a personalized
          roadmap.
        </p>
        <Link href="/recommendations" className="mt-4">
          <Button className="gap-2">
            <Compass className="h-4 w-4" />
            View Recommendations
          </Button>
        </Link>
      </div>
    );
  }

  const totalTasks = roadmap.milestones.reduce(
    (acc, m) => acc + m.tasks.length,
    0
  );
  const completedTasks = roadmap.milestones.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.completed).length,
    0
  );
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const roleTitle = roadmap.roleSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Find next uncompleted task
  const nextTask = roadmap.milestones
    .filter((m) => m.status === "active")
    .flatMap((m) => m.tasks)
    .find((t) => !t.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Roadmap</h1>
        <p className="mt-1 text-gray-500">
          Your personalized path to becoming a {roleTitle}
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressPercent}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tasks Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {completedTasks}/{totalTasks}
              </p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-4" />
        </CardContent>
      </Card>

      {/* Next Action */}
      {nextTask && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase text-blue-600">
              Next Best Action
            </p>
            <p className="mt-1 text-sm font-medium text-blue-900">
              {nextTask.title}
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              {nextTask.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Milestone Timeline */}
      <div className="space-y-3">
        {roadmap.milestones.map((milestone) => {
          const isExpanded = expandedMilestones.has(milestone.id);
          const milestoneCompleted = milestone.tasks.every((t) => t.completed);
          const milestoneProgress = milestone.tasks.length
            ? Math.round(
                (milestone.tasks.filter((t) => t.completed).length /
                  milestone.tasks.length) *
                  100
              )
            : 0;
          const isLocked = milestone.status === "locked";

          return (
            <Card
              key={milestone.id}
              className={cn(
                isLocked && "opacity-60",
                milestoneCompleted && "border-green-200"
              )}
            >
              <button
                className="w-full text-left"
                onClick={() =>
                  !isLocked && toggleMilestoneExpand(milestone.id)
                }
                disabled={isLocked}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    {isLocked ? (
                      <Lock className="h-5 w-5 text-gray-400" />
                    ) : milestoneCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">
                          {milestone.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px]">
                          {milestone.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>~{milestone.estimatedWeeks} weeks</span>
                        <span>
                          {milestone.tasks.filter((t) => t.completed).length}/
                          {milestone.tasks.length} tasks
                        </span>
                        {!isLocked && !milestoneCompleted && (
                          <span>{milestoneProgress}%</span>
                        )}
                      </div>
                    </div>
                    {!isLocked &&
                      (isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      ))}
                  </div>
                </CardHeader>
              </button>

              {isExpanded && !isLocked && (
                <CardContent className="space-y-2 px-4 pb-4 pt-0">
                  <p className="mb-3 text-xs text-gray-500">
                    {milestone.description}
                  </p>
                  {milestone.tasks.map((task) => (
                    <TaskCheckbox
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      description={task.description}
                      type={task.type}
                      completed={task.completed}
                      estimatedHours={task.estimatedHours}
                      resourceUrl={task.resourceUrl}
                      resourceLabel={task.resourceLabel}
                      onToggle={handleToggleTask}
                    />
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
