"use client";

import { useState } from "react";

import { budgetService, type BudgetInput } from "../services/budget.service";

type Status = "idle" | "loading" | "success" | "error";

export function useBudgetController() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createBudget(input: BudgetInput) {
    try {
      setStatus("loading");
      setErrorMessage(null);

    const token = "cookie-session";
      if (!token) {
        throw new Error("Usuário não autenticado. Faça login para continuar.");
      }

      const response = await budgetService.createRequest(input, token);
      setStatus("success");
      return response;
    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "";
      
      if (message.includes("fetch failed") || message.includes("Failed to fetch")) {
        setErrorMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      } else {
        setErrorMessage(message || "Falha ao enviar a solicitação de orçamento");
      }
      throw error;
    }
  }

  function reset() {
    setStatus("idle");
    setErrorMessage(null);
  }

  return {
    status,
    errorMessage,
    createBudget,
    reset,
  };
}
