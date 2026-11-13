"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Leaf, Loader2, Recycle, Scale, ShieldCheck } from "lucide-react";
import { diagnosticService, type BioimpactoHistory } from "@/features/company-area/services/diagnostic.service";
import { getBusinessDayStart, getEvidenceUploadDeadline } from "@/features/company-area/services/evidence-upload-window";
import { useCompany } from "../../../context/company-context";
import {
  EVIDENCE_ALLOWED_EXTENSIONS,
  EVIDENCE_UPLOAD_GROUPS,
  formatEvidenceFileSize,
  uploadEvidenceFiles,
  type EvidenceGroupCode,
  type StagedEvidenceFile,
  type UploadedEvidenceFile,
} from "../../../services/evidence-upload.service";
import { EvidencePillarsAccordion, type PillarScores } from "./evidence-pillars-accordion";
import { agroEvidences } from "../../../models/evidence-documents.mock";

type EvidenceGroup = Record<EvidenceGroupCode, StagedEvidenceFile[]>;
type UploadedGroup = Record<EvidenceGroupCode, UploadedEvidenceFile[]>;
type LoadingGroup = Record<EvidenceGroupCode, boolean>;

function getMaturityLevel(score: number, persistedLevel?: string | null) {
  if (persistedLevel?.trim()) {
    const normalized = persistedLevel.trim();
    if (/^Nível\s/i.test(normalized)) return normalized;
    const levelMatch = normalized.match(/(?:LEVEL|NIVEL|NÍVEL)[_\s-]*(\d)/i);
    if (levelMatch) {
      const labels = ["Elementar", "Estruturante", "Gerencial", "Estratégico", "Transformador"];
      return `Nível ${levelMatch[1]} · ${labels[Number(levelMatch[1]) - 1] ?? "Maturidade"}`;
    }
  }

  if (score >= 90) return "Nível 5 · Transformador";
  if (score >= 80) return "Nível 4 · Estratégico";
  if (score >= 60) return "Nível 3 · Gerencial";
  if (score >= 40) return "Nível 2 · Estruturante";
  return "Nível 1 · Elementar";
}

function createEmptyGroupMap<T>(factory: () => T): Record<EvidenceGroupCode, T> {
  return EVIDENCE_UPLOAD_GROUPS.reduce((acc, group) => {
    acc[group.code] = factory();
    return acc;
  }, {} as Record<EvidenceGroupCode, T>);
}

function mapEvidenceCategoryToGroupCode(category?: string | null): EvidenceGroupCode | null {
  const categoryToGroup: Record<string, EvidenceGroupCode> = {
    REGULARIZATION: "A",
    CONSERVATION: "B",
    NATURAL_RESOURCES: "C",
    SUSTAINABLE_PRODUCTION: "D",
    PEOPLE_AND_SOCIAL: "E",
    GOVERNANCE: "F",
    TRACEABILITY_AND_QUALITY: "G",
    PHOTOGRAPHIC: "H",
  };
  return category ? categoryToGroup[category] ?? null : null;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Data não informada";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildFileId(groupCode: EvidenceGroupCode, fileName: string, index: number) {
  return `${groupCode}-${Date.now()}-${index}-${fileName}`;
}

