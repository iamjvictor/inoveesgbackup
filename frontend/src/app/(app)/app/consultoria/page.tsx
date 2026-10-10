"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Video } from "lucide-react";
import { getCurrentConsultingAppointment, type CompanyConsultingAppointment } from "@/features/company-area/services/consulting.service";

export default function CompanyConsultingPage() {
  const [appointment, setAppointment] = useState<CompanyConsultingAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentConsultingAppointment()
      .then(setAppointment)
      .finally(() => setIsLoading(false));
  }, []);

  const isScheduled = appointment?.status === "REQUESTED" || appointment?.status === "CONFIRMED";
  const isCompleted = appointment?.status === "COMPLETED";

  const appointmentStartDate = appointment?.startsAt ? new Date(appointment.startsAt) : null;
  const appointmentEndDate = appointment?.endsAt 
    ? new Date(appointment.endsAt) 
    : appointmentStartDate 
      ? new Date(appointmentStartDate.getTime() + 60 * 60 * 1000) 
      : null;
  const isAppointmentPast = appointmentEndDate ? appointmentEndDate < new Date() : false;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link href="/app" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
      </Link>

      <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Consultoria ESG</span>
        <h1 className="mt-3 text-3xl font-bold">Sua consultoria especializada</h1>
        <p className="mt-2 text-sm text-slate-300">Acompanhe aqui o status da sua sessão com um especialista InoveESG.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-slate-500">Carregando agendamento...</p>
        ) : isScheduled && appointment?.startsAt ? (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isAppointmentPast ? "text-amber-600" : "text-emerald-600"}`}>
                Agendamento confirmado
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Sua sessão está marcada</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Calendar className={`h-5 w-5 ${isAppointmentPast ? "text-amber-600" : "text-emerald-600"}`} />
                <span className="text-sm font-semibold text-slate-700">{new Date(appointment.startsAt).toLocaleString("pt-BR", { dateStyle: "long", timeZone: appointment.timezone || "America/Sao_Paulo" })}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Clock className={`h-5 w-5 ${isAppointmentPast ? "text-amber-600" : "text-emerald-600"}`} />
                <span className="text-sm font-semibold text-slate-700">{new Date(appointment.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: appointment.timezone || "America/Sao_Paulo" })} — 1 hora</span>
              </div>
            </div>
            {appointment.meetingUrl && (
              <a href={appointment.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                <Video className="h-4 w-4" /> Entrar na reunião
              </a>
            )}
          </div>
        ) : (
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? "text-emerald-600" : "text-amber-600"}`}>
              {isCompleted ? "Consultoria concluída" : "Aguardando agendamento"}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {isCompleted ? "Sua sessão foi concluída" : "Nossa equipe agendará sua sessão em breve"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">Em caso de dúvidas, entre em contato com a equipe InoveESG.</p>
          </div>
        )}
      </section>
    </main>
  );
}
