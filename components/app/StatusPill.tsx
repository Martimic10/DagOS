import { cn } from "@/lib/utils";

export type ActivityStatus = "Success" | "Warning" | "Error";
export type ModelStatus = "Running" | "Idle" | "Stopped";

export function ActivityStatusPill({ status }: { status: ActivityStatus }) {
  const styles: Record<ActivityStatus, string> = {
    Success: "border-zinc-700/60 bg-zinc-900/60 text-zinc-400",
    Warning: "border-yellow-900/60 bg-yellow-950/40 text-yellow-600",
    Error: "border-red-900/40 bg-red-950/30 text-red-500",
  };
  const dots: Record<ActivityStatus, string> = {
    Success: "bg-zinc-600",
    Warning: "bg-yellow-600",
    Error: "bg-red-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
        styles[status]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}

export function ModelStatusPill({ status }: { status: ModelStatus }) {
  const styles: Record<ModelStatus, string> = {
    Running: "border-zinc-700 bg-zinc-800/80 text-zinc-300",
    Idle: "border-zinc-800 bg-zinc-900/60 text-zinc-500",
    Stopped: "border-zinc-800/60 bg-zinc-900/40 text-zinc-700",
  };
  const dots: Record<ModelStatus, string> = {
    Running: "bg-emerald-500",
    Idle: "bg-yellow-600",
    Stopped: "bg-zinc-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
        styles[status]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status}
    </span>
  );
}
