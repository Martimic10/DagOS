import Link from "next/link";
import {
  Check,
  Minus,
  ArrowRight,
  Download,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

// ── Data ──────────────────────────────────────────────────────────────────────

const freeFeatures = [
  "Run local AI models",
  "Chat with installed models",
  "Model library",
  "Install models with one click",
  "File analysis tools",
  "System monitor",
  "Conversation sync",
  "Basic settings",
];

const proFeatures = [
  "Everything in Free",
  "Model Playground — compare models",
  "Advanced AI workflows",
  "Model benchmarking tools",
  "Priority feature releases",
  "Advanced system analytics",
  "Pro badge",
];

const comparisonRows = [
  { feature: "Run local models",    free: true,  pro: true  },
  { feature: "Chat with models",    free: true,  pro: true  },
  { feature: "Install models",      free: true,  pro: true  },
  { feature: "Conversation sync",   free: true,  pro: true  },
  { feature: "File analysis",       free: true,  pro: true  },
  { feature: "System monitoring",   free: true,  pro: true  },
  { feature: "Model Playground",    free: false, pro: true  },
  { feature: "Advanced workflows",  free: false, pro: true  },
  { feature: "Benchmark tools",     free: false, pro: true  },
];

const faqs = [
  {
    q: "Is DagOS really free?",
    a: "Yes. You can run AI locally on your computer without paying anything. The Free plan includes everything you need to get started.",
  },
  {
    q: "Do I need powerful hardware?",
    a: "DagOS works with many lightweight models and scales up depending on your machine. Even a modern laptop can run smaller models well.",
  },
  {
    q: "What does Pro unlock?",
    a: "Pro unlocks advanced tools like the Model Playground and future workflow automation features designed for power users.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Pro subscriptions can be canceled at any time with no hidden fees or lock-in periods.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {included ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500/80" />
      ) : (
        <Minus className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
      )}
      <span className={`font-mono text-xs ${included ? "text-zinc-300" : "text-zinc-600"}`}>
        {label}
      </span>
    </div>
  );
}

