"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { ROLES } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { KeywordMatch, ResumeSectionScore } from "@/types";

interface AnalysisResult {
  atsScore: number;
  keywordMatches: KeywordMatch[];
  sectionScores: ResumeSectionScore[];
  suggestions: string[];
  feedback: string;
}

export default function ResumePage() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState(ROLES[0].slug);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Upload failed");
        setUploading(false);
        return;
      }

      setUploadId(data.data.id);
      setFileName(data.data.fileName);
      setUploading(false);
    } catch {
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  async function handleAnalyze() {
    if (!uploadId) return;

    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeUploadId: uploadId,
          targetRoleSlug: targetRole,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      setResult(data.data);
      setAnalyzing(false);
    } catch {
      setError("Analysis failed. Please try again.");
      setAnalyzing(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-blue-600";
    return "text-amber-600";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Resume ATS Analyzer
        </h1>
        <p className="mt-1 text-gray-500">
          Upload your resume and see how well it matches your target role
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-green-600" />
                <p className="text-sm font-medium text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-500">
                  Click or drag to upload a different file
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">
                    Click to upload
                  </span>{" "}
                  or drag and drop your resume
                </p>
                <p className="text-xs text-gray-400">PDF only, max 5MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Selection + Analyze */}
      {uploadId && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ROLES.map((role) => (
                    <option key={role.slug} value={role.slug}>
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          {/* ATS Score */}
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <div
                className={cn(
                  "flex h-24 w-24 flex-col items-center justify-center rounded-full border-4",
                  result.atsScore >= 75
                    ? "border-green-300 bg-green-50"
                    : result.atsScore >= 50
                    ? "border-blue-300 bg-blue-50"
                    : "border-amber-300 bg-amber-50"
                )}
              >
                <span
                  className={cn("text-3xl font-bold", getScoreColor(result.atsScore))}
                >
                  {result.atsScore}
                </span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ATS Readiness Score
                </h3>
                <p className="mt-1 text-sm text-gray-600">{result.feedback}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Section Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {result.sectionScores.map((section) => (
                  <div
                    key={section.section}
                    className={cn(
                      "flex items-center gap-2 rounded-lg p-3",
                      section.found
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {section.found ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {section.section}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keyword Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Progress
                  value={
                    (result.keywordMatches.filter((k) => k.found).length /
                      result.keywordMatches.length) *
                    100
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  {result.keywordMatches.filter((k) => k.found).length} of{" "}
                  {result.keywordMatches.length} keywords found
                </p>
              </div>
              <div className="space-y-2">
                {result.keywordMatches.map((match) => (
                  <div
                    key={match.skill}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {match.found ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-sm">{match.skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          match.found
                            ? "border-green-200 text-green-600"
                            : "border-red-200 text-red-500"
                        )}
                      >
                        {match.matchType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tips */}
      {!result && !uploadId && (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-blue-900">
              Tips for better results
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>Use a single-page PDF resume</li>
              <li>Include sections: Education, Skills, Projects, Experience</li>
              <li>Add your GitHub/LinkedIn links</li>
              <li>Use action verbs: Built, Designed, Implemented</li>
              <li>Quantify achievements: &quot;Improved performance by 40%&quot;</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
