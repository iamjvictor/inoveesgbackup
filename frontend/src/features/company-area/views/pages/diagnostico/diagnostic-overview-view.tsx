"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "../../components/section-heading";
import { ApiError, diagnosticService, type DiagnosticStartPayload } from "@/features/company-area/services/diagnostic.service";
import { useErrorModal } from "@/components/ui/error-modal-provider";
import {
  Leaf, 
  Recycle, 
  Heart, 
  Scale, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ClipboardCheck,
  Award,
  Download,
  FileCheck,
  Loader2
} from "lucide-react";

type OverviewQuestion = Omit<DiagnosticStartPayload["questions"][number], "axis"> & {
  id: string;
  axis: "E" | "B" | "S" | "G";
};

interface DiagnosticOverviewViewProps {
  dbDiagnostic: {
    id: string;
    kind?: "PRE_DIAGNOSTIC" | "FULL_DIAGNOSTIC" | "SUPPLIER_DIAGNOSTIC";
    status?: string | null;
    percentageCompletion?: number | null;
    score?: {
      environmentalScore?: number | null;
      bioeconomyCircularScore?: number | null;
      socialScore?: number | null;
      governanceScore?: number | null;
      overallScore?: number | null;
      maturityLevel?: string | null;
    } | null;
    _count?: {
      responses: number;
    };
    responses?: Array<{
      questionOrder: number;
      axis: "ENVIRONMENTAL" | "BIOECONOMY_CIRCULAR" | "SOCIAL" | "GOVERNANCE";
      answerText?: string | null;
    }>;
  };
}

function ScoreRing({ 
  percentage, 
  colorClass, 
  bgCircleClass = "text-slate-100", 
  size = 110,
  strokeWidth = 8 
}: { 
  percentage: number; 
  colorClass: string; 
  bgCircleClass?: string; 
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          className={bgCircleClass} 
        />
        <circle
          cx={size / 2} 
          cy={size / 2} 
          r={radius}
          fill="none" 
          stroke="currentColor" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference} 
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight text-slate-800">{percentage}%</span>
      </div>
    </div>
  );
}

