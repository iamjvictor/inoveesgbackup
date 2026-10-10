"use client";

import { useState, useMemo, Fragment, useEffect } from "react";
import { 
  Users2, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Building2, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  X, 
  Clock, 
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AdminSectionHeading } from "@/features/admin/shared/components/admin-section-heading";
import { AdminPagination } from "@/features/admin/shared/components/admin-pagination";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import { AdminFilters, type FilterGroup } from "@/features/admin/shared/components/admin-filters";
import type { AdminClientBoardModel, AdminClientSummary } from "@/features/admin/shared/types";

type Props = {
  model: AdminClientBoardModel;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
};

export function AdminConsultingView({ model, isLoading = false, onPageChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "score">("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Local state to manage list of clients and reflect booking changes immediately
  const [localClients, setLocalClients] = useState<AdminClientSummary[]>(model.clients);

  useEffect(() => {
    setLocalClients(model.clients);
  }, [model.clients]);

  // Calendar Navigation States
  const [dashboardCalendarDate, setDashboardCalendarDate] = useState(() => new Date());
  const [modalCalendarDate, setModalCalendarDate] = useState(() => new Date());

  // Modal States
  const [bookingClient, setBookingClient] = useState<AdminClientSummary | null>(null);
  const [selectedBookingDay, setSelectedBookingDay] = useState<number | null>(null);
  const [selectedBookingTime, setSelectedBookingTime] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detailsClient, setDetailsClient] = useState<AdminClientSummary | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);

  // Extract unique plans dynamically from clients data
  const planOptions = useMemo(() => {
    const plans = new Set(localClients.map((c) => c.plan));
    return [
      { value: "ALL", label: "Todos" },
      ...Array.from(plans).map((plan) => ({ value: plan, label: plan })),
    ];
  }, [localClients]);

  // Configure reusable filter structure
  const filters: FilterGroup[] = [
    {
      key: "plan",
      label: "Plano",
      options: planOptions,
      selectedValue: selectedPlan,
      onValueChange: setSelectedPlan,
    },
  ];

  // Dashboard Month Navigation Handlers
  const handlePrevDashboardMonth = () => {
    setDashboardCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayNum(null);
  };

  const handleNextDashboardMonth = () => {
    setDashboardCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayNum(null);
  };

  // Modal Month Navigation Handlers
  const handlePrevModalMonth = () => {
    setModalCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedBookingDay(null);
  };

  const handleNextModalMonth = () => {
    setModalCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedBookingDay(null);
  };

  // Dashboard calendar computed values
  const dashboardMonthName = useMemo(() => {
    return dashboardCalendarDate.toLocaleString("pt-BR", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase());
  }, [dashboardCalendarDate]);

  const dashboardYear = dashboardCalendarDate.getFullYear();
  const dashboardMonth = dashboardCalendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(dashboardYear, dashboardMonth, 1).getDay();
    const numDays = new Date(dashboardYear, dashboardMonth + 1, 0).getDate();

    const days: Array<{ dayNum: number | null; isToday: boolean; isAppointment: boolean }> = [];

    // Offset blank days
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNum: null, isToday: false, isAppointment: false });
    }

    const appointmentDays = localClients
      .filter((client) => client.consultingStatus === "SCHEDULED" || client.consultingStatus === "COMPLETED")
      .map((client) => client.consultingStartsAt ? new Date(client.consultingStartsAt) : null)
      .filter((date): date is Date => date !== null && date.getMonth() === dashboardMonth && date.getFullYear() === dashboardYear)
      .map((date) => date.getDate());

    for (let d = 1; d <= numDays; d++) {
      days.push({
        dayNum: d,
        isToday: d === today.getDate() && dashboardMonth === today.getMonth() && dashboardYear === today.getFullYear(),
        isAppointment: appointmentDays.includes(d)
      });
    }

    return days;
  }, [localClients, dashboardYear, dashboardMonth]);

  // Modal calendar computed values
  const modalMonthName = useMemo(() => {
    return modalCalendarDate.toLocaleString("pt-BR", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase());
  }, [modalCalendarDate]);

  const modalYear = modalCalendarDate.getFullYear();
  const modalMonth = modalCalendarDate.getMonth();

  const modalCalendarDays = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(modalYear, modalMonth, 1).getDay();
    const numDays = new Date(modalYear, modalMonth + 1, 0).getDate();

    const days: Array<{ dayNum: number | null; isToday: boolean }> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNum: null, isToday: false });
    }

    for (let d = 1; d <= numDays; d++) {
      days.push({
        dayNum: d,
        isToday: d === today.getDate() && modalMonth === today.getMonth() && modalYear === today.getFullYear(),
      });
    }

    return days;
  }, [modalYear, modalMonth]);

  const nextAppointment = useMemo(() => {
    return localClients
      .filter((client) => client.consultingStatus === "SCHEDULED" && client.consultingStartsAt)
      .sort((a, b) => new Date(a.consultingStartsAt!).getTime() - new Date(b.consultingStartsAt!).getTime())[0] ?? null;
  }, [localClients]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (selectedDayNum === null) return [];
    return localClients.filter((client) => {
      if (!client.consultingStartsAt) return false;
      const date = new Date(client.consultingStartsAt);
      return date.getDate() === selectedDayNum && 
             date.getMonth() === dashboardMonth && 
             date.getFullYear() === dashboardYear;
    });
  }, [selectedDayNum, localClients, dashboardMonth, dashboardYear]);

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
    const list = [...localClients].filter((client) => {
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
  }, [localClients, searchQuery, selectedPlan, sortField, sortDirection]);

  // Modal Handlers
  const handleOpenBookingModal = (client: AdminClientSummary) => {
    setBookingClient(client);
    setModalCalendarDate(new Date());
    setSelectedBookingDay(null);
    setSelectedBookingTime(null);
    setIsSuccess(false);
    setErrorMsg(null);
  };

  const handleCloseModal = () => {
    setBookingClient(null);
  };

  const handleOpenDetailsModal = (client: AdminClientSummary) => {
    setDetailsClient(client);
    setModalCalendarDate(new Date());
    setActionError(null);
    setIsRescheduling(false);
    setSelectedBookingDay(null);
    setSelectedBookingTime(null);
  };

  const updateLocalAppointment = (clientId: string, status: AdminClientSummary["consultingStatus"], startsAt?: string | null, orderId?: string) => {
    setLocalClients((prev) => prev.map((client) => {
      if (client.id !== clientId || (orderId && client.orderId !== orderId)) return client;

      const date = startsAt ? new Date(startsAt) : null;
      return {
        ...client,
        consultingStatus: status,
        consultingStartsAt: startsAt ?? null,
        consultingDate: date
          ? date.toLocaleString("pt-BR", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "America/Sao_Paulo",
            })
          : null,
      };
    }));
  };

  const handleAppointmentAction = async (action: "complete" | "cancel" | "reschedule") => {
    if (!detailsClient) return;
    if (action === "reschedule" && (!selectedBookingDay || !selectedBookingTime)) return;

    setIsActionSubmitting(true);
    setActionError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const body: { startsAt?: string; reason?: string; orderId?: string } = {
        orderId: detailsClient.orderId,
      };

      if (action === "reschedule") {
        const [hour, minute] = selectedBookingTime!.split(":").map(Number);
        body.startsAt = new Date(
          modalYear,
          modalMonth,
          selectedBookingDay!,
          hour,
          minute,
        ).toISOString();
      }

      const response = await fetch(`${API_URL}/admin/consultoria/${detailsClient.id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const appointment = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(appointment.message ?? "Não foi possível atualizar o agendamento.");
      }

      const nextStatus = appointment.status === "COMPLETED"
        ? "COMPLETED"
        : appointment.status === "CANCELED"
          ? "CANCELED"
          : "SCHEDULED";
      updateLocalAppointment(detailsClient.id, nextStatus, action === "cancel" ? null : appointment.startsAt, detailsClient.orderId);
      setDetailsClient((current) => current ? {
        ...current,
        consultingStatus: nextStatus,
        consultingStartsAt: action === "cancel" ? null : appointment.startsAt,
        consultingDate: action === "cancel"
          ? null
          : appointment.startsAt
            ? new Date(appointment.startsAt).toLocaleString("pt-BR", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "America/Sao_Paulo",
              })
            : current.consultingDate,
      } : current);
      setIsRescheduling(false);
      setSelectedBookingDay(null);
      setSelectedBookingTime(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingClient || !selectedBookingDay || !selectedBookingTime) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const [hourStr, minStr] = selectedBookingTime.split(":");
      const startsAtDate = new Date(modalYear, modalMonth, selectedBookingDay, Number(hourStr), Number(minStr));

      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const response = await fetch(`${API_URL}/admin/consultoria/${bookingClient.id}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          startsAt: startsAtDate.toISOString(),
          orderId: bookingClient.orderId,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message ?? "Erro ao agendar consultoria.");
      }

      const appointment = await response.json();
      const scheduledStatus = appointment.status === "CONFIRMED" || appointment.status === "REQUESTED"
        ? "SCHEDULED"
        : "PENDING";
      const formattedDate = `${selectedBookingDay} de ${modalMonthName}, ${modalYear} às ${selectedBookingTime}`;
      setLocalClients((prev) =>
        prev.map((c) => {
          if (c.id === bookingClient.id && (!bookingClient.orderId || c.orderId === bookingClient.orderId)) {
            return {
              ...c,
              consultingStatus: scheduledStatus,
              consultingDate: formattedDate,
              consultingStartsAt: startsAtDate.toISOString(),
            };
          }
          return c;
        })
      );

      setIsSuccess(true);
      setTimeout(() => {
        setBookingClient(null);
      }, 1500);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminSectionHeading
        eyebrow="Consultoria"
        title="Consultoria"
        description="Acompanhamento e agendamentos de reuniões com clientes do programa."
      />

      {/* KPI Cards on Top: Próximo Agendamento e Calendário */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Próximo Agendamento */}
        <div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Próximo Agendamento</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 uppercase">
                Confirmado
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900">
                {nextAppointment?.tradeName ?? "Nenhum agendamento"}
              </h3>
              <p className="text-xs text-slate-500">
                {nextAppointment ? "Consultoria ESG" : "As próximas consultorias aparecerão aqui"}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-700 bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {nextAppointment?.consultingDate ?? "Nenhuma data definida"}
                </p>
                <p className="text-xs text-slate-500">
                  {nextAppointment ? "Agendamento confirmado" : "Selecione uma empresa para agendar"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
            <span className="text-slate-400">Status: confirmado</span>
          </div>
        </div>

        {/* Card 2: Calendário */}
        <div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calendário de Consultorias</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevDashboardMonth}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-900 min-w-[120px] text-center">
                  {dashboardMonthName} de {dashboardYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextDashboardMonth}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Próximo mês"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              {/* Weekdays header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
                <span>D</span>
                <span>S</span>
                <span>T</span>
                <span>Q</span>
                <span>Q</span>
                <span>S</span>
                <span>S</span>
              </div>

              {/* Days grid */}
              <div className="mt-2 grid grid-cols-7 gap-1 text-center select-none">
                {calendarDays.map((d, index) => {
                  if (d.dayNum === null) {
                    return <div key={`empty-${index}`} className="h-7 w-7" />;
                  }

                  return (
                    <div key={`day-${d.dayNum}`} className="flex items-center justify-center h-7">
                      <button 
                        onClick={() => setSelectedDayNum(d.dayNum)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all cursor-pointer border-0 outline-none ${
                          d.isToday 
                            ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 ring-offset-1' 
                            : d.isAppointment
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-200 shadow-sm font-bold hover:bg-emerald-200/85'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {d.dayNum}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600 ring-1 ring-indigo-400" />
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-100 border border-emerald-300" />
              <span>Agendado</span>
            </div>
          </div>
        </div>
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
                <th className="py-4 px-6">Produto / Plano</th>
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
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Sparkles className="h-10 w-10 text-slate-300 animate-pulse" />
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">Nenhuma empresa de consultoria encontrada</h3>
                      <p className="mt-1 text-xs text-slate-500">Tente ajustar seus filtros de busca ou seleção.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, idx) => {
                  return (
                    <tr key={`${client.id}-${client.plan}-${idx}`} className="hover:bg-slate-50/40 transition-colors">
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
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
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

                      {/* Consulting Status Cell */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <AdminStatusBadge
                            label={client.consultingStatus === 'COMPLETED' ? 'Realizado' : client.consultingStatus === 'SCHEDULED' ? 'Agendado' : client.consultingStatus === 'CANCELED' ? 'Cancelado' : 'Pendente'}
                            tone={client.consultingStatus === 'COMPLETED' ? 'emerald' : client.consultingStatus === 'SCHEDULED' ? 'blue' : client.consultingStatus === 'CANCELED' ? 'rose' : 'amber'}
                          />
                          {client.consultingStatus === 'SCHEDULED' && client.consultingDate && (
                            <span className="text-[10px] text-slate-500 font-medium mt-1">
                              {client.consultingDate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Button Cell */}
                      <td className="py-4 px-6 text-right">
                        {client.consultingStatus === 'PENDING' ? (
                          <button
                            onClick={() => handleOpenBookingModal(client)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Agendar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDetailsModal(client)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <span>{client.consultingStatus === 'CANCELED' ? 'Remarcar' : 'Visualizar'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        basePath="/admin/consultoria"
        pagination={model.pagination}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />

      {/* Booking Calendar Modal */}
      {bookingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={handleCloseModal}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Consulta Agendada!</h3>
                <p className="mt-2 text-sm text-slate-500">
                  A consultoria com <strong>{bookingClient.tradeName}</strong> foi confirmada para o dia{" "}
                  <strong>{selectedBookingDay} de {modalMonthName} às {selectedBookingTime}</strong>.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="pr-12">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                    <Calendar className="h-3 w-3" />
                    Agendar Consultoria
                  </span>
                  <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                    {bookingClient.tradeName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Selecione uma data e horário no calendário abaixo para agendar a reunião.</p>
                </div>

                {/* Body / Calendar Content */}
                <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
                  {/* Month / Year header with navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevModalMonth}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Mês anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-bold text-slate-900 min-w-[130px] text-center">
                        {modalMonthName} {modalYear}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextModalMonth}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Próximo mês"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Fuso: America/Sao_Paulo</span>
                  </div>

                  {/* Calendar Grid */}
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                      <span>D</span>
                      <span>S</span>
                      <span>T</span>
                      <span>Q</span>
                      <span>Q</span>
                      <span>S</span>
                      <span>S</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {modalCalendarDays.map((day, idx) => {
                        if (day.dayNum === null) {
                          return <div key={`empty-${idx}`} className="h-10" />;
                        }

                        const isSelected = selectedBookingDay === day.dayNum;
                        
                        return (
                          <button
                            key={`day-${day.dayNum}`}
                            onClick={() => {
                              setSelectedBookingDay(day.dayNum);
                              setSelectedBookingTime(null);
                            }}
                            className={`h-10 w-10 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                : day.isToday
                                ? "bg-slate-100 text-slate-900 border border-slate-300"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {day.dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selector (Visible when a day is selected) */}
                  {selectedBookingDay && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-600" />
                          Horário da Consultoria
                        </label>
                        {selectedBookingTime && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Selecionado: {selectedBookingTime}
                          </span>
                        )}
                      </div>

                      {/* Custom Hour and Minute Pickers */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Hora
                          </label>
                          <select
                            value={selectedBookingTime ? selectedBookingTime.split(":")[0] : ""}
                            onChange={(e) => {
                              const h = e.target.value;
                              const m = selectedBookingTime ? selectedBookingTime.split(":")[1] : "00";
                              if (h) setSelectedBookingTime(`${h}:${m}`);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm"
                          >
                            <option value="" disabled>Hora</option>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                              <option key={h} value={h}>{h}h</option>
                            ))}
                          </select>
                        </div>

                        <span className="text-slate-400 font-bold text-base mt-4">:</span>

                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Minuto
                          </label>
                          <select
                            value={selectedBookingTime ? selectedBookingTime.split(":")[1] : ""}
                            onChange={(e) => {
                              const m = e.target.value;
                              const h = selectedBookingTime ? selectedBookingTime.split(":")[0] : "09";
                              if (m) setSelectedBookingTime(`${h}:${m}`);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm"
                          >
                            <option value="" disabled>Minuto</option>
                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                              <option key={m} value={m}>{m} min</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Quick presets */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                          Sugestões de horários comuns:
                        </span>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                          {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((time) => {
                            const isSelectedTime = selectedBookingTime === time;
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setSelectedBookingTime(time)}
                                className={`py-1.5 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                                  isSelectedTime
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                  {errorMsg && (
                    <span className="text-xs text-rose-500 font-semibold max-w-[200px] truncate">{errorMsg}</span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting || !selectedBookingDay || !selectedBookingTime}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Agendando...</span>
                        </>
                      ) : (
                        <span>Confirmar</span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Day Appointments Modal */}
      {selectedDayNum !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedDayNum(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedDayNum(null)}
              className="absolute top-6 right-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="pr-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                <Calendar className="h-3 w-3" />
                Agendamentos do Dia
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                {selectedDayNum} de {dashboardMonthName}, {dashboardYear}
              </h3>
            </div>

            {/* Body */}
            <div className="mt-6 border-t border-slate-100 pt-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {appointmentsForSelectedDay.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Sparkles className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500 font-medium">Nenhuma consultoria agendada para este dia.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointmentsForSelectedDay.map((client, idx) => {
                    const startsAt = client.consultingStartsAt ? new Date(client.consultingStartsAt) : null;
                    const timeStr = startsAt 
                      ? startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
                      : "";

                    return (
                      <div 
                        key={`${client.id}-${client.orderId}-${idx}`}
                        onClick={() => {
                          handleOpenDetailsModal(client);
                          setSelectedDayNum(null);
                        }}
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all cursor-pointer"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-sm font-bold text-slate-950 truncate">{client.tradeName}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate">{client.legalName}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            <Clock className="h-3 w-3" />
                            <span>{timeStr || "Horário não definido"}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <AdminStatusBadge
                            label={client.consultingStatus === 'COMPLETED' ? 'Realizado' : 'Agendado'}
                            tone={client.consultingStatus === 'COMPLETED' ? 'emerald' : 'blue'}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedDayNum(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDetailsClient(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setDetailsClient(null)}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label="Fechar detalhes"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-12">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Detalhes da consultoria</span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{detailsClient.tradeName}</h3>
              <p className="mt-1 text-xs text-slate-500">{detailsClient.legalName}</p>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <AdminStatusBadge
                  label={detailsClient.consultingStatus === "COMPLETED" ? "Realizado" : detailsClient.consultingStatus === "SCHEDULED" ? "Agendado" : detailsClient.consultingStatus === "CANCELED" ? "Cancelado" : "Pendente"}
                  tone={detailsClient.consultingStatus === "COMPLETED" ? "emerald" : detailsClient.consultingStatus === "SCHEDULED" ? "blue" : detailsClient.consultingStatus === "CANCELED" ? "rose" : "amber"}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Data e horário</span>
                <span className="font-semibold text-slate-900">{detailsClient.consultingDate ?? "Não definido"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Duração</span>
                <span className="font-semibold text-slate-900">1 hora</span>
              </div>
            </div>

            {isRescheduling && (
              <div className="mt-5 space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Escolha o novo horário</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevModalMonth}
                      className="p-1 rounded text-indigo-400 hover:text-indigo-800 hover:bg-indigo-100/60"
                      title="Mês anterior"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-bold text-indigo-900">
                      {modalMonthName} {modalYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextModalMonth}
                      className="p-1 rounded text-indigo-400 hover:text-indigo-800 hover:bg-indigo-100/60"
                      title="Próximo mês"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {modalCalendarDays.map((day, index) => day.dayNum === null ? (
                    <div key={`reschedule-empty-${index}`} className="h-8" />
                  ) : (
                    <button
                      key={`reschedule-day-${day.dayNum}`}
                      onClick={() => {
                        setSelectedBookingDay(day.dayNum);
                        setSelectedBookingTime(null);
                      }}
                      className={`h-8 rounded-lg text-xs font-bold ${selectedBookingDay === day.dayNum ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-indigo-100"}`}
                    >
                      {day.dayNum}
                    </button>
                  ))}
                </div>
                {selectedBookingDay && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Hora
                        </label>
                        <select
                          value={selectedBookingTime ? selectedBookingTime.split(":")[0] : ""}
                          onChange={(e) => {
                            const h = e.target.value;
                            const m = selectedBookingTime ? selectedBookingTime.split(":")[1] : "00";
                            if (h) setSelectedBookingTime(`${h}:${m}`);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="" disabled>Hora</option>
                          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                            <option key={h} value={h}>{h}h</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-slate-400 font-bold mt-4">:</span>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Minuto
                        </label>
                        <select
                          value={selectedBookingTime ? selectedBookingTime.split(":")[1] : ""}
                          onChange={(e) => {
                            const m = e.target.value;
                            const h = selectedBookingTime ? selectedBookingTime.split(":")[0] : "09";
                            if (m) setSelectedBookingTime(`${h}:${m}`);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="" disabled>Min</option>
                          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                            <option key={m} value={m}>{m} min</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                        <button
                          key={`reschedule-time-${time}`}
                          type="button"
                          onClick={() => setSelectedBookingTime(time)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                            selectedBookingTime === time 
                              ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" 
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {actionError && <p className="mt-4 text-xs font-semibold text-rose-600">{actionError}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setDetailsClient(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
              >
                Fechar
              </button>
              {(detailsClient.consultingStatus === "SCHEDULED" || detailsClient.consultingStatus === "CANCELED") && !isRescheduling && (
                <>
                  {detailsClient.consultingStatus === "SCHEDULED" && (
                    <button
                      onClick={() => handleAppointmentAction("cancel")}
                      disabled={isActionSubmitting}
                      className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => setIsRescheduling(true)}
                    disabled={isActionSubmitting}
                    className="rounded-xl border border-indigo-200 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    Remarcar
                  </button>
                  {detailsClient.consultingStatus === "SCHEDULED" && (
                    <button
                      onClick={() => handleAppointmentAction("complete")}
                      disabled={isActionSubmitting}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isActionSubmitting ? "Salvando..." : "Marcar como concluída"}
                    </button>
                  )}
                </>
              )}
              {isRescheduling && (
                <>
                  <button
                    onClick={() => setIsRescheduling(false)}
                    disabled={isActionSubmitting}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => handleAppointmentAction("reschedule")}
                    disabled={isActionSubmitting || !selectedBookingDay || !selectedBookingTime}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isActionSubmitting ? "Salvando..." : "Salvar novo horário"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
