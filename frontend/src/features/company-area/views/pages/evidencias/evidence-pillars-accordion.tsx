"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ChevronDown, CloudUpload, FileText, Heart, Leaf, Recycle, Scale, Send, Trash2, Upload, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EVIDENCE_DOCUMENTS_MOCK, type EvidenceDocumentMock, type EvidenceAxis } from "../../../models/evidence-documents.mock";
import {
  type EvidenceGroupCode,
  type StagedEvidenceFile,
  type UploadedEvidenceFile,
} from "../../../services/evidence-upload.service";

type PillarId = "environmental" | "bioeconomy" | "social" | "governance";

export interface PillarScores {
  environmental: { declared: number; proven: number | null };
  bioeconomy: { declared: number; proven: number | null };
  social: { declared: number; proven: number | null };
  governance: { declared: number; proven: number | null };
}

type EvidenceGroup = Record<EvidenceGroupCode, StagedEvidenceFile[]>;
type UploadedGroup = Record<EvidenceGroupCode, UploadedEvidenceFile[]>;
type LoadingGroup = Record<EvidenceGroupCode, boolean>;

interface EvidencePillarsAccordionProps {
  category: string;
  segment: string;
  scores: PillarScores | null;
  draftsByGroup: EvidenceGroup;
  persistedByGroup: UploadedGroup;
  sendingByGroup: LoadingGroup;
  onAddFiles: (groupCode: EvidenceGroupCode, documentType: string, files: FileList) => void;
  onRemoveFile: (groupCode: EvidenceGroupCode, fileId: string) => void;
  onClearGroup: (groupCode: EvidenceGroupCode) => void;
  onSendGroup: (groupCode: EvidenceGroupCode) => Promise<void>;
}

interface PillarDefinition {
  id: PillarId;
  title: string;
  initial: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBackground: string;
  groupCodes: EvidenceGroupCode[];
}

const pillars: PillarDefinition[] = [
  { id: "environmental", title: "Ambiental", initial: "E", icon: Leaf, iconClassName: "text-emerald-700", iconBackground: "bg-emerald-50", groupCodes: ["A", "B", "C"] },
  { id: "bioeconomy", title: "Bioeconomia", initial: "B", icon: Recycle, iconClassName: "text-amber-700", iconBackground: "bg-amber-50", groupCodes: ["D"] },
  { id: "social", title: "Social", initial: "S", icon: Heart, iconClassName: "text-blue-700", iconBackground: "bg-blue-50", groupCodes: ["E"] },
  { id: "governance", title: "Governança", initial: "G", icon: Scale, iconClassName: "text-violet-700", iconBackground: "bg-violet-50", groupCodes: ["F", "G", "H"] },
];

const axisInitials: Record<EvidenceAxis, string> = {
  Ambiental: "E",
  Bioeconomia: "B",
  Social: "S",
  Governança: "G",
};

