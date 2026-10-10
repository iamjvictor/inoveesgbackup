import { cn } from "@/lib/utils";
import type { AdminMetric } from "../types";
import {
  BookOpen,
  Building2,
  DollarSign,
  FileSpreadsheet,
  ShieldAlert,
  TrendingUp,
  Users2,
} from "lucide-react";

const iconBgTones = {
  emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
  amber: "bg-amber-50 text-amber-600 border border-amber-100/50",
  slate: "bg-slate-50 text-slate-600 border border-slate-100/50",
  rose: "bg-rose-50 text-rose-600 border border-rose-100/50",
} as const;

const badgeTones = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
} as const;

function getIconForMetric(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("faturamento") || normalized.includes("receita") || normalized.includes("revenue")) {
    return DollarSign;
  }
  if (normalized.includes("orçamento") || normalized.includes("budget")) {
    return FileSpreadsheet;
  }
  if (normalized.includes("cliente") || normalized.includes("client")) {
    return Users2;
  }
  if (normalized.includes("evidência") || normalized.includes("evidence")) {
    return ShieldAlert;
  }
  if (normalized.includes("fornecedor") || normalized.includes("supplier")) {
    return Building2;
  }
  if (normalized.includes("livro") || normalized.includes("book")) {
    return BookOpen;
  }
  return TrendingUp;
}

export function AdminStatCard({ metric }: { metric: AdminMetric }) {
  const tone = metric.tone ?? "slate";
  const Icon = getIconForMetric(metric.label);

  return (
    <article className={cn(
      "group relative rounded-[2rem] border border-slate-200/80 bg-white p-5 transition-all duration-300",
      "hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100/80",
      "flex flex-col justify-between min-h-[160px]"
    )}>
      <div className="flex items-center justify-between">
        {/* Icon Container */}
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105", iconBgTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {/* Badge */}
        <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", badgeTones[tone])}>
          {tone === "emerald" ? "saudável" : tone === "amber" ? "atenção" : tone === "rose" ? "crítico" : "estável"}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {metric.label}
        </span>
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-slate-950 transition-colors">
          {metric.value}
        </p>
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        {metric.detail}
      </p>
    </article>
  );
}
