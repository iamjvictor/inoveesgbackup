"use client";

import React, { useEffect, useState } from "react";
import { CircleCheck, Sparkles, ShieldCheck, ArrowRight, ArrowLeft, Users, Zap, GraduationCap, Rocket, Loader2, Clock, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/features/company-area/context/cart-context";
import { BudgetModal } from "@/features/company-area/views/components/budget-modal";
import { checkoutService } from "@/features/company-area/services/checkout.service";
import { canRequestUpgradeBudget } from "@/features/company-area/access/upgrade-access";
import { strategicDiagnosticPricing } from "./strategic-diagnostic-pricing";

import Link from "next/link";
import { InvitePurchaseModal } from "@/features/company-area/views/components/invite-purchase-modal";
import { DemandServiceDetailModal, DemandServiceItemData } from "@/features/company-area/views/components/demand-service-detail-modal";
import { isDemandServiceAvailable, shouldShowComingSoonOverlay } from "./availability";

interface UpgradePlan extends CartItem {
  features: string[];
  focus: string;
  badge?: string;
  highlight?: boolean;
}

const upgradePlans: UpgradePlan[] = [
  {
    id: "diag-estrat",
    name: "Diagnóstico Estratégico ESG",
    description: "Maturidade, evidências e plano de evolução ESG em um relatório estratégico verificado.",
    focus: "Mapeamento Completo",
    price: 795000,
    priceFormatted: "R$ 7.950,00",
    type: "ONE_TIME",
    requiresBudget: true,
    features: [
      "Relatório do nível de maturidade ESG",
      "Plano automatizado para evoluir a maturidade",
      "Análise de evidências e pontos-problema ESG",
      "Relatório com selo de verificação InoveESG"
    ]
  },
  {
    id: "diag-consultoria",
    name: "Diagnóstico + Consultoria",
    description: "Diagnóstico aprofundado com suporte estratégico ao vivo para plano de ação.",
    focus: "Diagnóstico + Ação",
    badge: "Recomendado",
    highlight: true,
    price: 0,
    priceFormatted: "Sob Orçamento",
    type: "ONE_TIME",
    requiresBudget: true,
    features: [
      "Tudo do Diagnóstico Estratégico",
      "2h de Sessão Estratégica Ao Vivo",
      "Apoio Técnico à Tomada de Decisão"
    ]
  },
  {
    id: "assessoria-completa",
    name: "Assessoria ESG Contínua",
    description: "Gestão contínua 360°, auditoria periódica e rastreabilidade da cadeia.",
    focus: "Gestão Corporativa 360°",
    price: 0,
    priceFormatted: "Sob Orçamento",
    type: "SUBSCRIPTION",
    requiresBudget: true,
    features: [
      "Auditoria e Sessões Mensais",
      "Painel de Rastreabilidade de Fornecedores",
      "Suporte Prioritário e Relatório GRI/SASB"
    ]
  }
];

interface DemandServiceItem {
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
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

const demandServices: DemandServiceItem[] = [
  {
    id: "pre-diag",
    name: "Diagnóstico Autodeclarável",
    description: "Autodeclaração ágil de maturidade ESG e relatório inicial.",
    priceFormatted: null,
    productCode: "PRE_DIAGNOSTIC",
    type: "ONE_TIME",
    requiresBudget: false,
    icon: Zap
  },
  {
    id: "pre-diag-plus",
    name: "Diagnóstico + Consultoria",
    description: "Diagnóstico autodeclarável com 1h de sessão estratégica ao vivo.",
    priceFormatted: null,
    productCode: "PRE_DIAGNOSTIC_PLUS",
    type: "ONE_TIME",
    requiresBudget: false,
    icon: Users,
    badge: "Recomendado",
    highlight: true
  },
  {
    id: "consulting-1h",
    name: "Consultoria ESG (1h)",
    description: "Call individual de orientação técnica e estratégica para decisões ESG.",
    priceFormatted: null,
    productCode: "CONSULTING_1H",
    type: "ONE_TIME",
    requiresBudget: false,
    icon: Users
  },
  {
    id: "cadeia-fornecedores",
    name: "Avaliação de Fornecedores",
    description: "Mapeamento e matriz de risco ESG na sua cadeia de suprimentos.",
    priceFormatted: "A partir de R$ 50",
    type: "ONE_TIME",
    requiresBudget: false,
    icon: ShieldCheck
  },
  {
    id: "capacitacao",
    name: "Capacitação ESG",
    description: "Treinamento especializado para a equipe com certificação inclusa.",
    priceFormatted: "Sob Orçamento",
    type: "ONE_TIME",
    requiresBudget: true,
    icon: GraduationCap
  },
  {
    id: "livro-esg",
    name: "Livro Bioeconomia & ESG",
    description: "Guia exclusivo para sua jornada em versão física ou digital.",
    priceFormatted: null,
    productCode: "LIVRO_ESG",
    type: "ONE_TIME",
    requiresBudget: false,
    icon: Rocket
  }
];

export default function UpgradePage() {
  const { addItem, clearCart } = useCart();
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [assessoriaMonths, setAssessoriaMonths] = useState<6 | 12>(12);
  const [catalogPrices, setCatalogPrices] = useState<Record<string, number>>({});
  const [catalogPriceError, setCatalogPriceError] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    checkoutService.getCatalogPrices()
      .then(({ prices }) => {
        if (isCurrent) setCatalogPrices(prices);
      })
      .catch(() => {
        if (isCurrent) setCatalogPriceError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const getDisplayPrice = (service: DemandServiceItemData) => {
    if (!service.productCode) return service.priceFormatted ?? "—";

    const priceCents = catalogPrices[service.productCode];
    if (priceCents === undefined) {
      return catalogPriceError ? "Preço indisponível" : "Carregando preço…";
    }

    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);
  };

  const [selectedDetailService, setSelectedDetailService] = useState<DemandServiceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalError, setDetailModalError] = useState<string | null>(null);

  const handleOpenBudget = (plan: UpgradePlan) => {
    clearCart();
    addItem({
      id: plan.id,
      name: plan.name,
      price: 0,
      priceFormatted: plan.priceFormatted,
      type: plan.type,
      description: plan.description ?? "",
      requiresBudget: true,
      months: plan.id === "assessoria-completa" ? assessoriaMonths : undefined
    });
    setIsBudgetOpen(true);
  };

  const handleStrategicDiagnosticClick = (plan: UpgradePlan) => {
    setDetailModalError(null);
    setSelectedDetailService({
      id: plan.id,
      name: plan.name,
      description: plan.description ?? "",
      priceFormatted: plan.priceFormatted,
      productCode: "FULL_DIAGNOSTIC",
      type: plan.type,
      requiresBudget: false,
      icon: ShieldCheck,
      detailVariant: "strategic-diagnostic",
      installmentLabel: strategicDiagnosticPricing.installments,
      fullPriceLabel: strategicDiagnosticPricing.fullPrice,
    });
    setIsDetailModalOpen(true);
  };

  const handleDemandServiceClick = (service: typeof demandServices[0]) => {
    if (service.id === "cadeia-fornecedores") {
      setIsInviteModalOpen(true);
      return;
    }

    if (service.requiresBudget) {
      clearCart();
      addItem({
        id: service.id,
        name: service.name,
        price: 0,
        priceFormatted: service.priceFormatted ?? "Sob Orçamento",
        type: service.type as CartItem["type"],
        description: service.description,
        requiresBudget: true
      });
      setIsBudgetOpen(true);
      return;
    }

    setDetailModalError(null);
    setSelectedDetailService(service);
    setIsDetailModalOpen(true);
  };

  const handleExecuteCheckout = async (service: DemandServiceItemData, includeConsulting = false) => {
    setCheckoutLoadingId(service.id);
    setDetailModalError(null);
    const token = "cookie-session";

    try {
      if (!token) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }

      // Salva o produto pendente no localStorage para a página de sucesso registrar no "Meus Serviços"
      const pendingItem = {
        id: service.id,
        name: service.name,
        description: service.description,
        priceFormatted: includeConsulting ? "À vista: R$ 8.750,00" : getDisplayPrice(service)
      };
      localStorage.setItem("inoveesg_pending_purchase", JSON.stringify([pendingItem]));

      if (service.id === "diag-estrat" || service.id === "pre-diag" || service.id === "pre-diag-plus" || service.id === "consulting-1h") {
        const productCode = service.id === "diag-estrat"
          ? includeConsulting ? "FULL_DIAGNOSTIC_PLUS" : "FULL_DIAGNOSTIC"
          : service.id === "pre-diag" ? "PRE_DIAGNOSTIC"
          : service.id === "pre-diag-plus" ? "PRE_DIAGNOSTIC_PLUS"
          : "CONSULTING_1H";
        const response = await checkoutService.createPreference(token, productCode);
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else {
          throw new Error("Falha ao gerar link de checkout.");
        }
      } else if (service.id === "livro-esg") {
        const response = await checkoutService.createPreference(token, "LIVRO_ESG");
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else {
          throw new Error("Falha ao gerar link de checkout.");
        }
      }
    } catch (err: unknown) {
      console.error("Erro ao iniciar compra:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao processar sua solicitação.";
      setDetailModalError(errorMessage);
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8 pt-2 animate-in fade-in duration-300 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Seção 1: Planos de Assessoria (Compactos e Otimizados) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight font-display">
              Planos de Assessoria
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Acompanhamento estratégico para cada nível de maturidade ESG
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 items-stretch pt-2">
          {upgradePlans.map((plan) => {
            const isSpecial = plan.highlight;
            const isBudgetAvailable = canRequestUpgradeBudget(plan.id);
            const showComingSoonOverlay = shouldShowComingSoonOverlay(isBudgetAvailable);
            return (
              <div 
                key={plan.id} 
                aria-disabled={showComingSoonOverlay}
                className={`rounded-2xl border bg-white p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 relative ${
                  isSpecial 
                    ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md" 
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-md shadow-xs"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-200" />
                    {plan.badge}
                  </div>
                )}

                <div className={`flex flex-1 flex-col ${showComingSoonOverlay ? "blur-[2px] opacity-60" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {plan.focus}
                    </span>
                    <span className={`text-[9px] font-bold ${isBudgetAvailable ? "text-emerald-700 bg-emerald-50 border-emerald-200/80" : "text-amber-700 bg-amber-50 border-amber-200/80"} border px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1`}>
                      {isBudgetAvailable ? <CircleCheck className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                      {isBudgetAvailable ? "Disponível" : "Em Breve"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 font-display tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-500 leading-snug mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="border-t border-slate-100 pt-2.5 mt-2.5 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Investimento</span>
                      {plan.id === "diag-estrat" ? (
                        <>
                          <span className="text-base font-extrabold text-emerald-700 font-display block leading-tight">{strategicDiagnosticPricing.installments}</span>
                          <span className="text-[10px] font-medium text-slate-500 block mt-0.5">{strategicDiagnosticPricing.fullPrice}</span>
                        </>
                      ) : (
                        <span className="text-base font-extrabold text-slate-800 font-display block leading-tight">{plan.priceFormatted}</span>
                      )}
                    </div>

                    {plan.id === "assessoria-completa" ? (
                      <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200/60 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          disabled={showComingSoonOverlay}
                          onClick={() => setAssessoriaMonths(6)}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            assessoriaMonths === 6
                              ? "bg-white text-emerald-700 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          6m
                        </button>
                        <button
                          type="button"
                          disabled={showComingSoonOverlay}
                          onClick={() => setAssessoriaMonths(12)}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            assessoriaMonths === 12
                              ? "bg-white text-emerald-700 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          12m
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md">
                        Personalizado
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-4 flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Destaques inclusos:</span>
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CircleCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 mt-auto">
                  <Button
                    disabled={!isBudgetAvailable}
                    onClick={() => {
                      if (!isBudgetAvailable) return;
                      if (plan.id === "diag-estrat") {
                        handleStrategicDiagnosticClick(plan);
                      } else {
                        handleOpenBudget(plan);
                      }
                    }}
                    className={`w-full rounded-xl h-9 font-bold text-xs flex items-center justify-center gap-1.5 shadow-none ${isBudgetAvailable ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed hover:bg-slate-100 disabled:opacity-85"}`}
                  >
                    {isBudgetAvailable ? <ArrowRight className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5 text-slate-400" />}
                    {isBudgetAvailable ? plan.id === "diag-estrat" ? "Comprar agora" : "Solicitar Orçamento" : "Em Breve"}
                  </Button>
                </div>

                {showComingSoonOverlay && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-white/45 text-slate-700 backdrop-blur-[1px] rounded-2xl overflow-hidden" aria-label="Plano em breve">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/90 shadow-sm">
                      <LockKeyhole className="h-4 w-4 text-slate-500" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Em breve</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção 2: Serviços sob Demanda (Dispostos Horizontalmente na mesma tela) */}
      <div className="space-y-3 pt-3 border-t border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight font-display">
              Serviços sob Demanda
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Soluções pontuais adicionais para contratação imediata
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {demandServices.map((service, idx) => {
            const Icon = service.icon;
            const isAvailable = isDemandServiceAvailable(service.id);
            const isSpecial = Boolean(service.highlight);

            return (
              <div 
                key={`${service.id}-${idx}`} 
                aria-disabled={!isAvailable}
                className={`group relative rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 ${
                  isSpecial
                    ? "border-emerald-500 ring-2 ring-emerald-500/15 bg-white shadow-md hover:border-emerald-600 hover:shadow-lg"
                    : "border-slate-200/80 bg-white shadow-xs " + (isAvailable ? "hover:border-emerald-500/40 hover:shadow-md" : "cursor-not-allowed")
                }`}
              >
                {service.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-200" />
                    {service.badge}
                  </div>
                )}

                <div className={`flex flex-1 flex-col ${isAvailable ? "" : "blur-[2px] opacity-60"}`}>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${isSpecial ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight">
                        {service.name}
                      </h3>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                      {service.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between mt-auto">
                    <span className={`font-extrabold text-xs leading-none ${isSpecial ? "text-emerald-700 font-display" : "text-slate-800"}`}>
                      {getDisplayPrice(service)}
                    </span>

                    <Button
                      onClick={() => handleDemandServiceClick(service)}
                      disabled={!isAvailable || checkoutLoadingId !== null || Boolean(service.productCode && catalogPrices[service.productCode] === undefined)}
                      size="sm"
                      className="rounded-lg px-3 h-7 text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all border-none flex items-center gap-1 shadow-xs"
                    >
                      {checkoutLoadingId === service.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        service.requiresBudget ? "Solicitar" : "Comprar"
                      )}
                    </Button>
                  </div>
                </div>

                {!isAvailable && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-white/45 text-slate-700 backdrop-blur-[1px] rounded-2xl overflow-hidden" aria-label="Produto em breve">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white/90 shadow-sm">
                      <LockKeyhole className="h-4 w-4 text-slate-500" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Em breve</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Faixa de Garantia e Confidencialidade (Compacta) */}
      <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span><strong>Confidencialidade LGPD:</strong> dados e documentos criptografados sob sigilo contratual.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-emerald-600" />
          <span><strong>Suporte Especializado:</strong> equipe técnica para personalizar escopos e tirar dúvidas.</span>
        </div>
      </div>

      {/* Modal de Orçamento Reusado */}
      <BudgetModal 
        isOpen={isBudgetOpen} 
        onClose={() => setIsBudgetOpen(false)} 
      />

      <InvitePurchaseModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <DemandServiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          if (!checkoutLoadingId) {
            setIsDetailModalOpen(false);
            setDetailModalError(null);
          }
        }}
        service={selectedDetailService}
        displayPrice={selectedDetailService ? getDisplayPrice(selectedDetailService) : ""}
        onConfirmCheckout={handleExecuteCheckout}
        isLoading={checkoutLoadingId !== null}
        error={detailModalError}
      />
    </div>
  );
}
