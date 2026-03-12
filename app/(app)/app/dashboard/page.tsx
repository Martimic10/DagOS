"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuntimePill } from "@/components/app/RuntimePill";
import { StatCard } from "@/components/app/StatCard";
import { BentoCard } from "@/components/app/BentoCard";
import { MonoBarChart } from "@/components/app/charts/MonoBarChart";
import { MonoHBarChart } from "@/components/app/charts/MonoHBarChart";
import { ActivityTable } from "@/components/app/ActivityTable";
import { loadActivityLog, type ActivityEvent } from "@/lib/activity-log";
import type { OllamaModel } from "@/app/api/ollama/models/route";
import type { RunningModel } from "@/app/api/ollama/running/route";

// ── Time-range helpers ────────────────────────────────────────────────────────

type Range = "1h" | "6h" | "24h" | "7d" | "30d";

const RANGE_MS: Record<Range, number> = {
  "1h":  1 * 60 * 60 * 1000,
  "6h":  6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d":  7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const RANGE_LABEL: Record<Range, string> = {
  "1h":  "last 1 hour",
  "6h":  "last 6 hours",
  "24h": "last 24 hours",
  "7d":  "last 7 days",
  "30d": "last 30 days",
};

interface Bucket { hour: string; value: number; [key: string]: string | number }

function groupIntoBuckets(events: ActivityEvent[], range: Range, now: Date): Bucket[] {
  const ms = RANGE_MS[range];
  const cutoff = new Date(now.getTime() - ms);
  const inWindow = events.filter((e) => new Date(e.timestamp) >= cutoff);

  if (range === "1h") {
    // 12 × 5-min buckets
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(now.getTime() - (12 - i) * 5 * 60_000);
      const end   = new Date(now.getTime() - (11 - i) * 5 * 60_000);
      const label = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
      return { hour: label, value: inWindow.filter((e) => { const t = new Date(e.timestamp); return t >= start && t < end; }).length };
    });
  }

  if (range === "6h") {
    // 12 × 30-min buckets
    return Array.from({ length: 12 }, (_, i) => {
      const start = new Date(now.getTime() - (12 - i) * 30 * 60_000);
      const end   = new Date(now.getTime() - (11 - i) * 30 * 60_000);
      const label = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
      return { hour: label, value: inWindow.filter((e) => { const t = new Date(e.timestamp); return t >= start && t < end; }).length };
    });
  }

  if (range === "24h") {
    // 24 × 1-hour buckets
    return Array.from({ length: 24 }, (_, i) => {
      const start = new Date(now.getTime() - (24 - i) * 3_600_000);
      const end   = new Date(now.getTime() - (23 - i) * 3_600_000);
      const label = `${String(start.getHours()).padStart(2, "0")}:00`;
      return { hour: label, value: inWindow.filter((e) => { const t = new Date(e.timestamp); return t >= start && t < end; }).length };
    });
  }

  if (range === "7d") {
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 7 }, (_, i) => {
      const start = new Date(now.getTime() - (7 - i) * 86_400_000);
      const end   = new Date(now.getTime() - (6 - i) * 86_400_000);
      const label = DAY_NAMES[start.getDay()];
      return { hour: label, value: inWindow.filter((e) => { const t = new Date(e.timestamp); return t >= start && t < end; }).length };
    });
  }

  // 30d: 4 × weekly buckets
  return Array.from({ length: 4 }, (_, i) => {
    const start = new Date(now.getTime() - (4 - i) * 7 * 86_400_000);
    const end   = new Date(now.getTime() - (3 - i) * 7 * 86_400_000);
    return { hour: `Wk ${i + 1}`, value: inWindow.filter((e) => { const t = new Date(e.timestamp); return t >= start && t < end; }).length };
  });
}

