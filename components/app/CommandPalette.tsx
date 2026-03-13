"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  FileText,
  Settings,
  Activity,
  BookOpen,
  Download,
  Plus,
  Search,
  ArrowRight,
  Terminal,
  Cpu,
} from "lucide-react";

// ─── Command definition ───────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  keywords?: string[];
  group: "Navigate" | "Actions";
}

const COMMANDS: Command[] = [
  // Navigate
  {
    id: "nav-dashboard",
    group: "Navigate",
    label: "Dashboard",
    description: "Overview, stats, activity",
    icon: LayoutDashboard,
    href: "/app/dashboard",
    keywords: ["home", "overview", "stats"],
  },
  {
    id: "nav-chat",
    group: "Navigate",
    label: "Chat",
    description: "Start a conversation with a model",
    icon: MessageSquare,
    href: "/app/chat",
    keywords: ["message", "talk", "conversation", "llm"],
  },
  {
    id: "nav-models",
    group: "Navigate",
    label: "Model Library",
    description: "Browse and install local models",
    icon: Package,
    href: "/app/models",
    keywords: ["install", "library", "ollama", "pull"],
  },
  {
    id: "nav-files",
    group: "Navigate",
    label: "File Analysis",
    description: "Upload and analyze documents",
    icon: FileText,
    href: "/app/files",
    keywords: ["pdf", "document", "upload", "analyze"],
  },
  {
    id: "nav-system",
    group: "Navigate",
    label: "System Monitor",
    description: "CPU, RAM, disk telemetry",
    icon: Cpu,
    href: "/app/system",
    keywords: ["cpu", "ram", "memory", "disk", "telemetry"],
  },
  {
    id: "nav-settings",
    group: "Navigate",
    label: "Settings",
    description: "Profile, preferences, theme",
    icon: Settings,
    href: "/app/settings",
    keywords: ["preferences", "profile", "theme", "config"],
  },
  {
    id: "nav-docs",
    group: "Navigate",
    label: "Docs",
    description: "Setup guide and documentation",
    icon: BookOpen,
    href: "/docs",
    keywords: ["help", "guide", "documentation", "setup"],
  },
  // Actions
  {
    id: "action-install",
    group: "Actions",
    label: "Install a model",
    description: "Go to Model Library → install",
    icon: Download,
    href: "/app/models",
    keywords: ["pull", "download", "ollama"],
  },
  {
    id: "action-new-chat",
    group: "Actions",
    label: "New chat",
    description: "Open the chat workspace",
    icon: Plus,
    href: "/app/chat",
    keywords: ["start", "conversation", "message"],
  },
  {
    id: "action-analyze",
    group: "Actions",
    label: "Analyze a file",
    description: "Upload a document to File AI",
    icon: FileText,
    href: "/app/files",
    keywords: ["pdf", "doc", "upload"],
  },
  {
    id: "action-terminal",
    group: "Actions",
    label: "Ollama runtime",
    description: "Check Ollama status on dashboard",
    icon: Terminal,
    href: "/app/dashboard",
    keywords: ["ollama", "runtime", "status"],
  },
  {
    id: "action-activity",
    group: "Actions",
    label: "View activity log",
    description: "Recent events on the dashboard",
    icon: Activity,
    href: "/app/dashboard",
    keywords: ["log", "history", "events"],
  },
];

const GROUPS: Command["group"][] = ["Navigate", "Actions"];

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  // ── Filtered commands ─────────────────────────────────────────────────────
  const filtered = query.trim()
    ? COMMANDS.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q) ||
          (c.keywords ?? []).some((k) => k.includes(q))
        );
      })
    : COMMANDS;

  // ── Open / close ──────────────────────────────────────────────────────────
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  // ── Global shortcut + custom event ───────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => { if (prev) { close(); return false; } openPalette(); return true; });
      }
    }
    function onCustom() { openPalette(); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("dagos:openCommandPalette", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("dagos:openCommandPalette", onCustom);
    };
  }, [close, openPalette]);

  // ── Keyboard navigation inside palette ───────────────────────────────────
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) execute(filtered[active]);
    }
  }

  // ── Auto-scroll active item into view ────────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // ── Execute ───────────────────────────────────────────────────────────────
  function execute(cmd: Command) {
    close();
    router.push(cmd.href);
  }

  if (!open) return null;

  // ── Group the filtered results ────────────────────────────────────────────
  const groupedFiltered = GROUPS.map((g) => ({
    group: g,
    items: filtered.filter((c) => c.group === g),
  })).filter((g) => g.items.length > 0);

  // Build a flat index map for active highlighting
  let flatIndex = 0;
  const indexedGroups = groupedFiltered.map((g) => ({
    ...g,
    items: g.items.map((item) => ({ ...item, flatIdx: flatIndex++ })),
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Palette */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950/95 shadow-2xl ring-1 ring-inset ring-white/5">

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-zinc-800/60 px-4 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKeyDown}
              placeholder="Search commands…"
              className="flex-1 bg-transparent font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            <span className="shrink-0 rounded border border-zinc-700/60 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
              ESC
            </span>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="py-10 text-center font-mono text-xs text-zinc-600">
                No commands match &ldquo;{query}&rdquo;
              </div>
            ) : (
              indexedGroups.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <p className="mb-1 px-3 pt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    {group}
                  </p>
                  {items.map(({ flatIdx, ...cmd }) => {
                    const Icon = cmd.icon;
                    const isActive = flatIdx === active;
                    return (
                      <button
                        key={cmd.id}
                        data-idx={flatIdx}
                        onMouseEnter={() => setActive(flatIdx)}
                        onClick={() => execute(cmd)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-zinc-800/80 text-zinc-100"
                            : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                        }`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                          isActive
                            ? "border-zinc-600/60 bg-zinc-700/60"
                            : "border-zinc-800/60 bg-zinc-900/60"
                        }`}>
                          <Icon className={`h-3.5 w-3.5 ${isActive ? "text-zinc-200" : "text-zinc-500"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-medium">{cmd.label}</p>
                          {cmd.description && (
                            <p className={`font-mono text-[10px] ${isActive ? "text-zinc-400" : "text-zinc-600"}`}>
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition-opacity ${isActive ? "opacity-60" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 border-t border-zinc-800/60 px-4 py-2.5">
            <span className="font-mono text-[10px] text-zinc-700">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[9px]">↑↓</kbd>
              {" "}navigate
            </span>
            <span className="font-mono text-[10px] text-zinc-700">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[9px]">↵</kbd>
              {" "}open
            </span>
            <span className="font-mono text-[10px] text-zinc-700">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 font-mono text-[9px]">⌘K</kbd>
              {" "}toggle
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
