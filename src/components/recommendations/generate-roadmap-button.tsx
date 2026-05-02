"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Route, Loader2 } from "lucide-react";

export function GenerateRoadmapButton({ roleSlug }: { roleSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleSlug }),
      });

      if (res.ok) {
        router.push("/roadmap");
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" className="gap-2" onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Route className="h-5 w-5" />
          Generate My Roadmap
        </>
      )}
    </Button>
  );
}
