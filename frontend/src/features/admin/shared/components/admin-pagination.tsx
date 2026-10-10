"use client";

import type { AdminPaginationMeta } from "../types";

type Props = {
  pagination: AdminPaginationMeta;
  basePath?: string;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
};

export function AdminPagination({ basePath, pagination, isLoading = false, onPageChange }: Props) {
  const buildHref = (page: number) => `${basePath}?page=${page}&limit=${pagination.limit}`;
  const previousDisabled = isLoading || !pagination.hasPreviousPage;
  const nextDisabled = isLoading || !pagination.hasNextPage;

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Página {pagination.page} de {pagination.totalPages} · {pagination.totalItems} itens
      </p>

      <div className="flex items-center gap-2">
        {onPageChange ? (
          <>
            <button
              type="button"
              disabled={previousDisabled}
              onClick={() => onPageChange(pagination.page - 1)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                !previousDisabled
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={nextDisabled}
              onClick={() => onPageChange(pagination.page + 1)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                !nextDisabled
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Próxima
            </button>
          </>
        ) : (
          <>
            <a
              aria-disabled={previousDisabled}
              tabIndex={previousDisabled ? -1 : undefined}
              href={!previousDisabled && basePath ? buildHref(pagination.page - 1) : basePath}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                !previousDisabled
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Anterior
            </a>
            <a
              aria-disabled={nextDisabled}
              tabIndex={nextDisabled ? -1 : undefined}
              href={!nextDisabled && basePath ? buildHref(pagination.page + 1) : basePath}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                !nextDisabled
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Próxima
            </a>
          </>
        )}
      </div>
    </div>
  );
}
