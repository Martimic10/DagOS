import Link from "next/link";
import { ArrowRight, ChevronRight, ShieldCheck, Cpu, Package, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const statCards = [
  {
    icon: ShieldCheck,
    label: "Private by default",
    value: "Local-only",
    helper: "No cloud required",
  },
  {
    icon: Cpu,
    label: "Ollama-ready",
    value: "Local runtime",
    helper: "Native integration",
  },
  {
    icon: Package,
    label: "Model Manager",
    value: "Install + run",
    helper: "One-click deploys",
  },
  {
    icon: Activity,
    label: "System Monitor",
    value: "CPU / RAM / GPU",
    helper: "Real-time telemetry",
  },
];

export function Hero() {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Status pill */}
        <div className="mb-8 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-xs text-zinc-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            System operational · v0.1.0-alpha
          </span>
        </div>

        {/* Headline */}
        <div className="mb-6 max-w-3xl">
          <h1 className="font-mono text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl lg:text-7xl">
            Local AI
            <br />
            <span className="text-zinc-500">Workstation OS</span>
          </h1>
        </div>

        <p className="mb-10 max-w-xl text-base text-zinc-400 leading-relaxed">
          Run models locally. Private by default. Built for speed.
          <br />
          A full command center for your on-device AI infrastructure.
        </p>

        {/* CTA row */}
        <div className="mb-16 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="h-10 gap-2 border border-zinc-700 bg-zinc-900 px-6 text-sm font-medium text-zinc-100 shadow-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all"
            asChild
          >
            <Link href="/app/dashboard">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-10 gap-2 border border-zinc-800 bg-transparent px-6 text-sm font-medium text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 hover:border-zinc-700 transition-all"
            asChild
          >
            <Link href="/docs">
              Quickstart
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4 shadow-sm ring-1 ring-inset ring-white/[0.03] hover:bg-zinc-900/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <p className="font-mono text-sm font-semibold text-zinc-100">
                  {card.value}
                </p>
                <p className="text-xs text-zinc-600">{card.helper}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
