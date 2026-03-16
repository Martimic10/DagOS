"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Download,
  Package,
  Zap,
  ChevronDown,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OllamaHealthResponse } from "@/app/api/ollama/health/route";

// ── Types ─────────────────────────────────────────────────────────────────────

type EngineStatus = "idle" | "checking" | "connected" | "disconnected";
type ModelStatus  = "idle" | "checking" | "ready"     | "empty";

const ONBOARDED_KEY = "dagos_onboarded";

// ── Sub-components ────────────────────────────────────────────────────────────

function ConnectionBadge({ status }: { status: EngineStatus }) {
  if (status === "checking")
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking…
      </span>
    );
  if (status === "connected")
    return (
      <span className="inline-flex items-center gap-2 font-mono text-xs text-emerald-500/90">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        AI engine is running
      </span>
    );
  if (status === "disconnected")
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-500/80">
        <AlertCircle className="h-3.5 w-3.5" />
        Not detected — open Ollama and try again
      </span>
    );
  return (
    <span className="font-mono text-xs text-zinc-600">
      Click &ldquo;Check Setup&rdquo; when Ollama is open
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("idle");
  const [modelStatus, setModelStatus]   = useState<ModelStatus>("idle");
  const [installing, setInstalling]     = useState(false);
  const [installProgress, setInstallProgress] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const router = useRouter();

  const runChecks = useCallback(async () => {
    setEngineStatus("checking");
    setModelStatus("checking");

    const [healthData, modelsData] = await Promise.all([
      fetch("/api/ollama/health")
        .then((r) => r.json() as Promise<OllamaHealthResponse>)
        .catch(() => ({ ok: false as const })),
      fetch("/api/ollama/models")
        .then((r) => r.json())
        .catch(() => ({ ok: false, models: [] })),
    ]);

    const connected = healthData.ok === true;
    const hasModels =
      modelsData.ok === true &&
      Array.isArray(modelsData.models) &&
      modelsData.models.length > 0;

    setEngineStatus(connected ? "connected" : "disconnected");
    setModelStatus(hasModels ? "ready" : "empty");
  }, []);

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
          } catch { /* skip */ }
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

  const handleContinue = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    router.push("/app/dashboard");
  }, [router]);

  const engineConnected = engineStatus === "connected";
  const modelReady      = modelStatus  === "ready";
  const allDone         = engineConnected && modelReady;
  const anyChecking     = engineStatus === "checking" || modelStatus === "checking";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">

      {/* ── Page header ── */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
            <Zap className="h-3 w-3 text-zinc-300" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            DagOS · Setup
          </span>
        </div>
        <h1 className="font-mono text-2xl font-bold text-zinc-100">Set Up DagOS</h1>
        <p className="mt-1.5 font-mono text-sm text-zinc-500">
          DagOS runs AI locally on your computer. Follow these steps to get everything ready.
        </p>
      </div>

      {/* ── Steps card ── */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/80 ring-1 ring-inset ring-white/3">

        {/* Step 1 — Install */}
        <div className="border-b border-zinc-800/60 px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors ${
                engineConnected
                  ? "border-emerald-800/50 bg-emerald-950/40 text-emerald-600"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500"
              }`}
            >
              {engineConnected ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : "1"}
            </div>
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-xs font-semibold text-zinc-200">
                Install the AI Engine
              </p>
              <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                DagOS uses Ollama to run AI models privately on your computer. Download and open it
                first. No data leaves your machine.
              </p>
              {!engineConnected && (
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
                    Opens ollama.com in your browser
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2 — Check Connection */}
        <div className="border-b border-zinc-800/60 px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors ${
                engineConnected
                  ? "border-emerald-800/50 bg-emerald-950/40 text-emerald-600"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500"
              }`}
            >
              {engineConnected ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : "2"}
            </div>
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-xs font-semibold text-zinc-200">
                Check Connection
              </p>
              <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                {engineStatus === "disconnected"
                  ? "Ollama doesn't appear to be running. Make sure it's open, then check again."
                  : "Once Ollama is installed and open, click below to verify the connection."}
              </p>

              <div className="flex flex-wrap items-center gap-3">
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
                <ConnectionBadge status={engineStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 — Install Model */}
        <div
          className={`border-b border-zinc-800/60 px-6 py-5 transition-opacity ${
            !engineConnected ? "opacity-40" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors ${
                modelReady
                  ? "border-emerald-800/50 bg-emerald-950/40"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500"
              }`}
            >
              {modelReady ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : "3"}
            </div>
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-xs font-semibold text-zinc-200">
                Install Your First Model
              </p>
              <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                {!engineConnected && engineStatus !== "idle"
                  ? "Connect the AI engine first."
                  : modelReady
                  ? "A model is installed and ready to use."
                  : "We recommend Llama 3 — a powerful, free model that works great for most tasks. About 2 GB."}
              </p>

              {engineConnected && !modelReady && (
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
                </div>
              )}

              {installProgress && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2">
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin text-zinc-600" />
                  <span className="font-mono text-[11px] text-zinc-500">{installProgress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4 — Launch */}
        <div className={`px-6 py-5 transition-opacity ${!allDone ? "opacity-40" : ""}`}>
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors ${
                allDone
                  ? "border-emerald-800/50 bg-emerald-950/40"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500"
              }`}
            >
              {allDone ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : "4"}
            </div>
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-xs font-semibold text-zinc-200">
                Launch Your Workspace
              </p>
              <p className="mb-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                {allDone
                  ? "Everything is ready. Open the chat and start using DagOS."
                  : "Complete the steps above to get started."}
              </p>
              <Button
                size="sm"
                onClick={handleContinue}
                disabled={!allDone}
                className="h-7 gap-1.5 border border-zinc-700 bg-zinc-900 font-mono text-[11px] text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 disabled:pointer-events-none disabled:opacity-30"
              >
                Open Workspace
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Advanced section ── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60">
        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left"
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-zinc-700" />
            <span className="font-mono text-[11px] text-zinc-600">Advanced setup</span>
            <span className="font-mono text-[10px] text-zinc-700">
              — manual terminal commands
            </span>
          </div>
          {advancedOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-700" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
          )}
        </button>

        {advancedOpen && (
          <div className="border-t border-zinc-800/60 px-5 pb-5 pt-4">
            <p className="mb-3 font-mono text-[10px] text-zinc-700">
              If you prefer to set up Ollama manually via the terminal:
            </p>
            <div className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950">
              <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-950 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-zinc-800" />
                  <div className="h-2 w-2 rounded-full bg-zinc-800" />
                  <div className="h-2 w-2 rounded-full bg-zinc-800" />
                </div>
                <span className="font-mono text-[10px] text-zinc-700">terminal</span>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {([
                  { step: "01", label: "Install",       cmd: "brew install ollama",   note: "# macOS — or visit ollama.com" },
                  { step: "02", label: "Start",         cmd: "ollama serve",           note: "# runs the local AI service"  },
                  { step: "03", label: "Get a model",   cmd: "ollama pull llama3.2",   note: "# about 2 GB"                 },
                ] as const).map(({ step, label, cmd, note }) => (
                  <div key={step} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-4 shrink-0 font-mono text-[10px] font-semibold text-zinc-700">
                      {step}
                    </span>
                    <span className="w-20 shrink-0 font-mono text-[10px] text-zinc-600">
                      {label}
                    </span>
                    <span className="font-mono text-xs text-zinc-600 shrink-0">$</span>
                    <code className="flex-1 font-mono text-xs text-zinc-200">{cmd}</code>
                    <span className="hidden font-mono text-[10px] text-zinc-700 sm:block">
                      {note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
