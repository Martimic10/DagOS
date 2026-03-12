"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  FileText,
  HelpCircle,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/demo/dashboard", icon: LayoutDashboard },
  { label: "Models",    href: "/demo/models",    icon: Package        },
  { label: "Chat",      href: "/demo/chat",      icon: MessageSquare  },
  { label: "Files",     href: "/demo/files",     icon: FileText       },
];

export function DemoSidebar() {
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
        <span className="ml-auto rounded border border-amber-800/60 bg-amber-950/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-500">
          demo
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
              <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-zinc-300" : "text-zinc-600")} />
              {item.label}
              {active && <span className="ml-auto h-1 w-1 rounded-full bg-zinc-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-1 border-t border-zinc-800/70 p-3">
        <Link
          href="/docs"
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-xs text-zinc-600 transition-colors hover:bg-zinc-900/60 hover:text-zinc-400"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Documentation
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-xs text-zinc-600 transition-colors hover:bg-zinc-900/60 hover:text-zinc-400"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Exit Demo
        </Link>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2">
          <FlaskConical className="h-3 w-3 text-amber-600" />
          <span className="font-mono text-[10px] text-amber-700">Demo mode active</span>
        </div>
      </div>
    </aside>
  );
}
