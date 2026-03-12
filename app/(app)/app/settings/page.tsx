"use client";

import { useCallback, useEffect, useState } from "react";
import {
  User,
  Check,
  SlidersHorizontal,
  Cpu,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadProfile, saveProfile, displayInitial } from "@/lib/local-profile";
import { loadPrefs, savePrefs, DEFAULT_PREFS, type Prefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/3">
      <div className="flex items-center gap-2.5 border-b border-zinc-800/60 px-5 py-3.5">
        <Icon className="h-3.5 w-3.5 text-zinc-600" />
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {title}
          </span>
          {subtitle && (
            <span className="ml-2.5 font-mono text-[10px] text-zinc-700">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-zinc-800/60 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 transition-colors hover:bg-zinc-900/50">
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium text-zinc-300">{label}</p>
        <p className="font-mono text-[10px] text-zinc-600">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border transition-colors focus:outline-none",
          checked ? "border-zinc-500 bg-zinc-400" : "border-zinc-700 bg-zinc-800"
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

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 gap-1.5 border font-mono text-xs transition-all",
        saved
          ? "border-emerald-800 bg-emerald-950 text-emerald-400"
          : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600"
      )}
    >
      {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : "Save"}
    </Button>
  );
}

// ── Ollama host ───────────────────────────────────────────────────────────────

const OLLAMA_HOST_KEY = "dagos_ollama_host";
const DEFAULT_HOST = "http://localhost:11434";

