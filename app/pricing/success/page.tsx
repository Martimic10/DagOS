"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingSuccessPage() {
  const [bridging, setBridging] = useState(true);

  useEffect(() => {
    // Give the webhook ~2s to update is_pro, then fire the desktop deep link
    // so the Electron app picks up the new Pro status without re-login.
    const t = setTimeout(() => {
      setBridging(false);
      // If the user has the desktop app open, this sends the current session
      // to it — same as the desktop-handoff page.
      window.location.href = "dagos://auth-refresh";
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050508]">
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
          <div className="h-4 w-4 rounded-sm bg-zinc-100" />
        </div>

        <CheckCircle2 className="h-10 w-10 text-emerald-400" />

        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xl font-bold text-zinc-100">
            You&apos;re now on Pro!
          </p>
          <p className="font-mono text-sm text-zinc-500">
            Your plan has been upgraded. All Pro features are now unlocked.
          </p>
        </div>

        {bridging ? (
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Syncing to desktop app…
          </div>
        ) : (
          <p className="font-mono text-xs text-zinc-600">
            Desktop app updated. You can close this tab.
          </p>
        )}

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button className="h-10 gap-2 bg-white font-mono text-sm text-zinc-950 hover:bg-zinc-100" asChild>
            <Link href="/app/dashboard">
              Go to Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" className="h-10 border border-zinc-800 font-mono text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300" asChild>
            <Link href="/app/playground">
              Try Model Playground →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
