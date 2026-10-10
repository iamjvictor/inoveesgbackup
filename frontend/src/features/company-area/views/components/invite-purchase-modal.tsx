"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle, ShoppingBag, Loader2 } from "lucide-react";

import { inviteService } from "../../services/invite.service";
import { checkoutService } from "../../services/checkout.service";
import { SupplierStatsSummary } from "./supplier-stats-summary";
import { Button } from "@/components/ui/button";

import { useEffect } from "react";

interface InvitePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialQuantity?: number;
  minInvites?: number;
  maxInvites?: number;
}

const AVAILABLE_PACKAGES = [
  { id: "bronze", name: "Bronze", minInvites: 15, maxInvites: 30 },
  { id: "prata", name: "Prata", minInvites: 31, maxInvites: 50 },
  { id: "ouro", name: "Ouro", minInvites: 51, maxInvites: 70 },
  { id: "platina", name: "Platina", minInvites: 71, maxInvites: 90 },
  { id: "diamante", name: "Diamante", minInvites: 100, maxInvites: 100 },
];

export function InvitePurchaseModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialQuantity,
  minInvites = 15,
  maxInvites = 30
}: InvitePurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(AVAILABLE_PACKAGES[0]);
  const [quantity, setQuantity] = useState<number>(AVAILABLE_PACKAGES[0].minInvites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minVal = selectedPackage.minInvites;
  const maxVal = selectedPackage.maxInvites;

  useEffect(() => {
    if (isOpen) {
      const foundPkg = AVAILABLE_PACKAGES.find(
        (p) => p.minInvites === minInvites && p.maxInvites === maxInvites
      );
      if (foundPkg) {
        setSelectedPackage(foundPkg);
        setQuantity(foundPkg.maxInvites);
      } else {
        setSelectedPackage(AVAILABLE_PACKAGES[0]);
        setQuantity(AVAILABLE_PACKAGES[0].maxInvites);
      }
    }
  }, [isOpen, minInvites, maxInvites]);

  if (!isOpen) return null;

  const pricePerInvite = 50; // Somente pré-diagnóstico (R$ 50/convite)
  const totalPrice = quantity * pricePerInvite;
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(totalPrice);

  const handleCheckout = async () => {
    if (quantity < minVal || quantity > maxVal) {
      setError(`A quantidade deve estar entre ${minVal} e ${maxVal} convites.`);
      return;
    }

    setLoading(true);
    setError(null);
    const token = "cookie-session";

    try {
      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const response = await checkoutService.createPreference(token, "INVITE_PACK", quantity);
      
      if (response.checkoutUrl) {
        const pendingItem = {
          id: `invite-pack-standard-${quantity}-${Date.now()}`,
          name: `Avaliação de Fornecedores - ${quantity} Convites (Pré-Diagnóstico)`,
          description: `Monitoramento e diagnóstico de ${quantity} fornecedores parceiros com envio de questionários e análises na plataforma.`,
          priceFormatted: formattedPrice
        };
        localStorage.setItem("inoveesg_pending_purchase", JSON.stringify([pendingItem]));

        const paymentWindow = window.open(response.checkoutUrl, "_blank", "noopener,noreferrer");
        if (!paymentWindow) {
          throw new Error("O navegador bloqueou a abertura da nova aba. Permita pop-ups para continuar o pagamento.");
        }
      } else {
        throw new Error("Falha ao gerar link de checkout.");
      }
    } catch (err: any) {
      setError(err?.message ?? "Falha ao iniciar processo de compra.");
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: typeof AVAILABLE_PACKAGES[0]) => {
    setSelectedPackage(pkg);
    setQuantity(pkg.maxInvites);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-1.5">
                  Adquirir Convites para Fornecedores
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </h1>
                <p className="text-xs text-slate-400">Amplie o monitoramento da sua cadeia de suprimentos</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable if needed */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Real-time Stats from Database */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estatísticas Atuais da sua Empresa
            </h3>
            <SupplierStatsSummary />
          </div>

          <hr className="border-slate-100" />

          {/* Escolha a Faixa de Convites */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Escolha a Faixa de Convites
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {AVAILABLE_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/10 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold block">{pkg.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                      {pkg.minInvites === pkg.maxInvites ? `${pkg.minInvites} convites` : `${pkg.minInvites} a ${pkg.maxInvites}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Purchase Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Left side: Package Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Tipo de Monitoramento
              </h3>
              
              <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-sm text-slate-800 font-semibold">Pré-Diagnóstico ESG</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-0.5 rounded-full">
                    R$ 50 / convite
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Questionário de autodeclaração respondido pelo fornecedor. Ideal para mapeamento ágil de maturidade de forma simplificada.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Incluso no pacote:</p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Formulário de Autodeclaração
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Relatório Automatizado
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-400 line-through">
                      <span className="size-1.5 rounded-full bg-slate-300" />
                      Análise de Evidências
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-400 line-through">
                      <span className="size-1.5 rounded-full bg-slate-300" />
                      Validação de Documentos
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side: Select Quantity & Summary */}
            <div className="space-y-4 flex flex-col justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. Resumo da Compra
                </h3>

                <div className="p-5 bg-white border border-slate-200/60 rounded-2xl space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Pacote Selecionado:</span>
                    <span className="font-bold text-slate-800">Pacote {selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Convites Inclusos:</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                      {quantity} convites
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Faixa de Fornecedores:</span>
                    <span className="font-semibold text-slate-700">
                      {selectedPackage.minInvites === selectedPackage.maxInvites 
                        ? `${selectedPackage.minInvites} fornecedores`
                        : `${selectedPackage.minInvites} a ${selectedPackage.maxInvites} fornecedores`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Calculation Panel */}
              <div className="border-t border-slate-200/60 pt-4 mt-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Valor Unitário Mínimo</span>
                  <span className="font-semibold text-slate-700">R$ {pricePerInvite.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-2 border-t border-slate-200/40">
                  <span>Total a Pagar</span>
                  <span className="text-emerald-700 text-lg font-mono">{formattedPrice}</span>
                </div>
              </div>
            </div>

          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
            className="rounded-full px-6 font-bold border-slate-200 text-slate-600"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100/50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar e Ir para Pagamento"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
