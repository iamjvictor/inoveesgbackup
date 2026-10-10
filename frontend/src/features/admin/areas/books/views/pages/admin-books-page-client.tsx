"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminBooksBoardModel } from "@/features/admin/shared/types";
import { getBooksBoardModel } from "../../services/books.service";
import { AdminBooksView } from "./admin-books-view";

const PAGE_SIZE = 10;

export function AdminBooksPageClient() {
  const [page, setPage] = useState(1);
  const [model, setModel] = useState<AdminBooksBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    getBooksBoardModel(page, PAGE_SIZE)
      .then((data) => {
        if (active) setModel(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar os livros");
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
        eyebrow="Livros"
        title="Vendas do produto livro"
        description="Carregando a visão das vendas do LIVRO_ESG."
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

  return model ? <AdminBooksView model={model} isLoading={isLoading || isPending} onPageChange={handlePageChange} /> : null;
}