export function EvidencesView() {
  const { company, serviceAccess, hasEvidenceAccess } = useCompany();
  const [previewMode, setPreviewMode] = useState(false);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [scores, setScores] = useState<PillarScores | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [provenOverallScore, setProvenOverallScore] = useState(0);
  const [maturityLevel, setMaturityLevel] = useState<string | null>(null);
  const [draftsByGroup, setDraftsByGroup] = useState<EvidenceGroup>(() => createEmptyGroupMap(() => []));
  const [persistedByGroup, setPersistedByGroup] = useState<UploadedGroup>(() => createEmptyGroupMap(() => []));
  const [sendingByGroup, setSendingByGroup] = useState<LoadingGroup>(() => createEmptyGroupMap(() => false));
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [bioimpactoHistory, setBioimpactoHistory] = useState<BioimpactoHistory | null>(null);
  const currentBioimpactoCardRef = useRef<HTMLDivElement>(null);
  const bioimpactoScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    diagnosticService.getBioimpactoHistory().then(setBioimpactoHistory).catch(() => setBioimpactoHistory(null));
  }, []);

  useEffect(() => {
    if (!bioimpactoHistory) return;
    requestAnimationFrame(() => currentBioimpactoCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }));
  }, [bioimpactoHistory]);

  useEffect(() => {
    setPreviewMode(process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).get("mockPrazo") === "2026-10-01");
  }, []);

  useEffect(() => {
    async function loadCurrentDiagnostic() {
      try {
        const result = await diagnosticService.getCurrentDiagnostic();
        if (!result.hasDiagnostic || !result.diagnostic) {
          setIsLoading(false);
          return;
        }

        setDiagnosticId(result.diagnostic.id);

        const score = result.diagnostic.score;
        if (score) {
          setOverallScore(Math.round(Number(score.overallScore ?? 0)));
          setProvenOverallScore(Math.round(Number(score.provenOverallScore ?? 0)));
          setMaturityLevel(score.maturityLevel ?? null);
          setScores({
            environmental: {
              declared: Math.round(Number(score.environmentalScore ?? 0)),
              proven: score.provenEnvironmentalScore != null ? Math.round(Number(score.provenEnvironmentalScore)) : null,
            },
            bioeconomy: {
              declared: Math.round(Number(score.bioeconomyCircularScore ?? 0)),
              proven: score.provenBioeconomyCircularScore != null ? Math.round(Number(score.provenBioeconomyCircularScore)) : null,
            },
            social: {
              declared: Math.round(Number(score.socialScore ?? 0)),
              proven: score.provenSocialScore != null ? Math.round(Number(score.provenSocialScore)) : null,
            },
            governance: {
              declared: Math.round(Number(score.governanceScore ?? 0)),
              proven: score.provenGovernanceScore != null ? Math.round(Number(score.provenGovernanceScore)) : null,
            },
          });
        }

        const nextPersisted = createEmptyGroupMap<UploadedEvidenceFile[]>(() => []);
        for (const evidence of result.diagnostic.evidences ?? []) {
          const groupCode = mapEvidenceCategoryToGroupCode(evidence.evidenceCategory);
          if (!groupCode) continue;
          nextPersisted[groupCode].push({
            id: evidence.id,
            fileName: evidence.fileName ?? "arquivo",
            documentType: evidence.documentType ?? undefined,
            filePath: evidence.filePath ?? "",
            fileUrl: evidence.fileUrl ?? null,
            storageBucket: evidence.storageBucket ?? "diagnostic-evidences",
            evidenceCategory: evidence.evidenceCategory ?? "PHOTOGRAPHIC",
            uploadedAt: evidence.uploadedAt ?? new Date().toISOString(),
            fileSizeBytes: evidence.fileSizeBytes ?? 0,
            mimeType: evidence.mimeType ?? "application/octet-stream",
            uploadStatus: evidence.uploadStatus ?? "COMPLETED",
            verificationStatus: evidence.verificationStatus ?? "PENDING",
            reviews: evidence.reviews,
          });
        }
        setPersistedByGroup(nextPersisted);

      } catch (error) {
        console.error("[evidences.view.loadCurrentDiagnostic] Failed", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentDiagnostic();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const hasPurchasedFullDiagnostic = serviceAccess?.purchasedProductCodes?.some((code) =>
    ["FULL_DIAGNOSTIC", "FULL_DIAGNOSTIC_PLUS", "BIOIMPACTO_EMPRESARIAL"].includes(code.toUpperCase().replace(/-/g, "_")),
  ) ?? false;
  const bioimpactoPurchase = serviceAccess?.purchasedServices?.find((service) => service.productCode === "BIOIMPACTO_EMPRESARIAL");
  const businessDay = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", day: "numeric" }).format(now));
  const bioimpactoExpiresAt = bioimpactoPurchase ? new Date(bioimpactoPurchase.purchasedAt) : null;
  bioimpactoExpiresAt?.setUTCFullYear(bioimpactoExpiresAt.getUTCFullYear() + 1);
  const bioimpactoWindowOpen = Boolean(bioimpactoExpiresAt && now < bioimpactoExpiresAt.getTime() && businessDay >= 1 && businessDay <= 15);
  const latestDeclaration = (company?.subjectDiagnostics ?? []).find((diagnostic) =>
    (hasPurchasedFullDiagnostic ? diagnostic.kind === "FULL_DIAGNOSTIC" : ["PRE_DIAGNOSTIC", "FULL_DIAGNOSTIC"].includes(diagnostic.kind)) &&
    ["DRAFT", "ACTIVE", "COMPLETED"].includes(diagnostic.status),
  );
  const hasUnresolvedDiagnostic = !previewMode && Boolean(latestDeclaration && latestDeclaration.status !== "COMPLETED");
  const completedAt = previewMode
    ? new Date("2026-10-01T00:00:00-03:00").getTime()
    : latestDeclaration?.status === "COMPLETED" && latestDeclaration.completedAt
      ? new Date(latestDeclaration.completedAt).getTime()
      : 0;
  const deadline = completedAt ? getEvidenceUploadDeadline(completedAt) : null;
  const hasFullDiagnostic = previewMode || hasPurchasedFullDiagnostic;
  const showEvidenceDeadline = hasFullDiagnostic || hasEvidenceAccess || hasUnresolvedDiagnostic;
  const canUpload = previewMode || (hasEvidenceAccess && !hasUnresolvedDiagnostic &&
    (bioimpactoPurchase ? bioimpactoWindowOpen : !hasFullDiagnostic || Boolean(deadline && now < deadline.closesAt.getTime())));
  const daysRemaining = deadline
    ? Math.max(0, Math.round((deadline.lastUploadDay - getBusinessDayStart(now)) / (24 * 60 * 60 * 1000)))
    : 0;
  const answeredDate = completedAt ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(completedAt)) : null;

  const pillarKpis = useMemo(() => [
    {
      id: "environmental",
      title: "Ambiental (E)",
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
      provenScore: scores?.environmental.proven ?? null,
      declaredScore: scores?.environmental.declared ?? 0,
    },
    {
      id: "bioeconomy",
      title: "Bioeconomia (B)",
      icon: Recycle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
      provenScore: scores?.bioeconomy.proven ?? null,
      declaredScore: scores?.bioeconomy.declared ?? 0,
    },
    {
      id: "social",
      title: "Social (S)",
      icon: Heart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      bar: "bg-blue-500",
      provenScore: scores?.social.proven ?? null,
      declaredScore: scores?.social.declared ?? 0,
    },
    {
      id: "governance",
      title: "Governança (G)",
      icon: Scale,
      color: "text-violet-600",
      bg: "bg-violet-50",
      bar: "bg-violet-500",
      provenScore: scores?.governance.proven ?? null,
      declaredScore: scores?.governance.declared ?? 0,
    },
  ], [scores]);

  const handleAddFiles = (groupCode: EvidenceGroupCode, documentType: string, files: FileList) => {
    if (!canUpload) return;
    const accepted = Array.from(files).filter((file) =>
      EVIDENCE_ALLOWED_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension))
    );

    if (accepted.length === 0) {
      setStatusMessage("Escolha arquivos PDF, imagens ou planilhas.");
      return;
    }

    setDraftsByGroup((current) => {
      const nextFiles = accepted.map((file, index) => ({
        id: buildFileId(groupCode, file.name, index),
        name: file.name,
        documentType,
        sizeBytes: file.size,
        sizeLabel: formatEvidenceFileSize(file.size),
        mimeType: file.type || "application/octet-stream",
        uploadedAt: "Agora",
        rawFile: file,
      }));

      return {
        ...current,
        [groupCode]: [...current[groupCode], ...nextFiles],
      };
    });

    setStatusMessage(`${accepted.length} arquivo(s) adicionados para ${documentType}.`);
  };

  const handleRemoveFile = (groupCode: EvidenceGroupCode, fileId: string) => {
    setDraftsByGroup((current) => ({
      ...current,
      [groupCode]: current[groupCode].filter((file) => file.id !== fileId),
    }));
  };

  const handleClearGroup = (groupCode: EvidenceGroupCode) => {
    setDraftsByGroup((current) => ({
      ...current,
      [groupCode]: [],
    }));
  };

  const handleSendGroup = async (groupCode: EvidenceGroupCode) => {
    if (previewMode) {
      setStatusMessage("Esta é uma prévia do prazo. Nenhum arquivo será enviado.");
      return;
    }
    if (!canUpload) {
      setStatusMessage(bioimpactoPurchase ? "O Plano 2.2 aceita evidências do dia 1 ao 15 de cada mês." : "O prazo de 20 dias para enviar evidências terminou.");
      return;
    }
    if (sendingByGroup[groupCode]) {
      return;
    }

    if (!diagnosticId) {
      setStatusMessage("Não foi possível localizar o diagnóstico atual.");
      return;
    }

    const draftFiles = draftsByGroup[groupCode];
    const uploadFiles = draftFiles
      .filter((file): file is typeof file & { rawFile: File } => Boolean(file.rawFile))
      .map((file) => ({
        file: file.rawFile,
        documentType: file.documentType,
        requirementCode: agroEvidences.find((document) => document.name === file.documentType)?.id ?? `GROUP_${groupCode}`,
        metadata: (() => {
          const document = agroEvidences.find((item) => item.name === file.documentType);
          return {
            expectedDocument: document?.expectedDocument ?? file.documentType,
            acceptedTypes: document?.acceptedTypes ?? [],
            primaryAxis: document?.primaryAxis ?? "Ambiental",
            scoringAxes: document?.scoringAxes ?? ["Ambiental"],
            points: document?.points ?? 0,
            strategicObjectives: document?.strategicObjectives ?? [],
            gapIfMissing: document?.gapIfMissing ?? "",
            recommendedService: document?.recommendedService ?? "",
          };
        })(),
      }));
    if (uploadFiles.length === 0) {
      setStatusMessage("Adicione arquivos antes de enviar.");
      return;
    }

    setSendingByGroup((current) => ({ ...current, [groupCode]: true }));
    const sendingLabel = draftFiles.map((file) => file.documentType).join(", ");
    setStatusMessage(`Enviando ${draftFiles.length} documento(s): ${sendingLabel}.`);

    try {
      const draftFilesBeforeUpload = [...draftFiles];
      const result = await uploadEvidenceFiles(diagnosticId, groupCode, uploadFiles);

      setPersistedByGroup((current) => ({
        ...current,
        [groupCode]: [
          ...current[groupCode],
          ...(result.evidences ?? []).map((evidence, index) => ({
            ...evidence,
            documentType: draftFilesBeforeUpload[index]?.documentType,
          })),
        ],
      }));

      setDraftsByGroup((current) => ({ ...current, [groupCode]: [] }));
      setStatusMessage(`${result.uploadedCount} arquivo(s) enviados em ${formatDateTime(result.uploadedAt)}.`);
    } catch (error) {
      console.error("[evidences.view.handleSendGroup] Upload failed", error);
      setStatusMessage(error instanceof Error ? error.message : "Falha ao enviar os arquivos.");
    } finally {
      setSendingByGroup((current) => ({ ...current, [groupCode]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="w-full">
        <section className={`flex flex-wrap items-center justify-between gap-4 border border-emerald-100 bg-white px-5 py-4 shadow-sm ${showEvidenceDeadline ? "rounded-t-2xl rounded-b-none" : "rounded-2xl"}`}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600">Desempenho comprovado</p>
            <p className="mt-1 text-sm text-slate-500">Pontuação calculada a partir das evidências aprovadas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">ICEB</p>
              <p className="text-xl font-extrabold leading-tight text-emerald-700">{provenOverallScore}<span className="text-xs font-medium text-emerald-600">/100</span></p>
            </div>
            <div className="border-l border-slate-100 pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Nível atual</p>
              <p className="text-sm font-bold leading-tight text-slate-800">{getMaturityLevel(provenOverallScore, maturityLevel)}</p>
            </div>
            <div className="border-l border-slate-100 pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Nota declarada</p>
              <p className="text-lg font-bold leading-tight text-slate-700">{overallScore}/100</p>
            </div>
          </div>
        </section>

      {bioimpactoHistory && (
        <section className="w-full rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Histórico de evidências</h2>
          <p className="mt-1 text-sm text-slate-600">Vigência até {new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(bioimpactoHistory.expiresAt))}. Cada janela abre do dia 1 ao 15.</p>
          {(() => {
            const openWindow = bioimpactoHistory.windows.find((window) => window.status === "OPEN");
            const nowDate = new Date(now);
            const localParts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(nowDate);
            const part = (type: string) => Number(localParts.find((item) => item.type === type)?.value);
            const year = part("year");
            const month = part("month");
            const nextOpening = openWindow
              ? new Date(openWindow.endsAt)
              : new Date(Date.UTC(year, month, 1, 3));
            const target = openWindow ? nextOpening : new Date(Math.min(nextOpening.getTime(), new Date(bioimpactoHistory.expiresAt).getTime()));
            const seconds = Math.max(0, Math.floor((target.getTime() - now) / 1000));
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            const timer = `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(remainingSeconds).padStart(2, "0")}s`;
            return <div aria-live="polite" className={`mt-4 rounded-xl border px-4 py-3 text-center ${openWindow ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              <p className="text-xs font-bold uppercase tracking-wide">{openWindow ? "Janela fecha em" : "Próxima janela abre em"}</p>
              <p className="mt-1 font-mono text-xl font-extrabold tabular-nums">{timer}</p>
              <p className="mt-1 text-xs">{openWindow ? "Envie suas evidências até o dia 15." : `Abertura prevista: ${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "long" }).format(target)}.`}</p>
            </div>;
          })()}
          <div className="relative mt-4">
            <button type="button" aria-label="Meses anteriores" onClick={() => bioimpactoScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })} className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-emerald-50 hover:text-emerald-700">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div ref={bioimpactoScrollRef} className="-mx-1 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} aria-label="Histórico das 12 janelas mensais">
            <div className="flex w-max gap-3 px-1">
              {Array.from({ length: 12 }, (_, index) => {
                const startMonth = new Date(bioimpactoHistory.startsAt);
                const startsAt = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + index, 1, 3));
                const endsAt = new Date(Date.UTC(startsAt.getUTCFullYear(), startsAt.getUTCMonth(), 16, 3));
                const window = bioimpactoHistory.windows.find((item) => item.number === index + 1);
                const currentMonthIndex = Math.max(0, Math.min(11, (new Date(now).getUTCFullYear() - startMonth.getUTCFullYear()) * 12 + new Date(now).getUTCMonth() - startMonth.getUTCMonth()));
                const isCurrent = currentMonthIndex === index;
                const isOpen = window?.status === "OPEN";
                const isPast = index < currentMonthIndex;
                const lastDay = new Date(endsAt.getTime() - 1);
                const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now) / 86_400_000));
                return <div key={index + 1} ref={isCurrent ? currentBioimpactoCardRef : undefined} className={`w-[270px] shrink-0 snap-center rounded-xl border p-4 ${isOpen ? "border-emerald-300 bg-emerald-50" : isCurrent ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50"}`}>
                  <p className="text-xs font-bold uppercase text-emerald-700">Janela {index + 1} · {isOpen ? "Aberta" : window?.status === "CLOSED" ? "Encerrada" : isCurrent ? "Atual" : isPast ? "Sem registros" : "Prevista"}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "short", year: "numeric" }).format(startsAt)} a {new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "short", year: "numeric" }).format(lastDay)}</p>
                  {isOpen && <p className="mt-1 text-xs text-emerald-800">Até dia 15 · {daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}</p>}
                  <p className="mt-2 text-xs text-slate-600">{window ? `${window.approved} aprovadas · ${window.rejected} rejeitadas · ${window.pending} pendentes` : "Aguardando esta janela"}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">Pontuação: {window?.score == null ? isPast ? "sem registro" : "em análise" : `${window.score.toFixed(1)}/100`}</p>
                </div>;
              })}
            </div>
          </div>
            <button type="button" aria-label="Próximos meses" onClick={() => bioimpactoScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-emerald-50 hover:text-emerald-700">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      )}
      {showEvidenceDeadline ? (
        <section className={`w-full max-w-none rounded-b-2xl border border-t-0 px-5 py-4 text-sm shadow-sm ${canUpload ? "border-emerald-100 bg-white text-slate-700" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
          {hasUnresolvedDiagnostic ? (
            <p>Conclua o diagnóstico autodeclarado antes de enviar as evidências.</p>
          ) : bioimpactoPurchase ? (
            <p>Consulte acima o histórico e a contagem regressiva da próxima janela de evidências.</p>
          ) : deadline ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="font-semibold">Prazo para envio de evidências</p>
                  <p className="text-slate-600">{canUpload ? "Envie seus arquivos até" : "Encerrado em"} <strong>{deadline.label}</strong></p>
                </div>
                <span className={`rounded-xl px-3 py-2 text-center font-bold text-white ${canUpload ? "bg-emerald-600" : "bg-amber-600"}`}>
                  {canUpload ? daysRemaining === 0 ? "Último dia" : `${daysRemaining} ${daysRemaining === 1 ? "dia restante" : "dias restantes"}` : "Prazo encerrado"}
                </span>
              </div>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Diagnóstico autodeclarado respondido em: <strong className="text-slate-700">{answeredDate}</strong></p>
            </>
          ) : (
            <p>Conclua o diagnóstico autodeclarado para iniciar o prazo de 20 dias de envio das evidências.</p>
          )}
        </section>
      ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pillarKpis.map((kpi) => {
          const Icon = kpi.icon;
          const isProven = kpi.provenScore !== null && kpi.provenScore > 0;

          return (
            <article
              key={kpi.id}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{kpi.title}</span>
                <div className={`rounded-xl p-2.5 ${kpi.bg} ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-slate-900">{kpi.provenScore ?? 0}%</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Nota comprovada</p>
                </div>
                {isProven ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Comprovada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
                    Não comprovada
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Nota declarada</span>
                  <span className="font-semibold text-slate-700">{kpi.declaredScore}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-500 ${kpi.bar}`} style={{ width: `${Math.min(100, Math.max(0, kpi.provenScore ?? 0))}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <EvidencePillarsAccordion
        category={company?.businessCategory?.name || "Não informado"}
        segment={company?.businessSegment?.name || company?.industrySegment || "Não informado"}
        scores={scores}
        draftsByGroup={draftsByGroup}
        persistedByGroup={persistedByGroup}
        sendingByGroup={sendingByGroup}
        canUpload={canUpload}
        uploadDeadline={deadline?.label ?? null}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
        onClearGroup={handleClearGroup}
        onSendGroup={handleSendGroup}
      />

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

    </div>
  );
}
