"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  Play,
  Trash2,
  Package,
  Loader2,
  Terminal,
  AlertCircle,
  Download,
  X,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { appendActivityEvent } from "@/lib/activity-log";
import type { OllamaModel, ModelsResponse } from "@/app/api/ollama/models/route";

// ─── Library catalogue ────────────────────────────────────────────────────────

type ModelCategory = "General" | "Coding" | "Lightweight";

interface LibraryModel {
  id: string;
  name: string;
  ollamaName: string;
  description: string;
  useCase: string;
  sizeLabel: string;
  category: ModelCategory;
  paramLabel: string;
}

const LIBRARY_MODELS: LibraryModel[] = [
  {
    id: "llama3",
    name: "Llama 3",
    ollamaName: "llama3",
    description: "Meta's flagship open model with strong reasoning, chat, and broad instruction following.",
    useCase: "General assistant · writing · analysis",
    sizeLabel: "~4.7 GB",
    category: "General",
    paramLabel: "8B",
  },
  {
    id: "mistral",
    name: "Mistral 7B",
    ollamaName: "mistral",
    description: "Fast, efficient open-source LLM from Mistral AI. Punches above its weight class.",
    useCase: "Chat · summarization · Q&A",
    sizeLabel: "~4.1 GB",
    category: "General",
    paramLabel: "7B",
  },
  {
    id: "gemma2",
    name: "Gemma 2",
    ollamaName: "gemma2",
    description: "Google's Gemma 2 — strong benchmark performance and clean instruction following.",
    useCase: "Instruction tasks · coding help · reasoning",
    sizeLabel: "~5.5 GB",
    category: "General",
    paramLabel: "9B",
  },
  {
    id: "qwen2.5",
    name: "Qwen 2.5",
    ollamaName: "qwen2.5",
    description: "Alibaba's multilingual powerhouse with strong multilingual and reasoning capabilities.",
    useCase: "Multilingual tasks · reasoning · tools",
    sizeLabel: "~4.4 GB",
    category: "General",
    paramLabel: "7B",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    ollamaName: "deepseek-coder",
    description: "Purpose-built for software engineering — code generation, debugging, and explanation.",
    useCase: "Code completion · debugging · review",
    sizeLabel: "~3.8 GB",
    category: "Coding",
    paramLabel: "6.7B",
  },
  {
    id: "codellama",
    name: "Code Llama",
    ollamaName: "codellama",
    description: "Meta's code-specialized Llama variant, fine-tuned on a massive code corpus.",
    useCase: "Code generation · infill · code chat",
    sizeLabel: "~3.8 GB",
    category: "Coding",
    paramLabel: "7B",
  },
  {
    id: "starcoder2",
    name: "StarCoder2",
    ollamaName: "starcoder2",
    description: "Trained on 600+ programming languages from The Stack v2. Polyglot by design.",
    useCase: "Polyglot coding · completion · docs",
    sizeLabel: "~3.8 GB",
    category: "Coding",
    paramLabel: "7B",
  },
  {
    id: "phi3",
    name: "Phi-3 Mini",
    ollamaName: "phi3",
    description: "Microsoft's surprisingly capable compact model. Great quality-per-GB ratio.",
    useCase: "Fast responses · edge devices · prototyping",
    sizeLabel: "~2.3 GB",
    category: "Lightweight",
    paramLabel: "3.8B",
  },
  {
    id: "tinyllama",
    name: "TinyLlama",
    ollamaName: "tinyllama",
    description: "1.1B parameter Llama variant. Ultra-fast with a near-zero memory footprint.",
    useCase: "Embedded use · rapid iteration · testing",
    sizeLabel: "~0.6 GB",
    category: "Lightweight",
    paramLabel: "1.1B",
  },
  {
    id: "llama3.2",
    name: "Llama 3.2",
    ollamaName: "llama3.2",
    description: "Meta's compact 3B Llama 3.2 — smaller footprint, still surprisingly capable.",
    useCase: "Lightweight assistant · on-device use",
    sizeLabel: "~2.0 GB",
    category: "Lightweight",
    paramLabel: "3B",
  },
];

const CATEGORIES: Array<ModelCategory | "All"> = ["All", "General", "Coding", "Lightweight"];

// ─── Types ───────────────────────────────────────────────────────────────────

type ModelActionStatus = "idle" | "running" | "run-ok" | "run-err" | "deleting";
type Tab = "featured" | "installed";

