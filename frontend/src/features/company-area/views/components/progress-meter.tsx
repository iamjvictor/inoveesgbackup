import { cn } from "@/lib/utils";

interface ProgressMeterProps {
  value: number;
  label?: string;
  className?: string;
}

export function ProgressMeter({ value, label, className }: ProgressMeterProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/60">{label}</p> : null}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${safeValue}%` }}
          aria-label={`Progresso ${safeValue}%`}
        />
      </div>
      <p className="text-xs text-foreground/60">{safeValue}%</p>
    </div>
  );
}
