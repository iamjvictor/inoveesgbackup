"use client";

import React from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onRemoveItem: (item: string) => void;
};

export function CartModal({ isOpen, onClose, items, onRemoveItem }: CartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay with Liquid Glass Effect */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/80 p-8 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-accent/10 rounded-full">
              <ShoppingCart className="size-6 text-accent" />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Seu Carrinho</p>
          <h2 className="mt-2 text-2xl font-bold font-display tracking-tight text-foreground">
            Itens Selecionados
          </h2>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <div className="text-center py-6 text-foreground/60">
            Seu carrinho está vazio.
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-border/50 pb-3">
                <div>
                  <h3 className="font-medium text-foreground">{item}</h3>
                  <p className="text-xs text-foreground/60">Serviço/Plano</p>
                </div>
                <button 
                  onClick={() => onRemoveItem(item)}
                  className="text-foreground/40 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center font-bold">
              <span>Total Estimado:</span>
              <span className="text-accent">Sob Orçamento</span>
            </div>
            
            <Button 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold justify-center rounded-full"
              onClick={onClose}
            >
              Finalizar Solicitação
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
