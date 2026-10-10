"use client";

import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  FileText
} from "lucide-react";

interface DiagnosticStartViewProps {
  userName: string;
  industrySegment: string;
  onStart: () => void;
  isStarting?: boolean;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  buttonLabel?: string;
  statusLabel?: string;
  summaryLabel?: string;
}

export function DiagnosticStartView({ 
  userName, 
  industrySegment, 
  onStart, 
  isStarting = false,
  eyebrow = "Mapeamento de Maturidade ESG",
  title = <>Olá, <span className="text-emerald-700">{userName}</span>!</>,
  description = (
    <>
      Seu questionário de diagnóstico ESG está pronto para ser preenchido.
      Esta avaliação foi adaptada especificamente para o segmento de
    </>
  ),
  buttonLabel = "Iniciar Diagnóstico",
  statusLabel = "Status: Não Iniciado",
  summaryLabel = "Estrutura das 29 Questões",
}: DiagnosticStartViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-background p-8 md:p-10 shadow-sm">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 size-60 rounded-full bg-emerald-100/35 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-60 rounded-full bg-teal-100/30 blur-3xl" />
        
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="size-4 animate-pulse" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-slate-600">
            {description} <span className="font-semibold text-slate-800">{industrySegment}</span>.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Logged in User Area / Action Card */}
        <div className="md:col-span-1 flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
          <div className="space-y-4">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Diagnóstico Setorial</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {statusLabel}
              </p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Responda às questões obrigatórias sobre as políticas e práticas sustentáveis da sua empresa para prosseguir.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100">
              <Button 
              onClick={onStart}
              disabled={isStarting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow group"
            >
              {isStarting ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {buttonLabel}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Explanatory Card 1: What is the ESG Diagnostic? */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md space-y-4">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Como funciona o Diagnóstico?</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            O Diagnóstico ESG InoveESG avalia a conformidade e maturidade socioambiental da sua empresa. Através das suas respostas, identificamos gaps nas áreas ambiental, bioeconomia circular, social e de governança.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Avaliação de riscos e conformidade</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Geração automática de plano de ação</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Score de reputação no mercado</span>
            </li>
          </ul>
        </div>

        {/* Explanatory Card 2: The 29 Questions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md space-y-4">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <FileText className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{summaryLabel}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            O questionário é composto por 29 perguntas cruciais estruturadas para mapear as atividades da sua organização sob as principais práticas de sustentabilidade.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-center md:grid-cols-4">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="block text-xs font-semibold text-emerald-700">Ambiental</span>
              <span className="text-lg font-bold text-slate-800">E</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="block text-xs font-semibold text-amber-700">Bioeconomia Circular</span>
              <span className="text-lg font-bold text-slate-800">B</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="block text-xs font-semibold text-sky-700">Social</span>
              <span className="text-lg font-bold text-slate-800">S</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="block text-xs font-semibold text-amber-700">Governança</span>
              <span className="text-lg font-bold text-slate-800">G</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            Você pode salvar o progresso de cada seção e retornar para continuar quando desejar.
          </p>
        </div>
      </div>
    </div>
  );
}
