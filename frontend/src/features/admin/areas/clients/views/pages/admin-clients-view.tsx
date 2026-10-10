"use client";

import { useState, useMemo, Fragment } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Users2, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  Building2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from "lucide-react";
import { AdminSectionHeading } from "@/features/admin/shared/components/admin-section-heading";
import { AdminPagination } from "@/features/admin/shared/components/admin-pagination";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import { AdminFilters, type FilterGroup } from "@/features/admin/shared/components/admin-filters";
import type { AdminClientBoardModel } from "@/features/admin/shared/types";

type Props = {
  model: AdminClientBoardModel;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
};

export function AdminClientsView({ model, isLoading = false, onPageChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "score">("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

  // Extract unique plans dynamically from clients data
  const planOptions = useMemo(() => {
    const plans = new Set(model.clients.map((c) => c.plan));
    return [
      { value: "ALL", label: "Todos" },
      ...Array.from(plans).map((plan) => ({ value: plan, label: plan })),
    ];
  }, [model.clients]);

  // Configure reusable filter structure (health removed, now only plan)
  const filters: FilterGroup[] = [
    {
      key: "plan",
      label: "Plano",
      options: planOptions,
      selectedValue: selectedPlan,
      onValueChange: setSelectedPlan,
    },
  ];

  const handleSort = (field: "name" | "score") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedPlan("ALL");
    setSortField("score");
    setSortDirection("desc");
  };

  const showClearButton = searchQuery !== "" || selectedPlan !== "ALL" || sortField !== "score" || sortDirection !== "desc";

  // Filter and sort clients locally
  const filteredClients = useMemo(() => {
    const list = model.clients.filter((client) => {
      const matchesSearch =
        client.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.segment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan = selectedPlan === "ALL" || client.plan === selectedPlan;

      return matchesSearch && matchesPlan;
    });

    list.sort((a, b) => {
      if (sortField === "score") {
        return sortDirection === "desc" ? b.score - a.score : a.score - b.score;
      }
      if (sortField === "name") {
        return sortDirection === "desc"
          ? b.tradeName.localeCompare(a.tradeName)
          : a.tradeName.localeCompare(b.tradeName);
      }
      return 0;
    });

    return list;
  }, [model.clients, searchQuery, selectedPlan, sortField, sortDirection]);

  const toggleExpand = (clientId: string) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  return (
    <div className="space-y-8">
      <AdminSectionHeading
        eyebrow="Clientes"
        title="Carteira, risco e maturidade"
        description="Leitura operacional das contas atendidas, com foco em saúde da carteira e contas que precisam de ação."
      />

      {/* KPI Cards on Top */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.metrics.map((metric) => (
          <AdminStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      {/* Reusable Filters */}
      <AdminFilters
        searchPlaceholder="Buscar por empresa, razão social ou segmento..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onClearFilters={handleClearFilters}
        showClearButton={showClearButton}
      />

      {/* Clients Listing Area */}
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <th 
                  onClick={() => handleSort("name")}
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 hover:text-slate-600 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Empresa</span>
                    {sortField === "name" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-slate-600" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-slate-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="py-4 px-6">Segmento</th>
                <th className="py-4 px-6">Plano</th>
                <th 
                  onClick={() => handleSort("score")}
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 hover:text-slate-600 transition-colors text-center group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Score</span>
                    {sortField === "score" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-slate-600" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-slate-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
                <th className="py-4 px-6 text-center">Saúde</th>
                <th className="py-4 px-6 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Sparkles className="h-10 w-10 text-slate-300 animate-pulse" />
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">Nenhum cliente encontrado</h3>
                      <p className="mt-1 text-xs text-slate-500">Tente ajustar seus filtros de busca ou seleção.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isExpanded = !!expandedClients[client.id];
                  return (
                    <Fragment key={client.id}>
                      <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? 'bg-slate-50/20' : ''}`}>
                        {/* Company Cell */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700">
                              {client.tradeName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{client.tradeName}</div>
                              <div className="text-xs text-slate-400">{client.legalName}</div>
                            </div>
                          </div>
                        </td>

                        {/* Segment Cell */}
                        <td className="py-4 px-6 text-slate-600 font-medium">{client.segment}</td>

                        {/* Plan Cell */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {client.plan}
                          </span>
                        </td>

                        {/* Score Cell */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-sm font-bold text-slate-950">{client.score}/100</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  client.score >= 70 ? 'bg-emerald-500' : client.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${client.score}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Health Status Badge Cell */}
                        <td className="py-4 px-6 text-center">
                          <AdminStatusBadge
                            label={client.health === 'healthy' ? 'Saudável' : client.health === 'watch' ? 'Atenção' : 'Crítico'}
                            tone={client.health === 'healthy' ? 'emerald' : client.health === 'watch' ? 'amber' : 'rose'}
                          />
                        </td>

                        {/* Expand Button Cell */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpand(client.id)}
                            className={`inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-all cursor-pointer ${
                              isExpanded ? 'bg-slate-100 text-slate-900' : ''
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Detail Expansion Panel */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/40 p-0">
                            <div className="border-t border-slate-100/80 px-8 py-6 animate-in slide-in-from-top-2 duration-200">
                              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Users count */}
                                <div className="rounded-2xl bg-white border border-slate-200/60 p-4 shadow-sm">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Users2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Usuários Ativos</span>
                                  </div>
                                  <p className="mt-2 text-xl font-bold text-slate-950">{client.activeUsers}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">Membros da organização</p>
                                </div>

                                {/* Evidence items pending */}
                                <div className="rounded-2xl bg-white border border-slate-200/60 p-4 shadow-sm">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <FileText className="h-4 w-4 text-amber-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Evidências Pendentes</span>
                                  </div>
                                  <p className="mt-2 text-xl font-bold text-slate-950">{client.evidencePending}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">Aguardando revisão</p>
                                </div>

                                {/* Supplier Coverage */}
                                <div className="rounded-2xl bg-white border border-slate-200/60 p-4 shadow-sm">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Cobertura de Fornecedores</span>
                                  </div>
                                  <p className="mt-2 text-xl font-bold text-slate-950">{client.supplierCoverage}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">Progresso da cadeia</p>
                                </div>

                                {/* Last Diagnostic Submission */}
                                <div className="rounded-2xl bg-white border border-slate-200/60 p-4 shadow-sm">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="h-4 w-4 text-purple-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Último Diagnóstico</span>
                                  </div>
                                  <p className="mt-2 text-sm font-bold text-slate-950 truncate">{client.lastDiagnosticAt || "Nunca realizado"}</p>
                                  <p className="text-xs text-slate-500 mt-1">Data da última submissão</p>
                                </div>
                              </div>

                              {/* Secondary details area */}
                              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-slate-100/50 p-4 border border-slate-200/40">
                                <div className="flex items-center gap-3">
                                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Status do Diagnóstico:
                                  </div>
                                  <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold border ${
                                    client.diagnosticStatus === 'COMPLETED' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : client.diagnosticStatus === 'DRAFT'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {client.diagnosticStatus === 'COMPLETED' ? 'Finalizado' : client.diagnosticStatus === 'DRAFT' ? 'Rascunho' : 'Contratado'}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => window.location.href = `/admin/clientes/${client.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    Visualizar Detalhes
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        basePath="/admin/clientes"
        pagination={model.pagination}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
