"use client";

import { useEffect, useState, useCallback } from "react";

interface SystemStats {
  cpu: number;
  memUsedGB: number;
  memTotalGB: number;
  memPercent: number;
}

interface StatusData {
  online: boolean | null;
  modelCount: number;
  stats: SystemStats | null;
  time: string;
}

function clock(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

function StatusDot({ online }: { online: boolean | null }) {
  if (online === null) {
    return <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-pulse" />;
  }
  if (online) {
    return (
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
    );
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-red-500/70" />;
}

// ─── Separator ────────────────────────────────────────────────────────────────

function Sep() {
  return <span className="text-zinc-800 select-none">·</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SystemStatusBar() {
  const [data, setData] = useState<StatusData>({
    online: null,
    modelCount: 0,
    stats: null,
    time: clock(),
  });

  const fetchData = useCallback(async () => {
    const [healthRes, modelsRes, statsRes] = await Promise.all([
      fetch("/api/ollama/health").then((r) => r.json()).catch(() => ({ ok: false })),
      fetch("/api/ollama/models").then((r) => r.json()).catch(() => ({ ok: false, models: [] })),
      fetch("/api/system/stats").then((r) => r.json()).catch(() => null),
    ]);

    setData({
      online: healthRes.ok === true,
      modelCount: modelsRes.ok ? (modelsRes.models?.length ?? 0) : 0,
      stats: statsRes?.ok ? statsRes : null,
      time: clock(),
    });
  }, []);

  // Initial fetch + 8s polling for system stats / runtime
  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 8000);
    return () => clearInterval(poll);
  }, [fetchData]);

  // Clock ticks every second independently
  useEffect(() => {
    const tick = setInterval(() => {
      setData((prev) => ({ ...prev, time: clock() }));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const { online, modelCount, stats, time } = data;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-8 items-center border-b border-zinc-800/80 bg-zinc-950 px-4">
      {/* Left — brand */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] font-semibold text-zinc-400">DagOS</span>
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-zinc-600">
          local ai
        </span>
      </div>

      {/* Center — status items */}
      <div className="mx-auto flex items-center gap-3">
        {/* Runtime */}
        <div className="flex items-center gap-1.5">
          <StatusDot online={online} />
          <span className={`font-mono text-[11px] ${online ? "text-zinc-400" : online === false ? "text-red-500/70" : "text-zinc-600"}`}>
            {online === null ? "Connecting…" : online ? "Runtime Online" : "Runtime Offline"}
          </span>
        </div>

        <Sep />

        {/* Models */}
        <span className="font-mono text-[11px] text-zinc-500">
          Models:{" "}
          <span className="text-zinc-400">{modelCount}</span>
        </span>

        <Sep />

        {/* Ollama */}
        <div className="flex items-center gap-1.5">
          <span className={`font-mono text-[11px] ${online ? "text-zinc-500" : "text-zinc-700"}`}>
            {online ? "Ollama Connected" : "Ollama Offline"}
          </span>
        </div>
      </div>

      {/* Right — system stats + clock */}
      <div className="ml-auto flex items-center gap-3">
        {stats && (
          <>
            <span className="font-mono text-[11px] text-zinc-600">
              CPU{" "}
              <span className={`${stats.cpu > 80 ? "text-amber-500/80" : "text-zinc-400"}`}>
                {stats.cpu}%
              </span>
            </span>
            <Sep />
            <span className="font-mono text-[11px] text-zinc-600">
              RAM{" "}
              <span className={`${stats.memPercent > 85 ? "text-amber-500/80" : "text-zinc-400"}`}>
                {stats.memUsedGB} GB
              </span>
            </span>
            <Sep />
          </>
        )}
        <span className="font-mono text-[11px] tabular-nums text-zinc-600">{time}</span>
      </div>
    </div>
  );
}
