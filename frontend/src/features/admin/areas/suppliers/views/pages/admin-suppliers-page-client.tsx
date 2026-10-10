"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminSupplierBoardModel } from "@/features/admin/shared/types";
import { getSupplierBoardModel } from "../../services/suppliers.service";
import { AdminSuppliersView } from "./admin-suppliers-view";

const PAGE_SIZE = 10;

export function AdminSuppliersPageClient() {
  const [page, setPage] = useState(1);
  const [model, setModel] = useState<AdminSupplierBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getSupplierBoardModel(page, PAGE_SIZE)
      .then((data) => {
        if (active) setModel(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar fornecedores");
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
        eyebrow="Fornecedores"
        title="Convites, resposta e cobertura da cadeia"
        description="Carregando a visão operacional da cadeia."
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
    <AdminSuppliersView model={model} isLoading={isLoading || isPending} onPageChange={handlePageChange} />
  ) : null;
}
