"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { getInvitesPurchaseViewModel } from "../../../controllers/invites.controller";
import { SectionHeading } from "../../components/section-heading";
import { SupplierStatsSummary } from "../../components/supplier-stats-summary";
import { InvitePurchaseModal } from "../../components/invite-purchase-modal";

type InvitePurchaseViewModel = ReturnType<typeof getInvitesPurchaseViewModel>;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function InvitePurchaseView({ model }: { model: InvitePurchaseViewModel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMin, setSelectedMin] = useState(15);
  const [selectedMax, setSelectedMax] = useState(30);
  const [selectedQuantity, setSelectedQuantity] = useState(15);

  const handleOpenModal = (min: number, max: number) => {
    setSelectedMin(min);
    setSelectedMax(max);
    setSelectedQuantity(min);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Convites"
        title="Compra de pacotes para fornecedores"
        description="Amplie a cobertura da cadeia de fornecedores sem interromper o monitoramento ESG."
      />

      {/* Real-time Connected Stats */}
      <SupplierStatsSummary />

      {model.shouldPromptPurchase ? (
        <section className="border border-amber-300 bg-amber-50/75 px-4 py-3 text-sm text-amber-900 rounded-2xl">
          Seu saldo de convites está baixo. Recomendado adquirir novo pacote para manter os envios ativos.
        </section>
      ) : null}

      <section className="border border-slate-100 bg-white shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-[150%] bg-gradient-to-l from-emerald-600/5 to-transparent blur-2xl pointer-events-none" />
        
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-bold text-slate-800">Adquirir Convites Adicionais</h3>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Selecione a quantidade de convites desejada para monitorar novos parceiros, enviar questionários e receber análises de conformidade ESG da sua cadeia.
          </p>
        </div>

        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-12 px-8 shadow-md transition-all duration-300 hover:scale-[1.02] shrink-0"
          onClick={() => handleOpenModal(15, 30)}
        >
          Comprar Convites
        </Button>
      </section>

      <InvitePurchaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        minInvites={selectedMin}
        maxInvites={selectedMax}
        initialQuantity={selectedQuantity}
      />
    </div>
  );
}
