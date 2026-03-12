"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Terminal,
  Cpu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OllamaHealthResponse } from "@/app/api/ollama/health/route";
import { loadProfile, saveProfile } from "@/lib/local-profile";

type CheckState = "idle" | "checking" | "online" | "offline";

const ONBOARDED_KEY = "dagos_onboarded";

const steps = [
  {
    num: "01",
    label: "Install Ollama",
    command: "brew install ollama",
    comment: "# macOS — or visit ollama.com",
  },
  {
    num: "02",
    label: "Start the server",
    command: "ollama serve",
    comment: "# runs on :11434",
  },
  {
    num: "03",
    label: "Pull a model",
    command: "ollama pull llama3",
    comment: "# ~4.7 GB",
  },
];

function StatusIndicator({ state }: { state: CheckState }) {
  if (state === "checking") {
    return (
      <div className="flex items-center gap-2.5">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
        <span className="font-mono text-sm text-zinc-400">Checking runtime…</span>
      </div>
    );
  }
  if (state === "online") {
    return (
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span className="font-mono text-sm text-emerald-400">
          Ollama detected on localhost:11434
        </span>
      </div>
    );
  }
  if (state === "offline") {
    return (
      <div className="flex items-center gap-2.5">
        <XCircle className="h-4 w-4 text-red-500/80" />
        <span className="font-mono text-sm text-red-400/80">
          Ollama not detected — start the server and re-check
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-4 w-4 rounded-full border border-zinc-700 bg-zinc-800" />
      <span className="font-mono text-sm text-zinc-600">
        Click Check Runtime to begin
      </span>
    </div>
  );
}

export default function SetupPage() {
  const [state, setState] = useState<CheckState>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const profile = loadProfile();
    if (profile?.firstName) setFirstName(profile.firstName);
  }, []);

  const runCheck = useCallback(async () => {
    setState("checking");
    setErrorDetail(null);
    try {
      const res = await fetch("/api/ollama/health");
      const data: OllamaHealthResponse = await res.json();
      if (data.ok) {
        setState("online");
      } else {
        setState("offline");
        setErrorDetail("error" in data ? data.error : null);
      }
    } catch {
      setState("offline");
      setErrorDetail("Could not reach health endpoint");
    }
  }, []);

  const handleContinue = useCallback(() => {
    const trimmed = firstName.trim().split(/\s+/)[0];
    if (trimmed) saveProfile({ firstName: trimmed });
    localStorage.setItem(ONBOARDED_KEY, "true");
    router.push("/app/dashboard");
  }, [router, firstName]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
              <div className="h-2 w-2 rounded-sm bg-zinc-100" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              DagOS · Setup
            </span>
          </div>
          <h1 className="font-mono text-2xl font-bold text-zinc-100">
            Connect your runtime
          </h1>
          <p className="mt-1.5 font-mono text-sm text-zinc-500">
            DagOS needs Ollama running locally to manage and serve models.
          </p>
        </div>

        {/* Install steps — terminal panel */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/80 ring-1 ring-inset ring-white/3">
          <div className="flex items-center gap-2 border-b border-zinc-800/70 bg-zinc-950 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
            </div>
            <div className="flex flex-1 items-center justify-center gap-2">
              <Terminal className="h-3 w-3 text-zinc-600" />
              <span className="font-mono text-[10px] text-zinc-600">
                terminal — setup
              </span>
            </div>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {steps.map((s) => (
              <div
                key={s.num}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span className="w-5 flex-shrink-0 font-mono text-[10px] font-semibold text-zinc-700">
                  {s.num}
                </span>
                <span className="w-28 flex-shrink-0 font-mono text-[10px] text-zinc-600">
                  {s.label}
                </span>
                <span className="font-mono text-xs text-zinc-600 flex-shrink-0">
                  $
                </span>
                <code className="flex-1 font-mono text-sm text-zinc-200">
                  {s.command}
                </code>
                <span className="hidden font-mono text-[10px] text-zinc-700 sm:block whitespace-nowrap">
                  {s.comment}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Local Profile card */}
        <div className="mb-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/3">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 px-5 py-3">
            <User className="h-3.5 w-3.5 text-zinc-600" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Local Profile
            </span>
          </div>
          <div className="px-5 py-4">
            <p className="mb-3 font-mono text-[11px] text-zinc-600">
              Set the name shown on this DagOS workstation.
            </p>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                First Name
              </span>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Michael"
                className="h-8 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Runtime status card */}
        <div className="mb-6 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/3">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-zinc-600" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Runtime Status
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-700">
              localhost:11434
            </span>
          </div>

          {/* Status body */}
          <div className="px-5 py-4">
            <StatusIndicator state={state} />

            {/* Error detail */}
            {errorDetail && (
              <p className="mt-2 font-mono text-[11px] text-zinc-700">
                Detail: {errorDetail}
              </p>
            )}

            {/* Online detail row */}
            {state === "online" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  Ollama API is responding · /api/tags
                </span>
              </div>
            )}
          </div>

          {/* Card footer — actions */}
          <div className="flex items-center justify-between border-t border-zinc-800/60 px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={runCheck}
              disabled={state === "checking"}
              className="h-8 gap-2 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700 disabled:opacity-40"
            >
              {state === "checking" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {state === "idle" ? "Check Runtime" : "Re-check"}
            </Button>

            <Button
              size="sm"
              onClick={handleContinue}
              disabled={state !== "online"}
              className="h-8 gap-2 border border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Skip hint */}
        <p className="text-center font-mono text-[10px] text-zinc-700">
          Ollama already running?{" "}
          <button
            onClick={runCheck}
            className="text-zinc-500 underline underline-offset-2 hover:text-zinc-300 transition-colors"
          >
            Check now
          </button>
        </p>
      </div>
    </div>
  );
}
