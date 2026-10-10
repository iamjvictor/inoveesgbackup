"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { inviteService, type SupplierInvite } from "@/features/company-area/services/invite.service";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Leaf,
  Users2,
  Scale,
  Plus,
  Users,
  ChevronRight,
  Loader2,
  Award,
  HelpCircle,
  FileText,
  Star,
  StarHalf
} from "lucide-react";

type DiagnosticCompletedViewProps = {
  userName: string;
  industrySegment: string;
  completedAt?: string | null;
  overallScore?: number | null;
  environmentalScore?: number | null;
  bioeconomyCircularScore?: number | null;
  socialScore?: number | null;
  governanceScore?: number | null;
  maturityLevel?: string | null;
  evidences?: Array<{
    id: string;
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
    evidenceCategory?: string | null;
  }> | null;
  canRedoDiagnostic: boolean;
  isStarting?: boolean;
  onRedo: () => void;
};

function formatDate(value?: string | null) {
  if (!value) return "Data não informada";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getMaturityLabel(level?: string | null) {
  if (!level) return "Não calculado";
  switch (level.toUpperCase()) {
    case "NASCENT":
      return "Nível 1 — Elementar";
    case "DEVELOPING":
      return "Nível 2 — Não Integrado";
    case "ESTABLISHED":
      return "Nível 3 — Gerencial";
    case "MANAGED":
      return "Nível 4 — Estratégico";
    case "OPTIMIZED":
      return "Nível 5 — Transformador";
    default:
      return level;
  }
}

export function DiagnosticCompletedView({
  userName,
  industrySegment,
  completedAt,
  overallScore,
  environmentalScore,
  bioeconomyCircularScore,
  socialScore,
  governanceScore,
  maturityLevel,
  evidences = [],
  canRedoDiagnostic,
  isStarting = false,
  onRedo,
}: DiagnosticCompletedViewProps) {
  const [invites, setInvites] = useState<SupplierInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [errorInvites, setErrorInvites] = useState(false);

  useEffect(() => {
    async function fetchInvites() {
      try {
    const token = "cookie-session";
        if (!token) {
          setLoadingInvites(false);
          return;
        }
        const list = await inviteService.listInvites(token);
        setInvites(list);
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err);
        setErrorInvites(true);
      } finally {
        setLoadingInvites(false);
      }
    }
    fetchInvites();
  }, []);

  const hasAudit = evidences && evidences.some(e => e.verificationStatus === "VERIFIED");
  const classification = hasAudit ? "Auditado" : "Declaratório";
  const confidenceLevel = hasAudit ? "Alto" : "Baixo";

  // Maps 0-100 score to 0.0 - 5.0 stars range with custom rounding rules:
  // - Decimal part <= 0.25 rounds to .0
  // - Decimal part > 0.25 and <= 0.75 rounds to .5
  // - Decimal part > 0.75 rounds to 1.0
  const getStarsValue = (score: number) => {
    const rawStars = score / 20;
    const integerPart = Math.floor(rawStars);
    const decimalPart = rawStars - integerPart;
    
    let roundedDecimal = 0;
    if (decimalPart > 0.25 && decimalPart <= 0.75) {
      roundedDecimal = 0.5;
    } else if (decimalPart > 0.75) {
      roundedDecimal = 1.0;
    }
    
    return integerPart + roundedDecimal;
  };

  const starsValue = getStarsValue(overallScore ?? 0);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <Star key={i} className="h-6 w-6 text-amber-500 fill-amber-500 animate-in zoom-in duration-300" style={{ animationDelay: `${i * 100}ms` }} />
        );
      } else if (rating >= i - 0.5) {
        stars.push(
          <StarHalf key={i} className="h-6 w-6 text-amber-500 fill-amber-500 animate-in zoom-in duration-300" style={{ animationDelay: `${i * 100}ms` }} />
        );
      } else {
        stars.push(
          <Star key={i} className="h-6 w-6 text-slate-200 animate-in zoom-in duration-300" style={{ animationDelay: `${i * 100}ms` }} />
        );
      }
    }
    return stars;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-background p-8 md:p-10 shadow-sm">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 size-60 rounded-full bg-emerald-100/35 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-60 rounded-full bg-teal-100/30 blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="size-4 animate-pulse" />
            <span>Diagnóstico concluído</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Parabéns, {userName}!
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-slate-600">
            Sua avaliação ESG para o segmento de <span className="font-semibold text-slate-800">{industrySegment}</span> foi processada com sucesso. Veja abaixo os detalhes da sua maturidade.
          </p>
        </div>
      </div>

      {/* Conditional Warning/Verification Status Banner */}
      {!hasAudit ? (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-orange-50/30 to-background p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-800 p-3 rounded-2xl shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm md:text-base font-bold text-slate-800 font-display flex flex-wrap items-center gap-2">
                  <span>Resultado ESG Classificado como:</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    {classification}
                  </span>
                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Confiança: {confidenceLevel}
                  </span>
                </h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl">
                  Suas respostas foram registradas, porém <strong>não há nenhuma evidência comprovada</strong> anexada ao sistema. 
                  Para elevar o nível de confiança para <strong>Alto</strong> e validar os seus resultados diante do mercado com selo oficial de verificação InoveESG, contrate nossa auditoria técnica de evidências.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild variant="outline" className="rounded-xl border-amber-200 text-slate-700 bg-white hover:bg-amber-50 h-10 text-xs font-bold shadow-sm">
                <Link href="/app/evidencias">
                  Anexar Documentos
                </Link>
              </Button>
              <Button asChild className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white h-10 text-xs font-bold shadow-md shadow-amber-100">
                <Link href="/app/upgrade">
                  Contratar Auditoria
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-250 bg-gradient-to-r from-emerald-50/80 via-teal-50/30 to-background p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm md:text-base font-bold text-slate-800 font-display flex flex-wrap items-center gap-2">
                  <span>Resultado ESG Classificado como:</span>
                  <span className="text-[10px] bg-emerald-150 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    {classification}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Confiança: {confidenceLevel}
                  </span>
                </h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl">
                  Parabéns! Seus indicadores foram validados através de nossa auditoria técnica documental. Suas notas são oficiais e devidamente respaldadas por evidências verificadas.
                </p>
              </div>
            </div>
            <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-10 text-xs font-bold shadow-md">
              <Link href="/app/evidencias">
                Ver Evidências
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Scores & KPIs Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Score Geral Card */}
        <div className="md:col-span-1 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nota Geral</span>
              <Award className="h-5 w-5 text-emerald-600 animate-bounce" />
            </div>
            
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Pontuação Geral</span>
                <span className="text-5xl font-black text-slate-900 font-display block">
                  {Math.round(overallScore ?? 0)}%
                </span>
              </div>

              <div className="flex flex-col items-center space-y-1.5 pt-2 border-t border-slate-100 w-full max-w-[150px]">
                <div className="flex items-center gap-1.5">
                  {renderStars(starsValue)}
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  Maturidade: {starsValue.toFixed(1)} / 5.0
                </span>
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-base font-black text-slate-800 font-display">
                  {getMaturityLabel(maturityLevel)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {!hasAudit && "Limite do Pré-Diagnóstico: 4.0 estrelas"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                <span className="text-slate-500 font-medium">Tipo de Diagnóstico</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${hasAudit ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-amber-50 text-amber-800 border border-amber-100"}`}>
                  {classification}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                <span className="text-slate-500 font-medium">Grau de Confiança</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${hasAudit ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                  {confidenceLevel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Preenchido em</span>
                <span className="font-semibold text-slate-700">
                  {formatDate(completedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <Button asChild className="w-full h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-850 font-bold text-xs shadow-sm">
              <Link href="/app/resultados">Ver Relatório Completo</Link>
            </Button>
            {canRedoDiagnostic ? (
              <Button onClick={onRedo} disabled={isStarting} variant="outline" className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs">
                {isStarting ? "Carregando..." : "Refazer Diagnóstico"}
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs">
                <Link href="/app/upgrade">Fazer Upgrade do Plano</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Eixos/KPIs Breakdown Grid */}
        <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
          {/* Ambiental */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Ambiental (E)</h4>
                </div>
                <span className="text-lg font-extrabold text-emerald-600">{Math.round(environmentalScore ?? 0)}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gestão de resíduos, pegada de carbono, conservação de recursos hídricos e controle de emissões.
              </p>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${environmentalScore ?? 0}%` }} />
              </div>
            </div>
          </div>

          {/* Bioeconomia */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Bioeconomia Circular</h4>
                </div>
                <span className="text-lg font-extrabold text-teal-600">{Math.round(bioeconomyCircularScore ?? 0)}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uso de materiais de fontes renováveis, ciclos fechados de reciclagem e reaproveitamento biológico.
              </p>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${bioeconomyCircularScore ?? 0}%` }} />
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Social (S)</h4>
                </div>
                <span className="text-lg font-extrabold text-rose-600">{Math.round(socialScore ?? 0)}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Condições de trabalho, saúde e segurança, relacionamento com a comunidade e diversidade.
              </p>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${socialScore ?? 0}%` }} />
              </div>
            </div>
          </div>

          {/* Governança */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Governança (G)</h4>
                </div>
                <span className="text-lg font-extrabold text-blue-600">{Math.round(governanceScore ?? 0)}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ética empresarial, transparência fiscal, conformidade legal e conselho de administração.
              </p>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${governanceScore ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cadeia de Fornecedores Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 font-display">
              <Users className="h-5 w-5 text-indigo-600" />
              Monitoramento ESG da Cadeia de Valor
            </h3>
            <p className="text-xs text-slate-500">
              Analise e engaje seus fornecedores parceiros para mapear riscos corporativos em toda a cadeia de suprimentos.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 self-start sm:self-center h-10 text-xs font-bold shadow-md shadow-indigo-100">
            <Link href="/app/fornecedores" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Convidar Fornecedor
            </Link>
          </Button>
        </div>

        {loadingInvites ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-400">Analisando fornecedores cadastrados...</p>
          </div>
        ) : errorInvites ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl p-6">
            <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-xs font-bold text-slate-700">Erro ao carregar dados dos fornecedores</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Verifique sua conexão ou tente recarregar a página.
            </p>
          </div>
        ) : invites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-bold text-slate-800">Sua cadeia de suprimentos ainda não está cadastrada</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Convide seus fornecedores para realizarem o diagnóstico ESG. Isso ajudará sua empresa a gerenciar os riscos de terceiros, obter o ESG Score médio da cadeia e exportar dados consolidados.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 mt-2 h-9 text-xs font-bold">
              <Link href="/app/fornecedores">
                Começar Mapeamento
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Convidados</span>
                  <p className="text-2xl font-black text-slate-800 font-display">{invites.length}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-500/20" />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cadastrados / Conectados</span>
                  <p className="text-2xl font-black text-indigo-600 font-display">
                    {invites.filter(i => i.status === "ACCEPTED" || i.supplierOrganizationId != null).length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-indigo-500/20" />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Responderam ao Diagnóstico</span>
                  <p className="text-2xl font-black text-emerald-600 font-display">
                    {invites.filter(i => i.requestedDiagnostics.some(d => d.status === "COMPLETED")).length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
              </div>
            </div>

            {/* List of Suppliers */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl bg-slate-50/20">
              <div className="overflow-x-auto animate-in fade-in duration-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3">Fornecedor</th>
                      <th className="px-5 py-3">Segmento</th>
                      <th className="px-5 py-3">Status do Convite</th>
                      <th className="px-5 py-3">Diagnóstico</th>
                      <th className="px-5 py-3 text-right">Nota Geral</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {invites.map((invite) => {
                      const completedDiag = invite.requestedDiagnostics.find(d => d.status === "COMPLETED");
                      const hasCompleted = !!completedDiag;
                      const hasAccepted = invite.status === "ACCEPTED" || invite.supplierOrganizationId != null;

                      let statusBadge = (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          Pendente
                        </span>
                      );
                      if (hasCompleted) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Respondido
                          </span>
                        );
                      } else if (hasAccepted) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            Preenchendo
                          </span>
                        );
                      }

                      return (
                        <tr key={invite.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800">
                                {invite.supplierOrganization?.tradeName || invite.supplierOrganization?.legalName || "Fornecedor Convidado"}
                              </p>
                              <p className="text-[10px] text-slate-400">{invite.supplierEmail}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium">
                            {invite.supplierOrganization?.industrySegment || "Geral / Não Informado"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              invite.status === "ACCEPTED" ? "bg-indigo-50 text-indigo-700" :
                              invite.status === "SENT" ? "bg-blue-50 text-blue-700" :
                              invite.status === "CANCELED" ? "bg-rose-50 text-rose-700" :
                              "bg-slate-100 text-slate-700"
                            }`}>
                              {invite.status === "ACCEPTED" ? "Conectado" :
                               invite.status === "SENT" ? "Enviado" :
                               invite.status === "CANCELED" ? "Cancelado" : invite.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {statusBadge}
                          </td>
                          <td className="px-5 py-3.5 text-right font-extrabold text-slate-850 text-sm">
                            {hasCompleted && completedDiag.score?.overallScore != null ? (
                              <span className="text-emerald-600 font-display">
                                {Math.round(completedDiag.score.overallScore)}%
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
