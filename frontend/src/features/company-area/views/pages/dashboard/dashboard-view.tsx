"use client";

import { useCompany } from "../../../context/company-context";
import { PreDiagnosticResultsView } from "../diagnostico/pre-diagnostic-results-view";

export function DashboardView() {
  const { user, isLoading } = useCompany();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          Olá, {user?.fullName?.split(" ")[0] || "Empresa"}! 👋
        </h1>
      </div>
      <PreDiagnosticResultsView />
    </div>
  );
}
