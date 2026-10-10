import { Building2, ShieldCheck, Users2 } from "lucide-react";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminClientSummary } from "@/features/admin/shared/types";

export function ClientCard({ client }: { client: AdminClientSummary }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{client.segment}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{client.tradeName}</h3>
          <p className="text-sm text-slate-600">{client.legalName}</p>
        </div>
        <AdminStatusBadge
          label={client.health}
          tone={client.health === "healthy" ? "emerald" : client.health === "watch" ? "amber" : "rose"}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Plano</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{client.plan}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Score</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{client.score}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Users2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Usuários</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{client.activeUsers}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Evidências pendentes: {client.evidencePending}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Cobertura fornecedores: {client.supplierCoverage}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Último diagnóstico: {client.lastDiagnosticAt}</span>
      </div>
    </article>
  );
}
