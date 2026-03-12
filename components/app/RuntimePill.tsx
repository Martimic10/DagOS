"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OllamaHealthResponse } from "@/app/api/ollama/health/route";

type State = "checking" | "online" | "offline";

export function RuntimePill() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ollama/health")
      .then((r) => r.json())
      .then((data: OllamaHealthResponse) => {
        if (!cancelled) setState(data.ok ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setState("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] text-zinc-600">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        Checking runtime
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px]",
        state === "online"
          ? "border-zinc-700/60 bg-zinc-900/60 text-zinc-400"
          : "border-zinc-800/60 bg-zinc-900/40 text-zinc-600"
      )}
    >
      <span
        className={cn(
          "relative flex h-1.5 w-1.5",
          state === "online" ? "visible" : "hidden"
        )}
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      {state === "offline" && (
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
      )}
      {state === "online" ? "Runtime Online" : "Runtime Offline"}
    </span>
  );
}
