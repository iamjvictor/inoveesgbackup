"use client";

import { useEffect, useState } from "react";

import { getResultsViewModel } from "@/features/company-area/controllers/results.controller";
import { ResultsView } from "@/features/company-area/views/pages/resultados/results-view";
import { diagnosticService, type DiagnosticHistoryItem } from "@/features/company-area/services/diagnostic.service";
import { ApiError } from "@/features/company-area/services/diagnostic.service";
import { useErrorModal } from "@/components/ui/error-modal-provider";
import { useCompany } from "@/features/company-area/context/company-context";

import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();
  const { showError } = useErrorModal();
  const { isLoading: companyLoading, isSupplierOnly } = useCompany();
  const [dbDiagnostic, setDbDiagnostic] = useState<any>(null);
  const [history, setHistory] = useState<DiagnosticHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
    const token = "cookie-session";
        if (!token) {
          setIsLoading(false);
          return;
        }
        const [res, hist] = await Promise.all([
          diagnosticService.getCurrentDiagnostic(token),
          diagnosticService.getDiagnosticHistory(token).catch(err => {
            console.error("Failed to load diagnostic history:", err);
            const apiError = err instanceof ApiError ? err : null;
            showError({ code: apiError?.code, retry: () => window.location.reload() });
            return [];
          })
        ]);
        setHistory(hist);

        if (res.hasDiagnostic && res.diagnostic) {
          setDbDiagnostic(res.diagnostic);
        }
      } catch (err) {
        console.error("Failed to load results:", err);
        const apiError = err instanceof ApiError ? err : null;
        showError({ code: apiError?.code, retry: () => window.location.reload() });
      } finally {
        setIsLoading(false);
      }
    }
    loadResults();
  }, [showError]);

  useEffect(() => {
    if (!isLoading && (!dbDiagnostic || dbDiagnostic.status !== "COMPLETED")) {
      router.replace("/app/diagnostico");
    }
  }, [isLoading, dbDiagnostic, router]);

  if (isLoading || companyLoading || !dbDiagnostic || dbDiagnostic.status !== "COMPLETED") {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  // Get base model structures
  const baseModel = getResultsViewModel({ isSupplierOrg: isSupplierOnly });

  // If we have diagnostic from DB, override with dynamic real data or aligned fallback mocks!
  if (dbDiagnostic) {
    const scoreObj = dbDiagnostic.score;
    const isPreDiagnostic = dbDiagnostic.kind === "PRE_DIAGNOSTIC";
    
    // Obter notas reais ou fallback para mocks
    const overallScore = scoreObj ? Math.round(Number(scoreObj.overallScore || 0)) : 0;
    const envScore = scoreObj ? Math.round(Number(scoreObj.environmentalScore || 0)) : 0;
    const bioScore = scoreObj ? Math.round(Number(scoreObj.bioeconomyCircularScore || 0)) : 0;
    const socScore = scoreObj ? Math.round(Number(scoreObj.socialScore || 0)) : 0;
    const govScore = scoreObj ? Math.round(Number(scoreObj.governanceScore || 0)) : 0;

    const globalProven = Math.round(Number(scoreObj?.provenOverallScore || 0));
    const envProven = Math.round(Number(scoreObj?.provenEnvironmentalScore || 0));
    const bioProven = Math.round(Number(scoreObj?.provenBioeconomyCircularScore || 0));
    const socProven = Math.round(Number(scoreObj?.provenSocialScore || 0));
    const govProven = Math.round(Number(scoreObj?.provenGovernanceScore || 0));

    baseModel.globalScore = overallScore;
    baseModel.globalProvenScore = globalProven;
    baseModel.isPreDiagnostic = isPreDiagnostic;
    baseModel.isSupplierOrg = isSupplierOnly || dbDiagnostic.kind === "SUPPLIER_DIAGNOSTIC";

    // Map dynamic axis scores and interpretations based on database scores
    const getInterpretation = (score: number, axis: string) => {
      const axisName = axis === "E" ? "ambiental" : axis === "B" ? "de bioeconomia circular" : axis === "S" ? "social" : "de governança";
      const excellentThreshold = isSupplierOnly ? 32 : 80;
      const structuredThreshold = isSupplierOnly ? 24 : 60;
      const intermediateThreshold = isSupplierOnly ? 16 : 40;

      if (score >= excellentThreshold) {
        return `Excelente maturidade ${axisName}. Práticas avançadas consolidadas com ótimo acompanhamento de metas e indicadores.`;
      } else if (score >= structuredThreshold) {
        return `Desempenho ${axisName} estruturado. Processos em execução regular com oportunidades pontuais de aprimoramento.`;
      } else if (score >= intermediateThreshold) {
        return `Maturidade ${axisName} em nível intermediário. Políticas iniciadas, demandando maior formalização e auditoria.`;
      } else {
        return `Nível ${axisName} crítico/inicial. Alta necessidade de estruturação de processos e conformidade básica.`;
      }
    };

    baseModel.axisScores = [
      {
        axis: "E",
        score: envScore,
        provenScore: envProven,
        interpretation: getInterpretation(envScore, "E"),
      },
      {
        axis: "B",
        score: bioScore,
        provenScore: bioProven,
        interpretation: getInterpretation(bioScore, "B"),
      },
      {
        axis: "S",
        score: socScore,
        provenScore: socProven,
        interpretation: getInterpretation(socScore, "S"),
      },
      {
        axis: "G",
        score: govScore,
        provenScore: govProven,
        interpretation: getInterpretation(govScore, "G"),
      },
    ];
  }

  return <ResultsView model={baseModel} history={history} />;
}
