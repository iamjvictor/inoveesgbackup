"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { useCompany } from "../../context/company-context";
import { canAccessEvidenceRoute, canAccessSuppliersRoute } from "../../access/route-access";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isUnpaid, isSupplierOnly, hasOnlyPreDiagnostic, hasInviteAccess, hasEvidenceAccess, hasPreDiagnosticAccess, isLoading } = useCompany();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Se não há usuário logado (falha no token ou deslogado), manda para a landing com login aberto
    if (!user) {
      router.push("/?auth=true");
      return;
    }

    if (pathname.startsWith("/app/evidencias") && !canAccessEvidenceRoute({ hasEvidenceAccess, hasPreDiagnosticAccess })) {
      router.push("/app/upgrade");
      return;
    }

    if (pathname.startsWith("/app/diagnostico") && !isSupplierOnly && !hasPreDiagnosticAccess) {
      router.push("/app/upgrade");
      return;
    }

    if (pathname.startsWith("/app/fornecedores") && !canAccessSuppliersRoute({ hasInviteAccess })) {
      router.push("/app/upgrade");
      return;
    }

    if (pathname.startsWith("/app/ranking") && !hasInviteAccess) {
      router.push("/app/upgrade");
      return;
    }

    // Redirecionamento para usuário não-pagante
    if (isUnpaid) {
      if (!isSupplierOnly) {
        const allowedPaths = ["/app/upgrade", "/app/perfil", "/app/meus-servicos", "/app/checkout"];
        const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
        if (!isAllowed) {
          router.push("/app/upgrade");
          return;
        }
      } else {
        const allowedPaths = ["/app", "/app/perfil", "/app/meus-servicos"];
        const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
        if (!isAllowed) {
          router.push("/app");
          return;
        }
      }
    }

    // Se o usuário tem apenas pré-diagnóstico e tentar acessar qualquer rota bloqueada
      if (hasOnlyPreDiagnostic) {
        const allowedPaths = [
          "/app",
          "/app/diagnostico",
          "/app/perfil",
          "/app/upgrade",
          "/app/checkout",
          "/app/meus-servicos",
        ];
        if (hasInviteAccess) {
          allowedPaths.push("/app/convites");
          allowedPaths.push("/app/fornecedores");
        }
        const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
        if (!isAllowed) {
          router.push("/app/upgrade");
        }
      }
  }, [user, isUnpaid, isSupplierOnly, hasOnlyPreDiagnostic, hasInviteAccess, hasEvidenceAccess, hasPreDiagnosticAccess, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-slate-500 text-sm font-medium">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#ebf1e7_0%,_var(--background)_36%,_var(--background)_100%)] text-foreground overflow-x-hidden">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col min-w-0">
          <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 pt-20 pb-8 md:px-8 md:py-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
