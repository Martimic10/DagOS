"use client";

import {
  DEMO_MODELS,
  DEMO_RUNNING_MODELS,
  DEMO_REQUESTS_CHART,
  DEMO_MODEL_USAGE,
  DEMO_SUCCESS_ERROR,
  DEMO_RESPONSE_STATS,
  DEMO_ACTIVITY,
} from "@/lib/demo-data";
import { StatCard } from "@/components/app/StatCard";
import { BentoCard } from "@/components/app/BentoCard";
import { MonoBarChart } from "@/components/app/charts/MonoBarChart";
import { MonoHBarChart } from "@/components/app/charts/MonoHBarChart";
import { ActivityTable } from "@/components/app/ActivityTable";

function bytesToGB(bytes: number) {
  return (bytes / 1_073_741_824).toFixed(1) + " GB";
}

const runningNames = new Set(DEMO_RUNNING_MODELS.map((m) => m.name));

const statCards = [
  {
    label: "Runtime",
    value: "Online",
    unit: "",
    delta: "Ollama responding",
    deltaPositive: true,
    icon: "Activity",
  },
  {
    label: "Installed Models",
    value: String(DEMO_MODELS.length),
    unit: "models",
    delta: "via localhost:11434",
    deltaPositive: true,
    icon: "Cpu",
  },
  {
    label: "Requests",
    value: "244",
    unit: "last 24 hours",
    delta: "238 ok · 6 err",
    deltaPositive: true,
    icon: "MessageSquare",
  },
  {
    label: "Avg Latency",
    value: "312",
    unit: "ms",
    delta: "from 238 successful requests",
    deltaPositive: null,
    icon: "Clock",
  },
];

export default function DemoDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold text-zinc-100">Dashboard</h1>
          <p className="font-mono text-xs text-zinc-600">
            Updated · {new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            <span className="ml-2 rounded border border-amber-800/50 bg-amber-950/30 px-1.5 py-0.5 text-amber-600">
              demo data
            </span>
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Top bento row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <BentoCard
          title="Requests"
          subtitle="chat requests · last 24 hours"
          headerRight={<span className="font-mono text-[10px] text-zinc-700">244 total</span>}
        >
          <MonoBarChart data={DEMO_REQUESTS_CHART} xKey="hour" yKey="value" height={160} tickFormat="raw" />
        </BentoCard>

        <BentoCard
          title="Installed Models"
          subtitle="sourced from Ollama"
          headerRight={<span className="font-mono text-[10px] text-zinc-500">{DEMO_MODELS.length} total</span>}
        >
          <div className="flex flex-col gap-1.5">
            {DEMO_MODELS.map((model) => (
              <div
                key={model.name}
                className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 hover:bg-zinc-900/60 transition-colors"
              >
                <div>
                  <p className="font-mono text-xs font-medium text-zinc-300">{model.name}</p>
                  <p className="font-mono text-[10px] text-zinc-700">{bytesToGB(model.size)}</p>
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
            ))}
          </div>
        </BentoCard>

        <BentoCard
          title="Model Usage"
          subtitle="requests by model · last 24 hours"
          headerRight={<span className="font-mono text-[10px] text-zinc-700">3 models</span>}
        >
          <MonoHBarChart data={DEMO_MODEL_USAGE} height={160} />
        </BentoCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BentoCard
          title="Success vs Errors"
          subtitle="outcome breakdown · last 24 hours"
          headerRight={<span className="font-mono text-[10px] text-zinc-700">97% success</span>}
        >
          <MonoBarChart data={DEMO_SUCCESS_ERROR} xKey="hour" yKey="value" height={160} tickFormat="raw" />
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-800/60 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Success</span>
              <span className="font-mono text-2xl font-bold text-zinc-200">238</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Errors</span>
              <span className="font-mono text-2xl font-bold text-zinc-200">6</span>
            </div>
          </div>
        </BentoCard>

        <BentoCard title="Response Stats" subtitle="token sizes · last 24 hours">
          <div className="flex flex-col gap-4">
            {DEMO_RESPONSE_STATS.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5">
                <span className="font-mono text-[11px] text-zinc-500">{label}</span>
                <span className="font-mono text-sm font-medium text-zinc-300">{value}</span>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* Activity */}
      <ActivityTable rows={DEMO_ACTIVITY as Parameters<typeof ActivityTable>[0]["rows"]} />
    </div>
  );
}
