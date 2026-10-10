"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  ShoppingBag, 
  Download, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/features/company-area/context/company-context";

import { inviteService } from "@/features/company-area/services/invite.service";
import { budgetService } from "@/features/company-area/services/budget.service";
import { getBudgetDisplayPrice } from "@/features/company-area/access/budget-card";

interface PurchasedService {
  id: string;
  name: string;
  description: string;
  priceFormatted: string;
  purchasedAt: string;
  status: "ATIVO" | "CONCLUIDO" | "PENDENTE";
}

interface RequestedBudget {
  id: string;
  name: string;
  code?: string;
  description: string;
  priceFormatted: string;
  requestedAt: string;
  status: "SOLICITADO" | "RESPONDIDO" | "ACEITO" | "RECUSADO" | "EM_ANALISE" | "PROPOSTA_ENVIADA" | "NEGOCIACAO" | "ATIVO";
}

export default function MeusServicosPage() {
  const { user, company, serviceAccess, isLoading: companyLoading, hasOnlyPreDiagnostic, isUnpaid, isSupplierOnly, hasActivePlan, refreshProfile } = useCompany();
  const [purchasedServices, setPurchasedServices] = useState<PurchasedService[]>([]);
  const [requestedBudgets, setRequestedBudgets] = useState<RequestedBudget[]>([]);
  const [isQueryingDb, setIsQueryingDb] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<RequestedBudget | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionStatus, setActionStatus] = useState<"success-accept" | "success-decline" | null>(null);
  const [loadingBudgetId, setLoadingBudgetId] = useState<string | null>(null);
  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);
  const [purchasedProductName, setPurchasedProductName] = useState<string | null>(null);

  // Carrega serviços comprados e solicitações de orçamento do localStorage & Banco de Dados
  useEffect(() => {
    if (companyLoading || !company) return;

    const loadServices = async () => {
      setIsQueryingDb(true);
      let localPurchased: PurchasedService[] = [];
      const companyId = company.id;

      try {
        const purchasedStr = localStorage.getItem(`inoveesg_purchased_services_${companyId}`);
        const requestedStr = localStorage.getItem(`inoveesg_requested_budgets_${companyId}`);

        if (purchasedStr) {
          localPurchased = JSON.parse(purchasedStr);
        }
        if (requestedStr) {
          setRequestedBudgets(JSON.parse(requestedStr));
        }
      } catch (e) {
        console.error("Erro ao carregar dados locais do painel de serviços:", e);
      }

      // Usa o contexto carregado no login como fonte principal dos serviços comprados
      if (serviceAccess?.purchasedServices?.length) {
        serviceAccess.purchasedServices.forEach((service) => {
          const exists = localPurchased.some((s) => s.id === service.serviceId);
          if (!exists) {
            localPurchased.push({
              id: service.serviceId,
              name: service.name,
              description: service.description || "",
              priceFormatted: `R$ ${(service.unitPriceCents / 100).toFixed(2).replace(".", ",")}`,
              purchasedAt: service.purchasedAt,
              status: "ATIVO",
            });
          }
        });
      } else if (company.orders) {
        const paidOrders = company.orders.filter((o) => o.status === "PAID");
        paidOrders.forEach((order) => {
          order.items?.forEach((item) => {
            if (!item.product) return;
            if (item.product.code === "INVITE_PACK") return; // Tratado separadamente pelas estatísticas de convites

            const serviceId = item.product.code === "PRE_DIAGNOSTIC" ? "pre-diag" : 
                             item.product.code === "PRE_DIAGNOSTIC_PLUS" ? "pre-diag-plus" : 
                             item.product.code === "LIVRO_ESG" ? "livro-esg" : 
                             item.product.code.toLowerCase().replace(/_/g, "-");

            const exists = localPurchased.some((s) => s.id === serviceId);
            if (!exists) {
              let name = item.product.name;
              let description = item.product.description || "";
              
              if (item.product.code === "PRE_DIAGNOSTIC") {
                name = "Diagnóstico Autodeclarável";
                description = "Diagnóstico de sustentabilidade corporativa focado em responder ao questionário inicial e acessar a nota de maturidade.";
              } else if (item.product.code === "PRE_DIAGNOSTIC_PLUS") {
                name = "Diagnóstico Autodeclarável + Consultoria";
                description = "Diagnóstico de sustentabilidade corporativa focado em responder ao questionário inicial, acessar a nota de maturidade e 1h de consultoria.";
              } else if (item.product.code === "LIVRO_ESG") {
                name = "Livro Bioeconomia & ESG";
                description = "Livro digital Bioeconomia & ESG.";
              }

              localPurchased.push({
                id: serviceId,
                name,
                description,
                priceFormatted: `R$ ${(item.unitPriceCents / 100).toFixed(2).replace(".", ",")}`,
                purchasedAt: order.paidAt || order.createdAt,
                status: "ATIVO"
              });
            }
          });
        });
      }

      // Consulta o saldo real de convites e orçamentos no banco de dados
    const token = "cookie-session";
      if (token) {
        try {
          const stats = await inviteService.getStats(token);
          if (stats && stats.totalInvitesPurchased > 0) {
            // Verifica se o serviço de convites/fornecedores já está na lista local
            const hasInviteService = localPurchased.some(
              (s) => s.id.startsWith("invite-pack") || s.name.toLowerCase().includes("fornecedor")
            );

            if (!hasInviteService) {
              localPurchased.push({
                id: "invite-pack-backend",
                name: "Avaliação de Fornecedores",
                description: `Você possui um total de ${stats.totalInvitesPurchased} convites contratados no banco de dados, sendo ${stats.availableInvites} convites ainda disponíveis para envio aos seus parceiros.`,
                priceFormatted: `${stats.availableInvites} convites disp.`,
                purchasedAt: new Date().toISOString(),
                status: "ATIVO"
              });
            } else {
              // Se já houver no localStorage, atualizamos a descrição e o preço formatado com os dados reais do banco
              localPurchased = localPurchased.map((s) => {
                if (s.id.startsWith("invite-pack") || s.name.toLowerCase().includes("fornecedor")) {
                  return {
                    ...s,
                    description: `Você possui um total de ${stats.totalInvitesPurchased} convites contratados no banco de dados, sendo ${stats.availableInvites} convites ainda disponíveis para envio aos seus parceiros.`,
                    priceFormatted: `${stats.availableInvites} convites disp.`
                  };
                }
                return s;
              });
            }
          }
        } catch (error) {
          console.error("Erro ao carregar estatísticas de convites do banco:", error);
        }

        try {
          const dbBudgets = await budgetService.listRequests(token);
          if (Array.isArray(dbBudgets)) {
            const mappedDbBudgets: RequestedBudget[] = dbBudgets.map((b: any) => ({
              id: b.id,
              name: b.product?.name ?? "Solicitação de Orçamento",
              code: b.product?.code,
              description: b.product?.description ?? "",
              priceFormatted: getBudgetDisplayPrice(b.status, b.proposedPriceCents),
              requestedAt: b.createdAt,
              status: b.status,
            }));
            setRequestedBudgets(mappedDbBudgets);
          }
        } catch (error) {
          console.error("Erro ao carregar orçamentos do banco:", error);
        } finally {
          setIsQueryingDb(false);
        }
      } else {
        setIsQueryingDb(false);
      }

      setPurchasedServices(localPurchased);
    };

    loadServices();
  }, [company, companyLoading, serviceAccess]);

  // Escuta retornos do checkout do Mercado Pago
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    const pending = params.get("pending");

    if (success === "true" || pending === "true") {
      refreshProfile().catch((refreshError) => {
        console.error("Erro ao atualizar perfil após retorno do checkout:", refreshError);
      });
    }

    if (success === "true") {
      setIsPaymentSuccessModalOpen(true);
      const budgetId = params.get("budgetId");
      if (budgetId) {
        const found = requestedBudgets.find(b => b.id === budgetId);
        if (found) {
          setPurchasedProductName(found.name);
        } else {
          setPurchasedProductName("Serviço Contratado");
        }
      } else {
        setPurchasedProductName(null);
      }
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (error === "true") {
      alert("Ocorreu um erro ou o pagamento foi cancelado. Tente novamente.");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (pending === "true") {
      alert("Seu pagamento está pendente de aprovação. Assim que for confirmado, o serviço será ativado.");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [requestedBudgets, refreshProfile]);

  // Formata data
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "---";
    }
  };

  // Prepara link de WhatsApp para contato com consultor
  const getWhatsAppLink = (serviceName: string) => {
    const text = encodeURIComponent(
      `Olá! Gostaria de conversar com um consultor sobre o serviço "${serviceName}" contratado na plataforma InoveESG.`
    );
    return `https://wa.me/5511999999999?text=${text}`;
  };

  // Obter checklist do produto para proposta
  const getProductChecklist = (code?: string) => {
    if (code === "full-diagnostic") {
      return [
        "Diagnóstico aprofundado nos eixos E, B, S e G",
        "Mapeamento completo de riscos e oportunidades",
        "Upload e análise de evidências de sustentabilidade",
        "Roadmap e plano de ação estruturado",
        "Selo de verificação de evidências InoveESG"
      ];
    }
    if (code === "diag-consultoria") {
      return [
        "Diagnóstico aprofundado nos eixos E, B, S e G",
        "Mapeamento completo de riscos e oportunidades",
        "Upload e análise de evidências de sustentabilidade",
        "Roadmap e plano de ação estruturado",
        "Selo de verificação de evidências InoveESG",
        "2 horas de consultoria estratégica com especialista ESG",
        "Apoio técnico personalizado para tomadas de decisão"
      ];
    }
    if (code === "assessoria-completa") {
      return [
        "Diagnóstico aprofundado nos eixos E, B, S e G",
        "Mapeamento completo de riscos e oportunidades",
        "Selo de verificação de evidências InoveESG",
        "Reuniões mensais de assessoria e acompanhamento",
        "Avaliação trimestral da cadeia de fornecedores",
        "Relatório anual consolidado com selo premium"
      ];
    }
    return [
      "Análise personalizada da demanda",
      "Direcionamento técnico consultivo",
      "Suporte prioritário via canais oficiais",
      "Acompanhamento de entrega do serviço"
    ];
  };

  const handleAcceptProposal = async (budgetId: string) => {
    const token = "cookie-session";
    if (!token) return;
    
    setIsSubmittingAction(true);
    setLoadingBudgetId(budgetId);
    try {
      const response = await budgetService.acceptRequest(budgetId, token);
      
      // Update local state
      setRequestedBudgets(prev => 
        prev.map(b => b.id === budgetId ? { ...b, status: "ACEITO" } : b)
      );
      
      if (response && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        setActionStatus("success-accept");
      }
    } catch (error) {
      console.error("Erro ao aceitar proposta:", error);
      alert("Ocorreu um erro ao aceitar a proposta. Tente novamente ou contate o suporte.");
    } finally {
      setIsSubmittingAction(false);
      setLoadingBudgetId(null);
    }
  };

  const handleDeclineProposal = async (budgetId: string) => {
    const token = "cookie-session";
    if (!token) return;
    
    setIsSubmittingAction(true);
    try {
      await budgetService.declineRequest(budgetId, token);
      
      // Update local state
      setRequestedBudgets(prev => 
        prev.map(b => b.id === budgetId ? { ...b, status: "RECUSADO" } : b)
      );
      
      setActionStatus("success-decline");
    } catch (error) {
      console.error("Erro ao recusar proposta:", error);
      alert("Ocorreu um erro ao recusar a proposta. Tente novamente.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Retorna apenas a lista de serviços de fato comprados/ativos no banco de dados
  const getContractedServices = () => {
    const services: any[] = [];

    // Adiciona os serviços adicionais
    purchasedServices.forEach(s => {
      services.push({
        id: s.id,
        name: s.name,
        description: s.description,
        status: s.status,
        isMain: false,
        purchasedAt: s.purchasedAt
      });
    });

    return services;
  };

  const contractedServices = getContractedServices();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── Heading ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Briefcase className="h-4 w-4" />
            Ecossistema InoveESG
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-display">
            Meus Serviços
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie seus serviços contratados, materiais adicionais e solicitações de propostas.
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-md shadow-emerald-100 transition-all hover:scale-[1.02]">
          <Link href="/app/upgrade" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Adquirir Novos Serviços
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* ── Grid Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Planos e Compras Adicionais */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card de Meus Serviços (Container Escuro Principal) */}
          <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
            {/* Decorações do Glassmorphism */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Área do Cliente
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-white">
                    Meus Serviços
                  </h2>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-bold text-emerald-300 flex items-center gap-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {contractedServices.length} {contractedServices.length === 1 ? "Ativo" : "Ativos"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {isQueryingDb || companyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-white/5 border border-white/10 rounded-2xl">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    <p className="text-xs text-slate-300 font-medium">Buscando seus serviços contratados...</p>
                  </div>
                ) : (
                  contractedServices.map((service) => {
                    const isMain = service.isMain;
                    const isBook = !isMain && service.name.toLowerCase().includes("livro");
                    
                    return (
                      <div 
                        key={service.id} 
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
                      >
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={`p-1.5 rounded-lg ${isMain ? "bg-emerald-500/20 text-emerald-300" : isBook ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                              {isMain ? <ShieldCheck className="h-4 w-4" /> : isBook ? <BookOpen className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                            </div>
                            <h4 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-300 transition-colors">
                              {service.name}
                            </h4>
                            {service.purchasedAt && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                Adquirido em {formatDate(service.purchasedAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-white/5 md:border-t-0">
                          {isMain ? (
                            <>
                              {hasOnlyPreDiagnostic && (
                                <Button asChild className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 px-4 transition-all">
                                  <Link href="/app/diagnostico" className="flex items-center gap-1.5">
                                    Responder
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              )}
                              <Button asChild variant="ghost" className="w-full md:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs h-9 px-4 transition-all">
                                <Link href="/app/resultados">
                                  Diagnóstico
                                </Link>
                              </Button>
                            </>
                          ) : isBook ? (
                            <>
                              <a 
                                href="#" 
                                className="w-1/2 md:w-auto text-[11px] font-bold text-center text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 py-2 px-4 rounded-xl transition-all"
                              >
                                PDF
                              </a>
                              <a 
                                href="#" 
                                className="w-1/2 md:w-auto text-[11px] font-bold text-center text-slate-900 bg-white hover:bg-slate-100 py-2 px-4 rounded-xl transition-all"
                              >
                                Ler
                              </a>
                            </>
                          ) : (
                            <>
                              <a 
                                href={getWhatsAppLink(service.name)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-1/2 md:w-auto text-[11px] font-bold text-center text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 py-2.5 px-4 rounded-xl transition-all"
                              >
                                Suporte
                              </a>
                              <Button asChild className="w-1/2 md:w-auto text-[11px] font-bold text-center text-white bg-emerald-600 hover:bg-emerald-700 h-9.5 px-4 rounded-xl transition-all border-none">
                                <Link href={
                                  service.id.startsWith("invite-pack") || service.name.toLowerCase().includes("fornecedor")
                                    ? "/app"
                                    : service.id === "pre-diag" || service.id === "pre-diag-plus"
                                    ? "/app/diagnostico"
                                    : "#"
                                }>
                                  Acessar
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Lado Direito: Solicitações de Orçamento (Propostas) & Ajuda */}
        <div className="space-y-8">
          
          {/* Card de Solicitações de Orçamento */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Acompanhar Orçamentos
            </h3>
            
            <p className="text-xs text-slate-500">
              Solicitações de cotações comerciais sem compromisso de pacotes e diagnósticos corporativos.
            </p>

            {requestedBudgets.length === 0 ? (
              <div className="bg-slate-50/50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">Nenhuma solicitação pendente</p>
                <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-0.5">
                  Adicione planos corporativos ao carrinho e solicite uma proposta.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requestedBudgets.map((req, idx) => (
                  <div 
                     key={`${req.id}-${idx}`}
                    className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 hover:bg-slate-100/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-700 leading-tight">
                        {req.name}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0">
                        {formatDate(req.requestedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        req.status === "SOLICITADO" || req.status === "EM_ANALISE"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : req.status === "RESPONDIDO" || req.status === "PROPOSTA_ENVIADA"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : req.status === "ACEITO"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : req.status === "ATIVO"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : req.status === "RECUSADO"
                                  ? "bg-rose-50 text-rose-700 border-rose-100"
                                  : "bg-slate-50 text-slate-700 border-slate-100"
                      }`}>
                        <Clock className="h-2.5 w-2.5" />
                        {req.status === "SOLICITADO" || req.status === "EM_ANALISE"
                          ? "Solicitado"
                          : req.status === "RESPONDIDO" || req.status === "PROPOSTA_ENVIADA"
                            ? "Respondido"
                            : req.status === "ACEITO"
                              ? "Aceito"
                              : req.status === "ATIVO"
                                ? "Ativo"
                                : req.status === "RECUSADO"
                                  ? "Recusado"
                                  : "Em negociação"}
                      </span>
                      
                      {req.status === "RESPONDIDO" || req.status === "PROPOSTA_ENVIADA" ? (
                        <button
                          onClick={() => {
                            setSelectedBudget(req);
                            setIsProposalModalOpen(true);
                          }}
                          className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded-lg transition-colors flex items-center gap-0.5 shadow-sm"
                        >
                          Ver Proposta
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      ) : req.status === "ACEITO" ? (
                        <button
                          onClick={() => handleAcceptProposal(req.id)}
                          disabled={loadingBudgetId === req.id}
                          className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingBudgetId === req.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Carregando...
                            </>
                          ) : (
                            <>
                              Efetuar Pagamento
                              <ArrowUpRight className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      ) : (
                        <a 
                          href={getWhatsAppLink(`Proposta: ${req.name}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                        >
                          Falar com consultor
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>

      {/* Modal de Proposta */}
      {isProposalModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => {
              if (!isSubmittingAction) {
                setIsProposalModalOpen(false);
                setSelectedBudget(null);
                setActionStatus(null);
              }
            }}
          />

          {/* Modal Content Container */}
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800">
            
            {/* Close button */}
            {!isSubmittingAction && (
              <button 
                onClick={() => {
                  setIsProposalModalOpen(false);
                  setSelectedBudget(null);
                  setActionStatus(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {actionStatus === "success-accept" ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 font-display">Proposta Aceita!</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Agradecemos a confirmação. Nossa equipe entrará em contato nas próximas horas para os próximos passos e agendamento.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      setIsProposalModalOpen(false);
                      setSelectedBudget(null);
                      setActionStatus(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold h-11"
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            ) : actionStatus === "success-decline" ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 font-display">Proposta Recusada</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  A proposta foi marcada como recusada. Caso mude de ideia ou deseje discutir outras opções, sinta-se à vontade para entrar em contato com nosso time.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      setIsProposalModalOpen(false);
                      setSelectedBudget(null);
                      setActionStatus(null);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold h-11"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Proposta Comercial
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 font-display mt-1">
                    {selectedBudget.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Solicitado em {formatDate(selectedBudget.requestedAt)}
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descrição do Escopo</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {selectedBudget.description || "Descrição de escopo sob análise técnica personalizada."}
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Itens Inclusos</h4>
                  <ul className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {getProductChecklist(selectedBudget.code).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Proposal Value */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Valor Proposto</p>
                    <p className="text-2xl font-bold text-emerald-700 font-display mt-0.5">{selectedBudget.priceFormatted}</p>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-600 bg-white border border-emerald-200/50 rounded-full px-2.5 py-1">
                    Faturamento faturado
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => handleDeclineProposal(selectedBudget.id)}
                    disabled={isSubmittingAction}
                    variant="outline"
                    className="w-full sm:w-1/2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-bold h-11"
                  >
                    {isSubmittingAction ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Recusar Proposta"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleAcceptProposal(selectedBudget.id)}
                    disabled={isSubmittingAction}
                    className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-11 shadow-md shadow-emerald-100"
                  >
                    {isSubmittingAction ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Aceitar Proposta"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Compra Concluída / Pagamento Confirmado */}
      {isPaymentSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => {
              setIsPaymentSuccessModalOpen(false);
              setPurchasedProductName(null);
            }}
          />

          {/* Modal Content Container */}
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 text-center space-y-6">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setIsPaymentSuccessModalOpen(false);
                setPurchasedProductName(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon decoration */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-12 w-12 animate-bounce" />
            </div>

            {/* Text content */}
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-display">
                Compra Concluída!
              </h3>
              <p className="text-sm font-semibold text-emerald-600">
                Pagamento confirmado com sucesso
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {purchasedProductName ? (
                  <>Seu pagamento para o serviço <strong>{purchasedProductName}</strong> foi processado. O serviço já está ativo e disponível para uso na sua conta.</>
                ) : (
                  "Seu pagamento foi processado com sucesso. O serviço contratado já está ativo e disponível para uso na sua conta."
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <Button 
                onClick={() => {
                  setIsPaymentSuccessModalOpen(false);
                  setPurchasedProductName(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-11 shadow-md shadow-emerald-100 transition-all hover:scale-[1.01]"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
