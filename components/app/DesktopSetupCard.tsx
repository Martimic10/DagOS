"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  ArrowRight,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
  Package,
  MessageSquare,
  Terminal,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type EngineStatus = "idle" | "checking" | "connected" | "disconnected";
type ModelStatus  = "idle" | "checking" | "ready"     | "empty";
type StepStatus   = "pending" | "checking" | "complete" | "attention";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window as { dagosDesktop?: { isDesktop?: boolean } }).dagosDesktop?.isDesktop === true
  );
}

const DISMISSED_KEY = "dagos_desktop_setup_dismissed";

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIcon({ status, num }: { status: StepStatus; num: number }) {
  if (status === "complete")
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  if (status === "checking")
    return <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-zinc-500" />;
  if (status === "attention")
    return <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/80" />;
  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 font-mono text-[9px] font-bold text-zinc-600">
      {num}
    </span>
  );
}

function StepBadge({ status }: { status: StepStatus }) {
  if (status === "complete")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-900/50 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-500/80">
        <span className="h-1 w-1 rounded-full bg-emerald-500" />
        Done
      </span>
    );
  if (status === "checking")
    return (
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        Checking…
      </span>
    );
  if (status === "attention")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded border border-amber-900/50 bg-amber-950/30 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-500/80">
        <span className="h-1 w-1 rounded-full bg-amber-500" />
        Needed
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-zinc-800/60 bg-zinc-900/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
      <span className="h-1 w-1 rounded-full bg-zinc-700" />
      Pending
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DesktopSetupCard() {
  const [visible, setVisible]               = useState(false);
  const [engineStatus, setEngineStatus]     = useState<EngineStatus>("idle");
  const [modelStatus, setModelStatus]       = useState<ModelStatus>("idle");
  const [installing, setInstalling]         = useState(false);
  const [installProgress, setInstallProgress] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen]     = useState(false);

  // Only mount inside the Electron shell
  useEffect(() => {
    if (!isDesktopApp()) return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;
    setVisible(true);
  }, []);

  const runChecks = useCallback(async () => {
    setEngineStatus("checking");
    setModelStatus("checking");

    const [healthData, modelsData] = await Promise.all([
      fetch("/api/ollama/health").then((r) => r.json()).catch(() => ({ ok: false })),
      fetch("/api/ollama/models").then((r) => r.json()).catch(() => ({ ok: false, models: [] })),
    ]);

    const connected = healthData.ok === true;
    const hasModels =
      modelsData.ok === true &&
      Array.isArray(modelsData.models) &&
      modelsData.models.length > 0;

    setEngineStatus(connected ? "connected" : "disconnected");
    setModelStatus(hasModels ? "ready" : "empty");

    if (connected && hasModels) {
      localStorage.setItem(DISMISSED_KEY, "true");
      setTimeout(() => setVisible(false), 1800);
    }
  }, []);

  // Auto-run checks when the card first appears
  useEffect(() => {
    if (visible) runChecks();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInstall = useCallback(async () => {
    setInstalling(true);
    setInstallProgress("Starting download…");

    try {
      const res = await fetch("/api/ollama/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3.2" }),
      });

      if (!res.body) throw new Error("No stream");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        for (const line of buf.split("\n")) {
          if (!line.trim().startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.trim().slice(6)) as {
              status?: string;
              total?: number;
              completed?: number;
            };
            if (json.status) {
              const pct =
                json.total && json.completed
                  ? ` · ${Math.round((json.completed / json.total) * 100)}%`
                  : "";
              setInstallProgress(`${json.status}${pct}`);
            }
          } catch { /* non-JSON, skip */ }
        }
        buf = buf.split("\n").pop() ?? "";
      }
    } catch {
      setInstallProgress("Download failed — make sure the AI engine is running.");
    } finally {
      setInstalling(false);
      setInstallProgress(null);
      runChecks();
    }
  }, [runChecks]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  }, []);

  if (!visible) return null;

  // ── Derived state ────────────────────────────────────────────────────────────

  const engineConnected = engineStatus === "connected";
  const modelReady      = modelStatus === "ready";
  const allDone         = engineConnected && modelReady;
  const anyChecking     = engineStatus === "checking" || modelStatus === "checking";

  // Step 1: guide to install — "pending" while unknown, "complete" once connected
  const step1: StepStatus =
    engineStatus === "checking" ? "checking" :
    engineConnected             ? "complete"  :
                                  "pending";

  // Step 2: verify connection — "attention" when we've tried and it failed
  const step2: StepStatus =
    engineStatus === "checking"    ? "checking"  :
    engineConnected                ? "complete"  :
    engineStatus === "disconnected"? "attention" :
                                     "pending";

  // Step 3: install model — locked until engine connects
  const step3: StepStatus =
    modelStatus === "checking"                   ? "checking"  :
    modelReady                                    ? "complete"  :
    engineConnected                               ? "attention" :
                                                    "pending";

  // Step 4: launch — only unlocked when fully ready
  const step4: StepStatus = allDone ? "complete" : "pending";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-950/80 ring-1 ring-inset ring-white/4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 bg-zinc-900/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900">
            <Zap className="h-3.5 w-3.5 text-zinc-300" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-zinc-100">Set Up DagOS</h2>
            <p className="font-mono text-[11px] text-zinc-500">
              DagOS runs AI locally on your computer. Follow these steps to get everything ready.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss setup"
          className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-800 text-zinc-600 transition-colors hover:border-zinc-700 hover:text-zinc-400"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* ── Body: steps + sidebar ── */}
      <div className="grid grid-cols-1 divide-y divide-zinc-800/50 lg:grid-cols-[1fr_200px] lg:divide-x lg:divide-y-0">

        {/* ── Steps column ── */}
        <div className="divide-y divide-zinc-800/40">

          {/* Step 1 — Install the AI Engine */}
          <div className={`px-6 py-5 transition-opacity ${step1 === "complete" ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-3">
              <StepIcon status={step1} num={1} />
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-zinc-200">
                    Install the AI Engine
                  </p>
                  <StepBadge status={step1} />
                </div>
                <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                  DagOS uses Ollama to run AI models privately on your computer. No data leaves
                  your machine.
                </p>
                {step1 !== "complete" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open("https://ollama.com/download", "_blank")}
                      className="h-7 gap-1.5 border border-zinc-700 bg-zinc-900/60 font-mono text-[11px] text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600"
                    >
                      <Download className="h-3 w-3" />
                      Download Ollama
                    </Button>
                    <span className="font-mono text-[10px] text-zinc-700">
                      Opens the Ollama website
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 — Check Connection */}
          <div className={`px-6 py-5 transition-opacity ${step2 === "complete" ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-3">
              <StepIcon status={step2} num={2} />
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-zinc-200">
                    Check Connection
                  </p>
                  <StepBadge status={step2} />
                </div>
                <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                  {step2 === "attention"
                    ? "The AI engine is installed but not running. Open Ollama and try again."
                    : "Once Ollama is installed and open, DagOS connects to it automatically."}
                </p>

                {step2 === "complete" ? (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-mono text-[11px] text-emerald-600/80">
                      AI engine is running
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={runChecks}
                      disabled={anyChecking}
                      className="h-7 gap-1.5 border border-zinc-800 bg-transparent font-mono text-[11px] text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-40"
                    >
                      {engineStatus === "checking" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      {engineStatus === "checking" ? "Checking…" : "Check Setup"}
                    </Button>
                    {step2 === "attention" && (
                      <span className="font-mono text-[10px] text-amber-600/80">
                        Make sure Ollama is open and running
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3 — Install First Model */}
          <div
            className={`px-6 py-5 transition-opacity ${
              step3 === "complete" ? "opacity-50" :
              !engineConnected     ? "opacity-40" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <StepIcon status={step3} num={3} />
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-zinc-200">
                    Install Your First Model
                  </p>
                  <StepBadge status={step3} />
                </div>
                <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                  {!engineConnected && engineStatus !== "idle"
                    ? "Connect the AI engine first, then install a model to continue."
                    : "We recommend Llama 3 — a powerful, free model that works great for most tasks. About 2 GB."}
                </p>

                {step3 !== "complete" && engineConnected && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInstall}
                      disabled={installing || anyChecking}
                      className="h-7 gap-1.5 border border-zinc-700 bg-zinc-900/60 font-mono text-[11px] text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-40"
                    >
                      {installing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Package className="h-3 w-3" />
                      )}
                      {installing ? "Installing…" : "Install Llama 3"}
                    </Button>
                    <Link href="/app/models">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 border border-zinc-800 bg-transparent font-mono text-[11px] text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700"
                      >
                        Choose Another Model
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Install progress */}
                {installProgress && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2">
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin text-zinc-600" />
                    <span className="font-mono text-[11px] text-zinc-500">{installProgress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 4 — Launch Workspace */}
          <div className={`px-6 py-5 transition-opacity ${!allDone ? "opacity-40" : ""}`}>
            <div className="flex items-start gap-3">
              <StepIcon status={step4} num={4} />
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-zinc-200">
                    Launch Your Workspace
                  </p>
                  <StepBadge status={step4} />
                </div>
                <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                  {allDone
                    ? "Everything is ready. Open the chat and start using DagOS."
                    : "Complete the steps above to unlock your workspace."}
                </p>
                <Link href="/app/chat">
                  <Button
                    size="sm"
                    disabled={!allDone}
                    className="h-7 gap-1.5 border border-zinc-700 bg-zinc-900 font-mono text-[11px] text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Open Workspace
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* ── Sidebar column ── */}
        <div className="flex flex-col bg-zinc-950/40">

          {/* Recommended path */}
          <div className="p-5">
            <div className="mb-3.5 flex items-center gap-2">
              <Cpu className="h-3 w-3 text-zinc-700" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Recommended
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {([
                { num: "01", label: "Install Ollama",      done: engineConnected },
                { num: "02", label: "Install Llama 3",     done: modelReady },
                { num: "03", label: "Start chatting",       done: false },
              ] as const).map(({ num, label, done }) => (
                <div key={num} className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600/70" />
                  ) : (
                    <span className="font-mono text-[10px] text-zinc-700">{num}</span>
                  )}
                  <span
                    className={`font-mono text-[11px] ${
                      done ? "text-zinc-600 line-through" : "text-zinc-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800/50" />

          {/* Advanced section */}
          <div className="p-5">
            <button
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-zinc-700" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  Advanced
                </span>
              </div>
              {advancedOpen ? (
                <ChevronDown className="h-3 w-3 text-zinc-700" />
              ) : (
                <ChevronRight className="h-3 w-3 text-zinc-700" />
              )}
            </button>

            {advancedOpen && (
              <div className="mt-3.5 flex flex-col gap-2">
                <p className="font-mono text-[10px] text-zinc-700 mb-1">Manual setup commands</p>
                {([
                  { cmd: "brew install ollama", note: "# install" },
                  { cmd: "ollama serve",        note: "# start"   },
                  { cmd: "ollama pull llama3.2",note: "# model"   },
                ] as const).map(({ cmd, note }) => (
                  <div
                    key={cmd}
                    className="rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-3 py-2"
                  >
                    <span className="block font-mono text-[9px] text-zinc-700">{note}</span>
                    <code className="font-mono text-[11px] text-zinc-300">{cmd}</code>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Re-check at bottom */}
          <div className="mt-auto border-t border-zinc-800/50 p-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={runChecks}
              disabled={anyChecking}
              className="w-full h-7 gap-1.5 border border-zinc-800 bg-transparent font-mono text-[11px] text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700 disabled:opacity-40"
            >
              {anyChecking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              {anyChecking ? "Checking…" : "Re-check Status"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
