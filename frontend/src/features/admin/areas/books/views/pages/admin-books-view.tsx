"use client";

import { useState } from "react";
import { BookOpen, CalendarDays, Send, X } from "lucide-react";
import { AdminPagination } from "@/features/admin/shared/components/admin-pagination";
import { AdminSectionHeading } from "@/features/admin/shared/components/admin-section-heading";
import { AdminStatCard } from "@/features/admin/shared/components/admin-stat-card";
import { AdminStatusBadge } from "@/features/admin/shared/components/admin-status-badge";
import type { AdminBooksBoardModel } from "@/features/admin/shared/types";

function paymentTone(status: string): "emerald" | "amber" | "rose" | "slate" {
  switch (status) {
    case "Pago":
    case "PAID":
    case "AUTHORIZED":
      return "emerald";
    case "Aguardando pagamento":
    case "PENDING":
      return "amber";
    case "Falhou":
    case "Cancelado":
    case "Estornado":
    case "FAILED":
    case "CANCELED":
    case "REFUNDED":
      return "rose";
    default:
      return "slate";
  }
}

function paymentStatusLabel(status: string) {
  switch (status) {
    case "Pago":
      return "Pago";
    case "Autorizado":
      return "Autorizado";
    case "Pendente":
      return "Pendente";
    case "Falhou":
      return "Falhou";
    case "Cancelado":
      return "Cancelado";
    case "Estornado":
      return "Estornado";
    case "Expirado":
      return "Expirado";
    case "PAID":
      return "Pago";
    case "AUTHORIZED":
      return "Autorizado";
    case "PENDING":
      return "Pendente";
    case "FAILED":
      return "Falhou";
    case "CANCELED":
      return "Cancelado";
    case "REFUNDED":
      return "Estornado";
    case "EXPIRED":
      return "Expirado";
    default:
      return status;
  }
}

function orderStatusTone(status: string): "emerald" | "amber" | "rose" | "slate" {
  switch (status) {
    case "Pago":
    case "PAID":
      return "emerald";
    case "Aguardando pagamento":
    case "Parcial":
    case "PENDING_PAYMENT":
    case "PARTIALLY_PAID":
      return "amber";
    case "Falhou":
    case "Cancelado":
    case "Estornado":
    case "FAILED":
    case "CANCELED":
    case "REFUNDED":
      return "rose";
    default:
      return "slate";
  }
}

function isPaidSale(paymentStatus: string) {
  return paymentStatus === "Pago" || paymentStatus === "PAID" || paymentStatus === "AUTHORIZED";
}

export function AdminBooksView({
  model,
  isLoading = false,
  onPageChange,
}: {
  model: AdminBooksBoardModel;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}) {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const selectedSale = model.sales.find((sale) => sale.id === selectedSaleId) ?? null;

  return (
    <div className="space-y-8">
      <AdminSectionHeading
        eyebrow="Livros"
        title="Vendas do produto livro"
        description="Conferência das vendas do LIVRO_ESG, com empresas compradoras, endereço, quantidade vendida e status de pagamento."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.metrics.map((metric) => (
          <AdminStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="space-y-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vendas</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Compradores do livro</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              <BookOpen className="h-3.5 w-3.5" />
              {model.summary.totalBooksSold} exemplares
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Empresa</th>
                    <th className="px-5 py-3">Endereço completo</th>
                    <th className="px-4 py-3 text-center">Qtd.</th>
                    <th className="px-4 py-3 text-center">Pagamento</th>
                    <th className="px-4 py-3 text-center">Pedido</th>
                    <th className="px-4 py-3 text-right">Valor do livro</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {model.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-5 align-top">
                        <div className="font-semibold text-slate-900">{sale.companyName}</div>
                        <div className="text-xs text-slate-500">{sale.legalName}</div>
                        <div className="mt-1 text-xs text-slate-400">CNPJ {sale.cnpj}</div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="max-w-[420px] whitespace-pre-line text-sm leading-6 text-slate-600">
                          {sale.address}
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                          CNPJ {sale.cnpj}
                        </div>
                      </td>
                      <td className="px-4 py-5 align-top text-center font-semibold text-slate-900">{sale.quantity}</td>
                      <td className="px-4 py-5 align-top text-center">
                        <AdminStatusBadge
                          label={paymentStatusLabel(sale.paymentStatus)}
                          tone={paymentTone(sale.paymentStatus)}
                        />
                        <div className="mt-2 text-xs text-slate-500">{sale.paymentMethod}</div>
                      </td>
                      <td className="px-4 py-5 align-top text-center">
                        <AdminStatusBadge
                          label={sale.orderStatus}
                          tone={orderStatusTone(sale.orderStatus)}
                        />
                      </td>
                      <td className="px-4 py-5 align-top text-right">
                        <div className="font-semibold text-slate-900">{sale.bookRevenue}</div>
                        <div className="text-xs text-slate-500">{sale.orderTotal}</div>
                      </td>
                      <td className="px-4 py-5 align-top text-right">
                        {isPaidSale(sale.paymentStatus) ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSaleId(sale.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Enviar
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Aguardando pagamento</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <AdminPagination pagination={model.pagination} isLoading={isLoading} onPageChange={onPageChange} />
          </div>
        </article>
      </section>

      {selectedSale ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Livro</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                  Pedido pronto para envio
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Revisar os dados do pedido antes de marcar como enviado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSaleId(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Empresa</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-lg font-semibold text-slate-900">{selectedSale.companyName}</p>
                    <p className="text-sm text-slate-600">{selectedSale.legalName}</p>
                    <p className="text-xs text-slate-500">CNPJ {selectedSale.cnpj}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pedido</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Quantidade</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedSale.quantity} livro(s)</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Valor do livro</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedSale.bookRevenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Valor do pedido</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedSale.orderTotal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pagamento</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedSale.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Endereço completo</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{selectedSale.address}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status atual</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminStatusBadge label={paymentStatusLabel(selectedSale.paymentStatus)} tone={paymentTone(selectedSale.paymentStatus)} />
                    <AdminStatusBadge label={selectedSale.orderStatus} tone={orderStatusTone(selectedSale.orderStatus)} />
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    <p>Pago em: {selectedSale.paidAt}</p>
                    <p className="mt-1">Compra em: {selectedSale.createdAt}</p>
                    <p className="mt-1">Forma de pagamento: {selectedSale.paymentMethod}</p>
                    <p className="mt-1">Gateway: {selectedSale.paymentProvider}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Controle de envio</p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    O controle real de envio ainda não foi implementado. O botão abaixo já está pronto para ser ligado
                    ao backend quando essa etapa existir.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white opacity-70"
                  >
                    Marcar como enviado
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={() => setSelectedSaleId(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