function documentAxes(document: EvidenceDocumentMock): EvidenceAxis[] {
  return [document.primaryAxis, ...document.scoringAxes.filter((axis) => axis !== document.primaryAxis)];
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function reviewerName(review: NonNullable<UploadedEvidenceFile["reviews"]>[number]) {
  return review.reviewer.fullName?.trim() || review.reviewer.email || "usuário responsável";
}

export function EvidencePillarsAccordion({
  category,
  segment,
  scores,
  draftsByGroup,
  persistedByGroup,
  sendingByGroup,
  onAddFiles,
  onRemoveFile,
  onClearGroup,
  onSendGroup,
}: EvidencePillarsAccordionProps) {
  const [expandedPillar, setExpandedPillar] = useState<PillarId | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<EvidenceDocumentMock | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectDocument = (document: EvidenceDocumentMock) => {
    setSelectedDocument(document);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !selectedDocument) return;
    onAddFiles(selectedDocument.groupCode, selectedDocument.name, event.target.files);
    event.target.value = "";
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.dataTransfer.files.length || !selectedDocument) return;
    onAddFiles(selectedDocument.groupCode, selectedDocument.name, event.dataTransfer.files);
  };

  const handleSendSelectedGroup = async () => {
    if (!selectedDocument) return;
    await onSendGroup(selectedDocument.groupCode);
  };

  const selectedDocumentFiles = selectedDocument
    ? persistedByGroup[selectedDocument.groupCode].filter((file) => file.documentType === selectedDocument.name)
    : [];

  const selectedDraftFiles = selectedDocument
    ? draftsByGroup[selectedDocument.groupCode].filter((file) => file.documentType === selectedDocument.name)
    : [];

  return (
    <section className="space-y-3" aria-label="Pilares de evidências">
      {pillars.map((pillar) => {
        const Icon = pillar.icon;
        const isExpanded = expandedPillar === pillar.id;
        const score = scores?.[pillar.id];
        const documents = EVIDENCE_DOCUMENTS_MOCK[pillar.title as EvidenceAxis]
          .filter((document) => pillar.groupCodes.includes(document.groupCode));

        return (
          <div key={pillar.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={cn("inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold", pillar.iconBackground, pillar.iconClassName)}>
                  <Icon className="h-5 w-5" />
                  {pillar.initial}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-slate-900">{pillar.title}</span>
                  <span className="block truncate text-sm text-slate-500">
                    {category} · {segment}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {score ? <span className="hidden text-sm font-medium text-slate-500 sm:inline">{score.proven ?? 0}% comprovada</span> : null}
                <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform", isExpanded && "rotate-180")} />
              </span>
            </button>

            {isExpanded ? (
              <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {documents.map((document) => (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => handleSelectDocument(document)}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-slate-100 p-2 text-slate-600"><FileText className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-slate-900">{document.name}</span>
                          <span className="mt-1 block text-xs text-slate-500">Esperado: {document.expectedDocument}</span>
                          <span className="mt-1 block text-xs text-slate-500">Formatos: {document.acceptedTypes.join(", ")} · {document.points} pts</span>
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                        <span
                          title={`Eixo principal: ${document.primaryAxis}`}
                          aria-label={`Eixo principal: ${document.primaryAxis}`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700"
                        >
                          {axisInitials[document.primaryAxis]}
                        </span>
                        {document.scoringAxes.filter((axis) => axis !== document.primaryAxis).map((axis) => (
                          <span
                            key={axis}
                            title={`Pontua em: ${axis}`}
                            aria-label={`Pontua em: ${axis}`}
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full border font-semibold",
                              axis === document.primaryAxis ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600",
                            )}
                          >
                            {axisInitials[axis]}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-left text-[11px] text-slate-500">Objetivos: {document.strategicObjectives.join(" · ")}</p>
                      {(() => {
                        const firstDocumentInGroup = documents.find((item) => item.groupCode === document.groupCode);
                        const documentFiles = persistedByGroup[document.groupCode].filter((file) =>
                          file.documentType === document.name || (!file.documentType && firstDocumentInGroup?.id === document.id)
                        );
                        return documentFiles.length > 0 ? (
                          <div className="mt-3 border-t border-slate-100 pt-3 text-xs" onClick={(event) => event.stopPropagation()}>
                            <p className="mb-2 font-medium text-slate-700">Documentos enviados</p>
                            <div className="space-y-2">
                              {documentFiles.map((file) => {
                                const status = file.verificationStatus === "VERIFIED"
                                  ? { label: "Aprovado", className: "text-emerald-700" }
                                  : file.verificationStatus === "REJECTED"
                                    ? { label: "Rejeitado", className: "text-rose-700" }
                                    : { label: "Em análise", className: "text-amber-700" };
                                return (
                                  <div key={file.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                                    <span className="min-w-0">
                                      <span className="block truncate text-slate-600">{file.fileName}</span>
                                      {file.reviews?.[0] ? (
                                        <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                                          {file.reviews[0].newStatus === "VERIFIED" ? "Aprovado" : "Revisado"} por {reviewerName(file.reviews[0])} em {formatReviewDate(file.reviews[0].reviewedAt)}
                                        </span>
                                      ) : null}
                                    </span>
                                    <span className="shrink-0 text-[10px] font-semibold">
                                      {file.uploadedAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(file.uploadedAt)) : "—"} · <span className={status.className}>{status.label}</span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}

      {selectedDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="evidence-document-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Documento solicitado</p>
                <h2 id="evidence-document-title" className="mt-2 text-xl font-semibold text-slate-900">{selectedDocument.name}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  <span className="font-medium text-slate-600">Esperado:</span> {selectedDocument.expectedDocument}
                </p>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setSelectedDocument(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                {documentAxes(selectedDocument).map((axis) => (
                  <span key={axis} title={axis} aria-label={axis} className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold", axis === selectedDocument.primaryAxis ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600")}>
                    {axisInitials[axis]}
                  </span>
                ))}
              </div>
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
                Selecione o documento solicitado. Após o envio, ele será encaminhado para análise e não poderá ser alterado.
              </p>
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleFileDrop}
              className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <CloudUpload className="mx-auto h-7 w-7 text-emerald-600" />
              <p className="mt-2 text-sm font-medium text-slate-800">Arraste o arquivo para cá</p>
              <p className="mt-1 text-xs text-slate-500">ou selecione no seu computador · {selectedDocument.acceptedTypes.join(", ")}</p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Selecionar documento</Button>
            </div>
            {selectedDraftFiles.length > 0 ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-sm font-medium text-emerald-900">Documentos selecionados</p>
                <div className="mt-2 space-y-2">
                  {selectedDraftFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                      <span className="truncate text-sm text-slate-700">{file.name}</span>
                      <button type="button" aria-label={`Remover ${file.name}`} onClick={() => onRemoveFile(selectedDocument.groupCode, file.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {selectedDocumentFiles.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Documentos enviados</p>
                <div className="mt-2 space-y-2">
                  {selectedDocumentFiles.map((file) => {
                    const status = file.verificationStatus === "VERIFIED"
                      ? { label: "Aprovado", className: "bg-emerald-100 text-emerald-700" }
                      : file.verificationStatus === "REJECTED"
                        ? { label: "Rejeitado", className: "bg-rose-100 text-rose-700" }
                        : { label: "Em análise", className: "bg-amber-100 text-amber-700" };
                    return (
                      <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs text-slate-700">{file.fileName}</span>
                            {file.reviews?.[0] ? (
                              <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                                {file.reviews[0].newStatus === "VERIFIED" ? "Aprovado" : "Revisado"} por {reviewerName(file.reviews[0])} em {formatReviewDate(file.reviews[0].reviewedAt)}
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold", status.className)}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <input ref={inputRef} type="file" multiple className="hidden" accept={selectedDocument.acceptedTypes.map((type) => `.${type.toLowerCase()}`).join(",")} onChange={handleFileChange} />
            <div className="mt-6 flex justify-end gap-3">
              {selectedDraftFiles.length > 0 ? (
                <>
                  <Button type="button" variant="ghost" onClick={() => onClearGroup(selectedDocument.groupCode)}>Limpar</Button>
                  <Button type="button" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={sendingByGroup[selectedDocument.groupCode]} onClick={handleSendSelectedGroup}><Send className="mr-2 h-4 w-4" />{sendingByGroup[selectedDocument.groupCode] ? "Enviando..." : "Enviar"}</Button>
                </>
              ) : null}
              <Button type="button" variant="outline" onClick={() => setSelectedDocument(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
