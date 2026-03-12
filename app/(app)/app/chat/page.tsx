"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import hljsHtml       from "highlight.js/lib/languages/xml";
import hljsCss        from "highlight.js/lib/languages/css";
import hljsJs         from "highlight.js/lib/languages/javascript";
import hljsTs         from "highlight.js/lib/languages/typescript";
import hljsPy         from "highlight.js/lib/languages/python";
import hljsBash       from "highlight.js/lib/languages/bash";
import hljsJson       from "highlight.js/lib/languages/json";
import hljsRust       from "highlight.js/lib/languages/rust";
import hljsGo         from "highlight.js/lib/languages/go";
import hljsMarkdown   from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("html",       hljsHtml);
hljs.registerLanguage("xml",        hljsHtml);
hljs.registerLanguage("css",        hljsCss);
hljs.registerLanguage("javascript", hljsJs);
hljs.registerLanguage("js",         hljsJs);
hljs.registerLanguage("typescript", hljsTs);
hljs.registerLanguage("ts",         hljsTs);
hljs.registerLanguage("tsx",        hljsTs);
hljs.registerLanguage("jsx",        hljsJs);
hljs.registerLanguage("python",     hljsPy);
hljs.registerLanguage("py",         hljsPy);
hljs.registerLanguage("bash",       hljsBash);
hljs.registerLanguage("sh",         hljsBash);
hljs.registerLanguage("shell",      hljsBash);
hljs.registerLanguage("json",       hljsJson);
hljs.registerLanguage("rust",       hljsRust);
hljs.registerLanguage("go",         hljsGo);
hljs.registerLanguage("markdown",   hljsMarkdown);
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  RotateCcw,
  ChevronDown,
  Square,
  Pencil,
  Check,
  X,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { appendActivityEvent } from "@/lib/activity-log";
import type { OllamaModel } from "@/app/api/ollama/models/route";
import type { ChatMessage } from "@/app/api/ollama/chat/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
  temperature: number;
  systemPrompt: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const CONVS_KEY    = "dagos_conversations";
const LEGACY_KEY   = "dagos_chats";
const SESSION_KEY  = "dagos_chat_session";

function loadConversations(): Conversation[] {
  try {
    // Try primary key, fall back to legacy
    const raw = localStorage.getItem(CONVS_KEY) ?? localStorage.getItem(LEGACY_KEY) ?? "[]";
    const parsed: Conversation[] = JSON.parse(raw);
    // Backfill updatedAt for legacy entries that lack it
    return parsed.map((c) => ({ ...c, updatedAt: c.updatedAt ?? c.createdAt ?? Date.now() }));
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(CONVS_KEY, JSON.stringify(convs));
}

function loadSession(): { activeId: string | null } {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}"); }
  catch { return { activeId: null }; }
}

function saveSession(activeId: string | null) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ activeId }));
}

function newConversation(model: string): Conversation {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
    model,
    temperature: 0.7,
    systemPrompt: "",
  };
}

function titleFromFirst(content: string): string {
  const t = content.trim().replace(/\s+/g, " ").slice(0, 40);
  return t.length > 0 ? (content.trim().length > 40 ? t + "…" : t) : "New Chat";
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000)      return "Just now";
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Content parsing ──────────────────────────────────────────────────────────

interface Segment {
  type: "text" | "code";
  content: string;
  lang?: string;
}

function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = raw;

  while (remaining.length > 0) {
    const fenceStart = remaining.indexOf("```");
    if (fenceStart === -1) {
      if (remaining) segments.push({ type: "text", content: remaining });
      break;
    }
    if (fenceStart > 0) {
      segments.push({ type: "text", content: remaining.slice(0, fenceStart) });
    }
    const afterFence = remaining.slice(fenceStart + 3);
    const nlPos = afterFence.indexOf("\n");
    const lang = nlPos === -1 ? afterFence.trim() : afterFence.slice(0, nlPos).trim();
    const codeBody = nlPos === -1 ? "" : afterFence.slice(nlPos + 1);
    const closePos = codeBody.indexOf("```");
    if (closePos === -1) {
      // Streaming: incomplete code block
      segments.push({ type: "code", lang, content: codeBody });
      break;
    }
    segments.push({ type: "code", lang, content: codeBody.slice(0, closePos).replace(/\n$/, "") });
    remaining = codeBody.slice(closePos + 3);
  }

  return segments;
}

function renderInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) result.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      result.push(
        <code key={m.index} className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-200">
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      result.push(<strong key={m.index} className="font-semibold text-zinc-100">{tok.slice(2, -2)}</strong>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) result.push(text.slice(last));
  return result;
}

function TextSegment({ text }: { text: string }) {
  const paras = text.split(/\n{2,}/).filter((p) => p.trim());
  if (!paras.length) return null;
  return (
    <>
      {paras.map((para, i) => (
        <p key={i} className={cn("leading-relaxed", i > 0 && "mt-2.5")}>
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>
              {renderInline(line)}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    if (!code.trim()) return code;
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [code, lang]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [code]);

  return (
    <div className="my-2.5 overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-950 first:mt-0 last:mb-0">
      <div className="flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900/60 px-3.5 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          {copied ? (
            <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
          ) : (
            <><Copy className="h-3 w-3" />Copy</>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, streaming }: { msg: ChatMessage; streaming?: boolean }) {
  const isUser = msg.role === "user";
  const segments = useMemo(() => parseSegments(msg.content), [msg.content]);
  const lastType = segments[segments.length - 1]?.type ?? "text";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[78%] rounded-lg bg-zinc-700 px-4 py-2.5 text-sm leading-relaxed text-zinc-100">
          <span className="whitespace-pre-wrap break-words">{msg.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div
        className={cn(
          "max-w-[85%] rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300",
          streaming && "border-zinc-700"
        )}
      >
        {segments.map((seg, i) =>
          seg.type === "code" ? (
            <CodeBlock key={i} lang={seg.lang ?? ""} code={seg.content} />
          ) : (
            <TextSegment key={i} text={seg.content} />
          )
        )}
        {streaming && (
          <span
            className={cn(
              "inline-block h-3.5 w-0.5 animate-pulse bg-zinc-400 align-middle",
              lastType === "text" ? "ml-0.5" : "ml-1 mt-1"
            )}
          />
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex gap-1.5 items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function ModelSelect({
  models,
  value,
  onChange,
}: {
  models: OllamaModel[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 pr-8 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
      >
        {models.length === 0 && <option value="">No models installed</option>}
        {models.map((m) => (
          <option key={m.name} value={m.name}>{m.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvItem({
  conv,
  active,
  streaming,
  renamingId,
  onSelect,
  onDelete,
  onRenameStart,
  onRenameCommit,
  onRenameCancel,
}: {
  conv: Conversation;
  active: boolean;
  streaming: boolean;
  renamingId: string | null;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onRenameStart: () => void;
  onRenameCommit: (title: string) => void;
  onRenameCancel: () => void;
}) {
  const isRenaming = renamingId === conv.id;
  const [draft, setDraft] = useState(conv.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const wasRenamingRef = useRef(false);
  useEffect(() => {
    const started = isRenaming && !wasRenamingRef.current;
    wasRenamingRef.current = isRenaming;
    if (!started) return;
    setTimeout(() => {
      setDraft(conv.title);
      inputRef.current?.select();
    }, 0);
  }, [isRenaming, conv.title]);

  function commit() {
    const t = draft.trim();
    onRenameCommit(t || conv.title);
  }

  if (isRenaming) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")  { e.preventDefault(); commit(); }
            if (e.key === "Escape") { e.preventDefault(); onRenameCancel(); }
          }}
          onBlur={commit}
          className="flex-1 min-w-0 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); commit(); }}
          className="shrink-0 text-zinc-500 hover:text-zinc-200"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); onRenameCancel(); }}
          className="shrink-0 text-zinc-600 hover:text-zinc-400"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={cn(
        "group relative flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors cursor-pointer",
        active
          ? "bg-zinc-800/70"
          : "hover:bg-zinc-900/60"
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-zinc-500" />
      )}

      {/* Title row */}
      <div className="flex items-center gap-1.5 pr-12">
        <span
          className={cn(
            "flex-1 truncate font-mono text-xs font-medium",
            active ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
          )}
        >
          {conv.title}
        </span>
        {streaming && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500 animate-pulse" />
        )}
      </div>

      {/* Timestamp */}
      <span className="font-mono text-[10px] text-zinc-700">
        {relativeTime(conv.updatedAt)}
      </span>

      {/* Hover actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onRenameStart(); }}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          title="Rename"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e); }}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [convs, setConvs]           = useState<Conversation[]>([]);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [models, setModels]         = useState<OllamaModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [streaming, setStreaming]   = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [input, setInput]           = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const scrollAreaRef    = useRef<HTMLDivElement>(null);
  const bottomRef        = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLTextAreaElement>(null);
  const abortRef         = useRef<AbortController | null>(null);
  const userScrolledUp   = useRef(false);
  const persistTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs to avoid stale closures in async stream loops
  const convsRef    = useRef(convs);
  convsRef.current  = convs;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const active            = convs.find((c) => c.id === activeId) ?? null;
  const isStreamingActive = streaming && streamingId === activeId;

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored  = loadConversations();
    const session = loadSession();
    setConvs(stored);
    if (session.activeId && stored.find((c) => c.id === session.activeId)) {
      setActiveId(session.activeId);
    } else if (stored.length > 0) {
      setActiveId(stored[0].id);
    }
  }, []);

  // ── Fetch models ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/ollama/models")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setModels(d.models); })
      .finally(() => setModelsLoading(false));
  }, []);

  // ── Scroll tracking ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const onScroll = () => {
      userScrolledUp.current = el.scrollHeight - el.scrollTop - el.clientHeight > 60;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (force || !userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [active?.messages.length, scrollToBottom]);

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persist = useCallback((next: Conversation[]) => {
    setConvs(next);
    saveConversations(next);
  }, []);

  // Throttled persist during streaming (max once per 300 ms)
  const throttledPersist = useCallback((next: Conversation[]) => {
    setConvs(next);
    if (persistTimerRef.current) return;
    persistTimerRef.current = setTimeout(() => {
      saveConversations(convsRef.current);
      persistTimerRef.current = null;
    }, 300);
  }, []);

  // ── Conversation actions ──────────────────────────────────────────────────
  const selectConv = useCallback((id: string) => {
    setActiveId(id);
    saveSession(id);
    userScrolledUp.current = false;
    setRenamingId(null);
  }, []);

  const handleNewChat = useCallback(() => {
    const model = models[0]?.name ?? "";
    const conv  = newConversation(model);
    const next  = [conv, ...convsRef.current];
    persist(next);
    selectConv(conv.id);
    setInput("");
  }, [models, persist, selectConv]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = convsRef.current.filter((c) => c.id !== id);
    persist(next);
    if (activeIdRef.current === id) {
      const newActive = next[0]?.id ?? null;
      setActiveId(newActive);
      saveSession(newActive);
    }
    if (renamingId === id) setRenamingId(null);
  }, [persist, renamingId]);

  const handleRenameCommit = useCallback((id: string, title: string) => {
    const next = convsRef.current.map((c) =>
      c.id === id ? { ...c, title: title || c.title } : c
    );
    persist(next);
    setRenamingId(null);
  }, [persist]);

  const updateActive = useCallback((patch: Partial<Conversation>) => {
    const next = convsRef.current.map((c) =>
      c.id === activeIdRef.current ? { ...c, ...patch } : c
    );
    persist(next);
  }, [persist]);

  const handleReset = useCallback(() => {
    updateActive({ messages: [], title: "New Chat", updatedAt: Date.now() });
    setInput("");
  }, [updateActive]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── Send (streaming) ──────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const currentConv = convsRef.current.find((c) => c.id === activeIdRef.current);
    if (!currentConv || !input.trim() || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const payload: ChatMessage[] = currentConv.systemPrompt.trim()
      ? [{ role: "system", content: currentConv.systemPrompt.trim() }, ...currentConv.messages, userMsg]
      : [...currentConv.messages, userMsg];

    const messagesWithUser = [...currentConv.messages, userMsg];
    const newTitle = currentConv.messages.length === 0
      ? titleFromFirst(userMsg.content)
      : currentConv.title;
    const now = Date.now();

    const afterUser = convsRef.current.map((c) =>
      c.id === activeIdRef.current
        ? { ...c, messages: messagesWithUser, title: newTitle, updatedAt: now }
        : c
    );
    persist(afterUser);
    setInput("");
    setStreaming(true);
    setStreamingId(activeIdRef.current);
    userScrolledUp.current = false;
    scrollToBottom(true);

    const abort = new AbortController();
    abortRef.current = abort;
    const startedAt = Date.now();

    // Placeholder assistant message
    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    throttledPersist(
      afterUser.map((c) =>
        c.id === activeIdRef.current
          ? { ...c, messages: [...messagesWithUser, assistantMsg] }
          : c
      )
    );

    try {
      const res = await fetch("/api/ollama/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: currentConv.model,
          messages: payload,
          temperature: currentConv.temperature,
        }),
        signal: abort.signal,
      });

      if (!res.body) throw new Error("No response body");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            accumulated += line.slice(6);
            throttledPersist(
              convsRef.current.map((c) => {
                if (c.id !== activeIdRef.current) return c;
                const msgs = [...c.messages];
                msgs[msgs.length - 1] = { role: "assistant", content: accumulated };
                return { ...c, messages: msgs };
              })
            );
            scrollToBottom();
          }
        }
      }

      // Final flush
      const finalNow = Date.now();
      persist(
        convsRef.current.map((c) => {
          if (c.id !== activeIdRef.current) return c;
          const msgs = [...c.messages];
          if (msgs[msgs.length - 1]?.role === "assistant") {
            msgs[msgs.length - 1] = { role: "assistant", content: accumulated || "(no response)" };
          }
          return { ...c, messages: msgs, updatedAt: finalNow };
        })
      );

      appendActivityEvent({
        route: "chat",
        action: "chat_request",
        model: currentConv.model,
        latencyMs: Date.now() - startedAt,
        status: "success",
        promptLength: userMsg.content.length,
        responseLength: accumulated.length,
      });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        persist(
          convsRef.current.map((c) => {
            if (c.id !== activeIdRef.current) return c;
            const msgs = [...c.messages];
            if (msgs[msgs.length - 1]?.role === "assistant" && msgs[msgs.length - 1].content === "") {
              msgs[msgs.length - 1] = { role: "assistant", content: "(stopped)" };
            }
            return { ...c, messages: msgs };
          })
        );
      } else {
        const errContent = `Error: ${(err as Error)?.message ?? "Unknown error"}`;
        persist(
          convsRef.current.map((c) => {
            if (c.id !== activeIdRef.current) return c;
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = { role: "assistant", content: errContent };
            return { ...c, messages: msgs };
          })
        );
        appendActivityEvent({
          route: "chat",
          action: "chat_request",
          model: currentConv.model,
          latencyMs: Date.now() - startedAt,
          status: "error",
          promptLength: userMsg.content.length,
        });
      }
    } finally {
      setStreaming(false);
      setStreamingId(null);
      abortRef.current = null;
      scrollToBottom(true);
      inputRef.current?.focus();
    }
  }, [input, streaming, persist, throttledPersist, scrollToBottom]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-3.5rem-48px)] gap-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">

      {/* LEFT: Conversation sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">

        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-600" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Conversations
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            onClick={handleNewChat}
            title="New conversation"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                <MessageSquare className="h-4 w-4 text-zinc-600" />
              </div>
              <p className="text-center font-mono text-xs text-zinc-600 leading-relaxed">
                No conversations yet.
                <br />
                <button
                  onClick={handleNewChat}
                  className="mt-1 inline-block text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
                >
                  Start one
                </button>
              </p>
            </div>
          ) : (
            <div className="py-1">
              {convs.map((c) => (
                <ConvItem
                  key={c.id}
                  conv={c}
                  active={c.id === activeId}
                  streaming={streaming && streamingId === c.id}
                  renamingId={renamingId}
                  onSelect={() => selectConv(c.id)}
                  onDelete={(e) => handleDelete(c.id, e)}
                  onRenameStart={() => setRenamingId(c.id)}
                  onRenameCommit={(title) => handleRenameCommit(c.id, title)}
                  onRenameCancel={() => setRenamingId(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-zinc-800 px-3 py-2.5">
          <p className="font-mono text-[10px] text-zinc-700">
            {convs.length} conversation{convs.length !== 1 ? "s" : ""} · auto-saved
          </p>
        </div>
      </aside>

      {/* CENTER: Chat window */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-200">
              {active?.title ?? "Chat Console"}
            </p>
            {active && (
              <p className="flex items-center gap-1.5 text-xs text-zinc-600">
                {active.model || "No model selected"}
                {isStreamingActive && (
                  <span className="flex items-center gap-1 text-zinc-500">
                    <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse" />
                    Streaming…
                  </span>
                )}
              </p>
            )}
          </div>
          {active && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-3 h-7 shrink-0 gap-1.5 text-xs text-zinc-500 hover:text-zinc-200"
              onClick={handleReset}
              disabled={streaming}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-4">
          {!active ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <MessageSquare className="h-10 w-10 text-zinc-800" />
              <p className="text-sm text-zinc-600">Select a conversation or create a new one.</p>
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
                onClick={handleNewChat}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Chat
              </Button>
            </div>
          ) : models.length === 0 && !modelsLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-4 font-mono text-xs text-zinc-500">
                <p className="mb-1 text-zinc-600">No models installed. Run:</p>
                <p className="text-zinc-300">ollama pull llama3</p>
              </div>
            </div>
          ) : active.messages.length === 0 && !streaming ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <MessageSquare className="h-8 w-8 text-zinc-800" />
              <p className="text-xs text-zinc-600">Send a message to start.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {active.messages.map((msg, i) => {
                const isLastAssistant =
                  i === active.messages.length - 1 && msg.role === "assistant";
                return (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    streaming={isStreamingActive && isLastAssistant}
                  />
                );
              })}
              {streaming &&
                streamingId === activeId &&
                active.messages[active.messages.length - 1]?.role !== "assistant" && (
                  <TypingIndicator />
                )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        {active && (
          <div className="border-t border-zinc-800 px-4 py-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  models.length === 0
                    ? "No models installed…"
                    : "Message… (Enter to send, Shift+Enter for newline)"
                }
                disabled={models.length === 0}
                rows={1}
                className="min-h-10 max-h-36 resize-none border-zinc-800 bg-zinc-900 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
              />
              {streaming ? (
                <Button
                  size="icon"
                  onClick={handleStop}
                  className="h-10 w-10 shrink-0 border border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
                  title="Stop generation"
                >
                  <Square className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  disabled={!input.trim() || models.length === 0}
                  onClick={handleSend}
                  className="h-10 w-10 shrink-0 bg-zinc-700 text-white hover:bg-zinc-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Session settings */}
      <aside className="flex w-60 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Session Settings
          </p>
        </div>

        {!active ? (
          <div className="px-4 py-6 text-center font-mono text-xs text-zinc-700">
            No active conversation.
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
            {/* Model */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Model
              </label>
              {modelsLoading ? (
                <div className="h-9 w-full animate-pulse rounded-md bg-zinc-800" />
              ) : (
                <ModelSelect
                  models={models}
                  value={active.model}
                  onChange={(v) => updateActive({ model: v })}
                />
              )}
            </div>

            {/* Temperature */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                  Temperature
                </label>
                <span className="font-mono text-xs text-zinc-400">
                  {active.temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={active.temperature}
                onChange={(e) => updateActive({ temperature: parseFloat(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-zinc-400"
              />
              <div className="flex justify-between font-mono text-[10px] text-zinc-700">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            {/* System prompt */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                System Prompt
              </label>
              <Textarea
                value={active.systemPrompt}
                onChange={(e) => updateActive({ systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant…"
                rows={5}
                disabled={streaming}
                className="resize-none border-zinc-800 bg-zinc-900 text-xs text-zinc-300 placeholder:text-zinc-700 focus-visible:ring-zinc-700"
              />
              <p className="font-mono text-[10px] text-zinc-700">
                Injected at the start of every message.
              </p>
            </div>

            {/* Conversation meta */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Info</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-600">Messages</span>
                <span className="font-mono text-[11px] text-zinc-400">{active.messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-600">Created</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {new Date(active.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-600">Updated</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {relativeTime(active.updatedAt)}
                </span>
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              size="sm"
              className="mt-auto w-full border-zinc-800 font-mono text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              onClick={handleReset}
              disabled={streaming}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset Chat
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