export function DiagnosticOverviewView({ dbDiagnostic }: DiagnosticOverviewViewProps) {
  const { showError } = useErrorModal();
  const isCompleted = dbDiagnostic?.status === "COMPLETED";
  const [questions, setQuestions] = useState<OverviewQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
    const token = "cookie-session";
        if (!token) {
          setLoadError("Sessão expirada. Faça login novamente.");
          return;
        }

        const session = await diagnosticService.startDiagnostic(token);
        const mapped = session.questions.map<OverviewQuestion>((question) => {
          let axis: OverviewQuestion["axis"] = "G";
          if (question.axis === "ENVIRONMENTAL") axis = "E";
          else if (question.axis === "BIOECONOMY_CIRCULAR") axis = "B";
          else if (question.axis === "SOCIAL") axis = "S";

          return {
            ...question,
            id: `q-${question.number}`,
            axis,
          };
        });

        setQuestions(mapped);
      } catch (error) {
        console.error("Failed to load diagnostic questions:", error);
        if (!isCompleted) {
          setLoadError("Não foi possível carregar a estrutura do diagnóstico.");
        }
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    loadQuestions();
  }, [isCompleted]);

  const handleDownload = async () => {
    console.log("[handleDownload] Download do relatório a partir do painel de diagnóstico");
    const reportWindow = window.open("about:blank", "_blank");

    if (reportWindow) {
      reportWindow.document.write(`
        <!doctype html>
        <html lang="pt-BR">
          <head><meta charset="utf-8"><title>Gerando relatório</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;font-family:Arial,sans-serif;color:#334155">
            <div style="text-align:center"><div style="font-size:18px;font-weight:700;margin-bottom:8px">Gerando relatório ESG</div><div style="font-size:14px;color:#64748b">Aguarde enquanto o PDF é preparado...</div></div>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }

    try {
      setDownloading(true);
    const token = "cookie-session";
      if (!token) {
        reportWindow?.close();
        showError({ title: "Sessão não encontrada", message: "Por favor, faça login novamente." });
        return;
      }
      const blob = await diagnosticService.downloadReport(token);
      const url = window.URL.createObjectURL(blob);
      if (reportWindow) {
        window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
        reportWindow.location.replace(url);
      } else {
        window.URL.revokeObjectURL(url);
        showError({
          title: "Não foi possível abrir o relatório",
          message: "Permita pop-ups para este site e tente novamente.",
        });
      }
    } catch (err: unknown) {
      reportWindow?.close();
      const apiError = err instanceof ApiError ? err : null;
      showError({
        code: apiError?.code,
        message: apiError?.status === 503 ? undefined : err instanceof Error ? err.message : undefined,
        retry: () => window.location.reload(),
      });
    } finally {
      setDownloading(false);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (loadError && !isCompleted) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Erro de carregamento</p>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
      </div>
    );
  }

  // Define components for each axis
  const pillarsConfig = [
    {
      key: "E",
      title: "Ambiental",
      description: "Avalia a pegada ecológica, eficiência energética, recursos hídricos, resíduos e emissões de carbono.",
      icon: Leaf,
      color: "emerald",
      bgClass: "bg-emerald-50/40 border-emerald-250/70 hover:shadow-emerald-100/50",
      textClass: "text-emerald-700",
      ringClass: "text-emerald-600",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      key: "B",
      title: "Bioeconomia Circular",
      description: "Mapeia a circularidade de materiais, reaproveitamento de coprodutos e sustentabilidade da cadeia.",
      icon: Recycle,
      color: "amber",
      bgClass: "bg-amber-50/40 border-amber-250/70 hover:shadow-amber-100/50",
      textClass: "text-amber-700",
      ringClass: "text-amber-500",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white border-none",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "S",
      title: "Social",
      description: "Examina a saúde ocupacional, direitos humanos, diversidade, relações comunitárias e segurança do trabalho.",
      icon: Heart,
      color: "blue",
      bgClass: "bg-blue-50/40 border-blue-250/70 hover:shadow-blue-100/50",
      textClass: "text-blue-700",
      ringClass: "text-blue-600",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white border-none",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      key: "G",
      title: "Governança",
      description: "Mede o canal de ética, compliance legal, transparência corporativa e práticas de conselho consultivo.",
      icon: Scale,
      color: "violet",
      bgClass: "bg-violet-50/40 border-violet-250/70 hover:shadow-violet-100/50",
      textClass: "text-violet-700",
      ringClass: "text-violet-600",
      btnClass: "bg-violet-600 hover:bg-violet-700 text-white border-none",
      badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    },
  ];

  const savedResponses = dbDiagnostic?.responses ?? [];
  const savedCountByAxis = {
    E: savedResponses.filter(r => r.axis === "ENVIRONMENTAL").length,
    B: savedResponses.filter(r => r.axis === "BIOECONOMY_CIRCULAR").length,
    S: savedResponses.filter(r => r.axis === "SOCIAL").length,
    G: savedResponses.filter(r => r.axis === "GOVERNANCE").length,
  };

  const totalQuestions = questions.length > 0
    ? questions.length
    : Object.values(savedCountByAxis).reduce((a, b) => a + b, 0);

  const answeredByAxis = savedResponses.reduce(
    (acc, response) => {
      if (response.axis === "ENVIRONMENTAL") acc.E += 1;
      else if (response.axis === "BIOECONOMY_CIRCULAR") acc.B += 1;
      else if (response.axis === "SOCIAL") acc.S += 1;
      else if (response.axis === "GOVERNANCE") acc.G += 1;
      return acc;
    },
    { E: 0, B: 0, S: 0, G: 0 }
  );

  const pillars = pillarsConfig.map((p) => {
    const axisQuestions = questions.filter((q) => q.axis === p.key);
    const totalCount = axisQuestions.length > 0 ? axisQuestions.length : savedCountByAxis[p.key as keyof typeof savedCountByAxis];
    const scoreMap: Record<string, number | null | undefined> = {
      E: dbDiagnostic?.score?.environmentalScore,
      B: dbDiagnostic?.score?.bioeconomyCircularScore,
      S: dbDiagnostic?.score?.socialScore,
      G: dbDiagnostic?.score?.governanceScore,
    };
    const savedScore = scoreMap[p.key];

    if (savedScore !== null && savedScore !== undefined) {
      const score = Math.round(Number(savedScore));
      return {
        ...p,
        status: "completed",
        percentage: score,
        labelText: `Nota: ${score}%`,
        totalCount,
        answeredCount: totalCount
      };
    } else {
      const answeredCount = isCompleted ? totalCount : answeredByAxis[p.key as keyof typeof answeredByAxis];
      const percentage = isCompleted ? 100 : (totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0);
      
      let status = isCompleted ? "finished" : "not_started";
      let labelText = isCompleted ? "Concluído" : "Não Iniciado";
      if (!isCompleted && answeredCount > 0 && answeredCount < totalCount) {
        status = "in_progress";
        labelText = `${answeredCount} de ${totalCount} resp.`;
      } else if (answeredCount > 0 && answeredCount === totalCount) {
        status = "finished";
        labelText = "Concluído";
      }

      return {
        ...p,
        status,
        percentage,
        labelText,
        totalCount,
        answeredCount,
      };
    }
  });

  const totalAnswered = Math.min(
    savedResponses.length,
    totalQuestions > 0 ? totalQuestions : savedResponses.length
  );
  const overallProgress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  const allPillarsFinished = pillars.every((p) => p.status === "finished" || p.status === "completed");

  const overallScore = dbDiagnostic?.score?.overallScore != null
    ? Math.round(Number(dbDiagnostic.score.overallScore))
    : 0;


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {!isCompleted && (
        <SectionHeading
          eyebrow="Painel ESG"
          title="Painel de Provas do Diagnóstico"
          description="O diagnóstico está dividido em 4 provas independentes. Complete cada eixo para liberar o envio final."
        />
      )}

      {/* ── Status Banner for Completed Diagnostic ── */}
      {isCompleted && (
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-200/80 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-8 text-white shadow-md">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Award className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                Pontuação Geral: {overallScore}%
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-2.5 shadow-lg border-none cursor-pointer rounded-2xl h-12 px-6"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Gerando...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5" /> Baixar Relatório PDF
                  </>
                )}
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-emerald-400/40 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-800/60 hover:text-white font-bold gap-2 rounded-2xl h-12 px-6"
              >
                <Link href="/app/resultados">
                  Ver Resultados Detalhados <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Progresso Geral (para diagnostics em andamento) ── */}
      {!isCompleted && (
        <div className="relative rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">Progresso Geral do Diagnóstico</p>
              <p className="text-xs text-slate-500 mt-1">
                Você respondeu {totalAnswered} de {totalQuestions} perguntas totais no ciclo atual.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-800">{overallProgress}%</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                {overallProgress === 100 ? "Pronto para Enviar" : "Em Andamento"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Pillar Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div 
              key={pillar.key}
              className={`group flex flex-col justify-between rounded-[28px] border p-6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${pillar.bgClass}`}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-12 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-700 shadow-sm transition group-hover:scale-110`}>
                      <Icon className={`size-6 ${pillar.textClass}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-slate-800">{pillar.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        <span>Eixo {pillar.key}</span>
                        <span className="text-slate-300">•</span>
                        <span>{pillar.answeredCount}/{pillar.totalCount} Questões</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${pillar.badgeClass}`}>
                    {pillar.labelText}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600 min-h-[48px]">
                  {pillar.description}
                </p>
              </div>

              {/* Progress and CTA section */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                {/* Visual score circle */}
                {pillar.percentage > 0 || isCompleted ? (
                  <ScoreRing 
                    percentage={pillar.percentage} 
                    colorClass={pillar.ringClass} 
                    bgCircleClass="text-slate-100" 
                    size={80}
                    strokeWidth={6}
                  />
                ) : (
                  <div className="flex size-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-200 text-slate-400">
                    <AlertCircle className="size-5" />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Pendente</span>
                  </div>
                )}

                {/* Button actions */}
                {!isCompleted ? (
                  pillar.status === "finished" ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                      <CheckCircle2 className="size-5" /> Concluído
                    </div>
                  ) : (
                    <Button asChild className={`rounded-2xl font-bold h-11 px-5 ${pillar.btnClass}`}>
                      <Link href={`/app/diagnostico/preencher?id=${dbDiagnostic.id}&axis=${pillar.key}`}>
                        {pillar.status === "not_started" ? (
                          <>
                            Iniciar Prova <Play className="size-4 ml-1.5 fill-current" />
                          </>
                        ) : (
                          <>
                            Continuar Prova <ArrowRight className="size-4 ml-1.5" />
                          </>
                        )}
                      </Link>
                    </Button>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                    <CheckCircle2 className="size-5" /> Prova Finalizada
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Declaração Final (apenas para diagnósticos em andamento) ── */}
      {!isCompleted && (
        <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-emerald-600" />
                <h3 className="text-lg font-bold tracking-tight text-slate-800">Conclusão e Declaração Final</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 max-w-2xl">
                Após responder todas as 4 provas acima, o botão de finalização será liberado. Você precisará ler e aceitar o Termo de Autorresponsabilidade antes do envio para cálculo.
              </p>
            </div>
            
            <Button 
              asChild 
              disabled={!allPillarsFinished}
              className={`rounded-2xl font-bold h-12 px-6 shadow-md transition-all duration-300 ${
                allPillarsFinished 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none scale-100 hover:scale-105" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-250 border-none"
              }`}
            >
              {allPillarsFinished ? (
                <Link href={`/app/diagnostico/preencher?id=${dbDiagnostic.id}&kind=${dbDiagnostic.kind ?? "FULL_DIAGNOSTIC"}&final=true`}>
                  Finalizar Diagnóstico <Award className="size-4 ml-2" />
                </Link>
              ) : (
                <span className="flex items-center">
                  Aguardando Provas <ArrowRight className="size-4 ml-2" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
