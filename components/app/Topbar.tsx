"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search, Bell, Settings, ChevronDown, Filter, Check, User, SlidersHorizontal,
  LayoutDashboard, MessageSquare, Cpu, FileText, Monitor, ArrowRight, Clock,
  CheckCircle2, XCircle, Package, Trash2,
} from "lucide-react";
import { loadProfile, saveProfile, displayName, displayInitial } from "@/lib/local-profile";
import { loadActivityLog, type ActivityEvent } from "@/lib/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { loadPrefs, savePrefs, type Prefs, DEFAULT_PREFS } from "@/lib/preferences";

// ── Page titles ───────────────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/models":    "Models",
  "/app/chat":      "Chat",
  "/app/files":     "Files",
  "/app/system":    "System",
  "/app/settings":  "Settings",
};

export const TIME_RANGES = [
  { value: "1h",  label: "Last 1 Hour" },
  { value: "6h",  label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d",  label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
] as const;

export const STATUS_FILTERS = [
  { value: "all",     label: "All Models" },
  { value: "running", label: "Running Only" },
  { value: "idle",    label: "Idle / Stopped" },
] as const;

// ── Nav pages (used by search palette) ────────────────────────────────────────

const NAV_PAGES = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard, description: "Overview & activity" },
  { label: "Chat",      href: "/app/chat",      icon: MessageSquare,   description: "Conversations with models" },
  { label: "Models",    href: "/app/models",    icon: Cpu,             description: "Manage installed models" },
  { label: "Files",     href: "/app/files",     icon: FileText,        description: "Analyze documents" },
  { label: "System",    href: "/app/system",    icon: Monitor,         description: "Hardware & runtime stats" },
  { label: "Settings",  href: "/app/settings",  icon: Settings,        description: "Preferences & configuration" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOTIF_KEY = "dagos_notif_last_read";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function notifLabel(e: ActivityEvent): string {
  switch (e.action) {
    case "chat_request":   return e.model ? `Chat · ${e.model.split(":")[0]}` : "Chat request";
    case "model_install":  return e.model ? `Installed ${e.model.split(":")[0]}` : "Model installed";
    case "model_delete":   return e.model ? `Removed ${e.model.split(":")[0]}` : "Model removed";
    case "model_run":      return e.model ? `Ran ${e.model.split(":")[0]}` : "Model run";
    default:               return e.action;
  }
}

function notifIcon(e: ActivityEvent) {
  if (e.status === "error") return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
  switch (e.action) {
    case "chat_request":  return <MessageSquare className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
    case "model_install": return <Package       className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
    case "model_delete":  return <Trash2        className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
    default:              return <CheckCircle2  className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
  }
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
      <div>
        <p className="font-mono text-xs text-zinc-300">{label}</p>
        <p className="font-mono text-[10px] text-zinc-600">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-zinc-700 transition-colors focus:outline-none",
          checked ? "bg-zinc-400" : "bg-zinc-800"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-0.5 h-3 w-3 rounded-full bg-zinc-900 shadow transition-transform",
            checked ? "translate-x-3" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

export function Topbar() {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Profile ─────────────────────────────────────────────────────────────────
  const [name, setName]                   = useState("Local User");
  const [initial, setInitial]             = useState("L");
  const [profileOpen, setProfileOpen]     = useState(false);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileSaved, setProfileSaved]   = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // ── Preferences ─────────────────────────────────────────────────────────────
  const [prefsOpen, setPrefsOpen]   = useState(false);
  const [prefs, setPrefs]           = useState<Prefs>(DEFAULT_PREFS);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // ── Notifications ───────────────────────────────────────────────────────────
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifLastRead, setNotifLastRead] = useState<string | null>(null);
  const [notifEvents, setNotifEvents]   = useState<ActivityEvent[]>([]);

  // ── Search palette ──────────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Load profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => {
      const p = loadProfile();
      setName(displayName(p));
      setInitial(displayInitial(p));
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // ── Load notif last-read timestamp ───────────────────────────────────────────
  useEffect(() => {
    setNotifLastRead(localStorage.getItem(NOTIF_KEY));
    setNotifEvents(loadActivityLog().slice(0, 12));
  }, []);

  // ── Seed profile modal ───────────────────────────────────────────────────────
  useEffect(() => {
    if (profileOpen) {
      const p = loadProfile();
      setProfileFirstName(p?.firstName ?? "");
      setProfileSaved(false);
      setTimeout(() => profileInputRef.current?.focus(), 50);
    }
  }, [profileOpen]);

  // ── Load prefs when modal opens ──────────────────────────────────────────────
  useEffect(() => {
    if (prefsOpen) {
      setPrefs(loadPrefs());
      setPrefsSaved(false);
    }
  }, [prefsOpen]);

  // ── Focus search input when palette opens ────────────────────────────────────
  useEffect(() => {
    if (searchOpen) {
      setSearchQuery("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // ── Ctrl+K global shortcut ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Commits ─────────────────────────────────────────────────────────────────
  function commitProfile() {
    const trimmed = profileFirstName.trim().split(/\s+/)[0] ?? "";
    saveProfile({ firstName: trimmed });
    window.dispatchEvent(new Event("storage"));
    setName(displayName({ firstName: trimmed }));
    setInitial(displayInitial({ firstName: trimmed }));
    setProfileSaved(true);
    setTimeout(() => { setProfileSaved(false); setProfileOpen(false); }, 900);
  }

  function commitPrefs() {
    savePrefs(prefs);
    setPrefsSaved(true);
    setTimeout(() => { setPrefsSaved(false); setPrefsOpen(false); }, 900);
  }

  // ── Notifications ────────────────────────────────────────────────────────────
  const openNotifications = useCallback(() => {
    const events = loadActivityLog().slice(0, 12);
    setNotifEvents(events);
    setNotifOpen(true);
  }, []);

  const markAllRead = useCallback(() => {
    const ts = new Date().toISOString();
    localStorage.setItem(NOTIF_KEY, ts);
    setNotifLastRead(ts);
  }, []);

  const unreadCount = notifLastRead
    ? notifEvents.filter((e) => e.timestamp > notifLastRead).length
    : notifEvents.length;

  // ── Search ───────────────────────────────────────────────────────────────────
  const filteredPages = NAV_PAGES.filter((p) =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function navigateTo(href: string) {
    setSearchOpen(false);
    router.push(href);
  }

  // ── Filter params ─────────────────────────────────────────────────────────────
  const pageTitle = pageTitles[pathname] ?? "Dashboard";
  const range  = searchParams.get("range")  ?? "24h";
  const status = searchParams.get("status") ?? "all";
  const isDashboard = pathname === "/app/dashboard";
  const activeFilterCount = (range !== "24h" ? 1 : 0) + (status !== "all" ? 1 : 0);

  function setParam(key: string, value: string, defaultVal: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultVal) params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <header className="fixed left-56 right-0 top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-800/70 bg-zinc-950/90 px-5 backdrop-blur-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-600">DagOS</span>
          <span className="font-mono text-xs text-zinc-700">/</span>
          <span className="font-mono text-xs font-medium text-zinc-300">{pageTitle}</span>
        </div>

        {/* Search trigger */}
        <div
          className="relative ml-4 flex-1 max-w-sm cursor-pointer"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <div className="flex h-8 items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-8 font-mono text-xs text-zinc-700 hover:border-zinc-700 hover:bg-zinc-900 transition-colors">
            <span>Search pages &amp; models…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-800 bg-zinc-950 px-1 py-0.5 font-mono text-[9px] text-zinc-700">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5">

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative h-8 gap-1.5 border bg-transparent font-mono text-xs transition-colors",
                  activeFilterCount > 0 && isDashboard
                    ? "border-zinc-600 text-zinc-300 hover:bg-zinc-900/60"
                    : "border-zinc-800 text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700"
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                {activeFilterCount > 0 && isDashboard && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-600 font-mono text-[9px] font-bold text-zinc-100">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 border-zinc-800 bg-zinc-950 font-mono text-xs">
              <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Time Range
              </DropdownMenuLabel>
              {TIME_RANGES.map((r) => (
                <DropdownMenuItem
                  key={r.value}
                  onClick={() => setParam("range", r.value, "24h")}
                  className={cn(
                    "flex items-center justify-between cursor-pointer focus:bg-zinc-900",
                    range === r.value ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {r.label}
                  {range === r.value && <Check className="h-3 w-3 text-zinc-400" />}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Model Status
              </DropdownMenuLabel>
              {STATUS_FILTERS.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => setParam("status", s.value, "all")}
                  className={cn(
                    "flex items-center justify-between cursor-pointer focus:bg-zinc-900",
                    status === s.value ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {s.label}
                  {status === s.value && <Check className="h-3 w-3 text-zinc-400" />}
                </DropdownMenuItem>
              ))}

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => router.replace(pathname)}
                    className="cursor-pointer text-zinc-600 hover:text-zinc-400 focus:bg-zinc-900 focus:text-zinc-400"
                  >
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
                onClick={openNotifications}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-400 font-mono text-[8px] font-bold text-zinc-900">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-72 border-zinc-800 bg-zinc-950 p-0 font-mono"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 px-3 py-2.5">
                <span className="font-mono text-xs font-semibold text-zinc-300">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Events list */}
              {notifEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-8">
                  <Bell className="h-5 w-5 text-zinc-800" />
                  <p className="font-mono text-xs text-zinc-700">No activity yet</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {notifEvents.map((e) => {
                    const isUnread = !notifLastRead || e.timestamp > notifLastRead;
                    return (
                      <div
                        key={e.id}
                        className={cn(
                          "flex items-start gap-2.5 px-3 py-2.5 border-b border-zinc-800/40 last:border-0 transition-colors",
                          isUnread ? "bg-zinc-900/50" : "bg-transparent"
                        )}
                      >
                        <div className="mt-0.5">{notifIcon(e)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-mono text-xs truncate", isUnread ? "text-zinc-300" : "text-zinc-500")}>
                            {notifLabel(e)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-2.5 w-2.5 text-zinc-700 shrink-0" />
                            <span className="font-mono text-[10px] text-zinc-700">{relativeTime(e.timestamp)}</span>
                            {e.status === "error" && (
                              <span className="rounded bg-red-950 px-1 font-mono text-[9px] text-red-500">error</span>
                            )}
                          </div>
                        </div>
                        {isUnread && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              {notifEvents.length > 0 && (
                <div className="border-t border-zinc-800/60 px-3 py-2">
                  <button
                    onClick={() => { setNotifOpen(false); router.push("/app/dashboard"); }}
                    className="flex items-center gap-1 font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    View full activity log
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/app/settings")}
            className={cn(
              "h-8 w-8 hover:bg-zinc-900/60 hover:text-zinc-300",
              pathname === "/app/settings" ? "text-zinc-300" : "text-zinc-500"
            )}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* User chip */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 font-mono text-xs text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-mono text-[9px] font-bold text-zinc-300">
                  {initial}
                </div>
                <span className="hidden sm:inline">{name}</span>
                <ChevronDown className="h-3 w-3 text-zinc-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300"
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-mono text-xs font-bold text-zinc-300">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-semibold text-zinc-200">{name}</p>
                  <p className="font-mono text-[10px] text-zinc-600">DagOS Workstation</p>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuItem
                onSelect={() => setProfileOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-zinc-400 focus:bg-zinc-900 focus:text-zinc-100 hover:text-zinc-100"
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setPrefsOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-zinc-400 focus:bg-zinc-900 focus:text-zinc-100 hover:text-zinc-100"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Preferences
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="text-zinc-600 focus:bg-zinc-900 focus:text-zinc-400">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Search palette ──────────────────────────────────────────────────────── */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-lg border-zinc-800 bg-zinc-950 p-0 gap-0 shadow-2xl"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Search input */}
          <div className="flex items-center gap-2.5 border-b border-zinc-800/60 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
                if (e.key === "Enter" && filteredPages.length > 0) navigateTo(filteredPages[0].href);
              }}
              placeholder="Search pages and models…"
              className="flex-1 bg-transparent font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div className="py-2">
            {filteredPages.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-10">
                <Search className="h-5 w-5 text-zinc-800" />
                <p className="font-mono text-xs text-zinc-700">No pages match &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <>
                <p className="px-4 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-700">
                  Navigate
                </p>
                {filteredPages.map((page) => {
                  const Icon = page.icon;
                  const isActive = pathname === page.href;
                  return (
                    <button
                      key={page.href}
                      onClick={() => navigateTo(page.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-900/60",
                        isActive ? "bg-zinc-900/40" : ""
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-800 bg-zinc-900">
                        <Icon className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={cn("font-mono text-xs font-medium", isActive ? "text-zinc-200" : "text-zinc-400")}>
                          {page.label}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-700 truncate">{page.description}</p>
                      </div>
                      {isActive && (
                        <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
                          current
                        </span>
                      )}
                      {!isActive && <ArrowRight className="h-3 w-3 text-zinc-700 shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-3 border-t border-zinc-800/60 px-4 py-2.5">
            <span className="font-mono text-[10px] text-zinc-700">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 text-[9px]">↵</kbd>
              {" "}to navigate
            </span>
            <span className="font-mono text-[10px] text-zinc-700">
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 text-[9px]">esc</kbd>
              {" "}to close
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Profile modal ──────────────────────────────────────────────────────── */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent
          showCloseButton
          className="max-w-sm border-zinc-800 bg-zinc-950 p-0 gap-0 shadow-2xl"
        >
          <DialogHeader className="border-b border-zinc-800/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-mono text-sm font-bold text-zinc-200">
                {displayInitial({ firstName: profileFirstName }) || initial}
              </div>
              <div>
                <DialogTitle className="font-mono text-sm font-semibold text-zinc-100">
                  Local Profile
                </DialogTitle>
                <p className="font-mono text-[10px] text-zinc-600">Stored on this device only</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                First Name
              </span>
              <Input
                ref={profileInputRef}
                value={profileFirstName}
                onChange={(e) => { setProfileFirstName(e.target.value); setProfileSaved(false); }}
                onKeyDown={(e) => e.key === "Enter" && commitProfile()}
                placeholder="Michael"
                className="h-9 border-zinc-800 bg-zinc-900/60 font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-600 focus-visible:ring-0"
              />
            </label>
            <p className="mt-2 font-mono text-[10px] text-zinc-700">Only the first word is used for display.</p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-800/60 px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(false)}
              className="h-8 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={commitProfile}
              className={cn(
                "h-8 gap-1.5 border font-mono text-xs transition-colors",
                profileSaved
                  ? "border-emerald-800 bg-emerald-950 text-emerald-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600"
              )}
            >
              {profileSaved ? <><Check className="h-3.5 w-3.5" /> Saved</> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Preferences modal ─────────────────────────────────────────────────── */}
      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent
          showCloseButton
          className="max-w-sm border-zinc-800 bg-zinc-950 p-0 gap-0 shadow-2xl"
        >
          <DialogHeader className="border-b border-zinc-800/60 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
              <div>
                <DialogTitle className="font-mono text-sm font-semibold text-zinc-100">
                  Preferences
                </DialogTitle>
                <p className="font-mono text-[10px] text-zinc-600">Stored locally on this device</p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-2 px-5 py-5">
            <ToggleRow
              label="Show latency badge"
              description="Display response time on chat messages"
              checked={prefs.showLatencyBadge}
              onChange={(v) => setPrefs((p) => ({ ...p, showLatencyBadge: v }))}
            />
            <ToggleRow
              label="Compact activity table"
              description="Reduce row height in the dashboard log"
              checked={prefs.compactActivityTable}
              onChange={(v) => setPrefs((p) => ({ ...p, compactActivityTable: v }))}
            />
            <ToggleRow
              label="24-hour clock"
              description="Use 24 h time format across the interface"
              checked={prefs.show24hClock}
              onChange={(v) => setPrefs((p) => ({ ...p, show24hClock: v }))}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-800/60 px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPrefsOpen(false)}
              className="h-8 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={commitPrefs}
              className={cn(
                "h-8 gap-1.5 border font-mono text-xs transition-colors",
                prefsSaved
                  ? "border-emerald-800 bg-emerald-950 text-emerald-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600"
              )}
            >
              {prefsSaved ? <><Check className="h-3.5 w-3.5" /> Saved</> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
