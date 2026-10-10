"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ErrorModal } from "./error-modal";
import { type AppErrorCode } from "./error-modal-copy";

type AppError = {
  code?: AppErrorCode;
  title?: string;
  message?: string;
  retry?: () => void;
};

type ErrorModalContextValue = {
  showError: (error?: AppError) => void;
  closeError: () => void;
};

const ErrorModalContext = createContext<ErrorModalContextValue | null>(null);

export function ErrorModalProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<AppError | null>(null);

  const showError = useCallback((nextError?: AppError) => {
    setError(nextError ?? {});
  }, []);

  const closeError = useCallback(() => setError(null), []);
  const value = useMemo(() => ({ showError, closeError }), [showError, closeError]);

  return (
    <ErrorModalContext.Provider value={value}>
      {children}
      <ErrorModal
        isOpen={!!error}
        code={error?.code}
        title={error?.title}
        message={error?.message}
        onClose={closeError}
        onRetry={error?.retry}
      />
    </ErrorModalContext.Provider>
  );
}

export function useErrorModal() {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error("useErrorModal must be used within an ErrorModalProvider");
  }
  return context;
}
