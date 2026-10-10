import { AdminSectionHeading } from "@/features/admin/shared/components/admin-section-heading";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import type { AdminAnalyticsBoardModel } from "@/features/admin/shared/types";
import { AxisCard } from "../../components/axis-card";

export function AdminAnalyticsView({ model }: { model: AdminAnalyticsBoardModel }) {
  return (
    <div className="space-y-8">
      <AdminSectionHeading
        eyebrow="Análises"
        title="Leitura dos pilares e da maturidade"
        description="Consolide score, cobertura de evidências e tendência por pilar para priorizar o trabalho do time."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.metrics.map((metric) => (
          <AdminStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {model.axisInsights.map((axis) => (
            <AxisCard key={axis.axis} axis={axis} />
          ))}
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Maturidade</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Distribuição por faixa</h2>
          </div>

          <div className="space-y-3">
            {model.maturityBands.map((band) => (
              <div key={band.label} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-800">{band.label}</p>
                  <span className="text-sm font-semibold text-slate-900">{band.value}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${
                      band.tone === "emerald"
                        ? "bg-emerald-500"
                        : band.tone === "amber"
                          ? "bg-amber-500"
                          : band.tone === "rose"
                            ? "bg-rose-500"
                            : "bg-slate-500"
                    }`}
                    style={{ width: `${band.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Leituras</p>
            <div className="mt-3 space-y-3">
              {model.notes.map((note) => (
                <div key={note.title}>
                  <p className="font-medium text-white">{note.title}</p>
                  <p className="text-sm leading-6 text-slate-300">{note.description}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
