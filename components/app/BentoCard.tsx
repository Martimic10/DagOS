import { cn } from "@/lib/utils";

interface BentoCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export function BentoCard({
  title,
  subtitle,
  children,
  className,
  headerRight,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-zinc-800/70 bg-zinc-950/60 ring-1 ring-inset ring-white/[0.03] overflow-hidden",
        className
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {title}
            </p>
            {subtitle && (
              <p className="font-mono text-[10px] text-zinc-700">{subtitle}</p>
            )}
          </div>
        </div>
        {headerRight && (
          <div className="flex items-center gap-2">{headerRight}</div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">{children}</div>
    </div>
  );
}
