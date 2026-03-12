import Link from "next/link";
import { ArrowRight, Github, CheckCircle2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

const badges = [
  { label: "Open Source" },
  { label: "Runs Locally" },
  { label: "Powered by Ollama" },
];

export function Hero() {
  return (
    <section className="relative pt-44 pb-28 px-6">
      {/* Hero glow */}
      <div className="absolute inset-0 pointer-events-none flex justify-center overflow-hidden">
        <div className="mt-0 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,transparent_60%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Status pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-xs text-zinc-400">
            v0.1.0-alpha · Open Source
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 font-mono text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl lg:text-7xl leading-[1.08]">
          Run AI Models
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Locally. Beautifully.
          </span>
        </h1>

        <p className="mb-10 mx-auto max-w-lg text-base text-zinc-400 leading-relaxed">
          DagOS is an open-source AI workstation for running and managing
          language models locally with Ollama.
        </p>

        {/* CTAs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="h-11 gap-2 px-7 font-mono text-sm bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-lg shadow-white/5"
            asChild
          >
            <Link href="/app/dashboard">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="h-11 gap-2 px-7 font-mono text-sm border border-indigo-500/40 bg-indigo-950/30 text-indigo-300 hover:bg-indigo-950/60 hover:border-indigo-500/60 hover:text-indigo-200 transition-all"
            asChild
          >
            <Link href="/demo">
              <FlaskConical className="h-4 w-4" />
              Launch Live Demo
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-11 gap-2 px-7 font-mono text-sm border border-zinc-800 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 hover:border-zinc-700 transition-all"
            asChild
          >
            <a
              href="https://github.com/Martimic10/DagOS"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {badges.map((badge, i) => (
            <span key={badge.label} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-500/80" />
                {badge.label}
              </span>
              {i < badges.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
