"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Upload,
  FileText,
  FileCode,
  FileJson,
  Trash2,
  Send,
  Square,
  ChevronDown,
  AlertCircle,
  Loader2,
  File,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { OllamaModel } from "@/app/api/ollama/models/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  content: string;      // extracted text
  truncated: boolean;   // true if content was clipped for storage
  chunkCount: number;   // how many MAX_PROMPT-sized chunks the content spans
  uploadedAt: string;   // ISO
}

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  streaming: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILES_KEY = "dagos_files";
const MAX_STORE  = 200_000;  // chars kept in localStorage per file
const MAX_PROMPT = 8_000;    // chars passed as context to model

const ACCEPTED_EXTENSIONS = [
  ".pdf", ".txt", ".md", ".markdown",
  ".json", ".jsonc",
  ".js", ".jsx", ".mjs", ".cjs",
  ".ts", ".tsx",
  ".py", ".rb", ".go", ".rs", ".java", ".c", ".cpp", ".h", ".cs",
  ".css", ".html", ".xml", ".svg",
  ".yaml", ".yml", ".toml", ".ini", ".env", ".cfg", ".conf",
  ".sh", ".bash", ".zsh",
  ".sql",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFiles(): StoredFile[] {
  try { return JSON.parse(localStorage.getItem(FILES_KEY) ?? "[]"); }
  catch { return []; }
}

function saveFiles(files: StoredFile[]) {
  try { localStorage.setItem(FILES_KEY, JSON.stringify(files)); }
  catch (e) { console.warn("localStorage full — file not persisted:", e); }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1_048_576)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)      return "Just now";
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fileTypeLabel(mimeType: string, name: string): string {
  if (mimeType === "application/pdf")  return "PDF";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "Markdown";
  if (name.endsWith(".json") || name.endsWith(".jsonc"))  return "JSON";
  if (/\.(ts|tsx)$/.test(name)) return "TypeScript";
  if (/\.(js|jsx|mjs|cjs)$/.test(name)) return "JavaScript";
  if (name.endsWith(".py"))  return "Python";
  if (name.endsWith(".rs"))  return "Rust";
  if (name.endsWith(".go"))  return "Go";
  if (name.endsWith(".java")) return "Java";
  if (/\.(sh|bash|zsh)$/.test(name)) return "Shell";
  if (name.endsWith(".sql")) return "SQL";
  if (name.endsWith(".yaml") || name.endsWith(".yml")) return "YAML";
  if (name.endsWith(".toml")) return "TOML";
  if (name.endsWith(".html")) return "HTML";
  if (name.endsWith(".css"))  return "CSS";
  const sub = mimeType.split("/")[1];
  return sub ? sub.replace("x-", "").toUpperCase() : "File";
}

function FileIcon({ name, mimeType, className }: { name: string; mimeType: string; className?: string }) {
  const isCode = /\.(ts|tsx|js|jsx|py|rs|go|java|c|cpp|h|cs|sh|bash|sql|html|css)$/.test(name);
  const isJson = name.endsWith(".json") || name.endsWith(".jsonc");
  if (isJson) return <FileJson className={className} />;
  if (isCode) return <FileCode className={className} />;
  return <FileText className={className} />;
}

