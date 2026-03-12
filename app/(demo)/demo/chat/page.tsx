"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { DEMO_CHAT_RESPONSES, DEMO_MODELS } from "@/lib/demo-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the DagOS demo assistant. Ask me anything — I'll simulate a response so you can see how the chat interface works. In a real installation, your locally running model would respond here.",
};

export default function DemoChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEMO_MODELS[0].name);
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    // Simulate 800–1200ms delay
    const delay = 800 + Math.random() * 400;
    await new Promise((r) => setTimeout(r, delay));

    const response = DEMO_CHAT_RESPONSES[responseIndex.current % DEMO_CHAT_RESPONSES.length];
    responseIndex.current += 1;

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setThinking(false);
  }

  return (
    <div className="flex h-[calc(100vh-10.5rem)] flex-col gap-0 rounded-xl border border-zinc-800/60 bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-zinc-500" />
          <span className="font-mono text-sm font-medium text-zinc-300">Demo Chat</span>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-xs text-zinc-400 focus:outline-none focus:border-zinc-700"
        >
          {DEMO_MODELS.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <Bot className="h-3.5 w-3.5 text-zinc-500" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-2.5 font-mono text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-zinc-800 text-zinc-100"
                  : "border border-zinc-800/60 bg-zinc-900/50 text-zinc-300"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <User className="h-3.5 w-3.5 text-zinc-500" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <Bot className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/60 px-4 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message…"
            disabled={thinking}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
