import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/landing/DownloadButton";

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
          <DownloadButton />
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
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
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
