import { cn } from "@/lib/utils";
import type { SectionStatus, SupplierStatus } from "../../models/types";

const labels = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  convidado: "Convidado",
  respondido: "Respondido",
  pendente: "Pendente",
  expirado: "Expirado",
} as const;

type StatusValue = SectionStatus | SupplierStatus;

interface StatusPillProps {
  status: StatusValue;
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "concluido" || status === "respondido"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "",
        status === "em_andamento" || status === "convidado"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "",
        status === "nao_iniciado" || status === "pendente"
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : "",
        status === "expirado" ? "border-red-200 bg-red-50 text-red-700" : ""
      )}
    >
      {labels[status]}
    </span>
  );
}
