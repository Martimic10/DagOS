"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Cpu, MessageSquare, Settings,
  Activity, Send, Loader2, FlaskConical,
  CheckCircle2, Clock, Hash, HardDrive,
} from "lucide-react";

// ── Fake data ─────────────────────────────────────────────────────────────────

const MODELS = [
  { name: "llama3.2",  tag: "3b",   size: "2.0 GB", status: "running" },
  { name: "mistral",   tag: "7b",   size: "4.1 GB", status: "idle"    },
  { name: "deepseek",  tag: "7b",   size: "4.7 GB", status: "idle"    },
];

const STATS = [
  { label: "Runtime",          value: "Online",  sub: "Ollama responding",       dot: "emerald" },
  { label: "Installed Models", value: "3",       sub: "via localhost:11434",      dot: "zinc"    },
  { label: "Requests Today",   value: "48",      sub: "44 ok · 4 err",           dot: "zinc"    },
  { label: "Avg Latency",      value: "312ms",   sub: "from 44 successful reqs", dot: "zinc"    },
];

const SEED_MESSAGES = [
  { role: "user",      text: "What's the capital of France?"                                                    },
  { role: "assistant", text: "The capital of France is Paris. It's been the country's capital since the late 10th century and is home to iconic landmarks like the Eiffel Tower and the Louvre." },
  { role: "user",      text: "What about Germany?"                                                              },
  { role: "assistant", text: "The capital of Germany is Berlin. It became the reunified capital after the fall of the Berlin Wall in 1989 and is now one of Europe's largest cities." },
];

const FAKE_REPLIES = [
  "That's a great question! Here's what I know about that topic based on my training data.",
  "Sure! To summarize: this is a locally-running AI model powered by Ollama on your own hardware — no data leaves your machine.",
  "I can help with that. Keep in mind this is a demo running in your browser — in the real app, responses come from your local Ollama runtime.",
  "Interesting prompt. The real DagOS connects to Ollama on localhost:11434 and streams responses directly to you.",
];

// ── Nav items ─────────────────────────────────────────────────────────────────

type Screen = "dashboard" | "models" | "chat" | "playground";

const NAV: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard",  label: "Dashboard",  icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { id: "models",     label: "Models",     icon: <Cpu              className="h-3.5 w-3.5" /> },
  { id: "chat",       label: "Chat",       icon: <MessageSquare    className="h-3.5 w-3.5" /> },
  { id: "playground", label: "Playground", icon: <FlaskConical     className="h-3.5 w-3.5" /> },
];

// ── Screens ───────────────────────────────────────────────────────────────────

