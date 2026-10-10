import { cn } from "@/lib/utils";
import type { AdminAxis } from "@/features/admin/shared/types";

const axisTone: Record<AdminAxis, string> = {
  E: "bg-emerald-100 text-emerald-700 border-emerald-200",
  B: "bg-cyan-100 text-cyan-700 border-cyan-200",
  S: "bg-sky-100 text-sky-700 border-sky-200",
  G: "bg-amber-100 text-amber-700 border-amber-200",
};

export function OverviewPill({ axis, label }: { axis: AdminAxis; label: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", axisTone[axis])}>
      {label}
    </span>
  );
}
