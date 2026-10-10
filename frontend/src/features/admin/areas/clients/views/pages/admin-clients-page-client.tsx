"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminClientBoardModel } from "@/features/admin/shared/types";
import { getClientBoardModel } from "../../services/clients.service";
import { AdminClientsView } from "./admin-clients-view";

const PAGE_SIZE = 10;

export function AdminClientsPageClient() {
  const [page, setPage] = useState(1);
  const [model, setModel] = useState<AdminClientBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getClientBoardModel(page, PAGE_SIZE)
      .then((data) => {
        if (active) setModel(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
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
        eyebrow="Clientes"
        title="Carteira, risco e maturidade"
        description="Carregando a visão operacional dos clientes."
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
    <AdminClientsView model={model} isLoading={isLoading || isPending} onPageChange={handlePageChange} />
  ) : null;
}
