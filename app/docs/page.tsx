"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Terminal,
  BookOpen,
  Activity,
  Settings,
  Zap,
  Code2,
  ExternalLink,
  ChevronDown,
  Copy,
  Check,
  Menu,
  X,
  Download,
  Monitor,
  Apple,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sidebar nav structure ────────────────────────────────────────────────────

const nav = [
  {
    section: "Get Started",
    icon: Zap,
    items: [
      { id: "introduction",   label: "Introduction" },
      { id: "download",       label: "Download the App" },
      { id: "prerequisites",  label: "Prerequisites" },
      { id: "installation",   label: "Installation" },
      { id: "first-run",      label: "First Run" },
    ],
  },
  {
    section: "Features",
    icon: Activity,
    items: [
      { id: "dashboard",      label: "Dashboard" },
      { id: "chat-console",   label: "Chat Console" },
      { id: "model-manager",  label: "Model Manager" },
      { id: "setup-wizard",   label: "Setup Wizard" },
    ],
  },
  {
    section: "Configuration",
    icon: Settings,
    items: [
      { id: "ollama-runtime",       label: "Ollama Runtime" },
      { id: "model-settings",       label: "Model Settings" },
      { id: "system-requirements",  label: "System Requirements" },
    ],
  },
  {
    section: "API Reference",
    icon: Code2,
    items: [
      { id: "health-api",     label: "Health Check" },
      { id: "models-api",     label: "Models API" },
      { id: "chat-api",       label: "Chat API" },
      { id: "streaming-api",  label: "Streaming" },
    ],
  },
];

const tocItems = [
  { id: "introduction",        label: "Introduction" },
  { id: "download",            label: "Download the App" },
  { id: "prerequisites",       label: "Prerequisites" },
  { id: "installation",        label: "Installation" },
  { id: "first-run",           label: "First Run" },
  { id: "dashboard",           label: "Dashboard" },
  { id: "chat-console",        label: "Chat Console" },
  { id: "model-manager",       label: "Model Manager" },
  { id: "setup-wizard",        label: "Setup Wizard" },
  { id: "ollama-runtime",      label: "Ollama Runtime" },
  { id: "model-settings",      label: "Model Settings" },
  { id: "system-requirements", label: "System Requirements" },
  { id: "health-api",          label: "Health Check" },
  { id: "models-api",          label: "Models API" },
  { id: "chat-api",            label: "Chat API" },
  { id: "streaming-api",       label: "Streaming" },
];

// ─── Small reusable doc components ───────────────────────────────────────────