function DashboardScreen() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="font-mono text-sm font-bold text-zinc-100">Dashboard</p>
        <p className="font-mono text-[10px] text-zinc-600">Updated · just now</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{s.label}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot === "emerald" ? "bg-emerald-500" : "bg-zinc-600"}`} />
              <span className="font-mono text-sm font-bold text-zinc-100">{s.value}</span>
            </div>
            <p className="mt-0.5 font-mono text-[9px] text-zinc-700">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20">
        <div className="border-b border-zinc-800/50 px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Installed Models</p>
        </div>
        <div className="flex flex-col divide-y divide-zinc-800/40">
          {MODELS.map((m) => (
            <div key={m.name} className="flex items-center justify-between px-3 py-2">
              <div>
                <span className="font-mono text-xs font-semibold text-zinc-200">{m.name}</span>
                <span className="ml-1.5 font-mono text-[10px] text-zinc-600">{m.tag}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-600">{m.size}</span>
                <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                  m.status === "running"
                    ? "border-zinc-700/60 bg-zinc-800/60 text-zinc-300"
                    : "border-zinc-800/50 bg-zinc-900/50 text-zinc-600"
                }`}>
                  <span className={`h-1 w-1 rounded-full ${m.status === "running" ? "bg-zinc-400 animate-pulse" : "bg-zinc-700"}`} />
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelsScreen() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-zinc-100">Models</p>
          <p className="font-mono text-[10px] text-zinc-600">3 installed · via Ollama</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {MODELS.map((m) => (
          <div key={m.name} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-bold text-zinc-100">{m.name}</p>
                  <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">{m.tag}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                    <HardDrive className="h-2.5 w-2.5" />{m.size}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                    <Activity className="h-2.5 w-2.5" />localhost:11434
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                m.status === "running"
                  ? "border-zinc-700/60 bg-zinc-800/60 text-zinc-300"
                  : "border-zinc-800/50 bg-zinc-900/50 text-zinc-600"
              }`}>
                <span className={`h-1 w-1 rounded-full ${m.status === "running" ? "bg-zinc-400 animate-pulse" : "bg-zinc-700"}`} />
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatScreen() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [input, setInput]       = useState("");
  const [thinking, setThinking] = useState(false);
  const [model, setModel]       = useState("llama3.2");
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setThinking(true);
    setTimeout(() => {
      const reply = FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setThinking(false);
    }, 1200 + Math.random() * 800);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Model picker */}
      <div className="flex items-center gap-2 border-b border-zinc-800/60 px-4 py-2">
        <span className="font-mono text-[10px] text-zinc-600">Model:</span>
        {MODELS.map((m) => (
          <button
            key={m.name}
            onClick={() => setModel(m.name)}
            className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
              model === m.name
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-800">
                <div className="h-2 w-2 rounded-sm bg-zinc-300" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-3 py-2 font-mono text-xs leading-relaxed ${
              m.role === "user"
                ? "bg-zinc-800 text-zinc-200"
                : "border border-zinc-800/60 bg-zinc-900/60 text-zinc-300"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-800">
              <div className="h-2 w-2 rounded-sm bg-zinc-300" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-3 py-2">
              <span className="h-1 w-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/60 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message ${model}…`}
            className="flex-1 bg-transparent font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || thinking}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-600 disabled:opacity-30"
          >
            {thinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </button>
        </div>
        <p className="mt-1.5 text-center font-mono text-[9px] text-zinc-700">
          Demo only — responses are simulated. Real app uses your local Ollama.
        </p>
      </div>
    </div>
  );
}

const PLAYGROUND_RESULTS: { model: string; latency: string; tokens: number; response: string }[] = [
  { model: "llama3.2",  latency: "312ms", tokens: 94,  response: "Paris is the capital of France. It has served as the nation's capital since 987 AD and is home to over 2 million residents in the city proper." },
  { model: "mistral",   latency: "489ms", tokens: 112, response: "The capital of France is Paris. Known as the 'City of Light', Paris is renowned for its art, culture, and landmarks such as the Eiffel Tower and Notre-Dame Cathedral." },
  { model: "deepseek",  latency: "271ms", tokens: 78,  response: "France's capital is Paris. It sits on the Seine River in northern France and is the country's largest city, serving as its political and cultural center." },
];

