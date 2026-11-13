import type { Request, Response } from "express";
import { MercadoPagoWebhookService } from "../services/mercadopagoWebhookService.js";
import { env } from "../../../config/env.js";
import { isValidMercadoPagoSignature } from "../services/mercadopagoWebhookSignature.js";

const mercadopagoWebhookService = new MercadoPagoWebhookService();

function logValue(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  return String(value).replace(/[\r\n\t]/g, " ").slice(0, 100);
}

function firstLogValue(...values: unknown[]) {
  for (const value of values) {
    const normalized = logValue(value);
    if (normalized) return normalized;
  }
  return "unknown";
}

export class MercadoPagoWebhookController {
  async handle(request: Request, response: Response) {
    try {
      const body = request.body ?? {};
      const bodyDataId = body?.data?.id;
      const queryDataId = request.query["data.id"] ?? request.query.data_id;
      const dataId = Array.isArray(queryDataId) ? queryDataId[0] : queryDataId ?? bodyDataId;
      const eventType = firstLogValue(
        body?.type,
        body?.topic,
        body?.action,
        request.query.type,
        request.query.topic
      );
      const dataIdSource = queryDataId != null
        ? (request.query["data.id"] != null ? "query.data.id" : "query.data_id")
        : bodyDataId != null ? "body.data.id" : "missing";
      const requestContext = {
        eventType,
        paymentId: logValue(dataId),
        dataIdSource,
      };

      console.info("[mercadopago.webhook] Notification received", requestContext);

      if (queryDataId != null && (Array.isArray(queryDataId) || typeof queryDataId !== "string" || !queryDataId.trim())) {
        console.warn("[mercadopago.webhook] Notification rejected", {
          ...requestContext,
          reason: "invalid_query_data_id",
          queryDataIdIsArray: Array.isArray(queryDataId),
          queryDataIdIsEmpty: typeof queryDataId === "string" && !queryDataId.trim(),
        });
        return response.status(401).json({ message: "Assinatura do webhook inválida" });
      }
      if (queryDataId != null && bodyDataId != null && String(queryDataId).trim() !== String(bodyDataId).trim()) {
        console.warn("[mercadopago.webhook] Notification rejected", {
          ...requestContext,
          reason: "query_body_data_id_mismatch",
          queryPaymentId: logValue(queryDataId),
          bodyPaymentId: logValue(bodyDataId),
        });
        return response.status(401).json({ message: "Assinatura do webhook inválida" });
      }
      const signature = request.header("x-signature");
      const requestId = request.header("x-request-id");
      const signatureValid = isValidMercadoPagoSignature({
        signature,
        requestId,
        dataId,
        secret: env.mercadoPagoWebhookSecret,
      });
      if (!signatureValid) {
        console.warn("[mercadopago.webhook] Notification rejected", {
          ...requestContext,
          reason: "signature_invalid_or_missing",
          signatureHeaderPresent: Boolean(signature),
          requestIdHeaderPresent: Boolean(requestId),
          webhookSecretConfigured: Boolean(env.mercadoPagoWebhookSecret),
          dataIdPresent: dataId != null && String(dataId).trim().length > 0,
        });
        return response.status(401).json({ message: "Assinatura do webhook inválida" });
      }

      console.info("[mercadopago.webhook] Signature validated", requestContext);

      const result = await mercadopagoWebhookService.handleWebhook(
        body,
        {
          "x-request-id": request.header("x-request-id") ?? null,
        }
      );

      console.info("[mercadopago.webhook] Notification handled", {
        ...requestContext,
        received: result.received,
        ignored: result.ignored,
        reason: result.reason ?? null,
        paymentId: logValue(result.paymentId) ?? requestContext.paymentId,
        paymentStatus: logValue(result.paymentStatus),
        orderId: logValue(result.externalReference),
      });

      return response.status(200).json(result);
    } catch (error) {
      console.error("[mercadopago.webhook] Processing failed", {
        error: error instanceof Error ? error.message : "unknown error",
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao processar webhook do Mercado Pago",
      });
    }
  }
}
