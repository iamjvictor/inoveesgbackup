"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminClientBoardModel } from "@/features/admin/shared/types";
import { getConsultingBoardModel } from "../../services/consulting.service";
import { AdminConsultingView } from "./admin-consulting-view";

const PAGE_SIZE = 10;

export function AdminConsultingPageClient() {
  const [page, setPage] = useState(1);
  const [model, setModel] = useState<AdminClientBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getConsultingBoardModel(page, PAGE_SIZE)
      .then((data) => {
        if (active) setModel(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar consultoria");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page]);

  const handlePageChange = (nextPage: number) => {
    startTransition(() => setPage(nextPage));
  };

  if (!model && isLoading) {
    return (
      <AdminBoardLoading
        eyebrow="Consultoria"
        title="Pré-Diagnóstico + Consultoria"
        description="Carregando a visão operacional de consultoria."
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
    <AdminConsultingView model={model} isLoading={isLoading || isPending} onPageChange={handlePageChange} />
  ) : null;
}
