import {
  Zap,
  Cpu,
  AlertTriangle,
  MemoryStick,
  Activity,
  MessageSquare,
  Clock,
  Server,
  LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Zap,
  Cpu,
  AlertTriangle,
  MemoryStick,
  Activity,
  MessageSquare,
  Clock,
  Server,
};

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  delta: string;
  deltaPositive: boolean | null;
  icon: string;
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaPositive,
  icon,
}: StatCardProps) {
  const Icon = iconMap[icon] ?? Zap;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5 ring-1 ring-inset ring-white/3 hover:bg-zinc-900/40 transition-colors">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
          {label}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60">
          <Icon className="h-3.5 w-3.5 text-zinc-500" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-bold tracking-tight text-zinc-100">
          {value}
        </span>
        <span className="font-mono text-sm text-zinc-600">{unit}</span>
      </div>

      {/* Delta */}
      <p
        className={cn(
          "font-mono text-xs",
          deltaPositive === true
            ? "text-zinc-400"
            : deltaPositive === false
            ? "text-zinc-500"
            : "text-zinc-600"
        )}
      >
        {deltaPositive === true && (
          <span className="text-emerald-600">↑ </span>
        )}
        {deltaPositive === false && (
          <span className="text-zinc-500">↓ </span>
        )}
        {delta}
      </p>
    </div>
  );
}
