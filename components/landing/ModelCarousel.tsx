"use client";

import { useState } from "react";
import {
  siOllama,
  siMeta,
  siMistralai,
  siGooglegemini,
  siAnthropic,
  siHuggingface,
  siNvidia,
  siLangchain,
  siPytorch,
  siGithub,
} from "simple-icons";

// ─── Simple Icons renderer ───────────────────────────────────────────────────

function SiIcon({
  icon,
  className = "h-7 w-7",
}: {
  icon: { path: string; title: string };
  className?: string;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label={icon.title}
    >
      <path d={icon.path} />
    </svg>
  );
}

// ─── Manual SVGs ─────────────────────────────────────────────────────────────

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" fill="currentColor" className="h-7 w-7" aria-label="Microsoft">
      <rect x="0" y="0" width="9.5" height="9.5" rx="0.5" />
      <rect x="11.5" y="0" width="9.5" height="9.5" rx="0.5" />
      <rect x="0" y="11.5" width="9.5" height="9.5" rx="0.5" />
      <rect x="11.5" y="11.5" width="9.5" height="9.5" rx="0.5" />
    </svg>
  );
}

function DeepSeekIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" className="h-7 w-7" aria-label="DeepSeek">
      <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
    </svg>
  );
}

// ─── Logo list with brand colors ─────────────────────────────────────────────

const logos: {
  name: string;
  label: string;
  logo: React.ReactNode;
  color: string;
}[] = [
  { name: "Ollama",        label: "Local runtime",     logo: <SiIcon icon={siOllama} className="h-8 w-8" />,         color: "#e4e4e7" },
  { name: "Meta",          label: "Llama 3 / 3.1",     logo: <SiIcon icon={siMeta} />,                                color: "#0082FB" },
  { name: "Mistral AI",    label: "7B · 8×7B · Large", logo: <SiIcon icon={siMistralai} />,                           color: "#FF7000" },
  { name: "Google Gemini", label: "Gemma 2",            logo: <SiIcon icon={siGooglegemini} className="h-8 w-8" />,   color: "#8E75B2" },
  { name: "Microsoft",     label: "Phi-3 · Phi-4",     logo: <MicrosoftIcon />,                                       color: "#00A4EF" },
  { name: "DeepSeek",      label: "Coder · R1",         logo: <DeepSeekIcon />,                                        color: "#4D6BFE" },
  { name: "Anthropic",     label: "Claude models",      logo: <SiIcon icon={siAnthropic} />,                           color: "#D4A27F" },
  { name: "Hugging Face",  label: "Hub models",         logo: <SiIcon icon={siHuggingface} className="h-8 w-8" />,    color: "#FFD21E" },
  { name: "NVIDIA",        label: "GPU accelerated",    logo: <SiIcon icon={siNvidia} className="h-6 w-auto" />,      color: "#76B900" },
  { name: "LangChain",     label: "Agent pipelines",    logo: <SiIcon icon={siLangchain} />,                           color: "#1C3C3C" },
  { name: "PyTorch",       label: "Model weights",      logo: <SiIcon icon={siPytorch} />,                             color: "#EE4C2C" },
  { name: "GitHub",        label: "Open source",        logo: <SiIcon icon={siGithub} />,                              color: "#e4e4e7" },
];

const allLogos = [...logos, ...logos];

// ─── Logo card with hover color reveal ───────────────────────────────────────

function LogoCard({ item }: { item: typeof logos[number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex w-37 shrink-0 flex-col items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-5 py-5 ring-1 ring-inset ring-white/3 transition-all duration-300 cursor-default"
      style={{
        borderColor: hovered ? `${item.color}40` : undefined,
        boxShadow: hovered ? `0 0 18px 0 ${item.color}20` : undefined,
      }}
    >
      <div
        className="flex h-10 w-full items-center justify-center transition-colors duration-300"
        style={{ color: hovered ? item.color : "#52525b" }}
      >
        {item.logo}
      </div>
      <div className="text-center">
        <p
          className="font-mono text-[11px] font-semibold transition-colors duration-300"
          style={{ color: hovered ? item.color : "#a1a1aa" }}
        >
          {item.name}
        </p>
        <p className="mt-0.5 font-mono text-[9px] leading-tight text-zinc-700">
          {item.label}
        </p>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ModelCarousel() {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Section label */}
      <div className="mb-8 px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-700">
            Compatible with
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>
      </div>

      {/* Fade masks */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-28 z-10"
        style={{ background: "linear-gradient(to right, #09090b, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-28 z-10"
        style={{ background: "linear-gradient(to left, #09090b, transparent)" }}
      />

      {/* Marquee track */}
      <div className="group flex overflow-hidden select-none">
        <div
          className="flex gap-3 group-hover:[animation-play-state:paused]"
          style={{ animation: "marquee 55s linear infinite" }}
        >
          {allLogos.map((item, i) => (
            <LogoCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
