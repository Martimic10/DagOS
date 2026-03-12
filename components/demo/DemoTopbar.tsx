"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/demo/dashboard": "Dashboard",
  "/demo/models":    "Models",
  "/demo/chat":      "Chat",
  "/demo/files":     "Files",
};

export function DemoTopbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Demo";

  return (
    <header className="fixed top-[2.125rem] left-56 right-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/70 bg-zinc-950/90 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-sm font-semibold text-zinc-100">{title}</h1>
        <span className="rounded border border-amber-800/50 bg-amber-950/30 px-2 py-0.5 font-mono text-[10px] text-amber-500">
          DEMO
        </span>
      </div>
      <p className="font-mono text-xs text-zinc-700">
        Simulated data — no real runtime
      </p>
    </header>
  );
}
