"use client";

import { useState } from "react";
import { Package, CheckCircle2, Loader2, Download } from "lucide-react";
import { DEMO_LIBRARY } from "@/lib/demo-data";

interface CardState {
  installed: boolean;
  installing: boolean;
  progress: number;
}

export default function DemoModelsPage() {
  const [states, setStates] = useState<Record<string, CardState>>(() => {
    const init: Record<string, CardState> = {};
    DEMO_LIBRARY.forEach((m) => {
      init[m.id] = { installed: m.installed, installing: false, progress: 0 };
    });
    return init;
  });

  function install(id: string) {
    setStates((prev) => ({
      ...prev,
      [id]: { installed: false, installing: true, progress: 0 },
    }));

    // Simulate progress over ~2.5 seconds
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        clearInterval(interval);
        setStates((prev) => ({
          ...prev,
          [id]: { installed: true, installing: false, progress: 100 },
        }));
      } else {
        setStates((prev) => ({
          ...prev,
          [id]: { ...prev[id], progress: Math.min(p, 99) },
        }));
      }
    }, 200);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-mono text-xl font-bold text-zinc-100">Model Library</h1>
        <p className="font-mono text-xs text-zinc-600 mt-0.5">
          Demo — installations are simulated
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {DEMO_LIBRARY.map((model) => {
          const state = states[model.id];
          return (
            <div
              key={model.id}
              className="flex flex-col gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 transition-colors hover:bg-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <Package className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-zinc-100">{model.name}</p>
                    <p className="font-mono text-xs text-zinc-600">{model.size} · {model.category}</p>
                  </div>
                </div>
                {state.installed && !state.installing && (
                  <span className="inline-flex items-center gap-1.5 rounded border border-emerald-800/40 bg-emerald-950/30 px-2 py-0.5 font-mono text-[10px] text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Installed
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-500 leading-relaxed">{model.description}</p>

              {/* Progress bar while installing */}
              {state.installing && (
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-400 transition-all duration-200"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-600">Downloading model…</span>
                    <span className="font-mono text-[10px] text-zinc-600">{Math.round(state.progress)}%</span>
                  </div>
                </div>
              )}

              {/* Button */}
              {!state.installing && (
                <button
                  onClick={() => !state.installed && install(model.id)}
                  disabled={state.installed}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2 font-mono text-xs transition-all ${
                    state.installed
                      ? "border-zinc-800/40 bg-zinc-900/30 text-zinc-600 cursor-default"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100"
                  }`}
                >
                  {state.installing ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Installing…</>
                  ) : state.installed ? (
                    <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Installed</>
                  ) : (
                    <><Download className="h-3.5 w-3.5" /> Install Model</>
                  )}
                </button>
              )}

              {state.installing && (
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800/40 bg-zinc-900/30 py-2 font-mono text-xs text-zinc-600 cursor-default"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Installing…
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