interface CardInstall {
  state: "idle" | "installing" | "error";
  statusText?: string;
  completed?: number;
  total?: number;
  errorMsg?: string;
}

interface ModelRow extends OllamaModel {
  actionStatus: ModelActionStatus;
  actionError?: string;
}

// ─── Custom Install Modal ────────────────────────────────────────────────────

function CustomInstallModal({ open, onClose, onInstalled }: {
  open: boolean;
  onClose: () => void;
  onInstalled: () => void;
}) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "downloading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  const handleInstall = useCallback(async () => {
    const name = input.trim();
    if (!name || state === "downloading") return;
    setState("downloading");
    setError(null);
    try {
      const res = await fetch("/api/ollama/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: name }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("success");
        appendActivityEvent({ route: "models", action: "model_install", model: name, status: "success" });
        onInstalled();
        setTimeout(onClose, 1800);
      } else {
        setState("error");
        setError(data.error ?? "Installation failed");
        appendActivityEvent({ route: "models", action: "model_install", model: name, status: "error" });
      }
    } catch {
      setState("error");
      setError("Could not reach Ollama. Is it running?");
      appendActivityEvent({ route: "models", action: "model_install", model: name, status: "error" });
    }
  }, [input, state, onClose, onInstalled]);

  const busy = state === "downloading";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 p-0 shadow-2xl sm:max-w-md">
        <DialogHeader className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-mono text-sm font-semibold text-zinc-200">
              <Package className="h-4 w-4 text-zinc-500" />
              Custom Install
            </DialogTitle>
            <button
              onClick={onClose}
              disabled={busy}
              className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 py-5">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              Model Name
            </label>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); if (state !== "idle") { setState("idle"); setError(null); } }}
              onKeyDown={(e) => { if (e.key === "Enter") handleInstall(); if (e.key === "Escape") onClose(); }}
              disabled={busy}
              placeholder="e.g. llama3, mistral:7b, phi3:mini"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-zinc-700 focus:outline-none disabled:opacity-50"
            />
            <p className="font-mono text-[10px] text-zinc-700">
              Any model from <span className="text-zinc-500">ollama.com/library</span>
            </p>
          </div>

          {state === "downloading" && (
            <div className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-500" />
              <div>
                <p className="font-mono text-xs text-zinc-300">Downloading model…</p>
                <p className="font-mono text-[10px] text-zinc-600">This may take several minutes.</p>
              </div>
            </div>
          )}
          {state === "success" && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <p className="font-mono text-xs text-emerald-400">Model installed successfully!</p>
            </div>
          )}
          {state === "error" && error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500/80" />
              <p className="font-mono text-xs text-red-400/80">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={busy}
              className="h-8 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 disabled:opacity-40"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInstall}
              disabled={!input.trim() || busy || state === "success"}
              className="h-8 gap-1.5 border border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-40"
            >
              {busy
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Installing…</>
                : <><Download className="h-3.5 w-3.5" />Install</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Library card ─────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<ModelCategory, string> = {
  General:     "border-zinc-700/60 bg-zinc-800/40 text-zinc-400",
  Coding:      "border-zinc-700/50 bg-zinc-800/30 text-zinc-400",
  Lightweight: "border-zinc-700/50 bg-zinc-800/30 text-zinc-400",
};

function formatPullStatus(status?: string): string {
  if (!status) return "Preparing…";
  if (status === "pulling manifest") return "Fetching manifest…";
  if (status.startsWith("pulling")) return "Downloading…";
  if (status === "verifying sha256 digest") return "Verifying…";
  if (status === "writing manifest") return "Writing manifest…";
  if (status === "removing any unused layers") return "Cleaning up…";
  return status;
}

function LibraryCard({
  model,
  install,
  isInstalled,
  onInstall,
}: {
  model: LibraryModel;
  install: CardInstall;
  isInstalled: boolean;
  onInstall: () => void;
}) {
  const busy = install.state === "installing";
  const percent =
    install.total && install.total > 0
      ? Math.min(100, Math.round(((install.completed ?? 0) / install.total) * 100))
      : null;

  return (
    <div
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border bg-zinc-950/60 p-5 transition-colors",
        isInstalled
          ? "border-zinc-700/60 bg-zinc-900/30"
          : "border-zinc-800/70 hover:border-zinc-700/60 hover:bg-zinc-900/30"
      )}
    >
      {/* Top row: category + size */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
            CATEGORY_STYLES[model.category]
          )}
        >
          {model.category}
        </span>
        <span className="font-mono text-[10px] text-zinc-700">{model.sizeLabel}</span>
      </div>

      {/* Model name + param label */}
      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="font-mono text-sm font-semibold text-zinc-100">{model.name}</h3>
          <span className="font-mono text-[10px] text-zinc-600">{model.paramLabel}</span>
        </div>
        <p className="mt-1.5 font-mono text-xs leading-relaxed text-zinc-500">
          {model.description}
        </p>
      </div>

      {/* Use case */}
      <div className="mt-auto flex flex-col gap-3">
        <p className="font-mono text-[10px] text-zinc-700">
          {model.useCase}
        </p>

        {/* Action */}
        {isInstalled ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded border border-zinc-700/50 bg-zinc-800/40 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              Installed
            </span>
          </div>
        ) : install.state === "error" ? (
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] text-red-500/70">
              {install.errorMsg ?? "Install failed."}
            </span>
            <button
              onClick={onInstall}
              className="font-mono text-[11px] text-zinc-500 underline underline-offset-2 hover:text-zinc-300 text-left"
            >
              Retry
            </button>
          </div>
        ) : busy ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-400">
                {formatPullStatus(install.statusText)}
              </span>
              {percent !== null && (
                <span className="font-mono text-[10px] text-zinc-600">{percent}%</span>
              )}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              {percent !== null ? (
                <div
                  className="h-full rounded-full bg-zinc-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              ) : (
                <div className="h-full w-1/3 animate-pulse rounded-full bg-zinc-600" />
              )}
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={onInstall}
            className="h-8 w-full gap-1.5 border border-zinc-700/60 bg-zinc-900/60 font-mono text-xs text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bytesToGB(bytes: number): string {
  if (bytes === 0) return "—";
  return (bytes / 1_073_741_824).toFixed(1) + " GB";
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

