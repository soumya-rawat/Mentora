"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Target,
  CheckCircle2,
  TrendingUp,
  Compass,
  Route,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "@/types";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data.data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userName}
          </h1>
          <p className="text-gray-500">Here&apos;s your career progress overview</p>
        </div>
        {stats && stats.currentStreak > 0 && (
          <Badge className="gap-1 bg-orange-100 px-3 py-1.5 text-orange-700">
            <Flame className="h-4 w-4" />
            {stats.currentStreak} day streak
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.currentStreak}
                    <span className="text-sm font-normal text-gray-400">
                      {" "}
                      days
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tasks Done</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalTasksCompleted}
                    <span className="text-sm font-normal text-gray-400">
                      /{stats.totalTasks}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completionPercentage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Longest Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.longestStreak}
                    <span className="text-sm font-normal text-gray-400">
                      {" "}
                      days
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Progress */}
      {stats && stats.totalTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roadmap Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.completionPercentage} className="mb-2" />
            <p className="text-sm text-gray-500">
              {stats.totalTasksCompleted} of {stats.totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Activity */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2">
              {stats.weeklyActivity.map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${
                      count > 0 ? "bg-blue-500" : "bg-gray-100"
                    }`}
                    style={{
                      height: `${Math.max(count * 20, 4)}px`,
                      maxHeight: "80px",
                    }}
                  />
                  <span className="text-[10px] text-gray-400">
                    {dayLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats && stats.recentTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{task.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(task.completedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {task.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/recommendations">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <Compass className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Career Matches</p>
                <p className="text-xs text-gray-500">View recommendations</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/roadmap">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <Route className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">My Roadmap</p>
                <p className="text-xs text-gray-500">Continue learning</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/resume">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Resume Analysis</p>
                <p className="text-xs text-gray-500">Get ATS feedback</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
