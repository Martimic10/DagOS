import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-zinc-950/60 px-8 py-24 text-center">
          {/* Top glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.22)_0%,transparent_60%)]" />
          </div>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-indigo-500/40 to-transparent" />
          <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-indigo-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-indigo-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-indigo-500/40 to-transparent" />

          <div className="relative">
            <h2 className="mb-4 font-mono text-4xl font-bold text-zinc-100 sm:text-5xl leading-tight">
              Start Running AI
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Locally
              </span>
            </h2>
            <p className="mb-10 text-sm text-zinc-500">
              Free, open-source, and fully private.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 gap-2 px-7 font-mono text-sm bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-lg shadow-white/10"
                asChild
              >
                <Link href="/app/dashboard">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-11 gap-2 px-7 font-mono text-sm border border-zinc-700/60 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 hover:border-zinc-600 transition-all"
                asChild
              >
                <a
                  href="https://github.com/Martimic10/DagOS"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
