"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CloudUpload, FileText, PlusCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  EvidenceGroupCode,
  EvidenceUploadGroup,
  StagedEvidenceFile,
} from "../../../services/evidence-upload.service";

interface EvidenceGroupCardProps {
  group: EvidenceUploadGroup;
  draftFiles: StagedEvidenceFile[];
  onAddFiles: (groupCode: EvidenceGroupCode, documentType: string, files: FileList) => void;
  onRemoveFile: (groupCode: EvidenceGroupCode, fileId: string) => void;
  onClearGroup: (groupCode: EvidenceGroupCode) => void;
  onSendGroup: (groupCode: EvidenceGroupCode) => void;
  sending: boolean;
}

const toneStyles = {
  emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
  amber: "border-amber-200 bg-amber-50/70 text-amber-700",
  sky: "border-sky-200 bg-sky-50/70 text-sky-700",
  violet: "border-violet-200 bg-violet-50/70 text-violet-700",
  slate: "border-slate-200 bg-slate-50/70 text-slate-700",
} as const;

export function EvidenceGroupCard({
  group,
  draftFiles,
  onAddFiles,
  onRemoveFile,
  onClearGroup,
  onSendGroup,
  sending,
}: EvidenceGroupCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeDocumentType, setActiveDocumentType] = useState<string | null>(null);

  const handleOpenType = (documentType: string) => {
    setActiveDocumentType(documentType);
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !activeDocumentType) return;
    onAddFiles(group.code, activeDocumentType, event.target.files);
    setActiveDocumentType(null);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.dataTransfer.files.length || !activeDocumentType) return;
    onAddFiles(group.code, activeDocumentType, event.dataTransfer.files);
    setActiveDocumentType(null);
  };

  return (
    <article
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {group.badge}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{group.title}</h3>
            <p className="text-sm leading-6 text-slate-600">{group.description}</p>
          </div>
        </div>

      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-2xl border p-3", toneStyles[group.tone])}>
            <CloudUpload className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-medium text-slate-900">
              {activeDocumentType ? `Anexando: ${activeDocumentType}` : "Escolha um tipo de documento"}
            </p>
            <p className="text-sm text-slate-600">
              Clique em um tipo abaixo para abrir o envio. Você pode repetir o processo quantas vezes precisar.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {group.documentTypes.map((documentType) => {
            return (
              <button
                key={documentType}
                type="button"
                onClick={() => handleOpenType(documentType)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                  "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                )}
                >
                  <span>{documentType}</span>
              </button>
            );
          })}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          onChange={handleChange}
        />

        {activeDocumentType ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-900">Enviar documentos do tipo {activeDocumentType}</p>
                <p className="text-xs text-emerald-700">Solte o arquivo ou selecione no computador.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => inputRef.current?.click()}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Selecionar arquivo
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {draftFiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Nenhum documento selecionado ainda.
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Documentos selecionados</p>
            <div className="space-y-2">
              {draftFiles.map((file) => (
                <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {file.documentType} · {file.sizeLabel}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => onRemoveFile(group.code, file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500 hover:bg-slate-100"
                onClick={() => onClearGroup(group.code)}
              >
                Limpar seleção
              </Button>
              <Button
                type="button"
                className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => onSendGroup(group.code)}
                disabled={sending}
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        )}
      </div>

    </article>
  );
}
