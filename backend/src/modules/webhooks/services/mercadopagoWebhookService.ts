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

    console.info("[mercadopago.webhook] Event received", {
      headers,
      body,
      paymentId,
    });

    if (!isPaymentEvent(body)) {
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

    console.info("[mercadopago.webhook] Payment resolved", {
      paymentId: payment.id,
      paymentStatus,
      statusDetail: payment.status_detail,
      transactionAmount: payment.transaction_amount,
      currencyId: payment.currency_id,
      dateCreated: payment.date_created,
      dateApproved: payment.date_approved,
      paymentTypeId: payment.payment_type_id,
      reference,
    });

    if (paymentStatus === "approved") {
      if (!reference.orderId) {
        throw new Error("Pagamento aprovado, mas sem orderId no metadata");
      }

      console.info("[mercadopago.webhook] Confirming order payment", {
        orderId: reference.orderId,
        paymentId: payment.id,
      });

      await checkoutService.confirmPayment(reference.orderId, true);
    } else if (["rejected", "cancelled", "refunded", "charged_back"].includes(paymentStatus)) {
      if (!reference.orderId) {
        throw new Error("Pagamento finalizado com falha, mas sem orderId no metadata");
      }

      console.info("[mercadopago.webhook] Marking order payment as failed", {
        orderId: reference.orderId,
        paymentId: payment.id,
        paymentStatus,
      });

      await checkoutService.confirmPayment(reference.orderId, false);
    } else {
      console.info("[mercadopago.webhook] Payment status not final, ignoring", {
        paymentId: payment.id,
        paymentStatus,
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
