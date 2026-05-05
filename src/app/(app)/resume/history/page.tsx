import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ResumeHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const uploads = await prisma.resumeUpload.findMany({
    where: { userId: session.user.id },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume History</h1>
          <p className="mt-1 text-gray-500">
            Past uploads and analyses
          </p>
        </div>
        <Link
          href="/resume"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Analysis
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {uploads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12">
            <FileText className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No resumes uploaded yet</p>
            <Link
              href="/resume"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Upload your first resume →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {uploads.map((upload) => {
            const latestAnalysis = upload.analyses[0];
            return (
              <Card key={upload.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {upload.fileName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(upload.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>{upload.wordCount} words</span>
                    </div>
                  </div>
                  {latestAnalysis && (
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {latestAnalysis.targetRoleSlug.replace(/-/g, " ")}
                      </Badge>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          latestAnalysis.atsScore >= 75
                            ? "border-green-300 text-green-600"
                            : latestAnalysis.atsScore >= 50
                              ? "border-blue-300 text-blue-600"
                              : "border-amber-300 text-amber-600"
                        }`}
                      >
                        {Math.round(latestAnalysis.atsScore)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
