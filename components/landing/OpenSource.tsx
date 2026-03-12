import Link from "next/link";
import { Github, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OpenSource() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900/20 px-8 py-16 text-center">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_65%)] blur-2xl" />
          </div>

          <div className="relative">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">
              Open Source
            </p>
            <h2 className="mb-4 font-mono text-3xl font-bold text-zinc-100 sm:text-4xl">
              Built for Developers
            </h2>
            <p className="mb-10 mx-auto max-w-md text-sm text-zinc-400 leading-relaxed">
              DagOS is fully open-source and designed for developers who want
              complete control over their AI workflows. Inspect the code,
              contribute, or self-host.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size="sm"
                className="h-9 gap-2 px-5 font-mono text-xs bg-zinc-100 text-zinc-950 hover:bg-white transition-colors"
                asChild
              >
                <a
                  href="https://github.com/Martimic10/DagOS"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3.5 w-3.5" />
                  View on GitHub
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 px-5 font-mono text-xs border border-zinc-800 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                asChild
              >
                <Link href="/docs">
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