type ConnState = "idle" | "checking" | "ok" | "err";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Profile
  const [firstName, setFirstName] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Ollama runtime
  const [ollamaHost, setOllamaHost] = useState(DEFAULT_HOST);
  const [hostSaved, setHostSaved] = useState(false);
  const [connState, setConnState] = useState<ConnState>("idle");
  const [connDetail, setConnDetail] = useState<string | null>(null);

  // Load all from localStorage on mount
  useEffect(() => {
    const profile = loadProfile();
    if (profile?.firstName) setFirstName(profile.firstName);
    setPrefs(loadPrefs());
    setOllamaHost(localStorage.getItem(OLLAMA_HOST_KEY) ?? DEFAULT_HOST);
  }, []);

  // ── Profile ────────────────────────────────────────────────────────────────

  function saveProfileHandler() {
    const trimmed = firstName.trim().split(/\s+/)[0] ?? "";
    saveProfile({ firstName: trimmed || "" });
    window.dispatchEvent(new Event("storage"));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  // ── Preferences ────────────────────────────────────────────────────────────

  function savePrefsHandler() {
    savePrefs(prefs);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  }

  // ── Ollama runtime ─────────────────────────────────────────────────────────

  function saveHostHandler() {
    const trimmed = ollamaHost.trim() || DEFAULT_HOST;
    localStorage.setItem(OLLAMA_HOST_KEY, trimmed);
    setOllamaHost(trimmed);
    setHostSaved(true);
    setConnState("idle");
    setTimeout(() => setHostSaved(false), 2000);
  }

  const testConnection = useCallback(async () => {
    setConnState("checking");
    setConnDetail(null);
    const host = ollamaHost.trim() || DEFAULT_HOST;
    try {
      const res = await fetch("/api/ollama/health");
      const data = await res.json();
      if (data.ok) {
        setConnState("ok");
        setConnDetail(`Connected · ${host}`);
      } else {
        setConnState("err");
        setConnDetail(data.error ?? "Ollama did not respond");
      }
    } catch {
      setConnState("err");
      setConnDetail("Could not reach health endpoint");
    }
  }, [ollamaHost]);

  const connIcon = {
    idle: null,
    checking: <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />,
    ok:  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    err: <XCircle className="h-3.5 w-3.5 text-red-500/80" />,
  }[connState];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="font-mono text-xl font-bold text-zinc-100">Settings</h1>
        <p className="font-mono text-xs text-zinc-600">
          Manage your local DagOS workstation.
        </p>
      </div>

      {/* ── Local Profile ──────────────────────────────────────────────────── */}
      <SectionCard
        icon={User}
        title="Local Profile"
        subtitle="stored on this device"
        footer={<SaveButton saved={profileSaved} onClick={saveProfileHandler} />}
      >
        <div className="flex items-center gap-4">
          {/* Avatar preview */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-mono text-lg font-bold text-zinc-200">
            {displayInitial({ firstName }) || "?"}
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                First Name
              </span>
              <Input
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setProfileSaved(false); }}
                onKeyDown={(e) => e.key === "Enter" && saveProfileHandler()}
                placeholder="Michael"
                className="h-8 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-0"
              />
            </label>
            <p className="mt-1.5 font-mono text-[10px] text-zinc-700">
              Only the first word is used for display. Stored locally only.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Interface Preferences ──────────────────────────────────────────── */}
      <SectionCard
        icon={SlidersHorizontal}
        title="Interface"
        subtitle="appearance & behaviour"
        footer={<SaveButton saved={prefsSaved} onClick={savePrefsHandler} />}
      >
        <div className="flex flex-col gap-2">
          <ToggleRow
            label="Show latency badge"
            description="Display response time on chat messages"
            checked={prefs.showLatencyBadge}
            onChange={(v) => { setPrefs((p) => ({ ...p, showLatencyBadge: v })); setPrefsSaved(false); }}
          />
          <ToggleRow
            label="Compact activity table"
            description="Reduce row height in the dashboard log"
            checked={prefs.compactActivityTable}
            onChange={(v) => { setPrefs((p) => ({ ...p, compactActivityTable: v })); setPrefsSaved(false); }}
          />
          <ToggleRow
            label="24-hour clock"
            description="Use 24 h time format across the interface"
            checked={prefs.show24hClock}
            onChange={(v) => { setPrefs((p) => ({ ...p, show24hClock: v })); setPrefsSaved(false); }}
          />
          <ToggleRow
            label="Auto-scroll chat"
            description="Scroll to the latest message while streaming"
            checked={prefs.autoScrollChat}
            onChange={(v) => { setPrefs((p) => ({ ...p, autoScrollChat: v })); setPrefsSaved(false); }}
          />
          <ToggleRow
            label="Show model sizes"
            description="Display file size next to model names in lists"
            checked={prefs.showModelSizes}
            onChange={(v) => { setPrefs((p) => ({ ...p, showModelSizes: v })); setPrefsSaved(false); }}
          />
        </div>
      </SectionCard>

      {/* ── Ollama Runtime ─────────────────────────────────────────────────── */}
      <SectionCard
        icon={Cpu}
        title="Ollama Runtime"
        subtitle="local AI backend"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={testConnection}
              disabled={connState === "checking"}
              className="h-8 gap-1.5 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700 disabled:opacity-40"
            >
              {connState === "checking"
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              Test Connection
            </Button>
            <SaveButton saved={hostSaved} onClick={saveHostHandler} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              Host URL
            </span>
            <Input
              value={ollamaHost}
              onChange={(e) => { setOllamaHost(e.target.value); setHostSaved(false); setConnState("idle"); }}
              placeholder={DEFAULT_HOST}
              className="h-8 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-0"
            />
            <p className="mt-1.5 font-mono text-[10px] text-zinc-700">
              The address where Ollama is running. Default: {DEFAULT_HOST}
            </p>
          </label>

          {/* Connection status row */}
          {connState !== "idle" && (
            <div className={cn(
              "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
              connState === "ok"
                ? "border-emerald-900/60 bg-emerald-950/30"
                : connState === "err"
                ? "border-red-900/40 bg-red-950/20"
                : "border-zinc-800 bg-zinc-900/40"
            )}>
              {connIcon}
              <span className={cn(
                "font-mono text-[11px]",
                connState === "ok" ? "text-emerald-400" : connState === "err" ? "text-red-400/80" : "text-zinc-500"
              )}>
                {connState === "checking" && "Testing connection…"}
                {connState === "ok" && (connDetail ?? "Connected")}
                {connState === "err" && (connDetail ?? "Connection failed")}
              </span>
            </div>
          )}

          {/* Info row */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              DagOS proxies all Ollama requests through <code className="text-zinc-500">/api/ollama/*</code> — no CORS issues.
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <SectionCard icon={Info} title="About DagOS">
        <div className="flex flex-col gap-3">
          {/* Version row */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <span className="font-mono text-xs text-zinc-500">Version</span>
            <span className="rounded border border-zinc-700/60 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-400">
              v0.1.0
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <span className="font-mono text-xs text-zinc-500">Runtime</span>
            <span className="font-mono text-xs text-zinc-400">Ollama · localhost</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <span className="font-mono text-xs text-zinc-500">License</span>
            <span className="font-mono text-xs text-zinc-400">Apache 2.0</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <span className="font-mono text-xs text-zinc-500">Storage</span>
            <span className="font-mono text-xs text-zinc-400">localStorage · no cloud</span>
          </div>

          {/* Links */}
          <div className="mt-1 flex gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-[11px] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              <ExternalLink className="h-3 w-3" />
              GitHub
            </a>
            <a
              href="/docs"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-[11px] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              <ExternalLink className="h-3 w-3" />
              Documentation
            </a>
            <a
              href="https://ollama.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-[11px] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              <ExternalLink className="h-3 w-3" />
              Ollama
            </a>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
