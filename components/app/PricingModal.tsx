"use client";

import { useState } from "react";
import { X, Check, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Dialog as RadixDialog } from "radix-ui";

// ── Plan data ─────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  "Local AI dashboard",
  "Ollama model management",
  "System resource monitoring",
  "Unlimited chat sessions",
  "Community support",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Model Playground (compare models)",
  "Priority model downloads",
  "Advanced analytics",
  "Early access to new features",
  "Priority support",
];

// ── Modal ─────────────────────────────────────────────────────────────────────

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export function PricingModal({ open, onOpenChange, featureName }: PricingModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (!url) { setLoading(false); return; }

      // In Electron, open Stripe in the system browser via setWindowOpenHandler.
      // In the browser, navigate the current tab (standard Stripe checkout flow).
      if (window.dagosDesktop?.isDesktop) {
        window.open(url, "_blank");
        setLoading(false);
      } else {
        window.location.href = url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {/* Visually hidden title for screen reader accessibility */}
          <RadixDialog.Title className="sr-only">
            Upgrade to DagOS Pro
          </RadixDialog.Title>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0a0a0f] shadow-2xl shadow-black/60">

            {/* Indigo glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-50 w-125 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,transparent_70%)]" />

            {/* Corner accents */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-0 h-20 w-px bg-linear-to-b from-indigo-500/40 to-transparent" />
              <div className="absolute top-0 left-0 h-px w-20 bg-linear-to-r from-indigo-500/40 to-transparent" />
              <div className="absolute top-0 right-0 h-20 w-px bg-linear-to-b from-indigo-500/40 to-transparent" />
              <div className="absolute top-0 right-0 h-px w-20 bg-linear-to-l from-indigo-500/40 to-transparent" />
            </div>

            {/* Header */}
            <div className="relative flex items-start justify-between border-b border-zinc-800/60 px-6 py-5">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-400" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    Pro Required
                  </span>
                </div>
                <p className="font-mono text-base font-bold text-zinc-100">
                  {featureName
                    ? `${featureName} is a Pro feature`
                    : "Upgrade to DagOS Pro"}
                </p>
                <p className="mt-0.5 font-mono text-xs text-zinc-500">
                  Unlock all Pro features with a single upgrade.
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Plans */}
            <div className="relative grid grid-cols-2 gap-4 p-6">

              {/* Free */}
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5">
                <div className="mb-4 border-b border-zinc-800/60 pb-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Free</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-zinc-100">$0</p>
                  <p className="font-mono text-[10px] text-zinc-600">forever</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {FREE_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0 text-zinc-500" />
                      <span className="font-mono text-xs text-zinc-400">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex h-9 w-full items-center justify-center rounded-lg border border-zinc-800 font-mono text-xs text-zinc-600">
                  Current plan
                </div>
              </div>

              {/* Pro */}
              <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-linear-to-b from-indigo-950/40 to-zinc-900/30 p-5">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute top-0 left-0 h-12 w-px bg-linear-to-b from-indigo-500/50 to-transparent" />
                  <div className="absolute top-0 left-0 h-px w-12 bg-linear-to-r from-indigo-500/50 to-transparent" />
                  <div className="absolute top-0 right-0 h-12 w-px bg-linear-to-b from-indigo-500/50 to-transparent" />
                  <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-indigo-500/50 to-transparent" />
                </div>
                <div className="relative mb-4 border-b border-indigo-800/40 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-widest text-indigo-400">Pro</p>
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-indigo-400">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-2xl font-bold text-zinc-100">$12</p>
                  <p className="font-mono text-[10px] text-zinc-500">per month</p>
                </div>
                <div className="relative flex flex-col gap-2.5">
                  {PRO_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0 text-indigo-400" />
                      <span className="font-mono text-xs text-zinc-300">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="relative mt-5">
                  <Button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full h-9 gap-2 bg-white font-mono text-xs font-semibold text-zinc-950 hover:bg-zinc-100 shadow-lg shadow-white/5 transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5" />
                    )}
                    {loading ? "Redirecting…" : "Upgrade to Pro"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="border-t border-zinc-800/60 px-6 py-3.5 text-center">
              <p className="font-mono text-[10px] text-zinc-600">
                Secure payment via Stripe. Payment syncs instantly across browser and desktop.
              </p>
            </div>
          </div>
        </RadixDialog.Content>
      </DialogPortal>
    </Dialog>
  );
}
