import { LucideProps } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-mono text-xl font-bold text-zinc-100">{title}</h1>
        <p className="font-mono text-xs text-zinc-600">Not yet available</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 py-24 ring-1 ring-inset ring-white/[0.03]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
          <Icon className="h-5 w-5 text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-1 font-mono text-xs text-zinc-700">{description}</p>
        </div>
        <span className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-xs text-zinc-600">
          Coming soon
        </span>
      </div>
    </div>
  );
}
