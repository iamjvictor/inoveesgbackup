import { Clock3, DollarSign, Phone, Tag } from "lucide-react";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminBudgetRequest } from "@/features/admin/shared/types";

export function BudgetRequestCard({ request }: { request: AdminBudgetRequest }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{request.sector}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{request.organizationName}</h3>
          <p className="text-sm text-slate-600">{request.legalName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AdminStatusBadge
            label={
              request.status === "PENDING" ? "Pendente" :
              request.status === "APPROVED" ? "Aprovado" :
              request.status === "ACTIVE" ? "Ativo" :
              request.status === "REJECTED" ? "Recusado" :
              request.status === "PROPOSAL_SENT" ? "Respondido" :
              request.status
            }
            tone={
              request.status === "PENDING" ? "amber" :
              request.status === "APPROVED" || request.status === "ACTIVE" ? "emerald" :
              request.status === "REJECTED" ? "rose" :
              "slate"
            }
          />
          <p className="text-sm font-semibold text-slate-900">{request.proposalValue}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Objetivo</p>
          <p className="mt-2 text-sm text-slate-700">{request.objective}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Notas</p>
          <p className="mt-2 text-sm text-slate-700">{request.notes ?? "Sem observações adicionais."}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
          <Clock3 className="h-4 w-4" />
          {request.timeline}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
          <Phone className="h-4 w-4" />
          {request.phone}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
          <Tag className="h-4 w-4" />
          {request.focusAreas.join(" · ")}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
          <DollarSign className="h-4 w-4" />
          {request.annualRevenue}
        </span>
      </div>
    </article>
  );
}
