"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  FileText,
  Activity,
  Settings,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Models", href: "/app/models", icon: Package },
  { label: "Chat", href: "/app/chat", icon: MessageSquare },
  { label: "Files", href: "/app/files", icon: FileText },
  { label: "System", href: "/app/system", icon: Activity },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-zinc-800/70 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-14 flex-shrink-0 items-center gap-2.5 border-b border-zinc-800/70 px-4">
        <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
          <div className="h-2 w-2 rounded-sm bg-zinc-100" />
        </div>
        <span className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
          DagOS
        </span>
        <span className="ml-auto rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
          v0.1
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        <p className="mb-1 px-2 pt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-700">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm transition-colors",
                active
                  ? "bg-zinc-800/80 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-zinc-300" : "text-zinc-600"
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1 w-1 rounded-full bg-zinc-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div className="flex flex-col gap-1 border-t border-zinc-800/70 p-3">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-xs text-zinc-600 transition-colors hover:bg-zinc-900/60 hover:text-zinc-400"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Help Center
        </Link>
        <Link
          href="/docs"
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-xs text-zinc-600 transition-colors hover:bg-zinc-900/60 hover:text-zinc-400"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Documentation
        </Link>
        {/* System status */}
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-3 py-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] text-zinc-600">
            All systems operational
          </span>
        </div>
      </div>
    </aside>
  );
}
