"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: "/docs" },
  { label: "Releases", href: "https://github.com/Martimic10/DagOS", external: true },
  { label: "GitHub", href: "https://github.com/Martimic10/DagOS", external: true, icon: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled || menuOpen
          ? "border-b border-zinc-800/70 bg-[#050508]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-zinc-700 bg-zinc-900 group-hover:border-zinc-600 transition-colors">
            <div className="h-2.5 w-2.5 rounded-sm bg-zinc-100" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest text-zinc-100 uppercase">
            DagOS
          </span>
          <span className="hidden sm:inline rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
            LOCAL AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-200 transition-colors ${link.icon ? "ml-1" : ""}`}
              >
                {link.icon && <GithubIcon className="h-3.5 w-3.5" />}
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop CTA + Mobile hamburger */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden md:flex h-8 px-4 font-mono text-xs bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
            asChild
          >
            <Link href="/docs">Run DagOS</Link>
          </Button>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex md:hidden items-center justify-center h-8 w-8 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800/60 bg-[#050508]/98 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-3 border-b border-zinc-800/50 font-mono text-sm text-zinc-400 hover:text-zinc-100 transition-colors last:border-0"
                >
                  {link.icon && <GithubIcon className="h-4 w-4" />}
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 border-b border-zinc-800/50 font-mono text-sm text-zinc-400 hover:text-zinc-100 transition-colors last:border-0"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-3">
              <Button
                size="sm"
                className="w-full h-9 font-mono text-xs bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
                asChild
              >
                <Link href="/docs" onClick={() => setMenuOpen(false)}>
                  Run DagOS
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
