import { env } from "../config/env.js";

type BackUrls = {
  success?: string;
  failure?: string;
  pending?: string;
};

type CreateMercadoPagoPreferenceParams = {
  title: string;
  unitPrice: number;
  quantity?: number;
  description?: string;
  externalReference: string;
  metadata?: Record<string, unknown>;
  backUrls: BackUrls;
};

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id: string;
  status?: string;
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  currency_id?: string;
  date_created?: string;
  date_approved?: string | null;
  payment_type_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function createMercadoPagoPreference(params: CreateMercadoPagoPreferenceParams) {
  const successUrl = params.backUrls.success ?? "https://www.youtube.com";
  const failureUrl = params.backUrls.failure ?? "https://www.youtube.com";
  const pendingUrl = params.backUrls.pending ?? "https://www.youtube.com";
  const backendBaseUrl = env.backendUrl.startsWith("http://") || env.backendUrl.startsWith("https://")
    ? env.backendUrl
    : `https://${env.backendUrl}`;
  const notificationUrl = `${backendBaseUrl.replace(/\/$/, "")}/api/webhooks/mercadopago`;
  const checkoutUnitPrice = 0.01;
  const checkoutQuantity = 1;

  console.info("[mercadopago.preference] Building preference URLs", {
    successUrl,
    failureUrl,
    pendingUrl,
    notificationUrl,
    requestedUnitPrice: params.unitPrice,
    requestedQuantity: params.quantity ?? 1,
    checkoutUnitPrice,
    checkoutQuantity,
  });

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.mercadoPagoAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: params.title,
          quantity: checkoutQuantity,
          unit_price: checkoutUnitPrice,
          currency_id: "BRL",
          description: params.description,
        },
      ],
      external_reference: params.externalReference,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: "approved",
      notification_url: notificationUrl,
      metadata: params.metadata,
    }),
  });

  const payloadText = await response.text();
  let payload: Partial<MercadoPagoPreferenceResponse> & { message?: string } = {};

  if (payloadText) {
    try {
      payload = JSON.parse(payloadText) as Partial<MercadoPagoPreferenceResponse> & { message?: string };
    } catch {
      payload = { message: payloadText };
    }
  }

  if (!response.ok) {
    throw new Error(
      `Falha ao criar preferência Mercado Pago (${response.status}): ${payload.message ?? payloadText ?? "resposta vazia"}`
    );
  }

  const preferenceId = payload.id;
  const isSandbox = env.mercadoPagoSandbox;
  const checkoutUrl = isSandbox
    ? (payload.sandbox_init_point ?? payload.init_point)
    : (payload.init_point ?? payload.sandbox_init_point);
  const checkoutUrlSource = isSandbox
    ? (payload.sandbox_init_point ? "sandbox_init_point" : "init_point")
    : (payload.init_point ? "init_point" : "sandbox_init_point");

  if (!preferenceId || !checkoutUrl) {
    throw new Error("Mercado Pago não retornou os dados esperados da preferência.");
  }

  console.info("[mercadopago.preference] Checkout URL selected", {
    preferenceId,
    checkoutUrlSource,
    checkoutUrl,
  });

  return {
    preferenceId,
    checkoutUrl,
  };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.mercadoPagoAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  const payloadText = await response.text();
  let payload: Partial<MercadoPagoPaymentResponse> & { message?: string } = {};

  if (payloadText) {
    try {
      payload = JSON.parse(payloadText) as Partial<MercadoPagoPaymentResponse> & { message?: string };
    } catch {
      payload = { message: payloadText };
    }
  }

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar pagamento Mercado Pago (${response.status}): ${payload.message ?? payloadText ?? "resposta vazia"}`
    );
  }

  if (!payload.id) {
    throw new Error("Mercado Pago não retornou os dados do pagamento.");
  }

  return payload as MercadoPagoPaymentResponse;
}
