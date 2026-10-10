import { FileCheck2, FileQuestion, TriangleAlert } from "lucide-react";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminEvidenceSummary } from "@/features/admin/shared/types";

export function EvidenceCard({ evidence }: { evidence: AdminEvidenceSummary }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{evidence.companyName}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{evidence.title}</h3>
          <p className="text-sm text-slate-600">{evidence.supplierName} · {evidence.questionCode}</p>
        </div>
        <AdminStatusBadge
          label={evidence.status}
          tone={evidence.status === "VERIFIED" ? "emerald" : evidence.status === "REJECTED" ? "rose" : "amber"}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <FileQuestion className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Pilar</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{evidence.axis}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <FileCheck2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Revisor</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{evidence.reviewer}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <TriangleAlert className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">Risco</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{evidence.severity}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Arquivo: {evidence.fileName}</span>
        <span className="rounded-full border border-slate-200 px-3 py-1.5">Upload: {evidence.uploadDate}</span>
      </div>
    </article>
  );
}
