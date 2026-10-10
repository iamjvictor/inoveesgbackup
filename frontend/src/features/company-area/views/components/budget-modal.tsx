"use client";

import React, { useMemo, useState } from "react";
import { X, Sparkles, Loader2, CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "../../context/company-context";
import { useCart } from "../../context/cart-context";
import { useBudgetController } from "../../controllers/use-budget.controller";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BudgetStep = "confirm" | "success";

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { company } = useCompany();
  const { items, clearCart } = useCart();
  const { createBudget, reset } = useBudgetController();

  const [step, setStep] = useState<BudgetStep>("confirm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const budgetItems = useMemo(
    () => items.filter((item) => item.requiresBudget || item.price === 0),
    [items]
  );

  if (!isOpen) return null;

  const persistRequestedBudgets = () => {
    try {
      const companyId = company?.id || "anonymous";
      const storageKey = `inoveesg_requested_budgets_${companyId}`;
      const existingRequested = localStorage.getItem(storageKey);
      const requestedList = existingRequested ? JSON.parse(existingRequested) : [];

      const newRequests = budgetItems.map((item) => ({
        id: item.id,
        productCode: item.id,
        name: item.months ? `${item.name} (${item.months} meses)` : item.name,
        description: item.description || "",
        priceFormatted: item.priceFormatted,
        requestedAt: new Date().toISOString(),
        status: "SOLICITADO",
      }));

      localStorage.setItem(storageKey, JSON.stringify([...requestedList, ...newRequests]));
    } catch (error) {
      console.error("Failed to persist requested budgets", error);
    }
  };

  const handleConfirm = async () => {
    if (budgetItems.length === 0) {
      setErrorMessage("Selecione ao menos um produto sob orçamento.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const mainItem = budgetItems[0];
      await createBudget({
        productCode: mainItem?.id,
        months: mainItem?.months,
        items: budgetItems.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
        })),
      });

      persistRequestedBudgets();
      setStep("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao enviar a solicitação.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setStep("confirm");
    setErrorMessage(null);
    reset();
    onClose();
  };

  const handleFinish = () => {
    clearCart();
    setStep("confirm");
    setErrorMessage(null);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={isSubmitting ? undefined : handleClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 p-6 md:p-8 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.25)] backdrop-blur-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {step === "confirm" && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        )}

        {step === "confirm" ? (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3" />
                Solicitação de Orçamento
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 font-display tracking-tight">
                Confirmar solicitação?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vamos registrar sua proposta com base nos produtos selecionados. Nenhuma informação adicional é necessária.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Empresa</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{company?.legalName || "Empresa"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Itens</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{budgetItems.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                {budgetItems.map((item) => (
                  <div key={item.id} className="rounded-xl bg-white border border-slate-200 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.name} {item.months ? `(${item.months} meses)` : ""}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.priceFormatted}</p>
                  </div>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-full px-5"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting || budgetItems.length === 0}
                className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Solicitando...
                  </>
                ) : (
                  <>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Sim, solicitar
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Solicitação enviada</h2>
              <p className="mt-1 text-sm text-slate-500">
                Seu orçamento foi registrado com sucesso. Você pode acompanhar o status em Meus Serviços.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleFinish}
              className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
            >
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
