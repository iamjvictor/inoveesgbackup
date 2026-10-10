"use client";

import React, { useEffect } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Users, 
  Scale, 
  FileText, 
  Mail, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  ArrowRight, 
  BookOpen, 
  Download, 
  Clock, 
  HelpCircle,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { strategicDiagnosticPricing } from "@/app/(app)/app/upgrade/strategic-diagnostic-pricing";

export interface DemandServiceItemData {
  id: string;
  name: string;
  description: string;
  priceFormatted: string | null;
  productCode?: "PRE_DIAGNOSTIC" | "PRE_DIAGNOSTIC_PLUS" | "FULL_DIAGNOSTIC" | "FULL_DIAGNOSTIC_PLUS" | "CONSULTING_1H" | "LIVRO_ESG";
  detailVariant?: "strategic-diagnostic";
  installmentLabel?: string;
  fullPriceLabel?: string;
  type: string;
  requiresBudget: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface DemandServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: DemandServiceItemData | null;
  displayPrice: string;
  onConfirmCheckout: (service: DemandServiceItemData, includeConsulting?: boolean) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function DemandServiceDetailModal({
  isOpen,
  onClose,
  service,
  displayPrice,
  onConfirmCheckout,
  isLoading,
  error
}: DemandServiceDetailModalProps) {
  const [includeConsulting, setIncludeConsulting] = React.useState(false);

  useEffect(() => {
    setIncludeConsulting(false);
  }, [isOpen, service?.id]);

  // Fecha com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !service) return null;

  const isPreDiag = service.id === "pre-diag" || service.productCode === "PRE_DIAGNOSTIC";
  const isPreDiagPlus = service.id === "pre-diag-plus" || service.productCode === "PRE_DIAGNOSTIC_PLUS";
  const isConsulting = service.id === "consulting-1h" || service.productCode === "CONSULTING_1H";
  const isBook = service.id === "livro-esg" || service.productCode === "LIVRO_ESG";
  const isStrategicDiagnostic = service.detailVariant === "strategic-diagnostic" || service.productCode === "FULL_DIAGNOSTIC";

  const IconComponent = service.icon || (isStrategicDiagnostic ? ShieldCheck : isPreDiag ? Zap : isPreDiagPlus ? Users : isBook ? BookOpen : Users);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className={`h-1.5 w-full ${isPreDiagPlus ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" : "bg-emerald-600"}`} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isPreDiagPlus ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20" : "bg-emerald-50 text-emerald-600"}`}>
              <IconComponent className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {isStrategicDiagnostic ? "Serviço 02 · Verificação Estratégica" : isPreDiagPlus ? "Pacote Recomendado" : isPreDiag ? "Serviço Autodeclarável" : "Serviço Especializado"}
                </span>
                {service.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Sparkles className="h-2.5 w-2.5" />
                    {service.badge}
                  </span>
                )}
              </div>

              <h2 id="modal-service-title" className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-snug">
                {isStrategicDiagnostic && "Diagnóstico Estratégico ESG"}
                {isPreDiag && "Pré-Diagnóstico ESG Autodeclarável"}
                {isPreDiagPlus && "Pré-Diagnóstico ESG + Consultoria Estratégica"}
                {isConsulting && "Consultoria ESG Estratégica (1 hora)"}
                {isBook && "Livro Bioeconomia & ESG"}
                {!isPreDiag && !isPreDiagPlus && !isConsulting && !isBook && service.name}
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                {isStrategicDiagnostic && "Relatório completo de maturidade ESG, análise de evidências, pontos críticos e plano de evolução com selo de verificação InoveESG."}
                {isPreDiag && "Avaliação ágil, objetiva e 100% autodeclarável para mapear a maturidade da sua empresa sem a burocracia de upload de evidências nesta etapa."}
                {isPreDiagPlus && "A combinação estratégica ideal: questionário de maturidade ESG autodeclarável somado a 1 hora de sessão ao vivo individual com consultor especialista."}
                {isConsulting && "Sessão individual de consultoria com especialista sênior para sanar dúvidas, priorizar planos de ação e destravar tomadas de decisão."}
                {isBook && "Guia prático e aprofundado com metodologias e cases do mercado brasileiro para liderar a agenda de sustentabilidade."}
                {!isPreDiag && !isPreDiagPlus && !isConsulting && !isBook && service.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm">
          
          {/* Mensagem de Erro (se houver) */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <span className="font-semibold">Erro:</span> {error}
            </div>
          )}

