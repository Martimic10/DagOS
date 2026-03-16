"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, Apple, MonitorDot, Terminal } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "mac" | "windows" | "linux" | "unknown";

interface Release {
  label: string;
  sublabel: string;
  filename: string;
  icon: React.ReactNode;
}

// ── Config ────────────────────────────────────────────────────────────────────

const GITHUB_REPO = "Martimic10/DagOS";
const VERSION     = "v0.1.0";

const RELEASES: Record<Exclude<Platform, "unknown">, Release> = {
  mac: {
    label:     "Download for macOS",
    sublabel:  "Apple Silicon & Intel · .dmg",
    filename:  `DagOS-${VERSION}.dmg`,
    icon:      <Apple className="h-4 w-4" />,
  },
  windows: {
    label:     "Download for Windows",
    sublabel:  "Windows 10 & 11 · .exe",
    filename:  `DagOS-Setup-${VERSION}.exe`,
    icon:      <MonitorDot className="h-4 w-4" />,
  },
  linux: {
    label:     "Download for Linux",
    sublabel:  "x86_64 · .AppImage",
    filename:  `DagOS-${VERSION}.AppImage`,
    icon:      <Terminal className="h-4 w-4" />,
  },
};

const ALL_PLATFORMS: Exclude<Platform, "unknown">[] = ["mac", "windows", "linux"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac"))     return "mac";
  if (ua.includes("win"))     return "windows";
  if (ua.includes("linux"))   return "linux";
  return "unknown";
}

function releaseUrl(filename: string) {
  return `https://github.com/${GITHUB_REPO}/releases/latest/download/${filename}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DownloadButton() {
  const [platform, setPlatform]   = useState<Platform>("unknown");
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const primary = platform !== "unknown" ? RELEASES[platform] : null;
  const others  = ALL_PLATFORMS.filter((p) => p !== platform);

  return (
    <div ref={dropRef} className="relative inline-flex">
      {/* Primary download button */}
      <a
        href={primary ? releaseUrl(primary.filename) : `https://github.com/${GITHUB_REPO}/releases/latest`}
        download={primary?.filename}
        className="inline-flex h-11 items-center gap-2.5 rounded-l-xl bg-white px-5 font-mono text-sm font-semibold text-zinc-950 shadow-lg shadow-white/10 transition-all hover:bg-zinc-100 active:scale-[0.98]"
      >
        {primary ? primary.icon : <Download className="h-4 w-4" />}
        {primary ? primary.label : "Download"}
      </a>

      {/* Divider */}
      <div className="w-px bg-zinc-300/40" />

      {/* Chevron — opens other platforms */}
      <button
        onClick={() => setDropOpen((o) => !o)}
        className="inline-flex h-11 items-center justify-center rounded-r-xl bg-white px-3 text-zinc-500 shadow-lg shadow-white/10 transition-all hover:bg-zinc-100 hover:text-zinc-800 active:scale-[0.98]"
        aria-label="Other platforms"
      >
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${dropOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {dropOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black/60">
          <div className="border-b border-zinc-800/60 px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              All Platforms · {VERSION}
            </p>
          </div>
          <div className="flex flex-col p-1.5 gap-0.5">
            {ALL_PLATFORMS.map((p) => {
              const r = RELEASES[p];
              const isCurrent = p === platform;
              return (
                <a
                  key={p}
                  href={releaseUrl(r.filename)}
                  download={r.filename}
                  onClick={() => setDropOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-900 ${
                    isCurrent ? "bg-zinc-900/60" : ""
                  }`}
                >
                  <span className="text-zinc-400">{r.icon}</span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-zinc-200">
                      {r.label.replace("Download for ", "")}
                      {isCurrent && (
                        <span className="ml-2 rounded-full border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                          Detected
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-600">{r.sublabel}</span>
                  </div>
                </a>
              );
            })}
          </div>
          <div className="border-t border-zinc-800/60 px-4 py-2.5">
            <a
              href={`https://github.com/${GITHUB_REPO}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              onClick={() => setDropOpen(false)}
            >
              View all releases on GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
