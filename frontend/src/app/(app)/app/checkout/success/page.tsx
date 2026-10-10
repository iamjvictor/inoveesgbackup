"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/features/company-area/context/company-context";
import { useCart } from "@/features/company-area/context/cart-context";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { company, refreshProfile } = useCompany();
  const { clearCart } = useCart();
  const [purchasedItem, setPurchasedItem] = useState<{ name: string; price: string } | null>(null);

  useEffect(() => {
    // Limpa o carrinho e atualiza o perfil no login/session do usuário para destravar o diagnóstico
    clearCart();
    void refreshProfile().then(() => {
      router.refresh();
    });
  }, [clearCart, refreshProfile, router]);

  useEffect(() => {
    if (!company) return;

    // Processa compras pendentes para a lista de Meus Serviços
    try {
      const companyId = company.id;
      const pendingStr = localStorage.getItem("inoveesg_pending_purchase");
      if (pendingStr) {
        const pendingItems = JSON.parse(pendingStr);
        if (pendingItems && pendingItems.length > 0) {
          setPurchasedItem({
            name: pendingItems[0].name,
            price: pendingItems[0].priceFormatted
          });
        }
        
        const existingStr = localStorage.getItem(`inoveesg_purchased_services_${companyId}`);
        const existingItems = existingStr ? JSON.parse(existingStr) : [];
        
        const updatedItems = [...existingItems];
        pendingItems.forEach((item: any) => {
          if (!updatedItems.some((u: any) => u.id === item.id)) {
            updatedItems.push({
              id: item.id,
              name: item.name,
              description: item.description || "",
              priceFormatted: item.priceFormatted,
              purchasedAt: new Date().toISOString(),
              status: "ATIVO"
            });
          }
        });
        localStorage.setItem(`inoveesg_purchased_services_${companyId}`, JSON.stringify(updatedItems));
        localStorage.removeItem("inoveesg_pending_purchase");
      }
    } catch (e) {
      console.error("Failed to process purchased services", e);
    }
  }, [company]);

  const handleGoToDashboard = async () => {
    await refreshProfile();
    router.refresh();
    router.push("/app");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Background Decorative Emitter */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-50 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-emerald-50 rounded-full blur-2xl" />

        <div className="relative">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 text-amber-500 animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Pagamento Confirmado!</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Sua transação foi processada com sucesso. O acesso ao seu {purchasedItem ? "serviço" : "Pré-Diagnóstico"} foi liberado imediatamente!
          </p>
        </div>

        {/* Detalhes do Pagamento */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Produto</span>
            <span className="font-semibold text-slate-800">{purchasedItem ? purchasedItem.name : "Pré-Diagnóstico ESG"}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Valor Pago</span>
            <span className="font-semibold text-slate-800">{purchasedItem ? purchasedItem.price : "R$ 250,00"}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Status</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" /> Aprovado
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoToDashboard}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-full shadow-lg shadow-emerald-100 group transition-all"
        >
          Acessar Meu Painel ESG
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