function DocH1({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h1 id={id} className="scroll-mt-20 font-mono text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">
      {children}
    </h1>
  );
}
function DocH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 font-mono text-lg sm:text-xl font-semibold text-zinc-200 mt-12 mb-4 pt-2 border-t border-zinc-800/60">
      {children}
    </h2>
  );
}
function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-400 leading-relaxed mb-4">{children}</p>;
}
function DocCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
      {children}
    </code>
  );
}
function DocPre({ label, children }: { label?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const extract = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extract).join("");
      if (node && typeof node === "object" && "props" in node) {
        const el = node as React.ReactElement<{ children?: React.ReactNode }>;
        return extract(el.props.children);
      }
      return "";
    };
    const raw = extract(children);
    navigator.clipboard.writeText(raw.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="mb-5 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-600" />
          <span className="font-mono text-xs text-zinc-600">{label ?? "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          title="Copy to clipboard"
        >
          {copied ? (
            <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
          ) : (
            <><Copy className="h-3 w-3" />Copy</>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
function DocCallout({ type = "info", children }: { type?: "info" | "warn" | "tip"; children: React.ReactNode }) {
  const styles = {
    info: "border-zinc-700 bg-zinc-900/40 text-zinc-400",
    warn: "border-yellow-900/50 bg-yellow-950/20 text-yellow-400/80",
    tip:  "border-emerald-900/50 bg-emerald-950/20 text-emerald-400/80",
  };
  const labels = { info: "Note", warn: "Warning", tip: "Tip" };
  return (
    <div className={cn("mb-5 rounded-lg border px-4 py-3 text-sm leading-relaxed", styles[type])}>
      <span className="mr-2 font-mono text-xs font-semibold uppercase tracking-wider opacity-60">
        {labels[type]}:
      </span>
      {children}
    </div>
  );
}
function ApiRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const colors: Record<string, string> = {
    GET:    "text-emerald-400 bg-emerald-950/40 border-emerald-900/60",
    POST:   "text-blue-400   bg-blue-950/40   border-blue-900/60",
    DELETE: "text-red-400    bg-red-950/40    border-red-900/60",
  };
  return (
    <div className="flex flex-wrap items-start gap-2 sm:gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 mb-2">
      <span className={cn("shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold", colors[method] ?? "text-zinc-400")}>
        {method}
      </span>
      <code className="font-mono text-xs sm:text-sm text-zinc-300 flex-1 break-all">{path}</code>
      <span className="w-full sm:w-auto text-xs text-zinc-600">{desc}</span>
    </div>
  );
}

// ─── Sidebar nav content (shared between desktop + mobile drawer) ─────────────

function SidebarNav({
  openSections,
  toggleSection,
  activeId,
  onNavigate,
}: {
  openSections: Record<string, boolean>;
  toggleSection: (s: string) => void;
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-zinc-600" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Documentation</span>
        </div>
      </div>

      {nav.map((group) => {
        const Icon = group.icon;
        const open = openSections[group.section] ?? true;
        return (
          <div key={group.section} className="mb-1">
            <button
              onClick={() => toggleSection(group.section)}
              className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:text-zinc-200"
            >
              <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <Icon className="h-3.5 w-3.5" />
                {group.section}
              </span>
              <ChevronDown
                className={cn("h-3.5 w-3.5 text-zinc-600 transition-transform", open && "rotate-180")}
              />
            </button>
            {open && (
              <div className="mt-0.5 mb-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-6 py-1.5 text-left font-mono text-xs transition-colors",
                      activeId === item.id
                        ? "text-zinc-200 border-r-2 border-zinc-400 bg-zinc-900/60"
                        : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    <ChevronRight className="h-3 w-3 opacity-40" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = useState("introduction");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Get Started": true,
    "Features": true,
    "Configuration": false,
    "API Reference": false,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Active section via intersection observer
  useEffect(() => {
    const ids = tocItems.map((t) => t.id);
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  // Close drawer on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setDrawerOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const toggleSection = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">

          {/* Left: hamburger (mobile) + back + wordmark */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex lg:hidden items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to home</span>
            </Link>

            <div className="hidden h-4 w-px bg-zinc-800 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
                <div className="h-2 w-2 rounded-sm bg-zinc-100" />
              </div>
              <span className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
                DagOS
              </span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-500">
                Docs
              </span>
            </div>
          </div>

          {/* Right: CTA */}
          <Link
            href="/app/dashboard"
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 sm:px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            <span className="hidden sm:inline">Open Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 overflow-y-auto border-r border-zinc-800/70 bg-zinc-950 py-6 transition-transform duration-300 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
              <div className="h-2 w-2 rounded-sm bg-zinc-100" />
            </div>
            <span className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">DagOS</span>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-500">Docs</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-md border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarNav
          openSections={openSections}
          toggleSection={toggleSection}
          activeId={activeId}
          onNavigate={scrollTo}
        />
      </aside>

      <div className="flex pt-14">

        {/* ── Desktop left sidebar ── */}
        <aside className="hidden lg:block fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-zinc-800/70 bg-zinc-950 py-6">
          <SidebarNav
            openSections={openSections}
            toggleSection={toggleSection}
            activeId={activeId}
            onNavigate={scrollTo}
          />
        </aside>

        {/* ── Main content ── */}
        <main className="w-full lg:ml-60 xl:mr-52 min-h-screen flex-1 px-4 sm:px-8 lg:px-10 py-8 sm:py-12 max-w-none lg:max-w-3xl xl:max-w-none">

          {/* Introduction */}
          <DocH1 id="introduction">DagOS Documentation</DocH1>
          <DocP>
            DagOS is a local AI workstation OS dashboard — a full command center for managing,
            running, and chatting with AI models on your own hardware. No cloud, no subscriptions,
            no data leaving your machine. Everything runs through{" "}
            <DocCode>Ollama</DocCode> as the local inference runtime.
          </DocP>
          <DocCallout type="tip">
            DagOS v0.1 is in alpha. APIs and UI may change between releases.
          </DocCallout>

          {/* Download the App */}
          <DocH2 id="download">Download the App</DocH2>
          <DocP>
            DagOS is available as a native desktop application built with Electron. The desktop app
            wraps the full DagOS dashboard and launches directly into your workspace — no browser
            needed. It uses the same Supabase auth as the web version, so your account works
            everywhere.
          </DocP>
          <DocCallout type="tip">
            The desktop app is the recommended way to run DagOS. It opens straight into the
            dashboard and handles Ollama setup for you.
          </DocCallout>

          {/* Download cards */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* macOS */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <Apple className="h-4 w-4 text-zinc-400" />
                <span className="font-mono text-sm font-semibold text-zinc-200">macOS</span>
              </div>
              <p className="mb-4 font-mono text-[11px] text-zinc-600 leading-relaxed">
                macOS 13 Ventura or later. Apple Silicon and Intel both supported.
              </p>
              <a
                href="https://github.com/Martimic10/DagOS/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <Download className="h-3.5 w-3.5" />
                Download for macOS
                <ExternalLink className="h-3 w-3 text-zinc-600" />
              </a>
            </div>

            {/* Windows / Linux */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <Monitor className="h-4 w-4 text-zinc-400" />
                <span className="font-mono text-sm font-semibold text-zinc-200">
                  Windows &amp; Linux
                </span>
              </div>
              <p className="mb-4 font-mono text-[11px] text-zinc-600 leading-relaxed">
                Windows 10+ and Ubuntu 22+. Builds coming soon in v0.2.
              </p>
              <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2 font-mono text-xs text-zinc-600">
                Coming in v0.2
              </span>
            </div>
          </div>

          <DocCallout type="info">
            Releases are published on{" "}
            <a
              href="https://github.com/Martimic10/DagOS/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-zinc-300 transition-colors"
            >
              GitHub Releases
            </a>
            . DagOS is currently in alpha — expect frequent updates.
          </DocCallout>

          <DocP>
            After downloading, open the <DocCode>.dmg</DocCode> file, drag DagOS to your
            Applications folder, and launch it. The app will open directly into the dashboard. If
            Ollama isn&apos;t set up yet, you&apos;ll see the guided setup wizard.
          </DocP>

          {/* Prerequisites */}
          <DocH2 id="prerequisites">Prerequisites</DocH2>
          <DocP>Before running DagOS, you need the following installed on your machine:</DocP>
          <ul className="mb-5 space-y-2">
            {[
              ["Node.js 20+", "Required to run the Next.js app server"],
              ["npm or bun",  "Package manager for installing dependencies"],
              ["Ollama",      "Local model inference runtime (ollama.com)"],
              ["Git",         "To clone the repository"],
            ].map(([dep, desc]) => (
              <li key={dep} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span>
                  <DocCode>{dep}</DocCode>
                  <span className="ml-2 text-zinc-500">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <DocCallout type="warn">
            Ollama must be running on <DocCode>http://127.0.0.1:11434</DocCode> before DagOS can
            connect to it. DagOS does not start Ollama for you.
          </DocCallout>

          {/* Installation */}
          <DocH2 id="installation">Installation</DocH2>
          <DocP>Clone the repo and install dependencies:</DocP>
          <DocPre label="terminal — zsh">
{`git clone https://github.com/your-handle/dagos.git
cd dagos
npm install`}
          </DocPre>
          <DocP>Start the development server:</DocP>
          <DocPre label="terminal — zsh">
{`npm run dev`}
          </DocPre>
          <DocP>
            DagOS will be available at <DocCode>http://localhost:3000</DocCode>. The app shell lives at{" "}
            <DocCode>/app/dashboard</DocCode> and the landing page at <DocCode>/</DocCode>.
          </DocP>

          {/* First Run */}
          <DocH2 id="first-run">First Run</DocH2>
          <DocP>
            On first visit to the app, DagOS redirects you to <DocCode>/app/setup</DocCode> — the
            onboarding wizard. It verifies your Ollama runtime is reachable and walks you through
            pulling your first model. Once complete, it sets a flag in{" "}
            <DocCode>localStorage</DocCode> (<DocCode>dagos_onboarded = true</DocCode>) and
            redirects you to the dashboard.
          </DocP>
          <DocPre label="terminal — zsh">
{`# Start Ollama (if not already running)
ollama serve

# Pull a starter model (in a second terminal)
ollama pull llama3`}
          </DocPre>
          <DocCallout type="info">
            If Ollama is already running as a background service you don&apos;t need{" "}
            <DocCode>ollama serve</DocCode>. Check with{" "}
            <DocCode>curl http://127.0.0.1:11434/api/tags</DocCode>.
          </DocCallout>

          {/* Dashboard */}
          <DocH2 id="dashboard">Dashboard</DocH2>
          <DocP>
            The dashboard at <DocCode>/app/dashboard</DocCode> is the command center. It displays:
          </DocP>
          <ul className="mb-5 space-y-2 text-sm text-zinc-400">
            {[
              ["KPI Cards",         "Live counts of tokens/sec, active models, incidents, and memory"],
              ["Throughput Chart",   "Bar chart of inference throughput over time"],
              ["Running Models",     "List of currently loaded Ollama models"],
              ["Request Volume",     "Horizontal bar chart of requests by model"],
              ["Activity Table",     "Searchable log of recent inference events"],
              ["Runtime Pill",       "Live Ollama health indicator in the header"],
            ].map(([name, desc]) => (
              <li key={name} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><span className="font-mono text-zinc-300">{name}</span> — {desc}</span>
              </li>
            ))}
          </ul>
          <DocCallout type="info">
            Dashboard metrics in v0.1 use mock data for charts and the activity table. Live
            Ollama metrics (running models, health) are real.
          </DocCallout>

          {/* Chat Console */}
          <DocH2 id="chat-console">Chat Console</DocH2>
          <DocP>
            The chat interface at <DocCode>/app/chat</DocCode> gives you a full streaming chat
            session with any locally installed Ollama model. It has a three-column layout:
          </DocP>
          <ul className="mb-5 space-y-2 text-sm text-zinc-400">
            {[
              ["Left panel",   "Conversation list with per-chat history, stored in localStorage"],
              ["Center panel", "Streaming message window with token-by-token output"],
              ["Right panel",  "Session settings: model selector, temperature slider, system prompt"],
            ].map(([col, desc]) => (
              <li key={col} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><span className="font-mono text-zinc-300">{col}</span> — {desc}</span>
              </li>
            ))}
          </ul>
          <DocP>
            Conversations are persisted in <DocCode>localStorage</DocCode> under the key{" "}
            <DocCode>dagos_chats</DocCode>. The active session is stored in{" "}
            <DocCode>dagos_chat_session</DocCode>. Press <DocCode>Enter</DocCode> to send,{" "}
            <DocCode>Shift+Enter</DocCode> for a newline. A <strong>Stop</strong> button appears
            during streaming to cancel the generation mid-response.
          </DocP>

          {/* Model Manager */}
          <DocH2 id="model-manager">Model Manager</DocH2>
          <DocP>
            The model manager at <DocCode>/app/models</DocCode> lists every model installed in your
            Ollama runtime. For each model you can:
          </DocP>
          <ul className="mb-5 space-y-2 text-sm text-zinc-400">
            {[
              ["Run",    "Send a test prompt to warm up the model and confirm it loads correctly"],
              ["Delete", "Remove the model from Ollama (permanent — re-pull to restore)"],
            ].map(([action, desc]) => (
              <li key={action} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><DocCode>{action}</DocCode> — {desc}</span>
              </li>
            ))}
          </ul>
          <DocP>
            To install new models, use the Ollama CLI directly:
          </DocP>
          <DocPre label="terminal — zsh">
{`ollama pull mistral
ollama pull codellama
ollama pull deepseek-coder`}
          </DocPre>

          {/* Setup Wizard */}
          <DocH2 id="setup-wizard">Setup Wizard</DocH2>
          <DocP>
            The setup wizard at <DocCode>/app/setup</DocCode> is shown once on first launch. It
            walks through three steps:
          </DocP>
          <ol className="mb-5 space-y-2 text-sm text-zinc-400 list-none">
            {[
              ["1", "Install Ollama",     "Download and install the Ollama runtime"],
              ["2", "Check Runtime",      "Verify Ollama is reachable at 127.0.0.1:11434"],
              ["3", "Continue",           "Mark onboarding complete and open the dashboard"],
            ].map(([n, step, desc]) => (
              <li key={n} className="flex items-start gap-3">
                <span className="font-mono text-xs text-zinc-600 mt-0.5 w-4 shrink-0">{n}.</span>
                <span><span className="font-mono text-zinc-300">{step}</span> — {desc}</span>
              </li>
            ))}
          </ol>
          <DocCallout type="tip">
            To re-run setup, clear <DocCode>localStorage</DocCode> in your browser DevTools and
            navigate to <DocCode>/app/setup</DocCode> directly.
          </DocCallout>

          {/* Ollama Runtime */}
          <DocH2 id="ollama-runtime">Ollama Runtime</DocH2>
          <DocP>
            DagOS expects Ollama to be running at <DocCode>http://127.0.0.1:11434</DocCode>. All
            model operations proxy through Next.js API routes to avoid CORS issues:
          </DocP>
          <DocPre label="architecture">
{`Browser → Next.js API route → Ollama (127.0.0.1:11434)
                ↑
         Server-side only
         (no CORS issues)`}
          </DocPre>
          <DocP>
            You can change the Ollama host by editing the base URL in the API route files under{" "}
            <DocCode>app/api/ollama/</DocCode>. Future versions will expose this as a config option
            in the settings page.
          </DocP>

          {/* Model Settings */}
          <DocH2 id="model-settings">Model Settings</DocH2>
          <DocP>
            Per-conversation model settings are stored alongside chat history in{" "}
            <DocCode>localStorage</DocCode>. Each conversation tracks:
          </DocP>
          <ul className="mb-5 space-y-2 text-sm text-zinc-400">
            {[
              ["model",        "The Ollama model name (e.g. llama3, mistral)"],
              ["temperature",  "Sampling temperature 0.0–1.0 (default 0.7)"],
              ["systemPrompt", "Optional system message injected before every turn"],
            ].map(([key, desc]) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                <span><DocCode>{key}</DocCode> — {desc}</span>
              </li>
            ))}
          </ul>

          {/* System Requirements */}
          <DocH2 id="system-requirements">System Requirements</DocH2>
          <div className="mb-5 overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full min-w-100 text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  {["Component", "Minimum", "Recommended"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  ["RAM",  "8 GB",          "16–32 GB"],
                  ["CPU",  "4 cores",        "8+ cores"],
                  ["GPU",  "Optional",       "NVIDIA 8GB+ VRAM for GPU inference"],
                  ["Disk", "10 GB free",     "50 GB+ for multiple large models"],
                  ["OS",   "macOS / Linux",  "macOS 13+ or Ubuntu 22+"],
                ].map(([c, min, rec]) => (
                  <tr key={c} className="text-zinc-400">
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{c}</td>
                    <td className="px-4 py-2.5 text-xs">{min}</td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500">{rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Health API */}
          <DocH2 id="health-api">Health Check API</DocH2>
          <DocP>Check whether the Ollama runtime is reachable from the DagOS server.</DocP>
          <ApiRow method="GET" path="/api/ollama/health" desc="Returns Ollama reachability status" />
          <DocP>Response:</DocP>
          <DocPre>
{`// Success
{ "ok": true }

// Failure
{ "ok": false, "error": "ECONNREFUSED" }`}
          </DocPre>

          {/* Models API */}
          <DocH2 id="models-api">Models API</DocH2>
          <ApiRow method="GET"    path="/api/ollama/models" desc="List all installed models" />
          <ApiRow method="POST"   path="/api/ollama/run"    desc="Warm-start a model with a test prompt" />
          <ApiRow method="POST"   path="/api/ollama/delete" desc="Delete a model by name" />
          <DocP>Models list response:</DocP>
          <DocPre>
{`{
  "ok": true,
  "models": [
    {
      "name": "llama3:latest",
      "size": 4661211520,
      "modified_at": "2024-06-01T00:00:00Z"
    }
  ]
}`}
          </DocPre>
          <DocP>Delete request body:</DocP>
          <DocPre>
{`{ "name": "llama3:latest" }`}
          </DocPre>

          {/* Chat API */}
          <DocH2 id="chat-api">Chat API</DocH2>
          <ApiRow method="POST" path="/api/ollama/chat"        desc="Non-streaming single-turn response" />
          <ApiRow method="POST" path="/api/ollama/chat/stream" desc="Server-Sent Events streaming response" />
          <DocP>Request body (both endpoints):</DocP>
          <DocPre>
{`{
  "model": "llama3",
  "messages": [
    { "role": "system",    "content": "You are a helpful assistant." },
    { "role": "user",      "content": "What is Ollama?" },
    { "role": "assistant", "content": "Ollama is..." },
    { "role": "user",      "content": "Can I run it locally?" }
  ],
  "temperature": 0.7
}`}
          </DocPre>

          {/* Streaming API */}
          <DocH2 id="streaming-api">Streaming</DocH2>
          <DocP>
            The streaming endpoint returns <DocCode>text/event-stream</DocCode> (SSE). Each token
            is emitted as a <DocCode>data:</DocCode> event. A final{" "}
            <DocCode>event: done</DocCode> signals completion. Errors arrive as{" "}
            <DocCode>event: error</DocCode>.
          </DocP>
          <DocPre label="SSE event format">
{`data: Hello\n\n
data: , world\n\n
data: !\n\n
event: done
data: done\n\n`}
          </DocPre>
          <DocP>Example client-side consumption:</DocP>
          <DocPre label="browser">
{`const res = await fetch("/api/ollama/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model, messages, temperature }),
  signal: abortController.signal,
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  for (const line of chunk.split("\\n")) {
    if (line.startsWith("data: ")) {
      const token = line.slice(6);
      // append token to message...
    }
  }
}`}
          </DocPre>

          {/* Footer */}
          <div className="mt-16 border-t border-zinc-800/50 pt-8 pb-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="font-mono text-xs text-zinc-700">DagOS v0.1.0-alpha · Apache 2.0 License</p>
              <Link href="/" className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                <ArrowLeft className="h-3 w-3" />
                Back to home
              </Link>
            </div>
          </div>
        </main>

        {/* ── Desktop right TOC ── */}
        <aside className="hidden xl:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto py-8 px-5 border-l border-zinc-800/70 bg-zinc-950">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            On this page
          </p>
          <nav className="space-y-0.5">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "block w-full text-left py-1 font-mono text-xs transition-colors",
                  activeId === item.id
                    ? "text-zinc-200"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
