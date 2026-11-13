import { CheckoutService } from "../../checkout/services/checkoutService.js";
import { fetchMercadoPagoPayment } from "../../../lib/mercadopago.js";

type MercadoPagoWebhookBody = {
  action?: string;
  type?: string;
  topic?: string;
  resource?: string | number;
  data?: {
    id?: string | number;
  };
  id?: string | number;
  live_mode?: boolean;
  date_created?: string;
  api_version?: string;
};

type HandleWebhookResult = {
  received: boolean;
  ignored: boolean;
  reason?: string;
  paymentId?: string;
  paymentStatus?: string;
  externalReference?: string | null;
};

const checkoutService = new CheckoutService();

function extractPaymentId(body: MercadoPagoWebhookBody) {
  const rawId = body?.data?.id ?? body?.resource ?? body?.id;

  if (typeof rawId === "number") {
    return String(rawId);
  }

  if (typeof rawId === "string" && rawId.trim()) {
    return rawId.trim();
  }

  return null;
}

function isPaymentEvent(body: MercadoPagoWebhookBody) {
  const value = `${body?.type ?? body?.topic ?? body?.action ?? ""}`.toLowerCase();
  return value.includes("payment");
}

function resolveReference(payment: Awaited<ReturnType<typeof fetchMercadoPagoPayment>>) {
  const metadata = (payment.metadata ?? {}) as Record<string, unknown>;
  const externalReference = payment.external_reference ?? null;
  const orderId =
    (typeof externalReference === "string" && externalReference.trim())
      ? externalReference.trim()
      : (typeof metadata.orderId === "string" ? metadata.orderId : null);

  return {
    orderId,
    externalReference,
  };
}

export class MercadoPagoWebhookService {
  async handleWebhook(body: MercadoPagoWebhookBody, headers: Record<string, unknown>): Promise<HandleWebhookResult> {
    const paymentId = extractPaymentId(body);
    const eventType = `${body?.type ?? body?.topic ?? body?.action ?? "unknown"}`.slice(0, 100);

    console.info("[mercadopago.webhook] Processing event", {
      eventType,
      paymentId,
      paymentIdPresent: Boolean(paymentId),
    });

    if (!isPaymentEvent(body)) {
      console.info("[mercadopago.webhook] Event ignored", {
        eventType,
        paymentId,
        reason: "evento-nao-relacionado-a-pagamento",
      });
      return {
        received: true,
        ignored: true,
        reason: "evento-nao-relacionado-a-pagamento",
      };
    }

    if (!paymentId) {
      throw new Error("Webhook recebido sem paymentId");
    }

    const payment = await fetchMercadoPagoPayment(paymentId);
    const paymentStatus = (payment.status ?? "").toLowerCase();
    const reference = resolveReference(payment);

    console.info("[mercadopago.webhook] Payment fetched", {
      paymentId: payment.id,
      paymentStatus: paymentStatus || "unknown",
      orderId: reference.orderId,
      externalReferencePresent: Boolean(reference.externalReference),
    });

    if (paymentStatus === "approved") {
      if (!reference.orderId) {
        throw new Error("Pagamento aprovado, mas sem orderId no metadata");
      }

      const confirmation = await checkoutService.confirmPayment(reference.orderId, true);
      console.info("[mercadopago.webhook] Order confirmation applied", {
        paymentId: payment.id,
        paymentStatus,
        orderId: reference.orderId,
        orderStatus: confirmation?.status ?? "unknown",
      });
    } else if (["rejected", "cancelled", "refunded", "charged_back"].includes(paymentStatus)) {
      if (!reference.orderId) {
        throw new Error("Pagamento finalizado com falha, mas sem orderId no metadata");
      }

      const confirmation = await checkoutService.confirmPayment(reference.orderId, false);
      console.info("[mercadopago.webhook] Order failure applied", {
        paymentId: payment.id,
        paymentStatus,
        orderId: reference.orderId,
        orderStatus: confirmation?.status ?? "unknown",
      });
    } else {
      console.info("[mercadopago.webhook] Payment ignored", {
        paymentId: payment.id,
        paymentStatus: paymentStatus || "unknown",
        orderId: reference.orderId,
        reason: `status-${paymentStatus || "unknown"}`,
      });
      return {
        received: true,
        ignored: true,
        reason: `status-${paymentStatus || "unknown"}`,
        paymentId: payment.id,
        paymentStatus,
        externalReference: reference.externalReference,
      };
    }

    return {
      received: true,
      ignored: false,
      paymentId: payment.id,
      paymentStatus,
      externalReference: reference.externalReference,
    };
  }
}