          {/* SERVIÇO 02: Diagnóstico Estratégico ESG */}
          {isStrategicDiagnostic && (
            <>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  O que você recebe
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    [FileText, "Nível de maturidade ESG", "Avaliação clara do estágio atual da empresa."],
                    [TrendingUp, "Plano de evolução", "Recomendações automatizadas para aumentar a maturidade."],
                    [ShieldCheck, "Análise de evidências", "Verificação dos documentos e identificação dos pontos-problema ESG."],
                    [Award, "Relatório com selo", "Entrega assinada pela empresa, pela verificação InoveESG e com selo das evidências."],
                  ].map(([Icon, title, description]) => {
                    const FeatureIcon = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <div key={title as string} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 flex items-start gap-2.5">
                        <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0"><FeatureIcon className="h-4 w-4" /></div>
                        <div><h4 className="font-bold text-slate-800 text-xs mb-1">{title as string}</h4><p className="text-[11px] text-slate-600 leading-relaxed">{description as string}</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />Como funciona</h3>
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
                  <ol className="relative border-l border-emerald-200 ml-3 space-y-4 text-xs">
                    <li className="ml-4"><span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">1</span><h4 className="font-bold text-slate-800">Contratação</h4><p className="text-slate-500 text-[11px]">Após a confirmação, o pré-diagnóstico é liberado para preenchimento.</p></li>
                    <li className="ml-4"><span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">2</span><h4 className="font-bold text-slate-800">Pré-diagnóstico e evidências</h4><p className="text-slate-500 text-[11px]">Responda ao formulário e faça o upload das evidências do seu segmento em até 20 dias.</p></li>
                    <li className="ml-4"><span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">3</span><h4 className="font-bold text-slate-800">Análise e entrega</h4><p className="text-slate-500 text-[11px]">A equipe verifica os documentos e entrega o relatório estratégico em até 90 dias a partir da contratação.</p></li>
                  </ol>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-[11px] leading-relaxed text-amber-900">
                <strong>Prazo importante:</strong> o upload pode ser alterado somente durante os 20 dias iniciais. Depois desse prazo, os documentos enviados ficam bloqueados para análise.
              </div>
            </>
          )}

          {/* SERVIÇO 01: Pré-Diagnóstico ESG */}
          {isPreDiag && (
            <>
              {/* O que contempla / Como funciona */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Como funciona e o que está incluso
                </h3>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-1">Relatório Automático de Maturidade</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Diagnóstico visual e objetivo com sua classificação de maturidade nas dimensões Ambiental, Social e Governança.
                    </p>
                  </div>
                </div>
              </div>

              {/* Roteiro do Processo */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Roteiro do Processo (Passo a Passo)
                </h3>

                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
                  <ol className="relative border-l border-emerald-200 ml-3 space-y-4 text-xs">
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">1</span>
                      <h4 className="font-bold text-slate-800">Contratação Segura</h4>
                      <p className="text-slate-500 text-[11px]">Você confirma a contratação via checkout com liberação imediata na sua conta.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">2</span>
                      <h4 className="font-bold text-slate-800">Resposta ao Formulário</h4>
                      <p className="text-slate-500 text-[11px]">Responda ao questionário autodeclarável no painel, no seu próprio ritmo.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">3</span>
                      <h4 className="font-bold text-slate-800">Apuração Automatizada</h4>
                      <p className="text-slate-500 text-[11px]">O sistema calcula a pontuação com base nos pesos específicos das perguntas.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">4</span>
                      <h4 className="font-bold text-slate-800">Entrega do Diagnóstico</h4>
                      <p className="text-slate-500 text-[11px]">Visualização do nível de maturidade na tela e recebimento por e-mail com contato InoveESG.</p>
                    </li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {/* PACOTE 01: Pré-Diagnóstico + Consultoria */}
          {isPreDiagPlus && (
            <>
              {/* O que contempla */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  O que contempla este pacote completo
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">
                          Item 1: Pré-Diagnóstico ESG Autodeclarável
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          Serviço 01
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Questionário completo sem exigência de upload de evidências. Cálculo automatizado por pesos e relatório executivo imediato com índice de maturidade ESG.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs">
                          Item 2: Sessão de Consultoria ESG (1 hora ao vivo)
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          1h Exclusiva
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Call individual e personalizada (1:1) com consultor especializado em sustentabilidade para analisar seus resultados, sanar dúvidas e estruturar prioridades de implementação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roteiro do Processo */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Roteiro do Processo Integrado
                </h3>

                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
                  <ol className="relative border-l border-emerald-200 ml-3 space-y-4 text-xs">
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">1</span>
                      <h4 className="font-bold text-slate-800">Contratação Unificada</h4>
                      <p className="text-slate-500 text-[11px]">Pagamento seguro do pacote com liberação instantânea do diagnóstico.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">2</span>
                      <h4 className="font-bold text-slate-800">Preenchimento do Pré-Diagnóstico</h4>
                      <p className="text-slate-500 text-[11px]">Sua equipe preenche as respostas sem necessidade de anexar evidências.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">3</span>
                      <h4 className="font-bold text-slate-800">Agendamento da Consultoria</h4>
                      <p className="text-slate-500 text-[11px]">Escolha da melhor data e horário para a sua sessão técnica online de 1 hora.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">4</span>
                      <h4 className="font-bold text-slate-800">Sessão Estratégica & Próximos Passos</h4>
                      <p className="text-slate-500 text-[11px]">Debate dos resultados, orientações para os pontos fracos e plano de ação inicial.</p>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Box de Composição de Preço do Pacote */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Composição do Pacote
                </span>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Pré-Diagnóstico ESG Autodeclarável:</span>
                  <span className="font-semibold text-slate-800">R$ 250,00</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Consultoria ESG Individual (1 hora):</span>
                  <span className="font-semibold text-slate-800">R$ 300,00</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Soma dos serviços avulsos:</span>
                  <span className="text-slate-500 line-through">R$ 550,00</span>
                </div>
              </div>
            </>
          )}

          {/* CONSULTORIA AVULSA 1H */}
          {isConsulting && (
            <>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  O que está incluso na consultoria
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700 shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-1">Call 1:1 Exclusiva (1 hora)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Atendimento individual ao vivo por videoconferência com especialista sênior em sustentabilidade.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700 shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-1">Direcionamento de Ações</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Análise de dúvidas pontuais, adequação de processos, fornecedores ou certificações ESG.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Roteiro do Processo
                </h3>
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
                  <ol className="relative border-l border-emerald-200 ml-3 space-y-4 text-xs">
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">1</span>
                      <h4 className="font-bold text-slate-800">Contratação</h4>
                      <p className="text-slate-500 text-[11px]">Pagamento seguro do serviço avulso de 1h.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">2</span>
                      <h4 className="font-bold text-slate-800">Agendamento</h4>
                      <p className="text-slate-500 text-[11px]">Escolha do melhor dia e horário na agenda técnica.</p>
                    </li>
                    <li className="ml-4">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold">3</span>
                      <h4 className="font-bold text-slate-800">Realização da Sessão</h4>
                      <p className="text-slate-500 text-[11px]">Call focada nos objetivos e dúvidas da sua empresa.</p>
                    </li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {/* LIVRO BIOECONOMIA */}
          {isBook && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                Sobre o Livro Digital
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Obra de referência para gestores e líderes corporativos que desejam compreender a interseção entre inovação bioeconômica e critérios ESG na prática empresarial.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Download className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Após a aprovação do pagamento, o download e acesso ao material digital ficam disponíveis imediatamente na sua área de Meus Serviços.
                </p>
              </div>
            </div>
          )}

          {/* Garantias & Segurança */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Dados protegidos sob sigilo e conformidade com a <strong>LGPD</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Checkout seguro via <strong>Mercado Pago</strong></span>
            </div>
          </div>

        </div>

        {isStrategicDiagnostic && (
          <label className="mx-4 mb-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 transition-colors hover:bg-emerald-50 sm:mx-5">
            <span className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={includeConsulting}
                onChange={(event) => setIncludeConsulting(event.target.checked)}
                disabled={isLoading}
                className="mt-1 size-4 accent-emerald-600"
              />
              <span>
                <span className="block text-xs font-bold text-slate-900">Adicionar Consultoria Estratégica</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-slate-600">2 encontros de 1h: um inicial e outro ao longo dos 15 dias seguintes.</span>
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-xs font-extrabold text-emerald-700">{strategicDiagnosticPricing.consultingInstallments}</span>
              <span className="block text-[10px] text-slate-500">{strategicDiagnosticPricing.consultingFullPrice}</span>
            </span>
          </label>
        )}

        {/* Modal Footer / CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Investimento:
            </span>
            {isStrategicDiagnostic ? (
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold font-display text-emerald-700">
                  {includeConsulting ? strategicDiagnosticPricing.combinedInstallments : service.installmentLabel ?? strategicDiagnosticPricing.installments}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {includeConsulting ? strategicDiagnosticPricing.combinedFullPrice : service.fullPriceLabel ?? strategicDiagnosticPricing.fullPrice}
                </span>
              </div>
            ) : (
              <>
                <span className="text-xl sm:text-2xl font-extrabold font-display text-emerald-700">{displayPrice}</span>
                <span className="text-[10px] text-slate-500 font-medium">(pagamento único)</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-1/3 sm:w-auto rounded-xl text-xs h-10 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
            >
              Voltar
            </Button>

            <Button
              type="button"
              onClick={() => onConfirmCheckout(service, includeConsulting)}
              disabled={isLoading}
              className="flex-1 sm:w-auto rounded-xl text-xs h-10 px-5 font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gerando checkout...</span>
                </>
              ) : (
                <>
                  <span>{isStrategicDiagnostic ? "Comprar agora" : "Comprar Agora"}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
