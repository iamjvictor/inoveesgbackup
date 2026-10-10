"use client";

import React, { useState } from "react";
import { ShoppingBag, X, Trash2, CreditCard, ArrowRight, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../../context/cart-context";
import { useCompany } from "../../context/company-context";
import { useAuthController } from "@/features/auth/controllers/use-auth.controller";
import { BudgetModal } from "./budget-modal";
import { diagnosticService } from "../../services/diagnostic.service";


export function CartSidebar() {
  const { items, removeItem, total, itemCount } = useCart();
  const { user, company } = useCompany();
  const { logout } = useAuthController();
  
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBudgetService = items.some(item => item.requiresBudget || item.price === 0);

  const fixedTotal = items.reduce((acc, item) => {
    if (item.requiresBudget || item.price === 0) return acc;
    return acc + item.price;
  }, 0);

  const handleCheckoutClick = async () => {
    if (hasBudgetService) {
      setIsBudgetOpen(true);
    } else {
      setCheckoutLoading(true);
      setError(null);
    const token = "cookie-session";

      try {
        if (!token) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }

        // Guarda os itens do carrinho como compra pendente antes do pagamento
        localStorage.setItem("inoveesg_pending_purchase", JSON.stringify(items));

        // Cria a sessão de checkout no backend
        const session = await diagnosticService.simulatePreDiagnosticPurchase(token);

        if (!session?.checkoutUrl) {
          throw new Error("Não foi possível iniciar o checkout.");
        }

        window.location.href = session.checkoutUrl;
      } catch (err: any) {
        setError(err?.message ?? "Falha ao gerar link de pagamento.");
        setCheckoutLoading(false);
      }
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-slate-800">Seu Carrinho</h2>
            </div>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
              {user?.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{company?.legalName}</p>
            </div>
            <button 
              onClick={() => logout()}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-3 font-medium">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">Seu carrinho está vazio.<br/>Selecione um serviço ao lado.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group bg-slate-50 rounded-xl p-4 border border-slate-100 relative transition-all hover:bg-slate-100">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-2 -right-2 bg-white border border-slate-200 p-1.5 rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    {item.type === "SUBSCRIPTION" ? "Assinatura" : "Serviço Avulso"}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">{item.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  <div className="pt-2 text-sm font-bold text-slate-900 font-display">
                    {item.priceFormatted}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              {hasBudgetService ? "Total (Itens Fixos)" : "Total"}
            </span>
            <span className="text-xl font-bold text-slate-900">
              {hasBudgetService && fixedTotal === 0 
                ? "A definir" 
                : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(hasBudgetService ? fixedTotal : total)}
            </span>
          </div>

          {hasBudgetService && (
            <p className="text-[10px] text-slate-500 leading-normal">
              * O carrinho contém itens sob orçamento. Você fará uma solicitação de proposta sem custo para todo o conjunto de serviços.
            </p>
          )}

          <Button 
            disabled={items.length === 0 || checkoutLoading}
            onClick={handleCheckoutClick}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
          >
            {checkoutLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : hasBudgetService ? (
              <>
                <ClipboardList className="mr-2 h-5 w-5" />
                Solicitar Orçamento
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Finalizar Compra
              </>
            )}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-[10px] text-center text-slate-400">
            {hasBudgetService ? "Solicitação de orçamento sem compromisso" : "Pagamento 100% seguro processado por InoveESG"}
          </p>
        </div>
      </div>

      <BudgetModal 
        isOpen={isBudgetOpen} 
        onClose={() => setIsBudgetOpen(false)} 
      />
    </>
  );
}
