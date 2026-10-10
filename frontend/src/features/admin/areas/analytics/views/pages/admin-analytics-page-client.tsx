"use client";

import { useEffect, useState } from "react";
import { AdminBoardLoading } from "@/features/admin/shared/components/admin-board-loading";
import type { AdminAnalyticsBoardModel } from "@/features/admin/shared/types";
import { getAnalyticsBoardModel } from "../../services/analytics.service";
import { AdminAnalyticsView } from "./admin-analytics-view";

export function AdminAnalyticsPageClient() {
  const [model, setModel] = useState<AdminAnalyticsBoardModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getAnalyticsBoardModel()
      .then((data) => {
        if (active) setModel(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar análises");
      });

    return () => {
      active = false;
    };
  }, []);

  if (!model && !error) {
    return (
      <AdminBoardLoading
        eyebrow="Análises"
        title="Leitura dos pilares e da maturidade"
        description="Carregando indicadores analíticos."
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

  return model ? <AdminAnalyticsView model={model} /> : null;
}
