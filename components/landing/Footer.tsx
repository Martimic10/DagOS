import { Github, BookOpen, Download, Lock } from "lucide-react";

const links = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Docs", href: "/docs", icon: BookOpen },
  { label: "Download", href: "#quickstart", icon: Download },
  { label: "Privacy", href: "#", icon: Lock },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/70 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {/* Left */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
                <div className="h-1.5 w-1.5 rounded-sm bg-zinc-400" />
              </div>
              <span className="font-mono text-sm font-semibold text-zinc-300 uppercase tracking-widest">
                DagOS
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-600">
              Your local AI command center.
            </p>
          </div>

          {/* Right */}
          <nav className="flex flex-wrap items-center gap-5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  <Icon className="h-3 w-3" />
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-zinc-800/50 pt-6">
          <p className="font-mono text-xs text-zinc-700">
            © {new Date().getFullYear()} DagOS. All rights reserved. Open source
            under MIT license.
          </p>
        </div>
      </div>
    </footer>
  );
}