// ─── Status pill ─────────────────────────────────────────────────────────────

function ModelPill({ status }: { status: ModelActionStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />Running
      </span>
    );
  }
  if (status === "run-ok") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Online
      </span>
    );
  }
  if (status === "run-err") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-zinc-800/60 bg-zinc-900/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-red-500/80">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500/70" />Error
      </span>
    );
  }
  if (status === "deleting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-zinc-800/60 bg-zinc-900/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />Deleting
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />Installed
    </span>
  );
}

// ─── Empty / error states ────────────────────────────────────────────────────

function EmptyInstalled({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <Package className="h-5 w-5 text-zinc-600" />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm font-medium text-zinc-400">No models installed</p>
        <p className="mt-1 font-mono text-xs text-zinc-700">Install one from the library or use the terminal</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button
          size="sm"
          onClick={onSwitch}
          className="h-8 gap-1.5 border border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600"
        >
          Browse Library
        </Button>
        <div className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950/80">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-950 px-4 py-2">
            <Terminal className="h-3 w-3 text-zinc-600" />
            <span className="font-mono text-[10px] text-zinc-600">or use terminal</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="font-mono text-xs text-zinc-700">$</span>
            <code className="font-mono text-sm text-zinc-300">ollama pull llama3</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <AlertCircle className="h-5 w-5 text-zinc-600" />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm font-medium text-zinc-400">Could not connect to Ollama</p>
        <p className="mt-1 font-mono text-xs text-zinc-700">{message}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRetry}
        className="h-8 gap-2 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700"
      >
        <RefreshCw className="h-3.5 w-3.5" />Retry
      </Button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ModelsPage() {
  const [models, setModels]       = useState<ModelRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Custom install modal
  const [customOpen, setCustomOpen] = useState(false);
  const [customKey, setCustomKey]   = useState(0);

  // Library card install states
  const [cardStates, setCardStates] = useState<Record<string, CardInstall>>({});

  // Tab + filters
  const [activeTab, setActiveTab]       = useState<Tab>("featured");
  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState<ModelCategory | "All">("All");

  // ── Fetch installed models ──────────────────────────────────────────────────
  const fetchModels = useCallback(async (showSpinner = true) => {
    if (showSpinner) setRefreshing(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/ollama/models");
      const data: ModelsResponse = await res.json();
      if (data.ok) {
        setModels((prev) => {
          const statusMap = new Map(prev.map((m) => [m.name, m.actionStatus]));
          return data.models.map((m) => ({
            ...m,
            actionStatus: statusMap.get(m.name) ?? "idle",
          }));
        });
      } else {
        setFetchError(data.error);
      }
    } catch {
      setFetchError("Failed to reach /api/ollama/models");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchModels(false); }, [fetchModels]);

  // ── Derive which library models are installed ───────────────────────────────
  const installedNames = new Set(models.map((m) => m.name));
  function isLibraryModelInstalled(ollamaName: string): boolean {
    return installedNames.has(ollamaName) ||
      [...installedNames].some((n) => n === ollamaName || n.startsWith(ollamaName + ":"));
  }

  // ── Library card install (SSE streaming) ────────────────────────────────────
  const handleCardInstall = useCallback(async (ollamaName: string) => {
    const set = (patch: Partial<CardInstall>) =>
      setCardStates((prev) => ({ ...prev, [ollamaName]: { ...prev[ollamaName], state: "installing", ...patch } }));

    set({ state: "installing", statusText: undefined, completed: undefined, total: undefined });

    try {
      const res = await fetch("/api/ollama/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: ollamaName }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              ok: boolean;
              status?: string;
              completed?: number;
              total?: number;
              error?: string;
            };

            if (!event.ok) {
              setCardStates((prev) => ({
                ...prev,
                [ollamaName]: { state: "error", errorMsg: event.error ?? "Install failed" },
              }));
              appendActivityEvent({ route: "models", action: "model_install", model: ollamaName, status: "error" });
              return;
            }

            if (event.status === "success") {
              setCardStates((prev) => { const n = { ...prev }; delete n[ollamaName]; return n; });
              appendActivityEvent({ route: "models", action: "model_install", model: ollamaName, status: "success" });
              fetchModels(false);
              return;
            }

            set({
              state: "installing",
              statusText: event.status,
              completed: event.completed,
              total: event.total,
            });
          } catch { /* malformed line */ }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setCardStates((prev) => ({ ...prev, [ollamaName]: { state: "error", errorMsg: msg } }));
      appendActivityEvent({ route: "models", action: "model_install", model: ollamaName, status: "error" });
    }
  }, [fetchModels]);

  // ── Installed table actions ─────────────────────────────────────────────────
  const handleRun = useCallback(async (name: string) => {
    setModels((prev) =>
      prev.map((m) => m.name === name ? { ...m, actionStatus: "running", actionError: undefined } : m)
    );
    try {
      const res = await fetch("/api/ollama/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: name }),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      setModels((prev) =>
        prev.map((m) =>
          m.name === name
            ? { ...m, actionStatus: data.ok ? "run-ok" : "run-err", actionError: data.ok ? undefined : data.error }
            : m
        )
      );
      appendActivityEvent({ route: "models", action: "model_run", model: name, status: data.ok ? "success" : "error" });
      setTimeout(() => {
        setModels((prev) =>
          prev.map((m) => m.name === name ? { ...m, actionStatus: "idle", actionError: undefined } : m)
        );
      }, 4000);
    } catch {
      setModels((prev) =>
        prev.map((m) => m.name === name ? { ...m, actionStatus: "run-err", actionError: "Request failed" } : m)
      );
    }
  }, []);

  const handleDelete = useCallback(async (name: string) => {
    setModels((prev) =>
      prev.map((m) => m.name === name ? { ...m, actionStatus: "deleting" } : m)
    );
    try {
      const res = await fetch("/api/ollama/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (data.ok) {
        setModels((prev) => prev.filter((m) => m.name !== name));
        fetchModels(false);
        appendActivityEvent({ route: "models", action: "model_delete", model: name, status: "success" });
      } else {
        setModels((prev) =>
          prev.map((m) =>
            m.name === name ? { ...m, actionStatus: "run-err", actionError: data.error } : m
          )
        );
        appendActivityEvent({ route: "models", action: "model_delete", model: name, status: "error" });
      }
    } catch {
      setModels((prev) =>
        prev.map((m) => m.name === name ? { ...m, actionStatus: "run-err", actionError: "Request failed" } : m)
      );
    }
  }, [fetchModels]);

  // ── Filtered library models ─────────────────────────────────────────────────
  const filteredLibrary = LIBRARY_MODELS.filter((m) => {
    const matchesCategory = activeCategory === "All" || m.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.ollamaName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <CustomInstallModal
        key={customKey}
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onInstalled={() => fetchModels(false)}
      />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold text-zinc-100">Model Library</h1>
          <p className="font-mono text-xs text-zinc-600">
            Browse, install, and manage local models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchModels(true)}
            disabled={refreshing || loading}
            className="h-8 gap-2 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700 disabled:opacity-40"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => { setCustomKey((k) => k + 1); setCustomOpen(true); }}
            className="h-8 gap-1.5 border border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600"
          >
            <Download className="h-3.5 w-3.5" />
            Custom Install
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Segmented tabs */}
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-1 w-fit">
          {(["featured", "installed"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-4 py-1.5 font-mono text-xs capitalize transition-colors",
                activeTab === tab
                  ? "bg-zinc-800 text-zinc-200 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              {tab}
              {tab === "installed" && models.length > 0 && (
                <span className="ml-2 rounded-full border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
                  {models.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + category — only on featured tab */}
        {activeTab === "featured" && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
              <Input
                placeholder="Search models…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 border-zinc-800 bg-zinc-900/60 pl-8 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors",
                    activeCategory === cat
                      ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                      : "border-zinc-800 bg-transparent text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Featured tab ─────────────────────────────────────────────────────── */}
      {activeTab === "featured" && (
        <>
          {filteredLibrary.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <p className="font-mono text-sm text-zinc-500">No models match your search.</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                className="font-mono text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLibrary.map((model) => (
                <LibraryCard
                  key={model.id}
                  model={model}
                  install={cardStates[model.ollamaName] ?? { state: "idle" }}
                  isInstalled={isLibraryModelInstalled(model.ollamaName)}
                  onInstall={() => handleCardInstall(model.ollamaName)}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          <p className="font-mono text-[10px] text-zinc-700">
            {filteredLibrary.length} model{filteredLibrary.length !== 1 ? "s" : ""} shown
            {activeCategory !== "All" && ` · ${activeCategory}`}
            {search && ` · "${search}"`}
          </p>
        </>
      )}

      {/* ── Installed tab ────────────────────────────────────────────────────── */}
      {activeTab === "installed" && (
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3.5">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Installed Models
              </p>
              <p className="font-mono text-[10px] text-zinc-700">
                Sourced from Ollama · localhost:11434
              </p>
            </div>
            {models.length > 0 && (
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                {models.length} total
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
              <span className="font-mono text-xs text-zinc-600">Fetching models…</span>
            </div>
          ) : fetchError ? (
            <ErrorState message={fetchError} onRetry={() => fetchModels(false)} />
          ) : models.length === 0 ? (
            <EmptyInstalled onSwitch={() => setActiveTab("featured")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/60 hover:bg-transparent">
                  <TableHead className="pl-5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Name</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Size</TableHead>
                  <TableHead className="hidden font-mono text-[10px] uppercase tracking-wider text-zinc-600 md:table-cell">Last Modified</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Status</TableHead>
                  <TableHead className="pr-5 text-right font-mono text-[10px] uppercase tracking-wider text-zinc-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => {
                  const busy = model.actionStatus === "running" || model.actionStatus === "deleting";
                  return (
                    <TableRow
                      key={model.name}
                      className={cn(
                        "border-zinc-800/40 transition-colors",
                        busy ? "opacity-60" : "hover:bg-zinc-900/30"
                      )}
                    >
                      <TableCell className="pl-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-sm font-medium text-zinc-200">{model.name}</span>
                          {model.actionError && (
                            <span className="font-mono text-[10px] text-red-500/70">{model.actionError}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {bytesToGB(model.size)}
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-zinc-600 md:table-cell">
                        {formatDate(model.modified_at)}
                      </TableCell>
                      <TableCell>
                        <ModelPill status={model.actionStatus} />
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRun(model.name)}
                            disabled={busy}
                            className="h-7 gap-1.5 border border-zinc-800 bg-transparent px-2.5 font-mono text-[11px] text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300 hover:border-zinc-700 disabled:pointer-events-none disabled:opacity-40"
                          >
                            {model.actionStatus === "running"
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Play className="h-3 w-3" />}
                            Run
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(model.name)}
                            disabled={busy}
                            className="h-7 gap-1.5 border border-zinc-800/60 bg-transparent px-2.5 font-mono text-[11px] text-zinc-600 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/60 disabled:pointer-events-none disabled:opacity-40"
                          >
                            {model.actionStatus === "deleting"
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
