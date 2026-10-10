"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowUpRight, ShieldCheck, 
  Leaf, Users, Scale, Lock, FileText, Recycle, Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

import { diagnosticService } from "../../../services/diagnostic.service";
import { getCurrentConsultingAppointment, type CompanyConsultingAppointment } from "../../../services/consulting.service";
import { inviteService, type SupplierInvite } from "../../../services/invite.service";
import { useCompany } from "../../../context/company-context";
import { budgetService } from "../../../services/budget.service";
import { getBudgetDisplayPrice, getInitialCardRotationIndex, hasOpenBudget, isBudgetOwnedByUser, shouldShowBudgetCard } from "../../../access/budget-card";

interface DBDiagnostic {
  status: string;
  score?: {
    overallScore?: number | null;
    environmentalScore?: number | null;
    bioeconomyCircularScore?: number | null;
    socialScore?: number | null;
    governanceScore?: number | null;
  } | null;
}

interface OpenBudget {
  id: string;
  name: string;
  description: string;
  priceFormatted: string;
  requestedAt: string;
  status: string;
  requestedByUserId?: string | null;
  proposedPriceCents?: number | null;
}

export function PreDiagnosticResultsView() {
  const { user, hasInviteAccess, hasEvidenceAccess, company, isSupplierOnly, hasPreDiagnosticAccess, hasConsultingAccess } = useCompany();
  const [dbDiagnostic, setDbDiagnostic] = useState<DBDiagnostic | null>(null);
  const [realSuppliers, setRealSuppliers] = useState<SupplierInvite[]>([]);
  const [consultingAppointment, setConsultingAppointment] = useState<CompanyConsultingAppointment | null>(null);
  const [openBudget, setOpenBudget] = useState<OpenBudget | null>(null);
  const [cardRotationIndex, setCardRotationIndex] = useState(0);
  const [isCardPaused, setIsCardPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setOpenBudget(null);
      setCardRotationIndex(0);
      try {
    const token = "cookie-session";
        if (!token) {
          setIsLoading(false);
          return;
        }
        const res = await diagnosticService.getCurrentDiagnostic(token);
        if (res.hasDiagnostic && res.diagnostic) {
          setDbDiagnostic(res.diagnostic);
        }
        if (hasInviteAccess) {
          try {
            const invites = await inviteService.listInvites(token);
            setRealSuppliers(invites);
          } catch (e) {
            console.error("Failed to load real suppliers:", e);
          }
        }
        if (hasConsultingAccess) {
          try {
            setConsultingAppointment(await getCurrentConsultingAppointment());
          } catch (e) {
            console.error("Failed to load consulting appointment:", e);
          }
        }
        try {
          const budgetResponse: any = await budgetService.listRequests(token);
          const budgets = Array.isArray(budgetResponse) ? budgetResponse : budgetResponse?.data;
          const latestOpenBudget = Array.isArray(budgets)
            ? budgets
                .filter((budget: any) => isBudgetOwnedByUser(budget, user?.id ?? ""))
                .filter((budget: any) => hasOpenBudget(String(budget.status ?? "")))
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            : null;
          if (latestOpenBudget) {
            setCardRotationIndex(getInitialCardRotationIndex(true));
            setOpenBudget({
              id: latestOpenBudget.id,
              name: latestOpenBudget.product?.name ?? "Orçamento em andamento",
              description: latestOpenBudget.product?.description ?? "Sua solicitação está em acompanhamento pela equipe InoveESG.",
              priceFormatted: getBudgetDisplayPrice(latestOpenBudget.status, latestOpenBudget.proposedPriceCents),
              requestedAt: latestOpenBudget.createdAt,
              status: latestOpenBudget.status,
              requestedByUserId: latestOpenBudget.requestedByUserId,
            });
          }
        } catch (e) {
          console.error("Failed to load open budgets:", e);
          setOpenBudget(null);
        }
      } catch (err) {
        console.error("Failed to load pre-diagnostic results:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [hasInviteAccess, hasConsultingAccess, user?.id]);

  useEffect(() => {
    if (!openBudget || !(hasConsultingAccess || consultingAppointment) || isCardPaused) return;
    const interval = window.setInterval(() => setCardRotationIndex((current) => current + 1), 6000);
    return () => window.clearInterval(interval);
  }, [openBudget, hasConsultingAccess, consultingAppointment, isCardPaused]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const isCompleted = dbDiagnostic && dbDiagnostic.status === "COMPLETED";

  // Obter notas reais ou fallback para 0 se incompleto
  const scoreObj = dbDiagnostic?.score;
  const overallScore = isCompleted && scoreObj ? Math.round(Number(scoreObj.overallScore || 0)) : 0;
  const envScore = isCompleted && scoreObj ? Math.round(Number(scoreObj.environmentalScore || 0)) : 0;
  const bioScore = isCompleted && scoreObj ? Math.round(Number(scoreObj.bioeconomyCircularScore || 0)) : 0;
  const socScore = isCompleted && scoreObj ? Math.round(Number(scoreObj.socialScore || 0)) : 0;
  const govScore = isCompleted && scoreObj ? Math.round(Number(scoreObj.governanceScore || 0)) : 0;

  const consultingScheduledAt = consultingAppointment?.startsAt ?? null;
  const isConsultingScheduled = consultingAppointment?.status === "REQUESTED" || consultingAppointment?.status === "CONFIRMED";
  const isConsultingCompleted = consultingAppointment?.status === "COMPLETED";
  const isConsultingCanceled = consultingAppointment?.status === "CANCELED" || consultingAppointment?.status === "NO_SHOW";

  const appointmentStartDate = consultingScheduledAt ? new Date(consultingScheduledAt) : null;
  const appointmentEndDate = consultingAppointment?.endsAt 
    ? new Date(consultingAppointment.endsAt) 
    : appointmentStartDate 
      ? new Date(appointmentStartDate.getTime() + 60 * 60 * 1000) 
      : null;
  const isAppointmentPast = appointmentEndDate ? appointmentEndDate < new Date() : false;
  const hasConsultingCard = Boolean(hasConsultingAccess || consultingAppointment);
  const showBudgetCard = shouldShowBudgetCard(Boolean(openBudget), hasConsultingCard, cardRotationIndex);

  const getPillarDescription = (score: number, pillar: "E" | "B" | "S" | "G") => {
    if (pillar === "E") {
      if (score >= 80) return "Excelente gestão de recursos e eficiência energética. Foco no monitoramento rigoroso e metas de descarbonização.";
      if (score >= 60) return "Estrutura básica de descarte de resíduos e economia de recursos ativa. Requer refinar inventários de carbono.";
      return "Gestão de recursos e resíduos em nível inicial. Necessidade imediata de estruturação de controle básico de água, energia e emissões.";
    } else if (pillar === "B") {
      if (score >= 80) return "Bioeconomia circular consolidada, com cadeia de valor integrada e inovação orientada ao reaproveitamento.";
      if (score >= 60) return "Práticas circulares em desenvolvimento, com oportunidades em logística reversa, insumos renováveis e simbiose industrial.";
      return "Pilar de bioeconomia circular em fase inicial. Falta formalizar critérios de circularidade e integração com fornecedores.";
    } else if (pillar === "S") {
      if (score >= 80) return "Ótimo ambiente de trabalho e programas de treinamento. Foco em diversidade e governança de direitos humanos.";
      if (score >= 60) return "Treinamentos básicos em segurança e saúde ocupacional ativos. Oportunidades em programas de inclusão de fornecedores.";
      return "Programas sociais e de saúde em estruturação inicial. Necessidade de formalização de políticas internas de diversidade.";
    } else {
      if (score >= 80) return "Alto nível de conformidade, ética e governança corporativa ativa. Comitês independentes bem estruturados.";
      if (score >= 60) return "Código de conduta e LGPD formalizados. Oportunidade de criar canais de ouvidoria com SLA transparente.";
      return "Estrutura de governança e ética em fase embrionária. Alta prioridade para a formalização do código de ética e comitê interno.";
    }
  };

  // Helper for supplier risk styling and label
  const getSupplierRiskLabel = (score: number) => {
    const stars = score / 20;
    if (stars >= 4.0) return { label: "Risco Muito Baixo", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (stars >= 3.0) return { label: "Risco Baixo", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (stars >= 2.0) return { label: "Risco Moderado", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    if (stars >= 1.0) return { label: "Risco Alto", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
    return { label: "Risco Muito Alto", color: "text-red-500 bg-red-500/10 border-red-500/20" };
  };

  const renderMeusServicosCTA = () => {
    return (
      <Card className="border border-emerald-100 bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/20 shadow-lg rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all hover:shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-4 max-w-2xl">
            <span className="bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block">
              Nossos Serviços
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-display">
              Impulsione o crescimento da sua empresa com práticas ESG
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              O ESG (Governança Ambiental, Social e Corporativa) não é apenas conformidade, é uma alavanca estratégica de valor para a sua empresa. Veja os principais benefícios:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Destaque Comercial</h4>
                  <p className="text-[11px] text-slate-500">Seja a escolha preferida de grandes clientes que já exigem relatórios ESG de fornecedores.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Redução de Custos</h4>
                  <p className="text-[11px] text-slate-500">Economize recursos otimizando o consumo de energia, água e reduzindo resíduos.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Mitigação de Riscos</h4>
                  <p className="text-[11px] text-slate-500">Evite passivos ambientais e multas, garantindo conformidade jurídica.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 p-1 rounded-lg text-emerald-600 mt-0.5 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Acesso a Capital</h4>
                  <p className="text-[11px] text-slate-500">Facilite a captação de recursos e consiga taxas de juros mais atrativas em bancos.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto self-stretch md:self-auto flex items-end md:items-center">
            <Button asChild className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs h-11 px-6 shadow-md transition-all hover:scale-[1.02]">
              <Link href="/app/meus-servicos" className="flex items-center justify-center gap-2">
                Acessar Meus Serviços
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (isSupplierOnly) {
    if (!isCompleted) {
      return (
        <div className="space-y-6 py-4 animate-in fade-in duration-500">
          {/* Banner Principal - Realizar Pré-Diagnóstico */}
          <div className="w-full relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-gradient-to-l from-emerald-600/20 to-transparent blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[20%] h-[80%] bg-gradient-to-r from-teal-600/10 to-transparent blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 h-full z-20">
              <div className="space-y-3 flex-1">
                <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block">
                  Avaliação ESG Pendente
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Faça sua Avaliação de Risco ESG
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                  Você ainda não realizou a sua avaliação. Responda o formulário para calcular a sua pontuação e análise de risco ESG.
                </p>
                <div className="pt-2">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 px-5 transition-all">
                    <Link href="/app/diagnostico" className="flex items-center gap-1.5">
                      Realizar Avaliação de Risco
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA para Meus Serviços */}
          {renderMeusServicosCTA()}
        </div>
      );
    }

    const risk = getSupplierRiskLabel(overallScore);

    return (
      <div className="space-y-8 py-4 animate-in fade-in duration-500">
        
        {/* Banner Principal com nota e risco */}
        <div className="w-full relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-gradient-to-l from-emerald-600/20 to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[20%] h-[80%] bg-gradient-to-r from-teal-600/10 to-transparent blur-2xl" />
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 h-full z-20">
            <div className="space-y-3 flex-1">
              <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block">
                Diagnóstico Concluído
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                Diagnóstico Piloto ESG
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                Parabéns! Sua empresa concluiu a fase preliminar do diagnóstico. Confira abaixo a pontuação dividida e sua análise de risco.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3 items-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Análise de Risco:</span>
                <span className={`text-xs font-bold py-1 px-3 rounded-full border ${risk.color}`}>
                  {risk.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 shrink-0 self-center md:self-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pontuação Consolidada</span>
              <div className="flex items-baseline gap-1 bg-slate-800/80 border border-slate-700/50 py-2.5 px-6 rounded-2xl">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">{overallScore}</span>
                <span className="text-sm font-semibold text-slate-500">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição por Pilar ESG */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Distribuição por Pilar ESG
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pilar E - Ambiental */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800">Ambiental (E)</CardTitle>
                  </div>
                  <span className="text-sm font-bold text-slate-800 font-mono">{envScore}/100</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${envScore}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Pilar B - Bioeconomia Circular */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-50 p-1.5 rounded-lg text-amber-600">
                      <Recycle className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800">Bioeconomia Circular (B)</CardTitle>
                  </div>
                  <span className="text-sm font-bold text-slate-800 font-mono">{bioScore}/100</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${bioScore}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Pilar S - Social */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800">Social (S)</CardTitle>
                  </div>
                  <span className="text-sm font-bold text-slate-800 font-mono">{socScore}/100</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${socScore}%` }} />
                </div>
              </CardContent>
            </Card>

            {/* Pilar G - Governança */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600">
                      <Scale className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800">Governança (G)</CardTitle>
                  </div>
                  <span className="text-sm font-bold text-slate-800 font-mono">{govScore}/100</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${govScore}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA para Meus Serviços */}
        {renderMeusServicosCTA()}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-500">
      
      {/* ── Top Section: Banner + Consulting Card or Purchase CTA ─────────────────── */}
      {!hasPreDiagnosticAccess ? (
        <Card className="border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white shadow-2xl shadow-emerald-950/20 rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden transition-all hover:shadow-emerald-950/30">
          {/* Background glowing ambient light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
            <div className="space-y-5 max-w-3xl">
              <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full inline-block">
                Nossos Serviços
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
                Adquira o Pré-Diagnóstico ESG e Consultoria
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Mapeie a maturidade em sustentabilidade da sua empresa nos pilares Ambiental, Social e Governança, atenda aos requisitos do mercado de fornecedores e otimize sua gestão com a validação de nossos especialistas.
              </p>
            </div>
            
            <div className="shrink-0 w-full lg:w-auto self-stretch lg:self-auto flex items-end lg:items-center font-display">
              <Button asChild className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm h-14 px-8 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.03]">
                <Link href="/app/upgrade" className="flex items-center justify-center gap-2">
                  Adquirir Serviços ESG
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Banner Principal (2 cols) */}
          <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex h-[340px] flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-gradient-to-l from-emerald-600/20 to-transparent blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[20%] h-[80%] bg-gradient-to-r from-teal-600/10 to-transparent blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 h-full z-20">
              <div className="space-y-3 flex-1">
                <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block">
                  {isCompleted ? "Diagnóstico Concluído" : "Pré-Diagnóstico ESG Pendente"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">
                  {isCompleted ? "Diagnóstico Piloto ESG" : "Faça seu Pré-Diagnóstico ESG"}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                  {isCompleted 
                    ? "Parabéns! Sua empresa concluiu a fase preliminar do diagnóstico. Confira abaixo a pontuação dividida e seu plano de ação recomendado."
                    : "Você ainda não concluiu o seu Pré-Diagnóstico. Responda o formulário para calcular a maturidade ESG da sua empresa nos pilares Ambiental, Bioeconomia Circular, Social e Governança."
                  }
                </p>
                {!isCompleted && (
                  <div className="pt-2">
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 px-5 transition-all">
                      <Link href="/app/diagnostico" className="flex items-center gap-1.5">
                        Realizar Pré-Diagnóstico
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center md:items-end gap-2 shrink-0 self-center md:self-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pontuação Consolidada</span>
                <div className="flex items-baseline gap-1 bg-slate-800/80 border border-slate-700/50 py-2.5 px-6 rounded-2xl">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">{overallScore}</span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Consultoria (1 col) */}
          <div
            className="relative group/card h-[340px] min-h-[340px]"
            onMouseEnter={() => setIsCardPaused(true)}
            onMouseLeave={() => setIsCardPaused(false)}
          >
          {showBudgetCard && openBudget ? (
            <Card className="h-full min-h-0 border border-blue-100 shadow-xl rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden bg-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block">
                    Orçamento em andamento
                  </span>
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Seu Orçamento</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {openBudget.name} está em acompanhamento pela equipe InoveESG.
                </p>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    <Clock className="h-4 w-4" />
                    {openBudget.status === "RESPONDIDO" || openBudget.status === "PROPOSTA_ENVIADA" ? "Proposta disponível" : "Solicitação recebida"}
                  </div>
                    <p className="text-sm font-bold text-slate-800">{openBudget.priceFormatted}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{openBudget.description}</p>
                </div>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-9 transition-all">
                  <Link href="/app/meus-servicos" className="flex items-center justify-center gap-1.5">
                    Acompanhar Orçamento
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          ) : hasConsultingAccess || consultingAppointment ? (
            <Card className="h-full min-h-0 border border-slate-100 shadow-xl rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden bg-white">
              <div className="space-y-3">
                <span className={`${
                  isConsultingCompleted
                    ? "bg-slate-100 border-slate-200 text-slate-700" 
                    : isConsultingCanceled 
                    ? "bg-rose-50 border-rose-200 text-rose-600" 
                    : isConsultingScheduled 
                    ? isAppointmentPast
                      ? "bg-amber-50 border-amber-200 text-amber-600 font-bold"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600" 
                    : "bg-amber-50 border-amber-200 text-amber-600"
                } border text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block`}>
                  {isConsultingCompleted 
                    ? "Consultoria Concluída" 
                    : isConsultingCanceled 
                    ? "Consultoria Cancelada" 
                    : isConsultingScheduled 
                    ? "Consultoria Ativa" 
                    : "Aguardando Agendamento"}
                </span>

                <h3 className="text-base font-bold text-slate-800">Sua Consultoria ESG</h3>

                {isConsultingScheduled && consultingScheduledAt ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Você possui uma sessão agendada com nossos especialistas.
                    </p>
                    <div className={`rounded-2xl border p-4 ${isAppointmentPast ? "border-amber-200 bg-amber-50/50" : "border-emerald-100 bg-emerald-50/50"}`}>
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isAppointmentPast ? "text-amber-700" : "text-emerald-700"}`}>
                        <Calendar className="h-4 w-4" />
                        Próxima sessão
                      </div>
                      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                        <div>
                          <p className="text-sm font-bold capitalize text-slate-800">
                            {new Date(consultingScheduledAt).toLocaleDateString("pt-BR", {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              timeZone: consultingAppointment?.timezone || "America/Sao_Paulo",
                            })}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-slate-500">
                            Fuso horário: {consultingAppointment?.timezone || "Brasília"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-extrabold leading-none ${isAppointmentPast ? "text-amber-700" : "text-emerald-700"}`}>
                            {new Date(consultingScheduledAt).toLocaleTimeString("pt-BR", {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: consultingAppointment?.timezone || "America/Sao_Paulo",
                            })}
                          </p>
                          <p className={`mt-1 text-[10px] font-semibold ${isAppointmentPast ? "text-amber-700" : "text-emerald-700"}`}>Duração: 1 hora</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isConsultingCompleted ? (
                  <div className="space-y-2">
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Sua sessão de consultoria foi concluída. Obrigado por participar.
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg inline-block">
                      Atendimento concluído
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {isConsultingCanceled
                        ? "Seu agendamento foi cancelado. Nossa equipe poderá remarcar uma nova sessão para você."
                        : "Você tem direito a uma consultoria especializada individual. Agende seu horário para validar suas práticas."}
                    </p>
                    <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg inline-block">
                      {isConsultingCanceled ? "Agendamento cancelado" : "Aguardando Agendamento"}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-0 border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden bg-slate-50/50">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-10" />
              
              <div className="space-y-3 relative z-20">
                <div className="flex justify-between items-start">
                  <span className="bg-slate-200/80 border border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full inline-block">
                    Consultoria ESG
                  </span>
                  <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-400 select-none">Consultoria Especializada</h3>
                <p className="text-slate-400 text-xs leading-relaxed select-none">
                  Agende sessões individuais com especialistas para validar evidências de conformidade e aprimorar seus indicadores ESG.
                </p>
              </div>

              <div className="pt-4 relative z-20">
                <Button asChild className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-xl text-xs h-9 transition-all">
                  <Link href="/app/upgrade" className="flex items-center justify-center gap-1.5">
                    Adquirir Consultoria
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {openBudget && hasConsultingCard && (
            <>
              <button
                type="button"
                aria-label="Mostrar card anterior"
                onClick={() => setCardRotationIndex((current) => current - 1)}
                className="absolute left-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition-all hover:bg-white hover:text-slate-800 group-hover/card:opacity-100 focus-visible:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Mostrar próximo card"
                onClick={() => setCardRotationIndex((current) => current + 1)}
                className="absolute right-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition-all hover:bg-white hover:text-slate-800 group-hover/card:opacity-100 focus-visible:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          </div>

        </div>
      )}

      {/* ── Detalhamento dos Quatro Pilares (E, B, S, G) ─────────────────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Distribuição por Pilar ESG
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pilar E - Ambiental */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-800">Ambiental (E)</CardTitle>
                </div>
                <span className="text-sm font-bold text-slate-800 font-mono">{envScore}/100</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${envScore}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Pilar B - Bioeconomia Circular */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-50 p-1.5 rounded-lg text-amber-600">
                    <Recycle className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-800">Bioeconomia Circular (B)</CardTitle>
                </div>
                <span className="text-sm font-bold text-slate-800 font-mono">{bioScore}/100</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${bioScore}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Pilar S - Social */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-800">Social (S)</CardTitle>
                </div>
                <span className="text-sm font-bold text-slate-800 font-mono">{socScore}/100</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${socScore}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Pilar G - Governança */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600">
                    <Scale className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-800">Governança (G)</CardTitle>
                </div>
                <span className="text-sm font-bold text-slate-800 font-mono">{govScore}/100</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${govScore}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Análise de Evidências & Ações da Cadeia ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Análise de Evidências (Bloqueado) */}
        <Card className="lg:col-span-2 border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden bg-slate-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-800">Análise de Evidências</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Gerencie e audite os documentos comprobatórios das práticas ESG da sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative min-h-[300px] flex flex-col justify-between pt-4">
            {/* Lista desfocada de evidências */}
            <div className={hasEvidenceAccess ? "space-y-3" : "space-y-3 blur-[3px] select-none pointer-events-none opacity-50"}>
              {[
                { title: "Relatório de consumo energético anual", axis: "Ambiental (E)", status: "Pendente" },
                { title: "Comprovantes de circularidade de insumos", axis: "Bioeconomia Circular (B)", status: "Pendente" },
                { title: "Política de SST e relatórios de treinamento", axis: "Social (S)", status: "Pendente" },
                { title: "Código de Conduta e SLA do Canal de Ouvidoria", axis: "Governança (G)", status: "Pendente" },
                { title: "Inventário de Gases de Efeito Estufa (Escopo 1 e 2)", axis: "Ambiental (E)", status: "Não Iniciado" },
              ].map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{ev.title}</p>
                      <p className="text-[10px] text-slate-500">{ev.axis}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold py-0.5 px-2 bg-amber-50 text-amber-700 rounded-full">
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>

            {hasEvidenceAccess ? (
              <div className="mt-4 flex justify-end">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-6 shadow-sm">
                  <Link href="/app/evidencias" className="flex items-center justify-center gap-1.5">
                    Gerenciar Evidências <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                <div className="hidden sm:inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-100 mb-3 animate-bounce">
                  <Lock className="h-6 w-6 text-slate-800" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm mb-1">Upgrade Necessário</h5>
                <p className="text-slate-600 text-xs leading-relaxed max-w-sm mb-4">
                  A comprovação por evidências está disponível apenas no plano completo para auditoria e homologação das respostas do diagnóstico.
                </p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-6 shadow-sm">
                  <Link href="/app/upgrade" className="flex items-center justify-center gap-1.5">
                    Fazer Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lado Direito: Preview de Fornecedores & Certificação */}
        <div className="space-y-6">
          {/* Mapeamento de Cadeia (Bloqueado) */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl relative overflow-hidden bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800">Cadeia de Fornecedores</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Audite e gerencie o perfil ESG dos seus fornecedores.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative min-h-[160px] flex flex-col justify-between pt-2">
              {hasInviteAccess ? (
                <>
                  <div className="space-y-2.5">
                    {realSuppliers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center bg-white border border-slate-100 rounded-xl">
                        <Users className="h-6 w-6 text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Nenhum fornecedor cadastrado</p>
                        <p className="text-[10px] text-slate-500">Envie convites para começar a monitorar a sua cadeia.</p>
                      </div>
                    ) : (
                      realSuppliers.slice(0, 3).map((sup) => {
                        const orgName = sup.supplierOrganization?.tradeName || sup.supplierEmail;
                        const score = sup.requestedDiagnostics?.[0]?.score?.overallScore;
                        const scoreNum = score !== undefined && score !== null ? Number(score) : null;
                        const displayScore = scoreNum !== null ? Math.round(scoreNum) : "--";
                        const statusLabel = 
                          sup.status === "ACCEPTED" ? "Respondido" : 
                          sup.status === "PENDING" || sup.status === "SENT" ? "Pendente" : "Expirado";

                        let badgeClass = "bg-slate-100 text-slate-600 border border-slate-200/50";
                        if (scoreNum !== null) {
                          if (scoreNum < 60) {
                            badgeClass = "bg-red-50 text-red-600 border border-red-100";
                          } else if (scoreNum <= 80) {
                            badgeClass = "bg-amber-50 text-amber-600 border border-amber-100";
                          } else {
                            badgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                          }
                        }

                        return (
                          <div key={sup.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-[11px] font-semibold text-slate-700 truncate">{orgName}</p>
                              <p className="text-[9px] text-slate-500">Status: {statusLabel}</p>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${badgeClass}`}>
                              {displayScore}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-8 px-4 mt-4 shadow-sm w-full">
                    <Link href="/app/fornecedores" className="flex items-center justify-center gap-1">
                      Gerenciar Cadeia <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  {/* Lista desfocada de fornecedores */}
                  <div className="space-y-2.5 blur-[3px] select-none pointer-events-none opacity-55">
                    {[
                      { name: "EcoPack Embalagens Ltda", status: "Respondido", score: "84" },
                      { name: "TransLog Verde", status: "Pendente", score: "--" },
                    ].map((sup, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700 truncate">{sup.name}</p>
                          <p className="text-[9px] text-slate-500">Status: {sup.status}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {sup.score}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Overlay Lock de Upgrade */}
                  <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                    <div className="hidden sm:inline-block bg-white p-2 rounded-xl shadow-md border border-slate-100 mb-2">
                      <Lock className="h-5 w-5 text-slate-800" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs mb-0.5">Upgrade Necessário</h5>
                    <p className="text-slate-600 text-[10px] leading-relaxed max-w-[180px] mb-2.5">
                      Envie convites e acompanhe a conformidade de seus fornecedores.
                    </p>
                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-7 px-4 shadow-sm">
                      <Link href="/app/upgrade" className="flex items-center justify-center gap-1">
                        Fazer Upgrade <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
