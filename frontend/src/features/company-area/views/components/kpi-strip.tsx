import type { DashboardKpi } from "../../models/types";

interface KpiStripProps {
  items: DashboardKpi[];
}

export function KpiStrip({ items }: KpiStripProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.id} className="border-b border-border bg-white/60 px-4 py-4 shadow-[0_1px_0_0_rgba(16,23,18,0.06)]">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold leading-none tracking-tight">{item.value}</p>
          <p className="mt-2 text-sm text-foreground/68">{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
