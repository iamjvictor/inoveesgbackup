"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutFailurePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Background Decorative Emitter */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-50 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-red-50 rounded-full blur-2xl" />

        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <XCircle className="h-10 w-10 text-red-600 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Pagamento Recusado</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Houve um problema ao processar seu pagamento. Nenhuma cobrança foi realizada e seu carrinho continua salvo.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Motivo</span>
            <span className="font-semibold text-red-700">Simulação de Recusa</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Ação Sugerida</span>
            <span className="font-semibold text-slate-800">Tente novamente selecionando Sucesso</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => router.push("/app")}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold h-11 rounded-full shadow-lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Tentar Novamente (Carrinho)
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/app")}
            className="w-full text-slate-500 hover:text-slate-700 font-semibold h-11 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
