"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { diagnosticService } from "@/features/company-area/services/diagnostic.service";
import { inviteService } from "@/features/company-area/services/invite.service";

function CheckoutSimulateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const diagnosticId = searchParams.get("id");
  const orderId = searchParams.get("orderId");
  const amountParam = searchParams.get("amount");
  
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    if (!diagnosticId && !orderId) {
      setError("ID do diagnóstico ou pedido inválido ou ausente.");
    }
  }, [diagnosticId, orderId]);

  useEffect(() => {
    try {
      const pendingStr = localStorage.getItem("inoveesg_pending_purchase");
      if (pendingStr) {
        const pendingItems = JSON.parse(pendingStr);
        if (pendingItems && pendingItems.length > 0) {
          setProductName(pendingItems[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSimulatePayment = async (status: "success" | "failure") => {
    if (!diagnosticId && !orderId) return;
    setLoading(true);
    setError(null);
    const token = "cookie-session";

    try {
      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (orderId && !orderId.startsWith("fake-")) {
        await inviteService.confirmPayment(token, orderId, status);
      } else if (diagnosticId && !diagnosticId.startsWith("fake-")) {
        await diagnosticService.confirmPayment(token, diagnosticId, status);
      }
      
      if (status === "success") {
        router.push("/app/checkout/success");
      } else {
        router.push("/app/checkout/failure");
      }
    } catch (err: any) {
      setError(err?.message ?? "Falha ao processar o pagamento simulado.");
      setLoading(false);
    }
  };

  const isInvite = !!orderId;
  const displayAmount = amountParam ? Number(amountParam) : (isInvite ? 0 : 250);
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(displayAmount);

  const displayName = productName || (isInvite ? "Compra de Pacote de Convites" : "Pré-Diagnóstico ESG");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      {/* Aviso de Simulação Superior */}
      <div className="w-full max-w-lg mb-6 bg-amber-500 text-amber-950 font-bold px-4 py-3 rounded-2xl border border-amber-600/30 text-center text-xs sm:text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
        ⚠️ AMBIENTE DE HOMOLOGAÇÃO: Nenhuma cobrança real será realizada.
      </div>

      <div className="w-full max-w-lg bg-white shadow-xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200">
        
        {/* Header Mercado Pago Style */}
        <div className="bg-[#009EE3] text-white p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Shaking Hands Logo Simulado */}
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                <svg className="h-6 w-6 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4.5h-2V7h2v5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">mercado pago</h1>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Gateway Sandbox</p>
              </div>
            </div>
            <div className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider self-start sm:self-center">
              Modo Teste
            </div>
          </div>
        </div>

        {/* Banner com Título Grande de Simulação */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Simulação do Mercado Pago Gateway
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-semibold">
            Homologação de faturamento do sistema InoveESG
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center space-y-4">
              <XCircle className="h-10 w-10 text-red-600 mx-auto" />
              <p className="text-xs text-red-700 font-semibold leading-relaxed">{error}</p>
              <Button onClick={() => router.push("/app")} className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs h-10 rounded-xl">
                Voltar ao Dashboard
              </Button>
            </div>
          ) : (
            <>
              {/* Detalhes da Compra */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Resumo do Pedido</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">
                    {displayName}
                  </span>
                  <span className="text-slate-500 font-mono font-bold">{formattedAmount}</span>
                </div>
                <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-800">Total a Pagar</span>
                  <span className="text-[#009EE3] text-lg font-mono font-black">{formattedAmount}</span>
                </div>
              </div>

              {/* Alternar Métodos */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("pix")}
                  className={`py-3.5 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                    method === "pix"
                      ? "border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3] font-bold shadow-sm shadow-[#009EE3]/10"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs font-semibold">Pix Simulado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`py-3.5 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                    method === "card"
                      ? "border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3] font-bold shadow-sm shadow-[#009EE3]/10"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs font-semibold">Cartão de Crédito</span>
                </button>
              </div>

              {/* Conteúdo do Método */}
              {method === "pix" ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 p-2">
                    <div className="w-full h-full bg-slate-200 rounded-lg flex flex-col items-center justify-center text-[10px] text-slate-500 font-bold gap-1">
                      <QrCode className="h-8 w-8 text-slate-400" />
                      [QR CODE PIX]
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Você pode escolher simular o envio da notificação instantânea (webhook) aprovando o pagamento via Pix ou rejeitando-o.
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Validade</label>
                      <input
                        type="text"
                        disabled
                        value="12/30"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVV</label>
                      <input
                        type="text"
                        disabled
                        value="123"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação com Sucesso/Recusa */}
              <div className="flex flex-col gap-2.5 pt-4">
                <Button
                  disabled={loading}
                  onClick={() => handleSimulatePayment("success")}
                  className="w-full rounded-xl font-bold h-11 bg-[#009EE3] hover:bg-[#007cb3] text-white shadow-md shadow-[#009EE3]/10 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Simular Pagamento Aprovado (Sucesso)
                    </>
                  )}
                </Button>

                <Button
                  disabled={loading}
                  variant="outline"
                  onClick={() => handleSimulatePayment("failure")}
                  className="w-full rounded-xl font-bold h-11 border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50/50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Simular Pagamento Recusado (Falha)
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSimulatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    }>
      <CheckoutSimulateContent />
    </Suspense>
  );
}
