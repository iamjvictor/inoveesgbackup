import { cn } from "@/lib/utils";
import type { AdminAxisInsight } from "@/features/admin/shared/types";

const barTone = {
  E: "bg-emerald-500",
  B: "bg-cyan-500",
  S: "bg-sky-500",
  G: "bg-amber-500",
} as const;

export function AxisCard({ axis }: { axis: AdminAxisInsight }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{axis.label}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{axis.score}/100</h3>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-medium text-white", barTone[axis.axis])}>
          +{axis.trend} pt
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Resposta</span>
            <span>{axis.responseRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className={cn("h-2 rounded-full", barTone[axis.axis])} style={{ width: `${axis.responseRate}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Evidências</span>
            <span>{axis.evidenceCoverage}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className={cn("h-2 rounded-full", barTone[axis.axis])} style={{ width: `${axis.evidenceCoverage}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">{axis.pendingItems} itens pendentes nessa frente.</p>
    </article>
  );
}
