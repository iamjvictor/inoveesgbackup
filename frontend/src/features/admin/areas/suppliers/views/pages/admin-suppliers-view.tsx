"use client";

import { useState, useMemo, Fragment } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  TimerReset, 
  TrendingUp, 
  Sparkles,
  Building2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ShoppingBag,
  Clock,
  Link2
} from "lucide-react";
import { AdminSectionHeading } from "@/features/admin/shared/components/admin-section-heading";
import { AdminPagination } from "@/features/admin/shared/components/admin-pagination";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import { AdminFilters, type FilterGroup } from "@/features/admin/shared/components/admin-filters";
import type { AdminSupplierBoardModel } from "@/features/admin/shared/types";

type Props = {
  model: AdminSupplierBoardModel;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
};

export function AdminSuppliersView({ model, isLoading = false, onPageChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "score">("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});

  const statusOptions = [
    { value: "ALL", label: "Todos os Status" },
    { value: "RESPONDED", label: "Respondido" },
    { value: "ACTIVE", label: "Ativo" },
    { value: "INVITED", label: "Convidado" },
    { value: "OVERDUE", label: "Em Atraso" },
    { value: "REGISTERED", label: "Apenas Cadastrado" },
  ];

  const filters: FilterGroup[] = [
    {
      key: "status",
      label: "Status",
      options: statusOptions,
      selectedValue: selectedStatus,
      onValueChange: setSelectedStatus,
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
    setSelectedStatus("ALL");
    setSortField("score");
    setSortDirection("desc");
  };

  const showClearButton = searchQuery !== "" || selectedStatus !== "ALL" || sortField !== "score" || sortDirection !== "desc";

  // Filter and sort suppliers locally
  const filteredSuppliers = useMemo(() => {
    const list = model.suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.segment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "ALL" || supplier.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortField === "score") {
        return sortDirection === "desc" ? b.score - a.score : a.score - b.score;
      }
      if (sortField === "name") {
        return sortDirection === "desc"
          ? b.companyName.localeCompare(a.companyName)
          : a.companyName.localeCompare(b.companyName);
      }
      return 0;
    });

    return list;
  }, [model.suppliers, searchQuery, selectedStatus, sortField, sortDirection]);

  const toggleExpand = (supplierId: string) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  // Helper function to map status labels to user friendly texts
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RESPONDED":
        return "Respondido";
      case "ACTIVE":
        return "Ativo";
      case "INVITED":
        return "Convidado";
      case "OVERDUE":
        return "Em Atraso";
      case "REGISTERED":
        return "Apenas Cadastrado";
      default:
        return status;
    }
  };

  // Helper to map status to color theme
  const getStatusTone = (status: string): "emerald" | "blue" | "slate" | "rose" | "amber" => {
    switch (status) {
      case "RESPONDED":
        return "emerald";
      case "ACTIVE":
        return "blue";
      case "OVERDUE":
        return "rose";
      case "REGISTERED":
        return "amber";
      case "INVITED":
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-8">
      <AdminSectionHeading
        eyebrow="Fornecedores"
        title="Convites, resposta e cobertura da cadeia"
        description="Veja quem foi convidado, quem respondeu e onde a cadeia ainda tem atrasos ou gaps de evidência."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.metrics.map((metric) => (
          <AdminStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      {/* Reusable Filters */}
      <AdminFilters
        searchPlaceholder="Buscar por fornecedor, e-mail ou segmento..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onClearFilters={handleClearFilters}
        showClearButton={showClearButton}
      />

      {/* Suppliers Table Listing */}
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
                    <span>Fornecedor</span>
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
                <th className="py-4 px-6">E-mail de Contato</th>
                <th className="py-4 px-6 text-center">Status</th>
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
                <th className="py-4 px-6 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Sparkles className="h-10 w-10 text-slate-300 animate-pulse" />
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">Nenhum fornecedor encontrado</h3>
                      <p className="mt-1 text-xs text-slate-500">Tente ajustar seus filtros de busca ou seleção.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const isExpanded = !!expandedSuppliers[supplier.id];
                  return (
                    <Fragment key={supplier.id}>
                      <tr className={`hover:bg-slate-50/40 transition-colors ${isExpanded ? 'bg-slate-50/20' : ''}`}>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{supplier.companyName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {supplier.id.substring(0, 8)}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {supplier.segment}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                          {supplier.contactEmail}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <AdminStatusBadge
                            label={getStatusLabel(supplier.status)}
                            tone={getStatusTone(supplier.status)}
                          />
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-800">
                          {supplier.score > 0 ? `${supplier.score}/100` : "—"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpand(supplier.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors"
                          >
                            <span>{isExpanded ? "Ocultar" : "Expandir"}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/30 p-6">
                            <div className="grid gap-6 lg:grid-cols-3">
                              {/* Secondary Metrics */}
                              <div className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                                  <Building2 className="h-4 w-4 text-slate-400" />
                                  Informações Gerais
                                </p>
                                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <TrendingUp className="h-4 w-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider">Progresso</span>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-slate-900">{supplier.progress}%</p>
                                  </div>
                                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <TimerReset className="h-4 w-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider">Evidências Pendentes</span>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-slate-900">{supplier.evidencePending}</p>
                                  </div>
                                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider">Convidado em</span>
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-slate-700">{supplier.invitedAt || "Não convidado"}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Atualizado: {supplier.lastUpdate || "—"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Empresas Conectadas */}
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                  <Link2 className="h-4 w-4 text-emerald-500" />
                                  Empresas Vinculadas (Cadeia)
                                </p>
                                {supplier.linkedCompanies && supplier.linkedCompanies.length > 0 ? (
                                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 max-h-[220px] overflow-y-auto">
                                    {supplier.linkedCompanies.map((company) => (
                                      <div key={company.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                                        <div className="flex flex-col min-w-0 pr-2">
                                          <span className="text-xs font-semibold text-slate-700 truncate">{company.name}</span>
                                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {company.id.substring(0, 8)}</span>
                                        </div>
                                        <span className={`inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                          company.status === "ACTIVE" || company.status === "RESPONDED"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                            : company.status === "OVERDUE"
                                              ? "bg-rose-50 text-rose-700 border border-rose-200/50"
                                              : "bg-slate-50 text-slate-600 border border-slate-200/50"
                                        }`}>
                                          {company.status === "ACTIVE" || company.status === "RESPONDED" ? "Conectado" : company.status === "OVERDUE" ? "Atrasado" : "Convidado"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-4 text-center text-xs text-slate-400 flex flex-col items-center justify-center min-h-[140px] h-[calc(100%-1.75rem)]">
                                    <Link2 className="h-6 w-6 text-slate-300 mb-1" />
                                    <span>Nenhuma empresa compradora vinculada.</span>
                                  </div>
                                )}
                              </div>

                              {/* Products purchased info */}
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                  <ShoppingBag className="h-4 w-4 text-violet-500" />
                                  Produtos Adquiridos
                                </p>
                                {supplier.purchasedProducts && supplier.purchasedProducts.length > 0 ? (
                                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 max-h-[220px] overflow-y-auto">
                                    {supplier.purchasedProducts.map((prod, idx) => (
                                      <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                                        <span className="text-xs font-semibold text-slate-700">{prod.name}</span>
                                        <span className={`inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                          prod.status === "PAID" 
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                                            : "bg-amber-50 text-amber-700 border border-amber-200/50"
                                        }`}>
                                          {prod.status === "PAID" ? "Pago" : "Pendente"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-4 text-center text-xs text-slate-400 flex flex-col items-center justify-center min-h-[140px] h-[calc(100%-1.75rem)]">
                                    <ShoppingBag className="h-6 w-6 text-slate-300 mb-1" />
                                    <span>Nenhum produto adquirido ou pagamento registrado.</span>
                                  </div>
                                )}
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
        basePath="/admin/fornecedores"
        pagination={model.pagination}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
