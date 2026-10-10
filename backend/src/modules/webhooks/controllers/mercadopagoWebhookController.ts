import type { Request, Response } from "express";
import { MercadoPagoWebhookService } from "../services/mercadopagoWebhookService.js";

const mercadopagoWebhookService = new MercadoPagoWebhookService();

export class MercadoPagoWebhookController {
  async handle(request: Request, response: Response) {
    try {
      const result = await mercadopagoWebhookService.handleWebhook(
        request.body ?? {},
        {
          "x-request-id": request.header("x-request-id") ?? null,
          "x-signature": request.header("x-signature") ?? null,
          "x-trace-id": request.header("x-trace-id") ?? null,
          "user-agent": request.header("user-agent") ?? null,
        }
      );

      return response.status(200).json(result);
    } catch (error) {
      console.error("[mercadopago.webhook] Processing failed", {
        error: error instanceof Error ? error.message : error,
        body: request.body,
        headers: {
          "x-request-id": request.header("x-request-id") ?? null,
          "x-signature": request.header("x-signature") ?? null,
          "x-trace-id": request.header("x-trace-id") ?? null,
          "user-agent": request.header("user-agent") ?? null,
        },
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao processar webhook do Mercado Pago",
      });
    }
  }
}
