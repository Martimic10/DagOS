import Image from "next/image";

const screenshots = [
  {
    label: "Dashboard",
    file: "dashboard.png",
    alt: "DagOS Dashboard — system telemetry and model overview",
  },
  {
    label: "Chat",
    file: "chat.png",
    alt: "DagOS Chat Interface — streaming AI responses",
  },
  {
    label: "Models",
    file: "models.png",
    alt: "DagOS Model Library — install and manage local models",
  },
];

export function Screenshots() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">
            Preview
          </p>
          <h2 className="font-mono text-3xl font-bold text-zinc-100 sm:text-4xl">
            Your Local AI Command Center
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {screenshots.map((shot) => (
            <div
              key={shot.label}
              className="group overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/20 transition-all duration-300 hover:border-zinc-700/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                <Image
                  src={`/screenshots/${shot.file}`}
                  alt={shot.alt}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="border-t border-zinc-800/60 px-4 py-3 flex items-center justify-between">
                <p className="font-mono text-xs text-zinc-500">{shot.label}</p>
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
