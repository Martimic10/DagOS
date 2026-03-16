"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Play,
  Loader2,
  CheckSquare,
  Square,
  Clock,
  Hash,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProGate } from "@/components/app/ProGate";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OllamaModel {
  name: string;
  size?: number;
}

type ResultStatus = "idle" | "running" | "done" | "error";

interface ModelResult {
  model: string;
  status: ResultStatus;
  response: string | null;
  error: string | null;
  latencyMs: number | null;
  tokenCount: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortName(name: string) {
  return name.split(":")[0];
}

function formatLatency(ms: number | null) {
  if (ms === null) return null;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatSize(bytes?: number) {
  if (!bytes) return null;
  const gb = bytes / 1_073_741_824;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1_048_576).toFixed(0)} MB`;
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: ModelResult }) {
  const isRunning = result.status === "running";
  const isDone    = result.status === "done";
  const isError   = result.status === "error";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-zinc-950/60 transition-colors",
        isDone  ? "border-zinc-700/60"  :
        isError ? "border-red-900/40"   :
        isRunning ? "border-indigo-500/20" :
        "border-zinc-800/60"
      )}
    >
      {/* Card header */}
      <div className={cn(
        "flex items-center justify-between border-b px-4 py-3",
        isDone  ? "border-zinc-800/60 bg-zinc-900/20" :
        isError ? "border-red-900/30 bg-red-950/10"   :
        isRunning ? "border-indigo-900/30 bg-indigo-950/10" :
        "border-zinc-800/40 bg-zinc-900/20"
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          {isRunning ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-400" />
          ) : isError ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400/70" />
          ) : (
            <div className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              isDone ? "bg-emerald-500" : "bg-zinc-700"
            )} />
          )}
          <span className="truncate font-mono text-xs font-semibold text-zinc-200">
            {shortName(result.model)}
          </span>
          <span className="truncate font-mono text-[10px] text-zinc-600">
            {result.model.includes(":") ? result.model.split(":")[1] : "latest"}
          </span>
        </div>

        {/* Metrics */}
        <div className="flex shrink-0 items-center gap-3 ml-2">
          {result.latencyMs !== null && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
              <Clock className="h-3 w-3" />
              {formatLatency(result.latencyMs)}
            </span>
          )}
          {result.tokenCount !== null && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
              <Hash className="h-3 w-3" />
              {result.tokenCount}
            </span>
          )}
        </div>
      </div>

      {/* Response body */}
      <div className="flex-1 px-4 py-4 min-h-[180px]">
        {result.status === "idle" && (
          <p className="font-mono text-xs text-zinc-700">Waiting to run…</p>
        )}
        {result.status === "running" && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500/60" />
            <span className="font-mono text-xs text-zinc-600">Generating…</span>
          </div>
        )}
        {result.status === "error" && (
          <p className="font-mono text-xs text-red-400/80 leading-relaxed">
            {result.error ?? "An error occurred"}
          </p>
        )}
        {result.status === "done" && result.response && (
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
            {result.response}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Playground inner ──────────────────────────────────────────────────────────

function PlaygroundInner() {
  const [models, setModels]           = useState<OllamaModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [prompt, setPrompt]           = useState("");
  const [results, setResults]         = useState<ModelResult[]>([]);
  const [running, setRunning]         = useState(false);

  // Load installed models
  useEffect(() => {
    fetch("/api/ollama/models")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.models)) setModels(d.models);
      })
      .catch(() => {})
      .finally(() => setModelsLoading(false));
  }, []);

  function toggleModel(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const runAll = useCallback(async () => {
    if (!prompt.trim() || selected.size === 0 || running) return;

    const modelList = Array.from(selected);
    setRunning(true);

    // Initialise all result cards
    setResults(
      modelList.map((m) => ({
        model: m, status: "running",
        response: null, error: null,
        latencyMs: null, tokenCount: null,
      }))
    );

    // Run all in parallel, update each card as it completes
    await Promise.allSettled(
      modelList.map(async (model) => {
        const start = Date.now();
        try {
          const res = await fetch("/api/ollama/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: prompt.trim() }],
              temperature: 0.7,
            }),
          });

          const latencyMs = Date.now() - start;
          const data = await res.json();

          if (!res.ok || !data.ok) throw new Error(data.error ?? "Request failed");

          const response: string = data.response ?? data.message?.content ?? "";
          const tokenCount: number | null =
            typeof data.eval_count === "number" ? data.eval_count : null;

          setResults((prev) =>
            prev.map((r) =>
              r.model === model
                ? { ...r, status: "done", response, latencyMs, tokenCount }
                : r
            )
          );
        } catch (err) {
          const latencyMs = Date.now() - start;
          setResults((prev) =>
            prev.map((r) =>
              r.model === model
                ? {
                    ...r, status: "error",
                    error: err instanceof Error ? err.message : "Unknown error",
                    latencyMs,
                  }
                : r
            )
          );
        }
      })
    );

    setRunning(false);
  }, [prompt, selected, running]);

  const colClass =
    results.length >= 3
      ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      : results.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1";

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-indigo-400" />
            <h1 className="font-mono text-xl font-bold text-zinc-100">Model Playground</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              Pro
            </span>
          </div>
          <p className="font-mono text-xs text-zinc-500">
            Run the same prompt across multiple models and compare results side-by-side.
          </p>
        </div>
      </div>

      {/* Model selector */}
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60">
        <div className="border-b border-zinc-800/60 px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Select models to compare
          </p>
        </div>
        <div className="p-5">
          {modelsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
              <span className="font-mono text-xs text-zinc-600">Loading models…</span>
            </div>
          ) : models.length === 0 ? (
            <p className="font-mono text-xs text-zinc-600">
              No models installed. Go to Models to install one first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {models.map((m) => {
                const isSelected = selected.has(m.name);
                const size = formatSize(m.size);
                return (
                  <button
                    key={m.name}
                    onClick={() => toggleModel(m.name)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs transition-all",
                      isSelected
                        ? "border-indigo-500/40 bg-indigo-950/30 text-zinc-200"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    )}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                    ) : (
                      <Square className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {shortName(m.name)}
                    {size && (
                      <span className="text-zinc-700">{size}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prompt input */}
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60">
        <div className="border-b border-zinc-800/60 px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Prompt
          </p>
        </div>
        <div className="p-5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runAll();
            }}
            placeholder="Enter your prompt here… All selected models will receive the same message."
            rows={4}
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus:border-zinc-700 focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-zinc-700">
              {selected.size === 0
                ? "Select at least one model above"
                : `${selected.size} model${selected.size > 1 ? "s" : ""} selected · ⌘↵ to run`}
            </span>
            <Button
              onClick={runAll}
              disabled={!prompt.trim() || selected.size === 0 || running}
              className="h-9 gap-2 border border-zinc-700 bg-zinc-900 font-mono text-sm text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 disabled:pointer-events-none disabled:opacity-40"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {running ? "Running…" : "Run All Models"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results grid */}
      {results.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Results — {results.length} model{results.length > 1 ? "s" : ""}
          </p>
          <div className={cn("grid gap-4", colClass)}>
            {results.map((r) => (
              <ResultCard key={r.model} result={r} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && models.length > 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/50 border-dashed bg-zinc-950/30 py-16 gap-3">
          <FlaskConical className="h-8 w-8 text-zinc-800" />
          <p className="font-mono text-sm text-zinc-700">
            Select models and enter a prompt to begin
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page — gated behind Pro ───────────────────────────────────────────────────

export default function PlaygroundPage() {
  return (
    <ProGate feature="playground">
      <PlaygroundInner />
    </ProGate>
  );
}
