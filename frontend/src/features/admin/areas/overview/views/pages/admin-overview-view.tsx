import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { AdminSectionHeading } from "@/features/admin/shared/components/admin-section-heading";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminOverviewModel } from "@/features/admin/shared/types";
import { OverviewPill } from "../../components/overview-pill";

export function AdminOverviewView({ model }: { model: AdminOverviewModel }) {
  return (
    <div className="space-y-8">
      <AdminSectionHeading
        eyebrow="Visão geral"
        title="Operação ESG em tempo real"
        description="Painel de leitura rápida para orçamento, contas, evidências, fornecedores e acompanhamento dos pilares do diagnóstico."
        action={
          <Link
            href="/admin/analises"
            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Abrir análises <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {model.metrics?.map((metric) => (
          <AdminStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fila crítica</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Orçamentos e solicitações recentes</h2>
            </div>
            <Link href="/admin/orcamentos" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Ver orçamento
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {model.queue?.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{request.organizationName}</p>
                    <p className="text-sm text-slate-600">{request.sector} · {request.employeeCount}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm font-semibold text-slate-800">{request.proposalValue}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {request.tags.map((tag) => (
                    <OverviewPill key={tag} axis="G" label={tag} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Agenda</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Próximos agendamentos</h2>
            </div>
            <Calendar className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mt-5 space-y-3">
            {!model.upcomingAppointments || model.upcomingAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">Nenhum agendamento próximo</p>
                <p className="mt-1 text-xs text-slate-500">As próximas consultorias confirmadas aparecerão aqui.</p>
              </div>
            ) : model.upcomingAppointments.map((appointment) => {
              const startsAt = new Date(appointment.startsAt);
              return (
                <div key={appointment.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <span className="text-[10px] font-bold uppercase">{startsAt.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")}</span>
                    <span className="text-lg font-extrabold leading-none">{startsAt.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{appointment.organizationName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {startsAt.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" })} às {startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}
                    </p>
                  </div>
                  <AdminStatusBadge label={appointment.status === "CONFIRMED" ? "Confirmado" : "Solicitado"} tone={appointment.status === "CONFIRMED" ? "emerald" : "amber"} />
                </div>
              );
            })}
          </div>

          <Link href="/admin/consultoria" className="mt-5 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Abrir agenda completa <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </article>
      </section>

    </div>
  );
}
