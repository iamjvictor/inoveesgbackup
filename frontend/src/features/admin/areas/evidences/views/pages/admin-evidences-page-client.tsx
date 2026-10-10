"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminEvidenceBoardModel } from "@/features/admin/shared/types";
import { getEvidenceBoardModel } from "../../services/evidences.service";
import { AdminEvidencesView } from "./admin-evidences-view";

const PAGE_SIZE = 10;

export function AdminEvidencesPageClient() {
  const [page, setPage] = useState(1);
  const [model, setModel] = useState<AdminEvidenceBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadModel = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      setModel(await getEvidenceBoardModel(page, PAGE_SIZE));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar evidências");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadModel();
  }, [loadModel]);

  const handlePageChange = (nextPage: number) => {
    startTransition(() => setPage(nextPage));
  };

  if (!model && isLoading) {
    return (
      <AdminBoardLoading
        eyebrow="Evidências"
        title="Fila de revisão e validação"
        description="Carregando evidências para revisão."
      />
    );
  }

  if (error && !model) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return model ? (
    <AdminEvidencesView model={model} isLoading={isLoading || isPending} onPageChange={handlePageChange} onRefresh={() => loadModel(false)} />
  ) : null;
}
