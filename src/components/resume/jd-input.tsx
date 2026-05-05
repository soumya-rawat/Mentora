"use client";

import { useState } from "react";
import { Loader2, FileSearch } from "lucide-react";

interface JDInputProps {
  uploadId: string | null;
  onResult: (result: unknown) => void;
}

export function JDInput({ uploadId, onResult }: JDInputProps) {
  const [jdText, setJdText] = useState("");
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  async function handleMatch() {
    if (!uploadId) return;
    if (jdText.trim().length < 50) {
      setError("Please paste a job description (at least 50 characters)");
      return;
    }

    setMatching(true);
    setError("");

    try {
      const res = await fetch("/api/resume/match-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUploadId: uploadId, jobDescription: jdText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Match failed");
      }

      const data = await res.json();
      onResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMatching(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Paste Job Description</h3>
      <p className="mt-1 text-sm text-gray-500">
        Copy a job posting and we&apos;ll analyze how well your resume matches it.
      </p>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the full job description here..."
        rows={8}
        className="mt-3 w-full rounded-md border border-gray-300 p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {jdText.length} characters {jdText.length < 50 && jdText.length > 0 && "(min 50)"}
        </span>
        <button
          onClick={handleMatch}
          disabled={matching || !uploadId || jdText.trim().length < 50}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {matching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Matching...
            </>
          ) : (
            <>
              <FileSearch className="h-4 w-4" />
              Match Resume to JD
            </>
          )}
        </button>
      </div>

      {!uploadId && (
        <p className="mt-2 text-xs text-amber-600">Upload a resume first to use JD matching.</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
