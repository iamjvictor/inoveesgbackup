import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, CheckCircle2, ShieldCheck, Loader2, X } from "lucide-react";
import { diagnosticService } from "../../services/diagnostic.service";

interface SimulatedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  totalAmount: number;
  onSuccess: () => void;
}

export function SimulatedCheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onSuccess,
}: SimulatedCheckoutModalProps) {
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setLoading(true);
    setError(null);
    const token = "cookie-session";

    try {
      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      await diagnosticService.simulatePreDiagnosticPurchase(token);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message ?? "Falha ao processar o pagamento simulado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay with Liquid Glass Effect */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={!loading && !success ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/95 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.25)] backdrop-blur-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 animate-pulse" />
              Simulador de Pagamento
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simule a contratação imediata dos seus serviços sem custos reais.
            </p>
          </div>
          {!loading && !success && (
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200/50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Pagamento Confirmado!</h3>
              <p className="text-xs text-slate-500">Seu pré-diagnóstico foi ativado e já está disponível no seu painel.</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Detalhes do Pedido */}
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itens do pedido</span>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="text-slate-500 font-mono">{item.priceFormatted}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-bold text-emerald-700 text-base font-mono">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalAmount)}
                </span>
              </div>
            </div>

            {/* Alternar Métodos de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("pix")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                  method === "pix"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold shadow-sm shadow-emerald-50"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <QrCode className="h-5 w-5" />
                <span className="text-xs">PIX Simulado</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                  method === "card"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold shadow-sm shadow-emerald-50"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Cartão Simulado</span>
              </button>
            </div>

            {/* Conteúdo do Método Selecionado */}
            {method === "pix" ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 p-2">
                  <div className="w-full h-full bg-slate-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-slate-500 font-bold gap-1">
                    <QrCode className="h-8 w-8 text-slate-400" />
                    [QR CODE PIX]
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                  Escaneie ou clique no botão abaixo para confirmar o recebimento do PIX no ambiente de homologação.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número do Cartão</label>
                  <input
                    type="text"
                    disabled
                    value="4000 1234 5678 9010"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Validade</label>
                    <input
                      type="text"
                      disabled
                      value="12/30"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVV</label>
                    <input
                      type="text"
                      disabled
                      value="123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
                className="w-1/3 rounded-full font-bold h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleSimulatePayment}
                className="w-2/3 rounded-full font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Pagamento"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
