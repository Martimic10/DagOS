import {
  Download,
  MessageSquare,
  Activity,
  FileText,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { features } from "@/app/_data/mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Download,
  MessageSquare,
  Activity,
  FileText,
  ShieldCheck,
  Workflow,
};

export function FeatureBento() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-widest text-zinc-600">
              Features
            </p>
            <h2 className="font-mono text-2xl font-bold text-zinc-100">
              Everything in one place
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-zinc-500 sm:block">
            All the tools you need to manage your local AI stack.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6 shadow-sm ring-1 ring-inset ring-white/[0.03] hover:bg-zinc-900/40 transition-colors"
              >
                {/* Eyebrow + badge row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
                      {feature.eyebrow}
                    </span>
                  </div>
                  {feature.badge && (
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        feature.badgeVariant === "new"
                          ? "border-zinc-600 bg-zinc-800 text-zinc-300"
                          : "border-zinc-700/60 bg-zinc-900/60 text-zinc-500"
                      }`}
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-mono text-base font-semibold text-zinc-100">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-zinc-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
