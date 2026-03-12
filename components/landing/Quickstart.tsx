import { Terminal } from "lucide-react";
import { quickstartSteps } from "@/app/_data/mockData";

export function Quickstart() {
  return (
    <section id="quickstart" className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-zinc-600">
            Get started
          </p>
          <h2 className="font-mono text-2xl font-bold text-zinc-100">
            Quickstart
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/80 shadow-xl ring-1 ring-inset ring-white/[0.03]">
          {/* Terminal top bar */}
          <div className="flex items-center gap-2 border-b border-zinc-800/70 bg-zinc-950 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-zinc-700 hover:bg-red-500/70 transition-colors" />
              <div className="h-3 w-3 rounded-full bg-zinc-700 hover:bg-yellow-500/70 transition-colors" />
              <div className="h-3 w-3 rounded-full bg-zinc-700 hover:bg-green-500/70 transition-colors" />
            </div>
            <div className="flex flex-1 items-center justify-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-zinc-600" />
              <span className="font-mono text-xs text-zinc-600">
                terminal — zsh
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="divide-y divide-zinc-800/60">
            {quickstartSteps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:gap-6"
              >
                {/* Step number */}
                <div className="flex-shrink-0">
                  <span className="font-mono text-xs font-semibold text-zinc-700">
                    {step.step}
                  </span>
                </div>

                {/* Label */}
                <div className="w-36 flex-shrink-0">
                  <span className="font-mono text-xs text-zinc-500">
                    {step.label}
                  </span>
                </div>

                {/* Command block */}
                <div className="flex flex-1 items-baseline gap-3 overflow-x-auto">
                  <span className="flex-shrink-0 font-mono text-xs text-zinc-700">
                    $
                  </span>
                  <code className="font-mono text-sm font-medium text-zinc-200 whitespace-nowrap">
                    {step.command}
                  </code>
                  <span className="font-mono text-xs text-zinc-700 whitespace-nowrap">
                    {step.comment}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt line */}
          <div className="border-t border-zinc-800/70 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-700">$</span>
              <span className="font-mono text-xs text-zinc-600">
                DagOS is ready. Open{" "}
                <span className="text-zinc-400">http://localhost:3000</span> to
                access your dashboard.
              </span>
              <span className="inline-block h-3.5 w-0.5 animate-pulse bg-zinc-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
