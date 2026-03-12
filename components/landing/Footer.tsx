import Link from "next/link";

const links = [
  { label: "Docs", href: "/docs", external: false },
  { label: "GitHub", href: "https://github.com/Martimic10/DagOS", external: true },
  { label: "Releases", href: "https://github.com/Martimic10/DagOS", external: true },
  { label: "License", href: "https://github.com/Martimic10/DagOS", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/70 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {/* Logo */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
                <div className="h-2 w-2 rounded-sm bg-zinc-400" />
              </div>
              <span className="font-mono text-sm font-semibold text-zinc-300 uppercase tracking-widest">
                DagOS
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-600">
              Open-source local AI workstation.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-800/50 pt-6">
          <p className="font-mono text-xs text-zinc-700">
            © {new Date().getFullYear()} DagOS. Open-source software built for
            local AI workflows.
          </p>
        </div>
      </div>
    </footer>
  );
}
