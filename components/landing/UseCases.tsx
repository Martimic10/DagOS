import { Code2, FlaskConical, Wrench, ShieldCheck } from "lucide-react";

const cards = [
  {
    icon: Code2,
    title: "Developers",
    description:
      "Run models locally, test prompts, and analyze code or logs in one focused workspace.",
  },
  {
    icon: FlaskConical,
    title: "Researchers",
    description:
      "Work with files, compare outputs, and keep experiments organized on your own machine.",
  },
  {
    icon: Wrench,
    title: "Builders",
    description:
      "Use DagOS as a command center for local AI tools, experiments, and model workflows.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-Focused Users",
    description:
      "Keep models, chats, and file analysis local without depending on cloud tools.",
  },
];

export function UseCases() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">
            Built for
          </p>
          <h2 className="mb-4 font-mono text-3xl font-bold text-zinc-100 sm:text-4xl">
            Local AI Workflows
          </h2>
          <p className="mx-auto max-w-lg text-sm text-zinc-500 leading-relaxed">
            DagOS gives developers, researchers, and builders a modern workspace
            for running AI locally.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/40 hover:-translate-y-0.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700 transition-colors">
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-mono text-sm font-semibold text-zinc-100">
                    {card.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
