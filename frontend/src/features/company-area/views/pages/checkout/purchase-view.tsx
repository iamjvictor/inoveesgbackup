import React, { useEffect, useState } from "react";
import { CircleCheck, X, ShoppingCart, Rocket, Zap, Users, ShieldCheck, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "../../../context/cart-context";
import { HorizontalServiceRail } from "../../components/horizontal-service-rail";
import { useBudgetController } from "../../../controllers/use-budget.controller";
import { useCompany } from "../../../context/company-context";

const planProducts: (CartItem & {
  features: string[];
  focus: string;
  productCode: string;
  highlight?: boolean;
})[] = [
  {
    id: "diag-estrat",
    name: "Diagnóstico",
    description: "Foco: Diagnóstico Profundo",
    focus: "Profundo",
    productCode: "full-diagnostic",
    price: 6000,
    priceFormatted: "R$ 6.000",
    type: "ONE_TIME",
    requiresBudget: true,
    features: ["Autodeclaração", "Análise de Evidências", "Validação de Documentos", "Roadmap Estratégico", "Relatório com Selo"]
  },
  {
    id: "diag-consultoria",
    name: "Diag.+Consultoria",
    description: "Foco: Diagnóstico + Ação",
    focus: "Ação",
    productCode: "diag-consultoria",
    price: 7500,
    priceFormatted: "R$ 7.500",
    type: "ONE_TIME",
    requiresBudget: true,
    features: ["Autodeclaração", "Análise de Evidências", "Validação de Documentos", "Roadmap Estratégico", "Relatório com Selo", "Sessão Estratégica (2h)", "Apoio à Decisão"]
  },
  {
    id: "assessoria-completa",
    name: "Assessoria",
    description: "Foco: Gestão Contínua",
    focus: "Gestão",
    productCode: "assessoria-completa",
    price: 0,
    priceFormatted: "Sob Orçamento",
    type: "SUBSCRIPTION",
    requiresBudget: true,
    highlight: true,
    features: ["Autodeclaração", "Análise de Evidências", "Validação de Documentos", "Roadmap Estratégico", "Relatório com Selo", "Rastreabilidade Fornecedores", "Sessão Estratégica Mensal", "Apoio à Decisão", "Acompanhamento Mensal"]
  }
];

const demandServices: (CartItem & { 
  features: string[]; 
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
})[] = [
  {
    id: "pre-diag",
    name: "Diagnóstico Autodeclarável",
    description: "Diagnóstico rápido de maturidade. Relatório não verificado.",
    price: 250,
    priceFormatted: "R$ 250",
    type: "ONE_TIME",
    icon: Zap,
    features: ["Formulário ESG Autodeclarável", "Relatório de Maturidade"]
  },
  {
    id: "pre-diag-plus",
    name: "Diagnóstico Autodeclarável + Consultoria",
    description: "Diagnóstico autodeclarável + 1h de sessão estratégica.",
    price: 500,
    priceFormatted: "R$ 500",
    type: "ONE_TIME",
    icon: Users,
    highlight: true,
    badge: "Recomendado",
    features: ["Formulário ESG Autodeclarável", "1h Sessão Estratégica", "Relatório de Maturidade"]
  },
  {
    id: "cadeia-fornecedores",
    name: "Avaliação de Fornecedores",
    description: "Rastreie o impacto da sua cadeia de suprimentos.",
    price: 50,
    priceFormatted: "A partir de R$ 50",
    type: "ONE_TIME",
    requiresBudget: false,
    icon: ShieldCheck,
    features: ["Mapeamento de Fornecedores", "Análise de Risco ESG"]
  },
  {
    id: "capacitacao",
    name: "Capacitação ESG",
    description: "Aula sobre ESG + certificado para a equipe.",
    price: 0,
    priceFormatted: "Sob Orçamento",
    type: "ONE_TIME",
    requiresBudget: true,
    icon: GraduationCap,
    features: ["Aula Exclusiva", "Certificado de Capacitação"]
  },
  {
    id: "livro-esg",
    name: "Livro Bioeconomia & ESG",
    description: "Adquira o livro físico ou digital.",
    price: 41.9,
    priceFormatted: "R$ 41,90",
    type: "ONE_TIME",
    icon: Rocket,
    features: ["Conteúdo Exclusivo", "Versão Física ou Digital"]
  }
];

import { InvitePurchaseModal } from "../../components/invite-purchase-modal";

export function PurchaseView() {
  const { addItem, items } = useCart();
  const { company } = useCompany();
  const { createBudget } = useBudgetController();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedBudgetPlan, setSelectedBudgetPlan] = useState<(typeof planProducts)[number] | null>(null);
  const [isBudgetSubmitting, setIsBudgetSubmitting] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [requestedBudgetCodes, setRequestedBudgetCodes] = useState<string[]>([]);
  const [checkoutAssessoriaMonths, setCheckoutAssessoriaMonths] = useState<6 | 12>(12);

  useEffect(() => {
    try {
      const companyId = company?.id || "anonymous";
      const requestedStr = localStorage.getItem(`inoveesg_requested_budgets_${companyId}`);
      if (!requestedStr) {
        return;
      }

      const parsed = JSON.parse(requestedStr) as Array<{ productCode?: string }>;
      const codes = parsed.map((item) => item.productCode).filter((code): code is string => Boolean(code));
      if (codes.length > 0) {
        setRequestedBudgetCodes(Array.from(new Set(codes)));
      }
    } catch (error) {
      console.error("Failed to hydrate requested budget codes", error);
    }
  }, [company?.id]);

  const handleAddToCart = (product: CartItem) => {
    if (product.id === "cadeia-fornecedores") {
      setIsInviteModalOpen(true);
      return;
    }
    addItem(product);
  };

  const handleBudgetClick = (plan: (typeof planProducts)[number]) => {
    if (requestedBudgetCodes.includes(plan.productCode)) {
      return;
    }

    setBudgetError(null);
    setSelectedBudgetPlan(plan);
  };

  const persistRequestedBudget = (plan: (typeof planProducts)[number], months?: number) => {
    try {
      const companyId = company?.id || "anonymous";
      const storageKey = `inoveesg_requested_budgets_${companyId}`;
      const existingRequested = localStorage.getItem(storageKey);
      const requestedList = existingRequested ? JSON.parse(existingRequested) : [];

      const newRequest = {
        id: plan.id,
        productCode: plan.productCode,
        name: months ? `${plan.name} (${months} meses)` : plan.name,
        description: plan.description,
        priceFormatted: plan.priceFormatted,
        requestedAt: new Date().toISOString(),
        status: "SOLICITADO",
      };

      localStorage.setItem(storageKey, JSON.stringify([...requestedList, newRequest]));
    } catch (error) {
      console.error("Failed to persist budget request", error);
    }
  };

  const handleConfirmBudget = async () => {
    if (!selectedBudgetPlan) {
      return;
    }

    setIsBudgetSubmitting(true);
    setBudgetError(null);

    try {
      const months = selectedBudgetPlan.productCode === "assessoria-completa" ? checkoutAssessoriaMonths : undefined;
      await createBudget({
        productCode: selectedBudgetPlan.productCode,
        months
      });
      persistRequestedBudget(selectedBudgetPlan, months);
      setRequestedBudgetCodes((prev) =>
        prev.includes(selectedBudgetPlan.productCode) ? prev : [...prev, selectedBudgetPlan.productCode]
      );
      setSelectedBudgetPlan(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao solicitar orçamento.";
      setBudgetError(message);
    } finally {
      setIsBudgetSubmitting(false);
    }
  };

  const isInCart = (id: string) => items.some(item => item.id === id);

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-700 max-h-[calc(100vh-100px)] overflow-hidden">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
          <ShoppingCart className="h-3 w-3" />
          Escolha seu serviço
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start h-[calc(100vh-180px)]">
        {/* Lado Esquerdo: Planos e Tabela (Desktop) / Cards (Mobile) */}
        <div className="lg:col-span-8 h-full overflow-y-auto pr-2">
          
          {/* Mobile View: Planos como Cards */}
          <div className="lg:hidden grid gap-4">
            {planProducts.map((plan) => {
              return (
                <div key={plan.id} className={`rounded-2xl border border-border bg-white p-6 shadow-sm relative ${plan.highlight ? 'ring-2 ring-emerald-500' : ''}`}>
                  {plan.highlight && (
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Recomendado</div>
                  )}
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                  <div className="text-2xl font-bold text-slate-900 mb-4">
                    {plan.price > 0 ? "A partir de " : ""}{plan.priceFormatted}
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-slate-600">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2"><CircleCheck className="size-4 text-emerald-500 flex-shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleBudgetClick(plan)}
                    disabled={requestedBudgetCodes.includes(plan.productCode)}
                    className={`w-full rounded-full font-bold h-11 ${requestedBudgetCodes.includes(plan.productCode) ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  >
                    {requestedBudgetCodes.includes(plan.productCode) ? "Solicitado" : "Solicitar Orçamento"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Tabela Comparativa */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-5 bg-slate-50/50 border-b border-slate-200 font-bold text-slate-800 text-sm">Recursos</th>
                  {planProducts.map(plan => (
                    <th key={plan.id} className={`p-5 border-b border-slate-200 text-center font-bold text-sm ${plan.highlight ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'}`}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50/30 text-xs">Foco</td>
                  {planProducts.map(plan => (
                    <td key={plan.id} className={`p-4 text-center text-xs text-slate-500 ${plan.highlight ? 'bg-emerald-50/30' : ''}`}>
                      {plan.focus}
                    </td>
                  ))}
                </tr>
                {[
                  "Autodeclaração", "Evidências", "Documentos", "Roadmap", "Selo Verificação", "Fornecedores", "Sessão Estratégica", "Apoio Decisão", "Acomp. Mensal"
                ].map((feature) => (
                  <tr key={feature} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50/30 text-xs">{feature}</td>
                    {planProducts.map(plan => {
                      const hasFeature = plan.features.some(f => f.includes(feature) || (feature === "Evidências" && f.includes("Evidências")));
                      return (
                        <td key={plan.id} className={`p-4 text-center ${plan.highlight ? 'bg-emerald-50/30' : ''}`}>
                          {hasFeature ? (
                            <CircleCheck className="size-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="size-4 text-slate-200 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="p-5 font-bold text-slate-800 bg-slate-50/30 text-xs">Investimento</td>
                  {planProducts.map(plan => {
                    return (
                      <td key={plan.id} className={`p-5 text-center ${plan.highlight ? 'bg-emerald-50/30' : ''}`}>
                        <div className="text-[10px] text-slate-500 mb-0.5">{plan.price > 0 ? "A partir de" : ""}</div>
                        <div className="text-lg font-bold text-slate-900 mb-3">{plan.priceFormatted}</div>
                        <Button 
                          onClick={() => handleBudgetClick(plan)}
                          disabled={requestedBudgetCodes.includes(plan.productCode)}
                          className={`w-full rounded-full font-bold h-9 text-xs transition-all ${
                            requestedBudgetCodes.includes(plan.productCode)
                              ? 'bg-slate-100 text-slate-400' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {requestedBudgetCodes.includes(plan.productCode) ? "Solicitado" : "Solicitar Orçamento"}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Direito: Serviços Sob Demanda com navegação manual */}
        <div className="lg:col-span-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200 h-full flex flex-col justify-between overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
            <Rocket className="h-4 w-4 text-emerald-600" />
            Serviços Sob Demanda
          </h3>
          
          <HorizontalServiceRail
            ariaLabel="Lista de serviços sob demanda"
            className="flex-1"
            railClassName="pb-2"
            items={demandServices}
            renderItem={(service, idx) => {
              const Icon = service.icon;
              const inCart = isInCart(service.id);
              const isSpecial = Boolean((service as any).highlight);
              const badge = (service as any).badge;
              return (
                <div key={`${service.id}-${idx}`} className={`w-[260px] snap-start rounded-xl border bg-white p-3 flex flex-col justify-between shadow-sm transition-all shrink-0 relative overflow-hidden ${isSpecial ? 'border-emerald-500 ring-2 ring-emerald-500/15 shadow-md' : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'}`}>
                  {badge && (
                    <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {badge}
                    </div>
                  )}
                  <div>
                    <div className={`flex items-center gap-2 mb-1.5 ${badge ? 'pr-20' : ''}`}>
                      <div className={`p-1 rounded-lg transition-colors ${isSpecial ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{service.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">{service.description}</p>
                    <ul className="text-[9px] text-slate-600 space-y-1 mb-3">
                      {service.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5"><CircleCheck className="size-2.5 text-emerald-500" /> {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-2">
                    <span className="font-bold text-xs text-slate-900">{service.priceFormatted}</span>
                    <Button 
                      onClick={() => handleAddToCart(service)}
                      disabled={inCart}
                      size="sm"
                      className={`rounded-full px-3 h-7 text-[9px] font-bold ${inCart ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                      {inCart ? "Adicionado" : service.requiresBudget ? "Sob Orçamento" : "Adicionar"}
                    </Button>
                  </div>
                </div>
              );
            }}
          />

          <div className="p-4 rounded-xl bg-emerald-600 text-white text-center space-y-2 shadow-lg shadow-emerald-100 shrink-0">
            <h4 className="text-xs font-bold">Suporte?</h4>
            <p className="text-[9px] opacity-90">Agende uma conversa.</p>
            <Button variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 h-7 text-[9px] font-bold">
              Falar Agora
            </Button>
          </div>
        </div>
      </div>
      <InvitePurchaseModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {selectedBudgetPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            onClick={isBudgetSubmitting ? undefined : () => setSelectedBudgetPlan(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <ShoppingCart className="h-3 w-3" />
                  Confirmar orçamento
                </p>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900">
                  Solicitar orçamento de {selectedBudgetPlan.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Vamos registrar sua solicitação de orçamento para este produto.
                </p>
              </div>
              <button
                onClick={() => setSelectedBudgetPlan(null)}
                disabled={isBudgetSubmitting}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {budgetError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {budgetError}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Produto</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selectedBudgetPlan.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Investimento</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selectedBudgetPlan.priceFormatted}</p>
                </div>
              </div>
            </div>

            {selectedBudgetPlan.productCode === "assessoria-completa" && (
              <div className="mt-4 p-3 border border-slate-200/60 bg-slate-50 rounded-2xl">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Duração do Contrato
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCheckoutAssessoriaMonths(6)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      checkoutAssessoriaMonths === 6
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    6 meses
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutAssessoriaMonths(12)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      checkoutAssessoriaMonths === 12
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    12 meses
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedBudgetPlan(null)}
                disabled={isBudgetSubmitting}
                className="rounded-full px-5"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmBudget}
                disabled={isBudgetSubmitting}
                className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
              >
                {isBudgetSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Solicitando...
                  </>
                ) : (
                  "Sim, solicitar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
