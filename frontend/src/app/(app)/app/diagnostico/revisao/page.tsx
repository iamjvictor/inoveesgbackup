"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getDiagnosticReviewViewModel } from "@/features/company-area/controllers/diagnostic.controller";
import { DiagnosticReviewView } from "@/features/company-area/views/pages/diagnostico/diagnostic-review-view";
import { useCompany } from "@/features/company-area/context/company-context";
import { diagnosticService } from "@/features/company-area/services/diagnostic.service";

export default function DiagnosticReviewPage() {
  const { company, isLoading } = useCompany();
  const [isBlocked, setIsBlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function checkReviewAccess() {
      try {
    const token = "cookie-session";
        if (!token) {
          setIsBlocked(true);
          return;
        }

        const currentDiagnostic = await diagnosticService.getCurrentDiagnostic(token);
        setIsBlocked(currentDiagnostic?.diagnostic?.status === "COMPLETED");
      } catch (error) {
        console.error("Failed to check diagnostic review access:", error);
        setIsBlocked(true);
      } finally {
        setCheckingAccess(false);
      }
    }

    checkReviewAccess();
  }, []);

  if (isLoading || checkingAccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Revisão indisponível</p>
        <p className="mt-2 text-sm text-slate-600">
          Depois do envio das respostas, o diagnóstico não pode mais ser reaberto para revisão.
        </p>
        <div className="mt-5">
          <Button asChild className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            <Link href="/app/diagnostico">Voltar ao painel</Link>
          </Button>
        </div>
      </div>
    );
  }

  const model = getDiagnosticReviewViewModel(company?.industrySegment || undefined);

  return <DiagnosticReviewView model={model} />;
}
