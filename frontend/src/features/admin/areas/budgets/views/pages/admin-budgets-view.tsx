"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Clock3, 
  Phone, 
  Tag, 
  DollarSign, 
  ArrowUpDown, 
  X, 
  CheckCircle,
  Building2,
  Briefcase,
  Sparkles,
  Users2,
  HelpCircle,
  Loader2,
  CalendarDays
} from "lucide-react";
import { AdminPagination } from "@/features/admin/shared/components/admin-pagination";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminBudgetBoardModel, AdminBudgetRequest, BudgetRequestStatus } from "@/features/admin/shared/types";
import { Button } from "@/components/ui/button";
import { parseBrazilianCurrency } from "../../budget-currency";

type Props = {
  model: AdminBudgetBoardModel;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
};

export function AdminBudgetsView({ model: initialModel, isLoading = false, onPageChange }: Props) {
  const [model, setModel] = useState<AdminBudgetBoardModel>(initialModel);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRequest, setSelectedRequest] = useState<AdminBudgetRequest | null>(null);
  const [proposalValue, setProposalValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setModel(initialModel);
  }, [initialModel]);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let list = [...model.requests];

    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    list.sort((a, b) => {
      // Clean date format parsing (e.g. "18 jun 2026")
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [model.requests, statusFilter, sortOrder]);

  const handleOpenDetails = (req: AdminBudgetRequest) => {
    setSelectedRequest(req);
    // Parse proposal value if it is present, remove currency tags
    const numericVal = parseBrazilianCurrency(req.proposalValue);
    setProposalValue(isNaN(numericVal) ? "" : String(numericVal));
    setMessage(null);
  };

  const handleRespond = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const numericVal = parseBrazilianCurrency(proposalValue);
      if (isNaN(numericVal) || numericVal < 0) {
        throw new Error("Por favor, insira um valor numérico válido.");
      }

      const proposalValueCents = Math.round(numericVal * 100);

      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const response = await fetch(`${API_URL}/admin/budgets/${selectedRequest.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ proposalValueCents }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? "Erro ao responder orçamento.");
      }

      // Update local state
      const formattedVal = "R$ " + numericVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
      const updatedRequests = model.requests.map((r) => {
        if (r.id === selectedRequest.id) {
          return {
            ...r,
            status: "PROPOSAL_SENT" as const,
            proposalValue: formattedVal,
          };
        }
        return r;
      });

      // Recalculate open value & status counts
      const groupedByStatus: Record<BudgetRequestStatus, number> = {
        PENDING: 0,
        IN_REVIEW: 0,
        PROPOSAL_SENT: 0,
        APPROVED: 0,
        REJECTED: 0,
        ACTIVE: 0,
      };

      let openValueCents = 0;
      updatedRequests.forEach((r) => {
        if (groupedByStatus[r.status] !== undefined) {
          groupedByStatus[r.status]++;
        }
      });

      updatedRequests.forEach((r) => {
        if (r.status === "PENDING" || r.status === "IN_REVIEW") {
          const val = parseBrazilianCurrency(r.proposalValue);
          if (!isNaN(val)) {
            openValueCents += val * 100;
          }
        }
      });

      const openValue = "R$ " + (openValueCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

      // Update stat metrics
      const openCount = groupedByStatus.PENDING + groupedByStatus.IN_REVIEW;
      const updatedMetrics = model.metrics.map((m) => {
        if (m.id === "budgets-open") {
          return {
            ...m,
            value: String(openCount),
            detail: `${openCount} aguardando revisão`,
          };
        }
        return m;
      });

      setModel({
        ...model,
        metrics: updatedMetrics,
        requests: updatedRequests,
        groupedByStatus,
        openValue,
      });

      setMessage({ text: "Orçamento respondido com sucesso!", type: "success" });
      
      // Close modal after a short delay
      setTimeout(() => {
        setSelectedRequest(null);
      }, 1200);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Erro desconhecido", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "IN_REVIEW":
        return "Em Revisão";
      case "PROPOSAL_SENT":
        return "Respondido";
      case "APPROVED":
        return "Aprovado";
      case "REJECTED":
        return "Recusado";
      case "ACTIVE":
        return "Ativo";
      default:
        return status;
    }
  };

  const statusTone = (status: string) => {
    switch (status) {
      case "PENDING":
        return "amber";
      case "IN_REVIEW":
        return "blue";
      case "PROPOSAL_SENT":
        return "slate";
      case "APPROVED":
        return "emerald";
      case "REJECTED":
        return "rose";
      case "ACTIVE":
        return "emerald";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards on Top */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.metrics.map((metric) => (
          <AdminStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      {/* Main Board Area */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        {/* Table Controls (Filter & Sort) */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "Todos" },
              { id: "PENDING", label: "Pendentes" },
              { id: "PROPOSAL_SENT", label: "Respondidos" },
              { id: "APPROVED", label: "Aprovados" },
              { id: "REJECTED", label: "Recusados" },
              { id: "ACTIVE", label: "Ativos" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  statusFilter === filter.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Ordenar por data: {sortOrder === "asc" ? "Antigos primeiro" : "Novos primeiro"}
            </button>
          </div>
        </div>

        {/* Budget Simple List (One line/row per request) */}
        <div className="divide-y divide-slate-100">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">Nenhum orçamento encontrado</h3>
              <p className="mt-1 text-xs text-slate-500">Altere o filtro selecionado acima.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 px-4 rounded-2xl transition-colors"
              >
                {/* Left cell: Company & Sector */}
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-semibold text-slate-900">{request.organizationName}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[250px]">{request.sector}</p>
                </div>

                {/* Middle cell: Requested Product & Date */}
                <div className="flex-1 min-w-[150px]">
                  <p className="text-xs font-medium text-slate-700 truncate max-w-[250px]">{request.objective}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    <span>{request.createdAt}</span>
                  </div>
                </div>

                {/* Right cell: Status and Action Button */}
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="text-right sm:min-w-[100px]">
                    <div className="mt-1">
                      <AdminStatusBadge
                        label={statusLabel(request.status)}
                        tone={statusTone(request.status)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOpenDetails(request)}
                    variant="outline"
                    className="rounded-full px-4 py-1.5 h-8 text-xs font-semibold border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                  >
                    {request.status === "PROPOSAL_SENT" || request.status === "APPROVED" || request.status === "ACTIVE" ? "Visualizar" : "Responder"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details/Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedRequest(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-6 right-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header: Product Title */}
            <div className="pr-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                <Briefcase className="h-3 w-3" />
                Orçamento de Serviço
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {selectedRequest.objective}
              </h3>
            </div>

            {/* Body: Complete Company details in sections */}
            <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Identificação da Empresa Solicitante
                </h4>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 font-mono tracking-wider">CNPJ</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.cnpj || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Nome Fantasia / Razão Social</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.organizationName}</p>
                    <p className="text-xs text-slate-500">{selectedRequest.legalName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Contato / Telefone</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">E-mail de Sustentabilidade</p>
                    <p className="mt-1 font-medium text-slate-800 truncate">{selectedRequest.primaryEmail || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Site Oficial</p>
                    <p className="mt-1 font-medium text-slate-800 truncate">
                      {selectedRequest.website ? (
                        <a 
                          href={selectedRequest.website.startsWith("http") ? selectedRequest.website : `https://${selectedRequest.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          {selectedRequest.website}
                        </a>
                      ) : "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Redes Sociais</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.redesSociais || "Não informado"}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-slate-400">Endereço Completo</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {selectedRequest.enderecoCompleto}
                      {selectedRequest.municipioEstado && ` - ${selectedRequest.municipioEstado}`}
                      {!selectedRequest.enderecoCompleto && !selectedRequest.municipioEstado && "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  Caracterização Jurídica e Porte
                </h4>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Setor de Atuação</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.sector}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Natureza Jurídica</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.naturezaJuridica || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Nº de Colaboradores</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.employeeCount}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Faturamento Anual</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.annualRevenue}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Tempo de Operação</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.tempoOperacao || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Alcance de Mercado</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.alcanceMercado || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Nº de Fornecedores na Cadeia</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.numberOfSuppliers || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Já possui inventário ESG?</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.hasPriorInventory}</p>
                  </div>

                  {selectedRequest.status !== "PENDING" && selectedRequest.status !== "IN_REVIEW" && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Valor Proposto</p>
                      <p className="mt-1 font-semibold text-slate-800">{selectedRequest.proposalValue}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                  Atividade de Mercado
                </h4>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Categoria de Negócio</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.businessCategoryName || "Não informado"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">Segmento de Atuação</p>
                    <p className="mt-1 font-medium text-slate-800">{selectedRequest.businessSegmentName || "Não informado"}</p>
                  </div>

                  {selectedRequest.specificActivity && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-slate-400">Atividade Específica</p>
                      <p className="mt-1 font-medium text-slate-800">{selectedRequest.specificActivity}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Questionnaire Answers (esgJaPossui & esgInteresse) */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">A empresa já possui:</p>
                  {Array.isArray(selectedRequest.esgJaPossui) && selectedRequest.esgJaPossui.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.esgJaPossui.map((item) => (
                        <span 
                          key={item} 
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhum item selecionado</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interesse de Sustentabilidade:</p>
                  {Array.isArray(selectedRequest.esgInteresse) && selectedRequest.esgInteresse.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.esgInteresse.map((item) => (
                        <span 
                          key={item} 
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhum item selecionado</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment Details Section */}
            {selectedRequest.paymentDetails && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Informações de Ativação e Pagamento
                </h4>
                <div className="mt-4 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700/70">Data de Compra / Ativação</p>
                    <p className="mt-1 font-semibold text-slate-800">{selectedRequest.paymentDetails.paidAt}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700/70">Valor Pago</p>
                    <p className="mt-1 font-semibold text-slate-800">{selectedRequest.paymentDetails.amountPaid}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700/70">Forma de Pagamento</p>
                    <p className="mt-1 font-semibold text-slate-800">{selectedRequest.paymentDetails.paymentMethod}</p>
                  </div>
                  {selectedRequest.paymentDetails.providerReference && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-700/70">ID da Transação ({selectedRequest.paymentDetails.provider || "Mercado Pago"})</p>
                      <p className="mt-1 font-mono text-xs text-slate-600 break-all">{selectedRequest.paymentDetails.providerReference}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Section: Price input & Responder button */}
            {(selectedRequest.status === "PENDING" || selectedRequest.status === "IN_REVIEW") && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Ação Comercial
                </h4>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 block mb-2">
                      Valor Proposto (R$)
                    </label>
                    <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-slate-900 transition-colors flex items-center gap-2">
                      <span className="text-slate-400 text-sm font-semibold">R$</span>
                      <input
                        type="text"
                        value={proposalValue}
                        onChange={(e) => setProposalValue(e.target.value)}
                        placeholder="0.00"
                        disabled={isSubmitting}
                        className="w-full bg-transparent border-0 p-0 text-sm font-semibold focus:outline-none focus:ring-0 text-slate-800"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleRespond}
                    disabled={isSubmitting || !proposalValue}
                    className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 py-6 px-6 text-sm font-semibold tracking-wide shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Responder Orçamento"
                    )}
                  </Button>
                </div>

                {message && (
                  <div
                    className={`mt-4 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {message.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    <span>{message.text}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      <AdminPagination
        basePath="/admin/orcamentos"
        pagination={model.pagination}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
