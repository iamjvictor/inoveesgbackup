import { Mail, TimerReset, TrendingUp } from "lucide-react";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminSupplierSummary } from "@/features/admin/shared/types";

export function SupplierCard({ supplier }: { supplier: AdminSupplierSummary }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{supplier.segment}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{supplier.companyName}</h3>
          <p className="text-sm text-slate-600">{supplier.contactEmail}</p>
        </div>
        <AdminStatusBadge
          label={supplier.status}
          tone={supplier.status === "RESPONDED" ? "emerald" : supplier.status === "OVERDUE" ? "rose" : supplier.status === "ACTIVE" ? "blue" : "amber"}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Progresso</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{supplier.progress}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Score</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{supplier.score}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <TimerReset className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Pendências</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{supplier.evidencePending}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Convidado em {supplier.invitedAt}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Atualizado em {supplier.lastUpdate}</span>
      </div>
    </article>
  );
}
