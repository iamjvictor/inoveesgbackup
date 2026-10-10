"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Building2, ChartNoAxesCombined, FileSpreadsheet, FileText, Landmark, LogOut, ShieldCheck, Users2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthController } from "@/features/auth/controllers/use-auth.controller";
import type { AdminSessionUser } from "../server-auth";

const navigation = [
  { href: "/admin", label: "Visão geral", icon: ChartNoAxesCombined },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/financeiro", label: "Financeiro", icon: Landmark },
  { href: "/admin/livros", label: "Livros", icon: BookOpen },
  { href: "/admin/clientes", label: "Clientes", icon: Building2 },
  { href: "/admin/consultoria", label: "Consultoria", icon: Sparkles },
  { href: "/admin/fornecedores", label: "Fornecedores", icon: Users2 },
  { href: "/admin/evidencias", label: "Evidências", icon: ShieldCheck },
  { href: "/admin/analises", label: "Análises", icon: FileSpreadsheet },
] as const;

export function AdminSidebar({ adminUser }: { adminUser: AdminSessionUser }) {
  const pathname = usePathname();
  const { logout } = useAuthController();
  const displayName = adminUser.fullName ?? adminUser.email;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-slate-950 text-slate-100 lg:flex sticky top-0 h-screen">
      <div className="flex w-full h-full flex-col">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
            Admin Inove ESG
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">
            Painel operacional
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/20">
                {initials || "AD"}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="mt-0.5 break-all text-[11px] leading-4 text-slate-400">{adminUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout("/admin")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
