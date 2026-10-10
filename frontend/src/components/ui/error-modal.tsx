"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "./button";
import { getErrorModalCopy, type AppErrorCode } from "./error-modal-copy";

export interface ErrorModalProps {
  isOpen: boolean;
  code?: AppErrorCode;
  title?: string;
  message?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorModal({ isOpen, code, title, message, onClose, onRetry }: ErrorModalProps) {
  if (!isOpen) return null;

  const copy = getErrorModalCopy(code);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" role="presentation">
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-error-modal-title"
        aria-describedby="app-error-modal-message"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Fechar aviso"
        >
          <X className="size-5" />
        </button>

        <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="size-6" />
        </div>
        <h2 id="app-error-modal-title" className="mt-5 text-xl font-bold text-slate-900">
          {title ?? copy.title}
        </h2>
        <p id="app-error-modal-message" className="mt-2 text-sm leading-6 text-slate-600">
          {message ?? copy.message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {onRetry && (
            <Button type="button" onClick={onRetry}>
              <RefreshCw className="mr-2 size-4" />
              {copy.retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