function PlaygroundScreen() {
  const [prompt, setPrompt]   = useState("");
  const [ran, setRan]         = useState(false);
  const [running, setRunning] = useState(false);
  const [visible, setVisible] = useState<number>(0);

  function runAll() {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setRan(false);
    setVisible(0);
    let i = 0;
    const tick = () => {
      i++;
      setVisible(i);
      if (i < PLAYGROUND_RESULTS.length) setTimeout(tick, 400 + Math.random() * 300);
      else { setRunning(false); setRan(true); }
    };
    setTimeout(tick, 500);
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4 overflow-y-auto">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-3.5 w-3.5 text-indigo-400" />
        <p className="font-mono text-sm font-bold text-zinc-100">Model Playground</p>
      </div>

      {/* Model chips */}
      <div className="flex flex-wrap gap-1.5">
        {PLAYGROUND_RESULTS.map((r) => (
          <span key={r.model} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-950/30 px-2.5 py-1 font-mono text-[10px] text-indigo-300">
            <CheckCircle2 className="h-2.5 w-2.5 text-indigo-400" />{r.model}
          </span>
        ))}
      </div>

      {/* Prompt */}
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runAll()}
          placeholder="Enter a prompt and run all models…"
          className="flex-1 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600"
        />
        <button
          onClick={runAll}
          disabled={!prompt.trim() || running}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
        >
          {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Run All
        </button>
      </div>

      {/* Results */}
      {(running || ran) && (
        <div className="grid grid-cols-3 gap-2">
          {PLAYGROUND_RESULTS.map((r, i) => (
            <div
              key={r.model}
              className={`flex flex-col rounded-xl border bg-zinc-900/40 overflow-hidden transition-all duration-300 ${
                i < visible ? "border-zinc-700/60 opacity-100" : "border-zinc-800/40 opacity-30"
              }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-800/50 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5">
                  {i < visible
                    ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    : <Loader2 className="h-2.5 w-2.5 animate-spin text-indigo-500/60" />}
                  <span className="font-mono text-[10px] font-semibold text-zinc-300">{r.model}</span>
                </div>
                {i < visible && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 font-mono text-[9px] text-zinc-600"><Clock className="h-2 w-2" />{r.latency}</span>
                    <span className="flex items-center gap-0.5 font-mono text-[9px] text-zinc-600"><Hash className="h-2 w-2" />{r.tokens}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 p-2.5">
                {i < visible
                  ? <p className="font-mono text-[10px] leading-relaxed text-zinc-400">{r.response}</p>
                  : <div className="flex items-center gap-1"><span className="h-1 w-1 animate-bounce rounded-full bg-zinc-600 [animation-delay:0ms]" /><span className="h-1 w-1 animate-bounce rounded-full bg-zinc-600 [animation-delay:150ms]" /><span className="h-1 w-1 animate-bounce rounded-full bg-zinc-600 [animation-delay:300ms]" /></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!running && !ran && (
        <p className="text-center font-mono text-[10px] text-zinc-700 pt-4">
          Type a prompt above and hit Run All to compare models side-by-side.
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InteractiveDemo() {
  const [active, setActive] = useState<Screen>("dashboard");

  return (
    <section className="relative px-6 pb-28">
      <div className="mx-auto max-w-5xl">

        {/* Section label */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <CheckCircle2 className="h-3 w-3 text-emerald-500/80" /> Interactive Preview
          </span>
          <h2 className="font-mono text-2xl font-bold text-zinc-100">See it in action</h2>
          <p className="font-mono text-sm text-zinc-500">Click around the app below — no download required.</p>
        </div>

        {/* App window */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950 shadow-2xl shadow-black/60">

          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-900/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <div className="ml-3 flex h-5 items-center rounded border border-zinc-700/60 bg-zinc-800/60 px-2">
              <span className="font-mono text-[9px] text-zinc-500">localhost:3000/app/{active}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ollama Connected
              </span>
            </div>
          </div>

          {/* App layout */}
          <div className="flex" style={{ height: 460 }}>

            {/* Sidebar */}
            <div className="flex w-44 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-900/40 py-3">
              {/* Logo */}
              <div className="mb-3 flex items-center gap-2 px-4">
                <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-800">
                  <div className="h-2 w-2 rounded-sm bg-zinc-200" />
                </div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-300">DagOS</span>
              </div>

              <div className="px-3">
                <p className="mb-1 px-1 font-mono text-[8px] uppercase tracking-widest text-zinc-700">Navigation</p>
                {NAV.filter(n => n.id !== "playground").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-[11px] transition-all ${
                      active === item.id
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                    }`}
                  >
                    {active === item.id && <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />}
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                <p className="mb-1 mt-3 px-1 font-mono text-[8px] uppercase tracking-widest text-zinc-700">Pro Features</p>
                <button
                  onClick={() => setActive("playground")}
                  className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-[11px] transition-all ${
                    active === "playground"
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                  }`}
                >
                  {active === "playground" && <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />}
                  <FlaskConical className="h-3.5 w-3.5" />
                  Playground
                  <span className="ml-auto rounded-full border border-indigo-500/30 bg-indigo-950/50 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-indigo-400">
                    Pro
                  </span>
                </button>
              </div>

              {/* Bottom */}
              <div className="mt-auto border-t border-zinc-800/60 px-3 pt-3">
                <button
                  onClick={() => setActive("dashboard")}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-[11px] text-zinc-500 transition-all hover:bg-zinc-800/50 hover:text-zinc-300"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {active === "dashboard"  && <div className="h-full overflow-y-auto"><DashboardScreen /></div>}
              {active === "models"     && <div className="h-full overflow-y-auto"><ModelsScreen /></div>}
              {active === "chat"       && <div className="flex h-full flex-col"><ChatScreen /></div>}
              {active === "playground" && <PlaygroundScreen />}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[10px] text-zinc-700">
          Simulated demo · Real app connects to your local Ollama runtime
        </p>
      </div>
    </section>
  );
}
