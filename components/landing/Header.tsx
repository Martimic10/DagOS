"use client";

import { Github, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
            <div className="h-2 w-2 rounded-sm bg-zinc-100" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest text-zinc-100 uppercase">
            DagOS
          </span>
          <span className="hidden rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-500 sm:inline">
            v0.1
          </span>
        </div>

        {/* Nav actions */}
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100"
            asChild
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100"
            asChild
          >
            <a href="/docs">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Docs</span>
            </a>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-2 border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600"
            asChild
          >
            <a href="#quickstart">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
