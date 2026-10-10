"use client";

import { useEffect, useState } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminFinanceBoardModel } from "@/features/admin/shared/types";
import { getFinanceBoardModel } from "../../services/finance.service";
import { AdminFinanceView } from "./admin-finance-view";

export function AdminFinancePageClient() {
  const [model, setModel] = useState<AdminFinanceBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    let active = true;

    getFinanceBoardModel(page, 10, productId, status)
      .then((data) => {
        if (active) setModel(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar o financeiro");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, productId, status]);

  const reloadWith = (change: () => void) => {
    setIsLoading(true);
    setError(null);
    change();
  };

  if (!model && isLoading) {
    return (
      <AdminBoardLoading
        eyebrow="Financeiro"
        title="Compras, vendas e produtos"
        description="Carregando a visão financeira do admin."
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
    <div className="space-y-3">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Não foi possível atualizar os pedidos: {error}
        </div>
      ) : null}
      <AdminFinanceView
        model={model}
      productId={productId}
      status={status}
        isLoading={isLoading}
      onProductChange={(value) => {
        if (value === productId && page === 1) return;
          reloadWith(() => {
            setProductId(value);
            setPage(1);
          });
      }}
      onStatusChange={(value) => {
        if (value === status && page === 1) return;
        reloadWith(() => {
          setStatus(value);
          setPage(1);
        });
      }}
        onPageChange={(nextPage) => reloadWith(() => setPage(nextPage))}
      />
    </div>
  ) : null;
}
