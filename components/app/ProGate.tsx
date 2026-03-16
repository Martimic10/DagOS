"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { PricingModal } from "@/components/app/PricingModal";

// ── Feature config ─────────────────────────────────────────────────────────────

const FEATURES = {
  playground: {
    title: "Model Playground",
    description:
      "Run the same prompt across multiple models simultaneously and compare results side-by-side.",
  },
} as const;

type ProFeature = keyof typeof FEATURES;

// ── ProGate ───────────────────────────────────────────────────────────────────

export function ProGate({
  feature,
  children,
}: {
  feature: ProFeature;
  children: React.ReactNode;
}) {
  const { isPro, loading } = usePlan();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (isPro) return <>{children}</>;

  const config = FEATURES[feature];

  return (
    <>
      {/* Blurred preview of the locked content */}
      <div className="relative select-none">
        <div className="pointer-events-none blur-sm brightness-50 saturate-50">
          {children}
        </div>

        {/* Lock overlay — clicking opens the modal */}
        <button
          onClick={() => setModalOpen(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl focus:outline-none"
        >
          {/* Lock badge */}
          <div className="relative flex flex-col items-center gap-3">
            {/* Glow */}
            <div className="absolute -inset-8 rounded-full bg-indigo-600/10 blur-2xl" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-950/70 shadow-xl shadow-indigo-950/50 transition-all group-hover:border-indigo-400/50 group-hover:bg-indigo-950/90 group-hover:shadow-indigo-900/60">
              <Lock className="h-6 w-6 text-indigo-300 transition-transform group-hover:scale-110" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-sm font-semibold text-zinc-100">
                {config.title}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                Pro Feature
              </span>
            </div>

            <p className="max-w-xs text-center font-mono text-xs text-zinc-500">
              {config.description}
            </p>

            <div className="mt-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-1.5 font-mono text-xs text-zinc-400 transition-all group-hover:border-indigo-500/40 group-hover:bg-indigo-950/60 group-hover:text-indigo-300">
              Click to unlock →
            </div>
          </div>
        </button>
      </div>

      <PricingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        featureName={config.title}
      />
    </>
  );
}
