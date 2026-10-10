"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { getDiagnosticOverviewViewModel } from "@/features/company-area/controllers/diagnostic.controller";
import { DiagnosticOverviewView } from "@/features/company-area/views/pages/diagnostico/diagnostic-overview-view";
import { DiagnosticStartView } from "@/features/company-area/views/pages/diagnostico/diagnostic-start-view";
import { useCompany } from "@/features/company-area/context/company-context";
import { diagnosticService, type DiagnosticCurrentResponse } from "@/features/company-area/services/diagnostic.service";
import { ApiError } from "@/features/company-area/services/diagnostic.service";
import { useErrorModal } from "@/components/ui/error-modal-provider";

const DIAGNOSTIC_START_CACHE_KEY = "inoveesg:diagnostic-start";

export default function DiagnosticPage() {
  const { company, user, isLoading, hasActivePlan } = useCompany();
  const router = useRouter();
  const { showError } = useErrorModal();
  
  const [dbDiagnostic, setDbDiagnostic] = useState<DiagnosticCurrentResponse["diagnostic"]>(null);
  const [isFetchingDiag, setIsFetchingDiag] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const isCompletedDiagnostic = dbDiagnostic?.status === "COMPLETED";

  useEffect(() => {
    async function loadCurrentDiagnostic() {
    const token = "cookie-session";
      if (!token) {
        setIsFetchingDiag(false);
        return;
      }
      try {
        const res = await diagnosticService.getCurrentDiagnostic(token);
        if (res.hasDiagnostic && res.diagnostic) {
          setDbDiagnostic(res.diagnostic);
        }
      } catch (err) {
        console.error("Failed to load current diagnostic:", err);
        const apiError = err instanceof ApiError ? err : null;
        showError({
          code: apiError?.code,
          message: apiError?.status === 503 ? undefined : "Não foi possível carregar o diagnóstico.",
          retry: () => window.location.reload(),
        });
      } finally {
        setIsFetchingDiag(false);
      }
    }

    if (!isLoading && company) {
      loadCurrentDiagnostic();
    } else if (!isLoading && !company) {
      setIsFetchingDiag(false);
    }
  }, [isLoading, company, showError]);

  if (isLoading || isFetchingDiag) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const hasDiagnostic = !!dbDiagnostic;

  const handleStart = async () => {
    setIsStarting(true);
    try {
    const token = "cookie-session";

      const session = await diagnosticService.startDiagnostic(token);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(DIAGNOSTIC_START_CACHE_KEY, JSON.stringify(session));
      }

      // Fetch the diagnostic immediately after starting it to update status & render overview
      const res = await diagnosticService.getCurrentDiagnostic(token);
      if (res.hasDiagnostic && res.diagnostic) {
        setDbDiagnostic(res.diagnostic);
      }
    } catch (err) {
      console.error("Failed to start diagnostic:", err);
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("consultoria")) {
        router.push("/app/upgrade");
      }
    } finally {
      setIsStarting(false);
    }
  };

  if (!hasDiagnostic) {
    return (
      <DiagnosticStartView
        userName={user?.fullName || "Usuário"}
        industrySegment={company?.industrySegment || "Geral"}
        onStart={handleStart}
        isStarting={isStarting}
        eyebrow="Diagnóstico ESG"
        title={<>Olá, <span className="text-emerald-700">{user?.fullName || "Usuário"}</span>!</>}
        description={<>Seu questionário de diagnóstico ESG está pronto para ser preenchido. Esta avaliação foi adaptada especificamente para o segmento de</>}
        buttonLabel="Iniciar Diagnóstico"
        statusLabel="Status: Não Iniciado"
        summaryLabel="Estrutura das 29 Questões"
      />
    );
  }

  return <DiagnosticOverviewView dbDiagnostic={dbDiagnostic} />;
}
