import {
  ClipboardCheck,
  FileSpreadsheet,
  FileUp,
  LayoutDashboard,
  Truck,
  Briefcase,
  Trophy,
} from "lucide-react";

export const companyNavItems = [
  {
    href: "/app",
    label: "Painel",
    icon: LayoutDashboard,
  },
  {
    href: "/app/meus-servicos",
    label: "Meus Serviços",
    icon: Briefcase,
  },
  {
    href: "/app/diagnostico",
    label: "Diagnóstico",
    icon: ClipboardCheck,
  },
  {
    href: "/app/evidencias",
    label: "Evidências",
    icon: FileUp,
  },
  {
    href: "/app/fornecedores",
    label: "Cadeia",
    icon: Truck,
  },
  {
    href: "/app/resultados",
    label: "Resultados",
    icon: FileSpreadsheet,
  },
  {
    href: "/app/ranking",
    label: "Ranking",
    icon: Trophy,
  },
] as const;
