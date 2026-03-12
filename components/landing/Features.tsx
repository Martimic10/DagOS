import { Cpu, Package, MessageSquare, FileText } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Local AI Runtime",
    description:
      "Run models entirely on your machine with Ollama. No cloud required — all inference stays local and private.",
  },
  {
    icon: Package,
    title: "Model Library",
    description:
      "Browse and install open-source models with one click. Manage your local model collection from a clean interface.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Interface",
    description:
      "Chat with your locally running models. Streaming responses, conversation history, and code block rendering.",
  },
  {
    icon: FileText,
    title: "File AI",
    description:
      "Upload documents and analyze them with local models. PDFs, text files, and more — all processed on device.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">
            Features
          </p>
          <h2 className="font-mono text-3xl font-bold text-zinc-100 sm:text-4xl">
            Everything you need to run AI locally
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/50 hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all">
                  <Icon className="h-4 w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="mb-2 font-mono text-sm font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
