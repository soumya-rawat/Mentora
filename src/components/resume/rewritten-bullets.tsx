"use client";

import { RewrittenBullet } from "@/types";
import { ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";

interface RewrittenBulletsProps {
  bullets: RewrittenBullet[];
}

export function RewrittenBullets({ bullets }: RewrittenBulletsProps) {
  if (bullets.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">AI-Rewritten Bullets</h3>
      <p className="mt-1 text-sm text-gray-500">
        Improved versions of your weakest bullet points. Copy and adapt them.
      </p>

      <div className="mt-4 space-y-4">
        {bullets.map((bullet, i) => (
          <RewriteItem key={i} bullet={bullet} />
        ))}
      </div>
    </div>
  );
}

function RewriteItem({ bullet }: { bullet: RewrittenBullet }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(bullet.rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-md border border-gray-200 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
              Before
            </span>
            <p className="text-sm text-gray-500 line-through">{bullet.original}</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="mt-1 h-3 w-3 shrink-0 text-green-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                  After
                </span>
                <p className="text-sm font-medium text-gray-900">{bullet.rewritten}</p>
              </div>
              <p className="mt-1 text-xs text-gray-400">{bullet.explanation}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-md border p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          title="Copy rewritten bullet"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
