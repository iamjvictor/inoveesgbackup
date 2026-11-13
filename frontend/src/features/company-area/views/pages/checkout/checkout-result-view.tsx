"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock3,
  Loader2,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/features/company-area/context/company-context";
import { useCart } from "@/features/company-area/context/cart-context";
import {
  checkoutService,
  CheckoutRequestError,
  type CheckoutOrder,
} from "@/features/company-area/services/checkout.service";

type PageState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "not-found" }
  | { kind: "error" }
  | { kind: "pending"; order: CheckoutOrder; checks: number }
  | { kind: "paid"; order: CheckoutOrder }
  | { kind: "failed"; order: CheckoutOrder }
  | { kind: "canceled"; order: CheckoutOrder };

const MAX_STATUS_CHECKS = 6;
const POLL_INTERVAL_MS = 2500;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function CheckoutResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const { refreshProfile } = useCompany();
  const { clearCart } = useCart();
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [resultOrderId, setResultOrderId] = useState("");
  const handledPaidOrder = useRef<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const applyResult = (nextState: PageState) => {
      setResultOrderId(orderId);
      setState(nextState);

      // Sincroniza a URL no navegador conforme o status
      if (typeof window !== "undefined") {
        const query = searchParams.toString();
        const qStr = query ? `?${query}` : "";
        if (nextState.kind === "pending" && window.location.pathname.endsWith("/checkout/success")) {
          window.history.replaceState({}, "", `/app/checkout/pending${qStr}`);
        } else if (nextState.kind === "paid" && !window.location.pathname.endsWith("/checkout/success")) {
          window.history.replaceState({}, "", `/app/checkout/success${qStr}`);
        }
      }
    };

    const checkOrder = async () => {
      for (let attempt = 1; attempt <= MAX_STATUS_CHECKS; attempt += 1) {
        try {
          const order = await checkoutService.getOrder(orderId);
          if (cancelled) return;

          if (order.status === "PAID") {
            applyResult({ kind: "paid", order });
            if (handledPaidOrder.current !== order.id) {
              handledPaidOrder.current = order.id;
              clearCart();
              try {
                localStorage.removeItem("inoveesg_pending_purchase");
              } catch {
                /* ignore */
              }
              void refreshProfile(true);
            }
            return;
          }

          if (order.status === "CANCELED") {
            applyResult({ kind: "canceled", order });
            try {
              localStorage.removeItem("inoveesg_pending_purchase");
            } catch {
              /* ignore */
            }
            return;
          }

          if (["FAILED", "EXPIRED"].includes(order.status)) {
            applyResult({ kind: "failed", order });
            return;
          }

          applyResult({ kind: "pending", order, checks: attempt });
          if (attempt === MAX_STATUS_CHECKS) return;
        } catch (error) {
          if (cancelled) return;
          if (error instanceof CheckoutRequestError && error.statusCode === 404) {
            applyResult({ kind: "not-found" });
          } else {
            applyResult({ kind: "error" });
          }
          return;
        }

        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, POLL_INTERVAL_MS);
        });
        if (cancelled) return;
      }
    };

    void checkOrder();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, clearCart, refreshProfile, searchParams]);

  const goToDashboard = () => router.push("/app");
  const goToUpgrade = () => router.push("/app/upgrade");

  const visibleState = !orderId
    ? { kind: "missing" as const }
    : resultOrderId === orderId
      ? state
      : { kind: "loading" as const };
  const order = "order" in visibleState ? visibleState.order : null;
  const isPaid = visibleState.kind === "paid";
  const isFailed = visibleState.kind === "failed";
  const isCanceled = visibleState.kind === "canceled";
  const isPending = visibleState.kind === "pending";

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCanceling(true);
    setCancelError(null);
    try {
      await checkoutService.cancelOrder(order.id);
      try {
        localStorage.removeItem("inoveesg_pending_purchase");
      } catch {
        /* ignore */
      }
      setShowCancelModal(false);
      setState({
        kind: "canceled",
        order: { ...order, status: "CANCELED" },
      });
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Erro ao cancelar pedido");
    } finally {
      setIsCanceling(false);
    }
  };

  const heading = isPaid
    ? "Pagamento confirmado"
    : isCanceled
      ? "Compra cancelada"
      : isFailed
        ? "Pagamento não aprovado"
        : isPending
          ? "Pagamento em processamento"
          : visibleState.kind === "loading"
            ? "Consultando pagamento"
            : visibleState.kind === "missing"
              ? "Pedido não informado"
              : visibleState.kind === "not-found"
                ? "Pedido não encontrado"
                : "Não foi possível consultar o pagamento";

  const description = isPaid
    ? "O pagamento foi confirmado pelo sistema. O acesso contratado será atualizado na sua conta."
    : isCanceled
      ? "Este pedido foi cancelado no sistema. Nenhuma cobrança foi mantida e você pode iniciar uma nova compra quando desejar."
      : isFailed
        ? "O pagamento não foi aprovado. Você pode voltar ao painel para revisar seus serviços."
        : isPending
          ? visibleState.checks === MAX_STATUS_CHECKS
            ? "Ainda não recebemos a confirmação. Consulte novamente mais tarde pelo painel; não é necessário refazer a compra agora."
            : "Aguardando a confirmação do meio de pagamento. Esta página consultará o pedido por alguns instantes."
          : visibleState.kind === "loading"
            ? "Estamos consultando o status oficial do seu pedido."
            : visibleState.kind === "missing"
              ? "Não encontramos a identificação do pedido neste retorno. Consulte seus serviços pelo painel."
              : visibleState.kind === "not-found"
                ? "Não encontramos esse pedido para sua conta. Confira seus serviços pelo painel."
                : "O serviço de consulta está indisponível no momento. Tente novamente pelo painel em instantes.";

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
      <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-xl sm:p-9">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            isPaid
              ? "bg-emerald-50 text-emerald-600"
              : isCanceled
                ? "bg-slate-100 text-slate-600"
                : isFailed
                  ? "bg-rose-50 text-rose-600"
                  : visibleState.kind === "loading"
                    ? "bg-slate-50 text-slate-400"
                    : "bg-amber-50 text-amber-600"
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="h-9 w-9" />
          ) : isCanceled ? (
            <Ban className="h-9 w-9" />
          ) : isFailed ? (
            <XCircle className="h-9 w-9" />
          ) : visibleState.kind === "loading" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Clock3 className="h-8 w-8" />
          )}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">{heading}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>

        {order && (
          <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ReceiptText className="h-4 w-4" /> Detalhes do pedido
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Pedido</dt>
                <dd className="break-all text-right font-mono text-xs text-slate-700">{order.id}</dd>
              </div>
              {order.items.map((item, index) => (
                <div className="flex justify-between gap-4" key={`${item.name}-${index}`}>
                  <dt className="text-slate-600">
                    {item.name} <span className="text-slate-400">× {item.quantity}</span>
                  </dt>
                  <dd className="shrink-0 font-medium text-slate-800">
                    {formatMoney(item.unitPriceCents * item.quantity)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <dt className="font-medium text-slate-700">Valor contratado</dt>
                <dd className="font-bold text-slate-900">{formatMoney(order.totalCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Status</dt>
                <dd
                  className={`font-semibold ${
                    isPaid
                      ? "text-emerald-700"
                      : isCanceled
                        ? "text-slate-600"
                        : isFailed
                          ? "text-rose-700"
                          : "text-amber-700"
                  }`}
                >
                  {isPaid ? (
                    <>
                      <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                      Aprovado
                    </>
                  ) : isCanceled ? (
                    "Cancelado"
                  ) : isFailed ? (
                    "Não aprovado"
                  ) : (
                    "Pendente"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Criado em</dt>
                <dd className="text-right text-slate-700">{formatDate(order.createdAt)}</dd>
              </div>
              {order.paidAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Confirmado em</dt>
                  <dd className="text-right text-slate-700">{formatDate(order.paidAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Ações */}
        <div className="mt-7 space-y-3">
          {isCanceled ? (
            <>
              <Button
                onClick={goToUpgrade}
                className="h-11 w-full rounded-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Fazer nova compra
              </Button>
              <Button
                variant="outline"
                onClick={goToDashboard}
                className="h-11 w-full rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Ir para o dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : isPending ? (
            <>
              <Button
                onClick={goToDashboard}
                className="h-11 w-full rounded-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                Ir para o dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                disabled={isCanceling}
                className="h-11 w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
              >
                <Ban className="mr-2 h-4 w-4" /> Cancelar compra
              </Button>
            </>
          ) : (
            <Button
              onClick={goToDashboard}
              className="h-11 w-full rounded-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700 shadow-sm"
            >
              Ir para o dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </section>

      {/* Modal de confirmação de cancelamento */}
      {showCancelModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Deseja cancelar esta compra?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                O pedido de <strong className="text-slate-800">{formatMoney(order.totalCents)}</strong> será cancelado no banco de dados. Nenhuma cobrança será realizada e você poderá iniciar uma nova compra a qualquer momento.
              </p>
            </div>

            {cancelError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                {cancelError}
              </p>
            )}

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
                className="flex-1 h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCanceling}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" /> Sim, cancelar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center text-slate-600">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando pedido...
    </main>
  );
}

export function CheckoutResultView() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutResultContent />
    </Suspense>
  );
}