function bytesToGB(bytes: number): string {
  return (bytes / 1_073_741_824).toFixed(1) + " GB";
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const range  = (searchParams.get("range")  ?? "24h") as Range;
  const status = searchParams.get("status") ?? "all";

  const [online, setOnline]         = useState<boolean | null>(null);
  const [models, setModels]         = useState<OllamaModel[]>([]);
  const [runningModels, setRunningModels] = useState<RunningModel[]>([]);
  const [activity, setActivity]     = useState<ActivityEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const [healthRes, modelsRes, runningRes] = await Promise.all([
      fetch("/api/ollama/health").then((r) => r.json()).catch(() => ({ ok: false })),
      fetch("/api/ollama/models").then((r) => r.json()).catch(() => ({ ok: false, models: [] })),
      fetch("/api/ollama/running").then((r) => r.json()).catch(() => ({ ok: false, models: [] })),
    ]);
    setOnline(healthRes.ok === true);
    if (modelsRes.ok) setModels(modelsRes.models);
    if (runningRes.ok) setRunningModels(runningRes.models);
    setActivity(loadActivityLog());
    setLastUpdated(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const now = useMemo(() => new Date(), [lastUpdated]); // eslint-disable-line react-hooks/exhaustive-deps

  const windowMs = RANGE_MS[range];
  const cutoff   = new Date(now.getTime() - windowMs);

  const windowActivity = useMemo(
    () => activity.filter((e) => new Date(e.timestamp) >= cutoff),
    [activity, cutoff.getTime()] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const chatRequests = useMemo(
    () => windowActivity.filter((e) => e.action === "chat_request"),
    [windowActivity]
  );

  const avgLatency = useMemo(() => {
    const ok = chatRequests.filter((e) => e.status === "success" && e.latencyMs != null);
    if (ok.length === 0) return null;
    return Math.round(ok.reduce((s, e) => s + (e.latencyMs ?? 0), 0) / ok.length);
  }, [chatRequests]);

  const requestsChart = useMemo(
    () => groupIntoBuckets(chatRequests, range, now),
    [chatRequests, range, now]
  );

  const modelUsageData = useMemo(() => {
    const counts: Record<string, number> = {};
    windowActivity
      .filter((e) => e.action === "chat_request" && e.model)
      .forEach((e) => { counts[e.model!] = (counts[e.model!] ?? 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [windowActivity]);

  const successCount = chatRequests.filter((e) => e.status === "success").length;
  const errorCount   = chatRequests.filter((e) => e.status === "error").length;

  const successErrorChart = useMemo(() => [
    { hour: "Success", value: successCount },
    { hour: "Errors",  value: errorCount  },
  ], [successCount, errorCount]);

  // Filter models by status param using Ollama /api/ps running list
  const runningNames = new Set(runningModels.map((m) => m.name));
  const filteredModels = status === "running"
    ? models.filter((m) => runningNames.has(m.name))
    : status === "idle"
    ? models.filter((m) => !runningNames.has(m.name))
    : models;

  const recentActivity = useMemo(() => activity.slice(0, 100), [activity]);

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Runtime",
      value: online === null ? "…" : online ? "Online" : "Offline",
      unit: "",
      delta: online === null ? "checking…" : online ? "Ollama responding" : "Cannot reach Ollama",
      deltaPositive: online === true ? true : online === false ? false : null,
      icon: "Activity",
    },
    {
      label: "Installed Models",
      value: String(models.length),
      unit: models.length === 1 ? "model" : "models",
      delta: models.length === 0 ? "none yet — pull a model" : `via localhost:11434`,
      deltaPositive: models.length > 0 ? true : null,
      icon: "Cpu",
    },
    {
      label: "Requests",
      value: String(chatRequests.length),
      unit: RANGE_LABEL[range],
      delta: chatRequests.length === 0 ? "no activity yet" : `${successCount} ok · ${errorCount} err`,
      deltaPositive: chatRequests.length > 0 ? true : null,
      icon: "MessageSquare",
    },
    {
      label: "Avg Latency",
      value: avgLatency != null ? String(avgLatency) : "—",
      unit: avgLatency != null ? "ms" : "",
      delta: avgLatency != null ? `from ${successCount} successful request${successCount !== 1 ? "s" : ""}` : "no successful requests yet",
      deltaPositive: avgLatency != null ? null : null,
      icon: "Clock",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold text-zinc-100">Dashboard</h1>
          <p className="font-mono text-xs text-zinc-600 flex items-center gap-2">
            {lastUpdated
              ? `Updated · ${lastUpdated.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Loading…"}
            {range !== "24h" && (
              <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {range.toUpperCase()}
              </span>
            )}
            {status !== "all" && (
              <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {status}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RuntimePill />
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="h-8 gap-1.5 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Top bento row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* 1. Requests over time */}
        <BentoCard
          title="Requests"
          subtitle={`chat requests · ${RANGE_LABEL[range]}`}
          headerRight={
            <span className="font-mono text-[10px] text-zinc-700">
              {chatRequests.length} total
            </span>
          }
        >
          {chatRequests.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="font-mono text-xs text-zinc-700">No requests yet.</p>
            </div>
          ) : (
            <MonoBarChart data={requestsChart} xKey="hour" yKey="value" height={160} tickFormat="raw" />
          )}
        </BentoCard>

        {/* 2. Installed Models list */}
        <BentoCard
          title="Installed Models"
          subtitle="sourced from Ollama"
          headerRight={
            <span className="font-mono text-[10px] text-zinc-500">
              {models.length} total
            </span>
          }
        >
          <div className="flex flex-col gap-1.5">
            {filteredModels.length === 0 ? (
              <p className="py-6 text-center font-mono text-xs text-zinc-700">
                {models.length === 0
                  ? "No models installed."
                  : status === "running"
                  ? "No models currently running."
                  : "No idle models."}
              </p>
            ) : (
              filteredModels.slice(0, 6).map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 hover:bg-zinc-900/60 transition-colors"
                >
                  <div>
                    <p className="font-mono text-xs font-medium text-zinc-300">{model.name}</p>
                    <p className="font-mono text-[10px] text-zinc-700">
                      {bytesToGB(model.size)} · {formatDate(model.modified_at)}
                    </p>
                  </div>
                  {runningNames.has(model.name) ? (
                    <span className="inline-flex items-center gap-1.5 rounded border border-zinc-700/60 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse" />
                      Running
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      Idle
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </BentoCard>

        {/* 3. Model Usage */}
        <BentoCard
          title="Model Usage"
          subtitle={`requests by model · ${RANGE_LABEL[range]}`}
          headerRight={
            <span className="font-mono text-[10px] text-zinc-700">
              {modelUsageData.length} model{modelUsageData.length !== 1 ? "s" : ""}
            </span>
          }
        >
          {modelUsageData.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="font-mono text-xs text-zinc-700">No model usage yet.</p>
            </div>
          ) : (
            <MonoHBarChart data={modelUsageData} height={160} />
          )}
        </BentoCard>
      </div>

      {/* Bottom bento row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* 4. Success vs Errors chart */}
        <BentoCard
          title="Success vs Errors"
          subtitle={`outcome breakdown · ${RANGE_LABEL[range]}`}
          headerRight={
            <span className="font-mono text-[10px] text-zinc-700">
              {chatRequests.length > 0
                ? `${Math.round((successCount / chatRequests.length) * 100)}% success`
                : "no data"}
            </span>
          }
        >
          {chatRequests.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="font-mono text-xs text-zinc-700">No requests yet.</p>
            </div>
          ) : (
            <>
              <MonoBarChart data={successErrorChart} xKey="hour" yKey="value" height={160} tickFormat="raw" />
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-800/60 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Success</span>
                  <span className="font-mono text-2xl font-bold text-zinc-200">{successCount}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Errors</span>
                  <span className="font-mono text-2xl font-bold text-zinc-200">{errorCount}</span>
                </div>
              </div>
            </>
          )}
        </BentoCard>

        {/* 5. Avg response length */}
        <BentoCard
          title="Response Stats"
          subtitle={`token sizes · ${RANGE_LABEL[range]}`}
        >
          {chatRequests.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="font-mono text-xs text-zinc-700">No requests yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Avg Prompt Length",
                  value: (() => {
                    const ok = chatRequests.filter((e) => e.promptLength != null);
                    if (!ok.length) return "—";
                    return Math.round(ok.reduce((s, e) => s + (e.promptLength ?? 0), 0) / ok.length) + " chars";
                  })(),
                },
                {
                  label: "Avg Response Length",
                  value: (() => {
                    const ok = chatRequests.filter((e) => e.responseLength != null);
                    if (!ok.length) return "—";
                    return Math.round(ok.reduce((s, e) => s + (e.responseLength ?? 0), 0) / ok.length) + " chars";
                  })(),
                },
                {
                  label: "Avg Latency",
                  value: avgLatency != null ? `${avgLatency}ms` : "—",
                },
                {
                  label: "Total Requests",
                  value: String(chatRequests.length),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5">
                  <span className="font-mono text-[11px] text-zinc-500">{label}</span>
                  <span className="font-mono text-sm font-medium text-zinc-300">{value}</span>
                </div>
              ))}
            </div>
          )}
        </BentoCard>
      </div>

      {/* Activity table */}
      <ActivityTable rows={recentActivity} />
    </div>
  );
}
