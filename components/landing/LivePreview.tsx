"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { tokenChartData, runningModels, recentRequests, ModelStatus, RequestStatus } from "@/app/_data/mockData";

function ModelStatusPill({ status }: { status: ModelStatus }) {
  const styles: Record<ModelStatus, string> = {
    Running:
      "border-zinc-700 bg-zinc-800/80 text-zinc-300",
    Stopped:
      "border-zinc-800 bg-zinc-900/60 text-zinc-600",
    Downloading:
      "border-zinc-700 bg-zinc-800/60 text-zinc-400",
  };
  const dots: Record<ModelStatus, string> = {
    Running: "bg-emerald-500",
    Stopped: "bg-zinc-700",
    Downloading: "bg-yellow-500 animate-pulse",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function RequestStatusPill({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    "200 OK": "border-zinc-700 bg-zinc-800/80 text-zinc-300",
    "201 OK": "border-zinc-700 bg-zinc-800/80 text-zinc-300",
    "429 Rate": "border-zinc-700 bg-zinc-800/60 text-yellow-500",
    "500 Error": "border-zinc-700/60 bg-zinc-900/60 text-red-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function LivePreview() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-zinc-600">
            Dashboard
          </p>
          <h2 className="font-mono text-2xl font-bold text-zinc-100">
            Live Preview
          </h2>
        </div>

        {/* Main preview card */}
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 shadow-xl ring-1 ring-inset ring-white/3 overflow-hidden">
          {/* Card top bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
            </div>
            <span className="font-mono text-xs text-zinc-600">
              dagosd · localhost:3000
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-zinc-500">live</span>
            </div>
          </div>

          {/* Two-column widget area */}
          <div className="grid grid-cols-1 gap-0 divide-y divide-zinc-800/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* LEFT: Running models */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Running Models
                </span>
                <span className="font-mono text-xs text-zinc-600">
                  {runningModels.filter((m) => m.status === "Running").length} active
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {runningModels.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5 hover:bg-zinc-900/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-mono text-xs font-medium text-zinc-200">
                          {model.name}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-600">
                          {model.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {model.tokens && (
                        <span className="font-mono text-[10px] text-zinc-500">
                          {model.tokens}
                        </span>
                      )}
                      <ModelStatusPill status={model.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Token chart */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Tokens / sec (24h)
                </span>
                <span className="font-mono text-xs text-zinc-600">
                  peak 6.2k · avg 3.1k
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tokenChartData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#27272a"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
                      tickLine={false}
                      axisLine={false}
                      interval={5}
                    />
                    <YAxis
                      tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        color: "#e4e4e7",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      formatter={(value) => [
                        `${Number(value).toLocaleString()} t/s`,
                        "Tokens",
                      ]}
                    />
                    <Bar
                      dataKey="tokens"
                      fill="#3f3f46"
                      radius={[3, 3, 0, 0]}
                      activeBar={{ fill: "#a1a1aa" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent requests table */}
          <div className="border-t border-zinc-800/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Recent Requests
              </span>
              <span className="font-mono text-xs text-zinc-600">
                last 60 seconds
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      Time
                    </th>
                    <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      Model
                    </th>
                    <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      Route
                    </th>
                    <th className="pb-2 text-right font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {recentRequests.map((req, i) => (
                    <tr
                      key={i}
                      className="hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="py-2 pr-4 font-mono text-xs text-zinc-500">
                        {req.time}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-zinc-300">
                        {req.model}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-zinc-500">
                        {req.route}
                      </td>
                      <td className="py-2 text-right">
                        <RequestStatusPill status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
