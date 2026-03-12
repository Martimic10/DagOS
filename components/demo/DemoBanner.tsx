"use client";

import Link from "next/link";
import { FlaskConical, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative z-50 flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-950/40 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <FlaskConical className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
        <p className="font-mono text-xs text-amber-300/80 truncate">
          <span className="font-semibold text-amber-300">Demo Mode</span>
          {" — "}DagOS is running with simulated data. Install locally for the full experience.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1 font-mono text-xs text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
        >
          Run DagOS Locally
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 text-amber-600 hover:text-amber-400 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
