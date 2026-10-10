"use client";


import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DiagnosticRunView } from "@/features/company-area/views/pages/diagnostico/diagnostic-run-view";
import { Button } from "@/components/ui/button";
import { diagnosticService, type DiagnosticStartPayload } from "@/features/company-area/services/diagnostic.service";

type DiagnosticRunModel = {
  questions: Array<{
    id: string;
    sectionId: string;
    axis: "E" | "B" | "S" | "G";
    category: string;
    weight: number;
    type?: "ESSENTIAL" | "STRATEGIC" | "DIFFERENTIAL" | "COMPLEMENTARY";
    prompt: string;
    hint: string;
    answer: string;
    hasEvidence: boolean;
    options?: string[];
  }>;
  total: number;
  answered: number;
};

const DIAGNOSTIC_START_CACHE_KEY = "inoveesg:diagnostic-start";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapAxis(axis: DiagnosticStartPayload["questions"][number]["axis"]): "E" | "B" | "S" | "G" {
  if (axis === "ENVIRONMENTAL") return "E";
  if (axis === "BIOECONOMY_CIRCULAR") return "B";
  if (axis === "SOCIAL") return "S";
  return "G";
}

function mapPayloadToRunModel(
  payload: DiagnosticStartPayload,
  filterAxis?: string | null,
  savedAnswers: Record<string, string> = {}
): DiagnosticRunModel {
  const segmentSlug = slugify(payload.industrySegment || "diagnostico");
  
  let allQuestions = payload.questions.map((question) => {
    const qId = `q-${question.number}`;
    return {
      id: qId,
      sectionId: `${segmentSlug}-${mapAxis(question.axis).toLowerCase()}`,
      axis: mapAxis(question.axis),
      category: question.category,
      weight: question.weight ?? 1,
      type: question.type,
      prompt: question.prompt,
      hint: "Selecione a alternativa que melhor representa a situação atual da empresa.",
      answer: savedAnswers[qId] || "",
      hasEvidence: false,
      options: question.options.map((option) => option.text),
    };
  });

  if (filterAxis) {
    allQuestions = allQuestions.filter((q) => q.axis === filterAxis);
  }

  return {
    questions: allQuestions,
    total: allQuestions.length,
    answered: allQuestions.filter((q) => q.answer.trim().length > 0).length,
  };
}

function DiagnosticRunContent() {
  const searchParams = useSearchParams();
  const diagnosticIdFromUrl = searchParams.get("id");
  const axisFromUrl = searchParams.get("axis");
  const isPreDiagnostic = searchParams.get("kind") === "PRE_DIAGNOSTIC";
  const isFinalFromUrl = searchParams.get("final") === "true";

  const [resolvedDiagnosticId, setResolvedDiagnosticId] = useState<string | null>(diagnosticIdFromUrl);
  const [model, setModel] = useState<DiagnosticRunModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockedByConsultoria, setBlockedByConsultoria] = useState(false);

  useEffect(() => {
    async function loadDiagnostic() {
      try {
        let payload: DiagnosticStartPayload | null = null;

        if (typeof window !== "undefined") {
          const cached = window.sessionStorage.getItem(DIAGNOSTIC_START_CACHE_KEY);
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as DiagnosticStartPayload;
              if (!diagnosticIdFromUrl || parsed.diagnosticId === diagnosticIdFromUrl) {
                payload = parsed;
              }
            } catch {
              window.sessionStorage.removeItem(DIAGNOSTIC_START_CACHE_KEY);
            }
          }
        }

        if (!payload) {
    const token = "cookie-session";
          if (!token) {
            setError("Nenhum token de autenticação encontrado.");
            return;
          }

          payload = await diagnosticService.startDiagnostic(token);
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(DIAGNOSTIC_START_CACHE_KEY, JSON.stringify(payload));
          }
        }

        // Carregar respostas salvas do sessionStorage
        let savedAnswers: Record<string, string> = {};
        if (typeof window !== "undefined" && payload.diagnosticId) {
          const saved = window.sessionStorage.getItem(`inoveesg:diagnostic-answers-${payload.diagnosticId}`);
          if (saved) {
            try {
              savedAnswers = JSON.parse(saved);
            } catch (e) {
              console.error("Erro ao parsear respostas salvas:", e);
            }
          }
        }

        setModel(mapPayloadToRunModel(payload, axisFromUrl, savedAnswers));
        setResolvedDiagnosticId(payload.diagnosticId);
      } catch (err) {
        console.error("Failed to load diagnostic questions:", err);
        const message = err instanceof Error ? err.message : "Não foi possível carregar o diagnóstico.";
        setBlockedByConsultoria(message.toLowerCase().includes("consultoria"));
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDiagnostic();
  }, [diagnosticIdFromUrl, axisFromUrl]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Não foi possível iniciar o diagnóstico</p>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        {blockedByConsultoria && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href="/app/upgrade">Contratar consultoria</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
              <Link href="/app/resultados">Ver resultados atuais</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!model || !resolvedDiagnosticId) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground/75 font-medium">Nenhum diagnóstico ativo encontrado.</p>
      </div>
    );
  }

  return (
    <DiagnosticRunView
      model={model}
      diagnosticId={resolvedDiagnosticId}
      axis={axisFromUrl}
      isPreDiagnostic={isPreDiagnostic}
      isFinalFlow={isFinalFromUrl}
    />
  );
}

export default function DiagnosticRunPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <DiagnosticRunContent />
    </Suspense>
  );
}
