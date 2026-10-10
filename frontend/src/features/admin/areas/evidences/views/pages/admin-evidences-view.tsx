"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Building2, ChevronDown, FileCheck2, FileClock, FileText, Leaf, LoaderCircle, MessageCircle, Recycle, Send, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { createEvidenceNote, getEvidenceNotes, getEvidencePreview, reviewEvidence } from "../../services/evidences.service";
import type {
  AdminEvidenceBoardModel,
  AdminEvidenceCompanySummary,
  AdminEvidenceNote,
  AdminEvidenceSummary,
} from "@/features/admin/shared/types";

type Props = {
  model: AdminEvidenceBoardModel;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onRefresh?: () => Promise<void>;
};

function CompanyCard({
  company,
  active,
  onClick,
}: {
  company: AdminEvidenceCompanySummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Selecionar ${company.companyName} para análise de evidências`}
      className={`group w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-emerald-400 bg-emerald-50/40 shadow-sm"
          : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className={`h-4 w-4 shrink-0 ${active ? "text-emerald-600" : "text-slate-400"}`} />
            <p className="truncate text-base font-semibold tracking-tight text-slate-900">{company.companyName}</p>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{company.category} · {company.segment}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
      </div>

      <div className="mt-5 grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 pr-3">
          <FileClock className="h-4 w-4 text-amber-600" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Pendentes</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{company.evidencePending}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-3">
          <FileCheck2 className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Analisados</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{company.evidenceAnalyzed}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

const pillarLabels = {
  E: "Ambiental",
  B: "Bioeconomia Circular",
  S: "Social",
  G: "Governança",
} as const;

function groupDocumentsByEvidenceName(documents: AdminEvidenceCompanySummary["documents"]) {
  const groups = new Map<string, AdminEvidenceCompanySummary["documents"]>();
  for (const document of documents) {
    const evidenceName = getEvidenceTypeLabel(document);
    groups.set(evidenceName, [...(groups.get(evidenceName) ?? []), document]);
  }
  return Array.from(groups.entries());
}

function getEvidenceTypeLabel(document: AdminEvidenceCompanySummary["documents"][number]) {
  const candidates = [document.evidenceName, document.documentType];
  const filenamePattern = /\.(pdf|docx?|xlsx?|xls|png|jpe?g)$/i;
  return candidates.find((value) => value?.trim() && !filenamePattern.test(value.trim()))?.trim() ?? "Tipo não informado";
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getMaturityLevel(score: number) {
  if (score >= 90) return "Nível 5 · Transformador";
  if (score >= 80) return "Nível 4 · Estratégico";
  if (score >= 60) return "Nível 3 · Gerencial";
  if (score >= 40) return "Nível 2 · Estruturante";
  return "Nível 1 · Elementar";
}

function CompanyEvidenceDetail({
  company,
  onBack,
  onRefresh,
}: {
  company: AdminEvidenceCompanySummary;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
}) {
  const [openPillar, setOpenPillar] = useState<keyof typeof pillarLabels | null>("E");
  const [selectedDocument, setSelectedDocument] = useState<AdminEvidenceCompanySummary["documents"][number] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [openEvidenceGroups, setOpenEvidenceGroups] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState("");
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, AdminEvidenceNote[]>>({});
  const [notesLoading, setNotesLoading] = useState<Record<string, boolean>>({});
  const [notesError, setNotesError] = useState<Record<string, string>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [noteSaving, setNoteSaving] = useState<Record<string, boolean>>({});
  const [noteSaveError, setNoteSaveError] = useState<Record<string, string>>({});
  const documents = company.documents ?? [];
  const documentsByPillar = (Object.keys(pillarLabels) as Array<keyof typeof pillarLabels>).map((axis) => ({
    axis,
    label: pillarLabels[axis],
    documents: documents.filter((document) => document.axis === axis),
  }));

  async function handleOpenDocument(document: typeof documents[number]) {
    setSelectedDocument(document);
    setPreviewUrl(null);
    setComment("");
    setPreviewLoading(true);
    try {
      const preview = await getEvidencePreview(document.id);
      setPreviewUrl(preview.signedUrl);
    } catch {
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleReview(status: "VERIFIED" | "REJECTED") {
    if (!selectedDocument) return;
    setReviewLoading(true);
    try {
      await reviewEvidence(selectedDocument.id, status, comment);
      await onRefresh?.();
      setSelectedDocument(null);
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleReviewGroup(group: typeof documents, reviewStatus: "VERIFIED" | "REJECTED") {
    const documentsToReview = reviewStatus === "REJECTED"
      ? group
      : group.filter((document) => {
          const status = document.status as AdminEvidenceSummary["status"];
          return status !== "VERIFIED";
        });
    if (!documentsToReview.length) return;

    setReviewLoading(true);
    try {
      await Promise.all(documentsToReview.map((document) => reviewEvidence(document.id, reviewStatus)));
      await onRefresh?.();
    } finally {
      setReviewLoading(false);
    }
  }

  async function loadEvidenceNotes(evidenceId: string, retry = false) {
    if (!retry && (Object.prototype.hasOwnProperty.call(evidenceNotes, evidenceId) || notesLoading[evidenceId])) return;
    setNotesLoading((current) => ({ ...current, [evidenceId]: true }));
    setNotesError((current) => ({ ...current, [evidenceId]: "" }));
    try {
      const notes = await getEvidenceNotes(evidenceId);
      setEvidenceNotes((current) => ({ ...current, [evidenceId]: notes }));
    } catch (error) {
      setNotesError((current) => ({
        ...current,
        [evidenceId]: error instanceof Error ? error.message : "Não foi possível carregar as observações.",
      }));
    } finally {
      setNotesLoading((current) => ({ ...current, [evidenceId]: false }));
    }
  }

  function handleToggleEvidenceNotes(evidenceId: string) {
    if (expandedNotesId === evidenceId) {
      setExpandedNotesId(null);
      return;
    }
    setExpandedNotesId(evidenceId);
    setNoteSaveError((current) => ({ ...current, [evidenceId]: "" }));
    void loadEvidenceNotes(evidenceId);
  }

  async function handleSaveEvidenceNote(evidenceId: string) {
    const content = (noteDrafts[evidenceId] ?? "").trim();
    if (!content || content.length > 2000 || noteSaving[evidenceId]) return;

    setNoteSaving((current) => ({ ...current, [evidenceId]: true }));
    setNoteSaveError((current) => ({ ...current, [evidenceId]: "" }));
    try {
      const note = await createEvidenceNote(evidenceId, content);
      setEvidenceNotes((current) => ({
        ...current,
        [evidenceId]: [...(current[evidenceId] ?? []), note],
      }));
      setNoteDrafts((current) => ({ ...current, [evidenceId]: "" }));
    } catch (error) {
      setNoteSaveError((current) => ({
        ...current,
        [evidenceId]: error instanceof Error ? error.message : "Não foi possível salvar a observação. Tente novamente.",
      }));
    } finally {
      setNoteSaving((current) => ({ ...current, [evidenceId]: false }));
    }
  }

  const pillarStyles = {
    E: { icon: Leaf, iconClass: "bg-emerald-50 text-emerald-600", activeClass: "border-emerald-300 bg-emerald-50/30" },
    B: { icon: Recycle, iconClass: "bg-amber-50 text-amber-600", activeClass: "border-amber-300 bg-amber-50/30" },
    S: { icon: Users, iconClass: "bg-sky-50 text-sky-600", activeClass: "border-sky-300 bg-sky-50/30" },
    G: { icon: ShieldCheck, iconClass: "bg-rose-50 text-rose-600", activeClass: "border-rose-300 bg-rose-50/30" },
  } as const;

  return (
    <section className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para empresas
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-[220px] flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">Análise de evidências</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{company.companyName}</h2>
            <p className="mt-1 text-sm text-slate-500">{company.category} · {company.segment}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-right">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">ICEB</p>
              <p className="text-lg font-extrabold leading-tight text-emerald-700">{company.icebScore}<span className="text-[11px] font-medium text-emerald-600">/100</span></p>
            </div>
            <div className="border-l border-slate-100 pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Nível atual</p>
              <p className="text-sm font-bold leading-tight text-slate-800">{getMaturityLevel(company.icebScore)}</p>
            </div>
            <div className="border-l border-slate-100 pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Pendentes</p>
              <p className="text-lg font-bold leading-tight text-amber-600">{company.evidencePending}</p>
            </div>
            <div className="border-l border-slate-100 pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Analisados</p>
              <p className="text-lg font-bold leading-tight text-emerald-600">{company.evidenceAnalyzed}</p>
            </div>
          </div>

          <div className="grid w-full gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4">
            {company.pillars.map((pillar) => {
              const Icon = pillarStyles[pillar.axis].icon;
              return (
                <div key={pillar.axis} className="rounded-xl border border-slate-100 px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${pillarStyles[pillar.axis].iconClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate text-xs font-bold text-slate-700">{pillar.label}</span>
                  </div>
                  <p className="mt-1 text-right text-xl font-extrabold leading-tight text-emerald-600">
                    {pillar.provenScore}<span className="text-xs font-medium text-emerald-500">/100</span>
                  </p>
                  <p className="text-right text-[10px] text-slate-500">{pillar.approvedPoints}/{pillar.totalAvailablePoints} pontos</p>
                  <p className="text-right text-[11px] text-slate-500">Declarada: {pillar.score}/100</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {documentsByPillar.map((pillar) => (
          <section key={pillar.axis} className={`overflow-hidden rounded-2xl border bg-white transition ${openPillar === pillar.axis ? pillarStyles[pillar.axis].activeClass : "border-slate-200"}`}>
            <button
              type="button"
              onClick={() => setOpenPillar(openPillar === pillar.axis ? null : pillar.axis)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={openPillar === pillar.axis}
            >
              <span className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${pillarStyles[pillar.axis].iconClass}`}>
                  {(() => { const Icon = pillarStyles[pillar.axis].icon; return <Icon className="h-4 w-4" />; })()}
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">{pillar.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{pillar.documents.length} documento(s)</span>
                </span>
              </span>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openPillar === pillar.axis ? "rotate-180" : ""}`} />
            </button>

            {openPillar === pillar.axis ? (
              <div className="border-t border-slate-100 px-5 pb-5 pt-3">
                <div className="space-y-4">
                  {pillar.documents.length ? groupDocumentsByEvidenceName(pillar.documents).map(([evidenceName, group]) => (
                    <div key={evidenceName} className="space-y-2">
                      <div className={`flex items-center justify-between gap-3 rounded-lg border border-dashed px-2 py-1.5 ${
                        group.length > 0 && group.every((document) => document.status === "VERIFIED")
                          ? "border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50/60"
                          : "border-slate-200 bg-white/70"
                      }`}>
                        <button
                          type="button"
                          onClick={() => setOpenEvidenceGroups((current) => ({
                            ...current,
                            [`${pillar.axis}-${evidenceName}`]: current[`${pillar.axis}-${evidenceName}`] === false,
                          }))}
                          className="flex min-w-0 items-center gap-2 text-left"
                          aria-expanded={openEvidenceGroups[`${pillar.axis}-${evidenceName}`] !== false}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{evidenceName}</p>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${openEvidenceGroups[`${pillar.axis}-${evidenceName}`] !== false ? "rotate-180" : ""}`} />
                        </button>
                        {group.every((document) => document.status === "VERIFIED") ? (
                          <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() => void handleReviewGroup(group, "REJECTED")}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Recusar evidências
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() => void handleReviewGroup(group, "VERIFIED")}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Aprovar evidências
                          </button>
                        )}
                      </div>
                      {openEvidenceGroups[`${pillar.axis}-${evidenceName}`] !== false ? group.map((document) => {
                        const status = document.status as AdminEvidenceSummary["status"];
                        const notesOpen = expandedNotesId === document.id;
                        const notes = evidenceNotes[document.id] ?? [];
                        return (
                          <div key={document.id} className="space-y-2">
                            <article className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 transition hover:bg-slate-100">
                              <button
                                type="button"
                                onClick={() => void handleOpenDocument(document)}
                                aria-label={`Abrir arquivo ${document.fileName}`}
                                className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                              >
                                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-slate-800">{getEvidenceTypeLabel(document)}</span>
                                  <span className="block truncate text-xs text-slate-500">Arquivo: {document.fileName} · {document.uploadDate}</span>
                                  {document.reviewedBy && document.reviewedAt ? (
                                    <span className="block truncate text-[11px] text-emerald-700">
                                      Aprovado por {document.reviewedBy} em {formatReviewDate(document.reviewedAt)}
                                    </span>
                                  ) : null}
                                </span>
                              </button>
                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleEvidenceNotes(document.id)}
                                  aria-expanded={notesOpen}
                                  aria-controls={`evidence-notes-${document.id}`}
                                  aria-label={`${notesOpen ? "Recolher" : "Abrir"} observações de ${getEvidenceTypeLabel(document)}${Object.prototype.hasOwnProperty.call(evidenceNotes, document.id) ? `, ${notes.length} observações` : ""}`}
                                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                    notesOpen
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-transparent text-slate-400 hover:border-slate-200 hover:bg-white hover:text-emerald-700"
                                  }`}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  {Object.prototype.hasOwnProperty.call(evidenceNotes, document.id) ? <span className="text-xs font-semibold">{notes.length}</span> : null}
                                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${notesOpen ? "rotate-180" : ""}`} />
                                </button>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                  status === "PENDING" || status === "UNDER_REVIEW"
                                    ? "bg-amber-100 text-amber-700"
                                    : status === "VERIFIED"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-rose-100 text-rose-700"
                                }`}>
                                  {status === "PENDING" ? "Pendente" : status === "UNDER_REVIEW" ? "Em análise" : status === "VERIFIED" ? "Validado" : "Rejeitado"}
                                </span>
                              </div>
                            </article>

                            {notesOpen ? (
                              <section id={`evidence-notes-${document.id}`} aria-label={`Observações de ${getEvidenceTypeLabel(document)}`} className="ml-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm sm:ml-7">
                                {notesLoading[document.id] ? (
                                  <p className="flex items-center gap-2 py-2 text-sm text-slate-500" role="status">
                                    <LoaderCircle className="h-4 w-4 animate-spin" /> Carregando observações...
                                  </p>
                                ) : notesError[document.id] ? (
                                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-rose-50 px-3 py-2.5">
                                    <p className="text-sm text-rose-700" role="alert">{notesError[document.id]}</p>
                                    <button type="button" onClick={() => void loadEvidenceNotes(document.id, true)} className="text-xs font-bold text-rose-700 underline underline-offset-2">Tentar novamente</button>
                                  </div>
                                ) : (
                                  <>
                                    {notes.length ? (
                                      <ol className="space-y-3">
                                        {notes.map((note) => (
                                          <li key={note.id} className="rounded-lg bg-slate-50 px-3 py-3">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{note.content}</p>
                                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                                              {note.authorName} · {formatReviewDate(note.createdAt)}
                                            </p>
                                          </li>
                                        ))}
                                      </ol>
                                    ) : (
                                      <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-400">Nenhuma observação registrada para este documento.</p>
                                    )}

                                    <form
                                      className="mt-3 border-t border-slate-100 pt-3"
                                      onSubmit={(event) => {
                                        event.preventDefault();
                                        void handleSaveEvidenceNote(document.id);
                                      }}
                                    >
                                      <label htmlFor={`evidence-note-input-${document.id}`} className="mb-1.5 block text-xs font-semibold text-slate-600">Nova observação</label>
                                      <textarea
                                        id={`evidence-note-input-${document.id}`}
                                        value={noteDrafts[document.id] ?? ""}
                                        onChange={(event) => setNoteDrafts((current) => ({ ...current, [document.id]: event.target.value }))}
                                        maxLength={2000}
                                        rows={3}
                                        placeholder="Escreva uma observação visível somente para administradores..."
                                        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                                        disabled={noteSaving[document.id]}
                                      />
                                      {noteSaveError[document.id] ? <p className="mt-1.5 text-xs text-rose-600" role="alert">{noteSaveError[document.id]}</p> : null}
                                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-[11px] text-slate-400">{(noteDrafts[document.id] ?? "").length}/2.000</span>
                                        <button
                                          type="submit"
                                          disabled={noteSaving[document.id] || !(noteDrafts[document.id] ?? "").trim()}
                                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {noteSaving[document.id] ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                          {noteSaving[document.id] ? "Salvando..." : "Salvar observação"}
                                        </button>
                                      </div>
                                    </form>
                                  </>
                                )}
                              </section>
                            ) : null}
                          </div>
                        );
                      }) : null}
                    </div>
                  )) : <p className="py-3 text-sm text-slate-400">Nenhum documento neste pilar.</p>}
                </div>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {selectedDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Pré-visualização da evidência">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Pré-visualização</p>
                <h3 className="mt-1 truncate text-lg font-bold text-slate-900">{selectedDocument.evidenceName || selectedDocument.documentType}</h3>
                <p className="mt-1 truncate text-sm text-slate-500">{selectedDocument.fileName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {previewUrl ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                  >
                    Abrir em nova guia
                  </a>
                ) : null}
                <button type="button" onClick={() => setSelectedDocument(null)} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Fechar">×</button>
              </div>
            </div>
            <div className="min-h-[280px] flex-1 overflow-auto bg-slate-100 p-4">
              {previewLoading ? <p className="py-24 text-center text-sm text-slate-500">Carregando arquivo...</p> : previewUrl && selectedDocument.fileName.toLowerCase().match(/\.(pdf|png|jpe?g|gif|webp)$/) ? <iframe title={selectedDocument.fileName} src={previewUrl} className="h-[52vh] w-full rounded-xl bg-white" /> : previewUrl ? <div className="py-24 text-center"><p className="text-sm text-slate-600">Este formato não possui pré-visualização nativa.</p><a href={previewUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Abrir arquivo</a></div> : <p className="py-24 text-center text-sm text-rose-600">Não foi possível carregar o arquivo.</p>}
            </div>
            <div className="border-t border-slate-100 p-5">
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comentário opcional da análise" className="h-20 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-400" />
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" disabled={reviewLoading} onClick={() => void handleReview("REJECTED")} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Recusar</button>
                <button type="button" disabled={reviewLoading} onClick={() => void handleReview("VERIFIED")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Aprovar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function AdminEvidencesView({ model, isLoading = false, onRefresh }: Props) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "DRAFT" | "CONTRACTED">("ALL");
  const [sortOrder, setSortOrder] = useState<"RECENT" | "OLD">("RECENT");

  const companies = useMemo(() => {
    const filtered = model.companies.filter((company) => statusFilter === "ALL" || company.diagnosticStatus === statusFilter);
    return sortOrder === "RECENT" ? filtered : [...filtered].reverse();
  }, [model.companies, sortOrder, statusFilter]);

  const selectedCompany = companies.find((company) => company.id === selectedCompanyId) ?? null;

  return (
    <div className="space-y-8">
      {selectedCompany ? (
        <CompanyEvidenceDetail company={selectedCompany} onBack={() => setSelectedCompanyId(null)} onRefresh={onRefresh} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {model.metrics.map((metric) => (
              <AdminStatCard key={metric.id} metric={metric} />
            ))}
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
              >
                <option value="ALL">Todos os status</option>
                <option value="COMPLETED">Concluído</option>
                <option value="DRAFT">Rascunho</option>
                <option value="CONTRACTED">Contratado</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Ordenação</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
              >
                <option value="RECENT">Mais recentes</option>
                <option value="OLD">Mais antigos</option>
              </select>
            </label>
          </div>
        </div>

        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} active={false} onClick={() => setSelectedCompanyId(company.id)} />
        ))}
          </section>

          {!isLoading && !companies.length ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-semibold text-slate-900">Nenhuma empresa com acesso às evidências foi encontrada.</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
