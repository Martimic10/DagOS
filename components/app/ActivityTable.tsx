"use client";

import { useState } from "react";
import {
  MessageSquare,
  Download,
  Play,
  Trash2,
  FileText,
  Zap,
  Search,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ActivityStatusPill } from "@/components/app/StatusPill";
import type { ActivityEvent, ActivityAction } from "@/lib/activity-log";

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  ActivityAction,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  chat_request:  { label: "Chat",           icon: MessageSquare, color: "text-indigo-400",  bg: "bg-indigo-950/40",  border: "border-indigo-900/60"  },
  model_install: { label: "Model Install",  icon: Download,      color: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-900/60" },
  model_run:     { label: "Model Run",      icon: Play,          color: "text-sky-400",     bg: "bg-sky-950/40",     border: "border-sky-900/60"     },
  model_delete:  { label: "Model Removed",  icon: Trash2,        color: "text-red-400",     bg: "bg-red-950/30",     border: "border-red-900/50"     },
  file_analyze:  { label: "File Analyzed",  icon: FileText,      color: "text-amber-400",   bg: "bg-amber-950/30",   border: "border-amber-900/50"   },
  runtime_start: { label: "Runtime Start",  icon: Zap,           color: "text-violet-400",  bg: "bg-violet-950/30",  border: "border-violet-900/50"  },
};

const FALLBACK_CONFIG = {
  label: "Event",
  icon: Activity,
  color: "text-zinc-400",
  bg: "bg-zinc-900/40",
  border: "border-zinc-800/60",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5)  return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function buildMessage(event: ActivityEvent): string {
  const model = event.model ? ` · ${event.model}` : "";
  switch (event.action) {
    case "chat_request":  return `Chat request sent${model}`;
    case "model_install": return `Installed ${event.model ?? "model"}`;
    case "model_run":     return `Loaded ${event.model ?? "model"} into memory`;
    case "model_delete":  return `Removed ${event.model ?? "model"}`;
    case "file_analyze":  return `File analyzed${model}`;
    case "runtime_start": return "Ollama runtime detected";
    default:              return `${event.action}${model}`;
  }
}

// ─── Feed item ────────────────────────────────────────────────────────────────

function FeedItem({ event, index }: { event: ActivityEvent; index: number }) {
  const cfg = ACTION_CONFIG[event.action] ?? FALLBACK_CONFIG;
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/20 px-4 py-2.5 transition-colors hover:bg-zinc-900/50 animate-in fade-in-0 slide-in-from-top-2"
      style={{ animationDuration: "250ms", animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: "both" }}
    >
      {/* Icon bubble */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${cfg.bg} ${cfg.border}`}>
        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
      </div>

      {/* Message */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs text-zinc-300">{buildMessage(event)}</p>
        <p className="font-mono text-[10px] text-zinc-600">{timeAgo(event.timestamp)}</p>
      </div>

      {/* Status */}
      <ActivityStatusPill status={event.status === "success" ? "Success" : "Error"} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ActivityTableProps {
  rows?: ActivityEvent[];
}

const PAGE_SIZE = 12;

export function ActivityTable({ rows = [] }: ActivityTableProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll]  = useState(false);

  const filtered = rows.filter((row) => {
    const q = search.toLowerCase();
    return (
      (row.model ?? "").toLowerCase().includes(q) ||
      row.action.toLowerCase().includes(q) ||
      row.route.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    );
  });

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3.5">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Recent Activity
          </p>
          <p className="font-mono text-[10px] text-zinc-700">
            {rows.length > 0
              ? `${rows.length} event${rows.length !== 1 ? "s" : ""} logged`
              : "No activity yet"}
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 w-44 border-zinc-800 bg-zinc-900/60 pl-7 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-2 p-4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Activity className="h-6 w-6 text-zinc-700" />
            <p className="font-mono text-xs text-zinc-600">No activity yet.</p>
            <p className="font-mono text-[10px] text-zinc-700">
              Chat requests and model actions will appear here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-zinc-600">
            No results match &ldquo;{search}&rdquo;
          </div>
        ) : (
          <>
            {visible.map((event, i) => (
              <FeedItem key={event.id} event={event} index={i} />
            ))}
            {filtered.length > PAGE_SIZE && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-1 w-full rounded-lg border border-zinc-800/50 py-2 font-mono text-[11px] text-zinc-600 transition-colors hover:border-zinc-700 hover:text-zinc-400"
              >
                Show {filtered.length - PAGE_SIZE} more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