function buildSystemPrompt(file: StoredFile): string {
  const label = fileTypeLabel(file.mimeType, file.name);
  const size  = formatBytes(file.size);
  const context = file.content.length > MAX_PROMPT
    ? file.content.slice(0, MAX_PROMPT) + "\n\n[… content truncated for context window …]"
    : file.content;

  return [
    `You are analyzing content from a ${label} file uploaded by the user.`,
    `Answer the user's question clearly and concisely using the content below.`,
    `Do not say phrases like "based on the document", "according to the file", or "the document states".`,
    `Respond naturally as if you already understand the content. If the answer is not in the content, say so directly.`,
    ``,
    `--- FILE: ${file.name} (${size}) ---`,
    context,
    `--- END ---`,
  ].join("\n");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        className="w-full appearance-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 pr-7 font-mono text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
      >
        {models.length === 0 && <option value="">No models installed</option>}
        {models.map((m) => (
          <option key={m.name} value={m.name}>{m.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

function EmptyFiles({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
        <File className="h-4 w-4 text-zinc-600" />
      </div>
      <div>
        <p className="font-mono text-xs text-zinc-500">No files uploaded</p>
        <p className="mt-0.5 font-mono text-[10px] text-zinc-700">Upload a file to get started</p>
      </div>
      <button
        onClick={onUploadClick}
        className="font-mono text-[11px] text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
      >
        Upload file
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FilesPage() {
  const [files, setFiles]       = useState<StoredFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [models, setModels]     = useState<OllamaModel[]>([]);
  const [model, setModel]       = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Per-file Q&A entries (in memory only, not persisted)
  const [qaMap, setQAMap] = useState<Record<string, QAEntry[]>>({});
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const qaBottomRef    = useRef<HTMLDivElement>(null);
  const abortRef       = useRef<AbortController | null>(null);
  const filesRef       = useRef(files);
  filesRef.current     = files;
  const qaMapRef       = useRef(qaMap);
  qaMapRef.current     = qaMap;

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeId) ?? null,
    [files, activeId]
  );

  const activeQA = useMemo(
    () => (activeId ? qaMap[activeId] ?? [] : []),
    [qaMap, activeId]
  );

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = loadFiles();
    setFiles(stored);
    if (stored.length > 0) setActiveId(stored[0].id);
  }, []);

  useEffect(() => {
    fetch("/api/ollama/models")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.models.length > 0) {
          setModels(d.models);
          setModel(d.models[0].name);
        }
      });
  }, []);

  // Auto-scroll Q&A
  useEffect(() => {
    qaBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeQA.length, streaming]);

  // ── Upload ──────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      let content: string;
      let truncated = false;

      if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", file);
        const res  = await fetch("/api/files/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "PDF extraction failed");
        content   = data.text;
        truncated = data.truncated;
      } else {
        // Read as plain text in the browser
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = (e) => resolve((e.target?.result as string) ?? "");
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });
        if (content.length > MAX_STORE) {
          truncated = true;
          content   = content.slice(0, MAX_STORE);
        }
      }

      const stored: StoredFile = {
        id:         crypto.randomUUID(),
        name:       file.name,
        size:       file.size,
        mimeType:   file.type || "text/plain",
        content,
        truncated,
        chunkCount: Math.max(1, Math.ceil(content.length / MAX_PROMPT)),
        uploadedAt: new Date().toISOString(),
      };

      const next = [stored, ...filesRef.current];
      setFiles(next);
      saveFiles(next);
      setActiveId(stored.id);
      setQuestion("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = ""; // reset so same file can be re-uploaded
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDeleteFile = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = filesRef.current.filter((f) => f.id !== id);
    setFiles(next);
    saveFiles(next);
    setQAMap((prev) => { const n = { ...prev }; delete n[id]; return n; });
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
    }
  }, [activeId]);

  // ── Ask ─────────────────────────────────────────────────────────────────
  const handleAsk = useCallback(async () => {
    if (!activeFile || !question.trim() || streaming || !model) return;

    const q = question.trim();
    setQuestion("");
    setStreaming(true);

    const entryId = crypto.randomUUID();
    const fileId  = activeFile.id;

    // Append Q entry with empty answer
    setQAMap((prev) => ({
      ...prev,
      [fileId]: [
        ...(prev[fileId] ?? []),
        { id: entryId, question: q, answer: "", streaming: true },
      ],
    }));

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/ollama/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildSystemPrompt(activeFile) },
            { role: "user",   content: q },
          ],
          temperature: 0.3,
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
            setQAMap((prev) => ({
              ...prev,
              [fileId]: (prev[fileId] ?? []).map((e) =>
                e.id === entryId ? { ...e, answer: accumulated } : e
              ),
            }));
          }
        }
      }

      setQAMap((prev) => ({
        ...prev,
        [fileId]: (prev[fileId] ?? []).map((e) =>
          e.id === entryId
            ? { ...e, answer: accumulated || "(no response)", streaming: false }
            : e
        ),
      }));
    } catch (err) {
      const msg =
        (err as Error)?.name === "AbortError"
          ? "(stopped)"
          : `Error: ${(err as Error)?.message ?? "Unknown error"}`;
      setQAMap((prev) => ({
        ...prev,
        [fileId]: (prev[fileId] ?? []).map((e) =>
          e.id === entryId ? { ...e, answer: msg, streaming: false } : e
        ),
      }));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [activeFile, question, streaming, model]);

  const handleStop = useCallback(() => { abortRef.current?.abort(); }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
    },
    [handleAsk]
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-[calc(100vh-3.5rem-48px)] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* ── LEFT: File list ─────────────────────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-3">
          <div className="flex items-center gap-2">
            <File className="h-3.5 w-3.5 text-zinc-600" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Files
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-6 w-6 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            title="Upload file"
          >
            {uploading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Upload className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <EmptyFiles onUploadClick={() => fileInputRef.current?.click()} />
          ) : (
            <div className="py-1">
              {files.map((f) => {
                const active = f.id === activeId;
                return (
                  <div
                    key={f.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => { setActiveId(f.id); setQuestion(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setActiveId(f.id); setQuestion(""); } }}
                    className={cn(
                      "group relative flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors cursor-pointer",
                      active ? "bg-zinc-800/70" : "hover:bg-zinc-900/60"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-zinc-500" />
                    )}
                    <div className="flex items-center gap-1.5 pr-6">
                      <FileIcon
                        name={f.name}
                        mimeType={f.mimeType}
                        className={cn(
                          "h-3 w-3 shrink-0",
                          active ? "text-zinc-400" : "text-zinc-600"
                        )}
                      />
                      <span
                        className={cn(
                          "flex-1 truncate font-mono text-xs font-medium",
                          active ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
                        )}
                      >
                        {f.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="font-mono text-[10px] text-zinc-700">
                        {formatBytes(f.size)} · {relativeTime(f.uploadedAt)}
                      </span>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeleteFile(f.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 text-zinc-600 hover:bg-zinc-800 hover:text-red-400"
                      title="Remove file"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="border-t border-zinc-800 px-3 py-2">
            <p className="font-mono text-[10px] text-red-500/80">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="mt-0.5 font-mono text-[10px] text-zinc-600 underline underline-offset-2 hover:text-zinc-400"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-800 px-3 py-2.5">
          <p className="font-mono text-[10px] text-zinc-700">
            {files.length} file{files.length !== 1 ? "s" : ""} · drag & drop to upload
          </p>
        </div>
      </aside>

      {/* ── MAIN: Preview + Q&A ─────────────────────────────────────────── */}
      {!activeFile ? (
        /* No file selected */
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800 px-12 py-10 text-center transition-colors hover:border-zinc-700 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
              <Upload className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-zinc-400">
                Drop a file here or click to upload
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-700">
                PDF, TXT, MD, JSON, and source code files
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* File header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileIcon
                name={activeFile.name}
                mimeType={activeFile.mimeType}
                className="h-4 w-4 shrink-0 text-zinc-500"
              />
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-medium text-zinc-200">
                  {activeFile.name}
                </p>
                <p className="font-mono text-[10px] text-zinc-600">
                  {fileTypeLabel(activeFile.mimeType, activeFile.name)}
                  {" · "}
                  {formatBytes(activeFile.size)}
                  {" · "}
                  {activeFile.content.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                  {" · "}
                  {activeFile.chunkCount ?? 1} {(activeFile.chunkCount ?? 1) === 1 ? "chunk" : "chunks"}
                  {activeFile.truncated && (
                    <span className="ml-2 text-yellow-600/80">· preview truncated</span>
                  )}
                </p>
              </div>
            </div>

            {/* Model selector + Remove File */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-zinc-600">Model</span>
              <div className="w-44">
                <ModelSelect models={models} value={model} onChange={setModel} />
              </div>

              {/* Remove file — inline confirm */}
              {confirmRemoveId === activeFile.id ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-2.5 py-1.5">
                  <span className="font-mono text-[10px] text-zinc-400">Remove file?</span>
                  <button
                    onClick={() => {
                      const next = filesRef.current.filter((f) => f.id !== activeFile.id);
                      setFiles(next);
                      saveFiles(next);
                      setQAMap((prev) => { const n = { ...prev }; delete n[activeFile.id]; return n; });
                      setActiveId(next[0]?.id ?? null);
                      setQuestion("");
                      setConfirmRemoveId(null);
                    }}
                    className="rounded px-2 py-0.5 font-mono text-[10px] text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    className="rounded p-0.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmRemoveId(activeFile.id)}
                  className="h-8 gap-1.5 border border-zinc-800 bg-transparent font-mono text-xs text-zinc-500 hover:bg-zinc-900/60 hover:text-red-400 hover:border-zinc-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Split: content preview (top) + Q&A (bottom) */}
          <div className="flex flex-1 flex-col overflow-hidden">

            {/* Content preview */}
            <div className="flex flex-col border-b border-zinc-800" style={{ height: "38%" }}>
              <div className="flex items-center justify-between border-b border-zinc-800/50 px-5 py-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  Content Preview
                </span>
                <span className="font-mono text-[10px] text-zinc-700">
                  {activeFile.content.length.toLocaleString()} chars
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <pre className="min-h-full whitespace-pre-wrap break-words px-5 py-4 font-mono text-xs leading-relaxed text-zinc-500">
                  {activeFile.content || <span className="text-zinc-700">(empty file)</span>}
                </pre>
              </div>
            </div>

            {/* Q&A area */}
            <div className="flex flex-1 flex-col overflow-hidden" style={{ height: "62%" }}>
              {/* Q&A header */}
              <div className="flex items-center justify-between border-b border-zinc-800/50 px-5 py-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  Ask about this file
                </span>
                {activeQA.length > 0 && (
                  <button
                    onClick={() => setQAMap((prev) => ({ ...prev, [activeFile.id]: [] }))}
                    className="font-mono text-[10px] text-zinc-700 hover:text-zinc-500"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Q&A messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {activeQA.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <p className="font-mono text-xs text-zinc-600">
                      Ask anything about this file.
                    </p>
                    <p className="font-mono text-[10px] text-zinc-700">
                      Summarize · explain · extract · compare
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {activeQA.map((entry) => (
                      <div key={entry.id} className="flex flex-col gap-2">
                        {/* Question */}
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-lg bg-zinc-700 px-4 py-2.5 font-mono text-xs text-zinc-100">
                            {entry.question}
                          </div>
                        </div>
                        {/* Answer */}
                        <div className="flex justify-start">
                          <div className="max-w-[90%] rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs leading-relaxed text-zinc-300">
                            {entry.answer === "" ? (
                              <span className="flex items-center gap-1.5 text-zinc-600">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Thinking…
                              </span>
                            ) : (
                              <>
                                <span className="whitespace-pre-wrap">{entry.answer}</span>
                                {entry.streaming && (
                                  <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-zinc-400 align-middle" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={qaBottomRef} />
                  </div>
                )}
              </div>

              {/* Question input */}
              <div className="border-t border-zinc-800 px-5 py-3">
                {models.length === 0 && (
                  <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] text-yellow-600/80">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    No models installed — install one in Models to ask questions.
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      models.length === 0
                        ? "No models available…"
                        : `Ask about ${activeFile.name}…`
                    }
                    disabled={models.length === 0}
                    rows={1}
                    className="min-h-10 max-h-32 resize-none border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                  />
                  {streaming ? (
                    <Button
                      size="icon"
                      onClick={handleStop}
                      className="h-10 w-10 shrink-0 border border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200"
                      title="Stop"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      disabled={!question.trim() || models.length === 0}
                      onClick={handleAsk}
                      className="h-10 w-10 shrink-0 bg-zinc-700 text-white hover:bg-zinc-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
