"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityStatusPill } from "@/components/app/StatusPill";
import type { ActivityEvent } from "@/lib/activity-log";

const ACTION_LABELS: Record<string, string> = {
  chat_request:   "Chat",
  model_run:      "Run",
  model_delete:   "Delete",
  model_install:  "Install",
};

const ROUTE_LABELS: Record<string, string> = {
  chat:      "/app/chat",
  models:    "/app/models",
  dashboard: "/app/dashboard",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatLatency(ms?: number): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface ActivityTableProps {
  rows?: ActivityEvent[];
}

export function ActivityTable({ rows = [] }: ActivityTableProps) {
  const [search, setSearch] = useState("");

  const filtered = rows.filter((row) => {
    const q = search.toLowerCase();
    return (
      (row.model ?? "").toLowerCase().includes(q) ||
      row.action.toLowerCase().includes(q) ||
      row.route.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/3 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3.5">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Recent Activity
          </p>
          <p className="font-mono text-[10px] text-zinc-700">
            {rows.length > 0 ? `${rows.length} event${rows.length !== 1 ? "s" : ""} logged` : "No activity yet"}
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 w-44 border-zinc-800 bg-zinc-900/60 pl-7 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="font-mono text-xs text-zinc-600">No activity yet.</p>
          <p className="font-mono text-[10px] text-zinc-700">
            Chat requests and model actions will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/60 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Time</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Action</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Model</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Route</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Latency</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase tracking-wider text-zinc-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center font-mono text-xs text-zinc-600">
                    No results match "{search}"
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-zinc-800/40 hover:bg-zinc-900/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {formatTime(row.timestamp)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-300">
                      {ACTION_LABELS[row.action] ?? row.action}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {row.model ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {ROUTE_LABELS[row.route] ?? row.route}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {formatLatency(row.latencyMs)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ActivityStatusPill
                        status={row.status === "success" ? "Success" : "Error"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
