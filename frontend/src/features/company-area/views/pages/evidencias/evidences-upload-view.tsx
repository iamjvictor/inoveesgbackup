"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Leaf, Loader2, Recycle, Scale, ShieldCheck } from "lucide-react";
import { diagnosticService } from "@/features/company-area/services/diagnostic.service";
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
  const { company } = useCompany();
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [scores, setScores] = useState<PillarScores | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [provenOverallScore, setProvenOverallScore] = useState(0);
  const [maturityLevel, setMaturityLevel] = useState<string | null>(null);
  const [draftsByGroup, setDraftsByGroup] = useState<EvidenceGroup>(() => createEmptyGroupMap(() => []));
  const [persistedByGroup, setPersistedByGroup] = useState<UploadedGroup>(() => createEmptyGroupMap(() => []));
  const [sendingByGroup, setSendingByGroup] = useState<LoadingGroup>(() => createEmptyGroupMap(() => false));
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm">
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