function CompareCell({ value }: { value: boolean }) {
  return (
    <td className="px-6 py-3.5 text-center">
      {value ? (
        <div className="flex justify-center">
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
      ) : (
        <div className="flex justify-center">
          <Minus className="h-4 w-4 text-zinc-700" />
        </div>
      )}
    </td>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-zinc-800/60 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4">
        <span className="font-mono text-sm font-medium text-zinc-200">{q}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <p className="pb-5 font-mono text-xs leading-relaxed text-zinc-500">{a}</p>
    </details>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12)_0%,transparent_65%)]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06)_0%,transparent_65%)]" />
      </div>

      <Header />

      <main className="pt-24">

        {/* ── HERO ── */}
        <section className="px-6 pt-16 pb-20 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="font-mono text-xs text-zinc-400">Simple, transparent pricing</span>
            </div>
            <h1 className="mb-4 font-mono text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
              Simple{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="mb-3 text-lg text-zinc-400 leading-relaxed">
              Run AI locally for free. Upgrade to Pro for advanced tools and workflows.
            </p>
            <p className="font-mono text-sm text-zinc-600">
              DagOS is free to use as a local AI workstation. Pro unlocks advanced capabilities for power users.
            </p>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">

            {/* Free */}
            <div className="flex flex-col rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-7">
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                    Free
                  </span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[10px] text-zinc-600">
                    Current plan
                  </span>
                </div>
                <div className="mb-2 flex items-end gap-1">
                  <span className="font-mono text-4xl font-bold text-zinc-100">$0</span>
                  <span className="mb-1 font-mono text-sm text-zinc-600">/ month</span>
                </div>
                <p className="font-mono text-xs text-zinc-500">
                  Everything you need to run AI locally.
                </p>
              </div>

              <div className="mb-7 flex flex-col gap-2.5">
                {freeFeatures.map((f) => (
                  <FeatureRow key={f} label={f} included />
                ))}
              </div>

              <div className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full h-10 gap-2 border border-zinc-700/80 bg-zinc-900/60 font-mono text-sm text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-100 transition-all"
                  asChild
                >
                  <Link href="/docs#download">
                    <Download className="h-4 w-4" />
                    Download DagOS
                  </Link>
                </Button>
              </div>
            </div>

            {/* Pro */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-zinc-950/60 p-7">
              {/* Corner accents */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-0 h-16 w-px bg-gradient-to-b from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 left-0 h-px w-16 bg-gradient-to-r from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 right-0 h-16 w-px bg-gradient-to-b from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 right-0 h-px w-16 bg-gradient-to-l from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[300px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
              </div>

              <div className="relative mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">
                    Pro
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-0.5 font-mono text-[10px] text-indigo-400">
                    <span className="h-1 w-1 rounded-full bg-indigo-400" />
                    Recommended
                  </span>
                </div>
                <div className="mb-2 flex items-end gap-1">
                  <span className="font-mono text-4xl font-bold text-zinc-100">$12</span>
                  <span className="mb-1 font-mono text-sm text-zinc-500">/ month</span>
                </div>
                <p className="font-mono text-xs text-zinc-500">
                  Advanced tools for AI power users.
                </p>
              </div>

              <div className="relative mb-7 flex flex-col gap-2.5">
                {proFeatures.map((f, i) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${
                        i === 0 ? "text-zinc-600" : "text-indigo-400/80"
                      }`}
                    />
                    <span
                      className={`font-mono text-xs ${
                        i === 0 ? "text-zinc-500" : "text-zinc-300"
                      }`}
                    >
                      {f}
                      {(f.includes("coming soon") || f.includes("workflows")) && (
                        <span className="ml-2 rounded border border-indigo-900/60 bg-indigo-950/40 px-1.5 py-0.5 font-mono text-[9px] text-indigo-500">
                          soon
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative mt-auto">
                <Button
                  className="w-full h-10 gap-2 bg-white font-mono text-sm text-zinc-950 hover:bg-zinc-100 transition-all shadow-lg shadow-white/5"
                  asChild
                >
                  <Link href="/signup">
                    Upgrade to Pro
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE COMPARISON ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Compare
              </p>
              <h2 className="font-mono text-2xl font-bold text-zinc-100 sm:text-3xl">
                Feature comparison
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/60">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/70">
                    <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center font-mono text-[10px] uppercase tracking-widest text-indigo-500">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {comparisonRows.map(({ feature, free, pro }, i) => (
                    <tr
                      key={feature}
                      className={`transition-colors ${
                        i % 2 === 0 ? "bg-transparent" : "bg-zinc-900/20"
                      } ${!free && pro ? "bg-indigo-950/10" : ""}`}
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-zinc-400">
                        {feature}
                        {!free && pro && (
                          <span className="ml-2 rounded border border-indigo-900/60 bg-indigo-950/40 px-1.5 py-0.5 font-mono text-[9px] text-indigo-500">
                            pro
                          </span>
                        )}
                      </td>
                      <CompareCell value={free} />
                      <CompareCell value={pro} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                Questions
              </p>
              <h2 className="font-mono text-2xl font-bold text-zinc-100 sm:text-3xl">
                Frequently asked
              </h2>
            </div>
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-7 py-2">
              {faqs.map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-zinc-950/60 px-8 py-20 text-center">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.2)_0%,transparent_60%)]" />
                <div className="absolute top-0 left-0 h-16 w-px bg-gradient-to-b from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 left-0 h-px w-16 bg-gradient-to-r from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 right-0 h-16 w-px bg-gradient-to-b from-indigo-500/40 to-transparent" />
                <div className="absolute top-0 right-0 h-px w-16 bg-gradient-to-l from-indigo-500/40 to-transparent" />
              </div>
              <div className="relative">
                <h2 className="mb-4 font-mono text-3xl font-bold text-zinc-100 sm:text-4xl leading-tight">
                  Start building with
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    local AI today.
                  </span>
                </h2>
                <p className="mb-10 font-mono text-sm text-zinc-500">
                  Free forever. Upgrade when you&apos;re ready.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-11 gap-2 px-7 font-mono text-sm border border-zinc-700/60 text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100 hover:border-zinc-600 transition-all"
                    asChild
                  >
                    <Link href="/docs#download">
                      <Download className="h-4 w-4" />
                      Download DagOS
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    className="h-11 gap-2 px-7 font-mono text-sm bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-lg shadow-white/10"
                    asChild
                  >
                    <Link href="/signup">
                      Upgrade to Pro
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
