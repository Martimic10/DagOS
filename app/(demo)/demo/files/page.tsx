"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Loader2, CheckCircle2, X } from "lucide-react";
import { DEMO_FILE_SUMMARY, DEMO_MODELS } from "@/lib/demo-data";

type Stage = "idle" | "uploading" | "analyzing" | "done";

export default function DemoFilesPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [answering, setAnswering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStage("uploading");
    await new Promise((r) => setTimeout(r, 800));
    setStage("analyzing");
    await new Promise((r) => setTimeout(r, 1400));
    setStage("done");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setStage("idle");
    setFileName(null);
    setQuestion("");
    setAnswer(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function ask() {
    if (!question.trim() || answering) return;
    setAnswering(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    setAnswer(
      `Based on the uploaded document, here's what I found: ${DEMO_FILE_SUMMARY} (This is a simulated response — in a real installation your local model would analyze the actual file contents.)`
    );
    setAnswering(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-mono text-xl font-bold text-zinc-100">File AI</h1>
        <p className="font-mono text-xs text-zinc-600 mt-0.5">
          Demo — file processing is simulated
        </p>
      </div>

      {stage === "idle" && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/20 px-8 py-16 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
            <Upload className="h-5 w-5 text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="font-mono text-sm font-medium text-zinc-300">Drop a file or click to upload</p>
            <p className="mt-1 font-mono text-xs text-zinc-600">PDF, TXT, MD — up to 10 MB</p>
          </div>
          <input ref={inputRef} type="file" className="hidden" onChange={onPick} />
        </div>
      )}

      {(stage === "uploading" || stage === "analyzing") && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 px-8 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <div className="text-center">
            <p className="font-mono text-sm font-medium text-zinc-300">
              {stage === "uploading" ? "Uploading file…" : "Analyzing with local model…"}
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-600">{fileName}</p>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="flex flex-col gap-4">
          {/* File card */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <FileText className="h-4 w-4 text-zinc-500" />
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-zinc-300">{fileName}</p>
                <p className="font-mono text-xs text-zinc-600">Analyzed · demo model</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <button
                onClick={reset}
                className="rounded p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Summary</p>
            <p className="font-mono text-sm text-zinc-300 leading-relaxed">{DEMO_FILE_SUMMARY}</p>
          </div>

          {/* Q&A */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Ask a question</p>

            <div className="flex items-center gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="Ask about this document…"
                disabled={answering}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={ask}
                disabled={!question.trim() || answering}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                {answering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
              </button>
            </div>

            {answer && (
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 px-4 py-3">
                <p className="font-mono text-sm text-zinc-300 leading-relaxed">{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model selector note */}
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/20 px-4 py-2.5">
        <span className="font-mono text-xs text-zinc-600">Model:</span>
        <span className="font-mono text-xs text-zinc-400">{DEMO_MODELS[1].name}</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-700">demo — simulated</span>
      </div>
    </div>
  );
}
