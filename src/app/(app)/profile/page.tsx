import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, GraduationCap, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      yearOfStudy: true,
      college: true,
      collegeTier: true,
      branch: true,
      onboardingComplete: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-gray-600" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm font-medium">
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Academic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.yearOfStudy && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Year of Study</span>
                <Badge variant="secondary">
                  <Calendar className="mr-1 h-3 w-3" />
                  {user.yearOfStudy === 5
                    ? "Graduated"
                    : `Year ${user.yearOfStudy}`}
                </Badge>
              </div>
              <Separator />
            </>
          )}
          {user.collegeTier && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">College Tier</span>
                <Badge variant="secondary">
                  <Building2 className="mr-1 h-3 w-3" />
                  {user.collegeTier}
                </Badge>
              </div>
              <Separator />
            </>
          )}
          {user.branch && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Branch</span>
              <span className="text-sm font-medium">{user.branch}</span>
            </div>
          )}
          {!user.onboardingComplete && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              Complete your profile assessment to get career recommendations.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/onboarding">
          <Button variant="outline">
            {user.onboardingComplete
              ? "Retake Assessment"
              : "Complete Assessment"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
