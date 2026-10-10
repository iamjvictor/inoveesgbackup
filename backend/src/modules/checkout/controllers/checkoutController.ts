import type { Request, Response } from "express";
import { CheckoutService } from "../services/checkoutService.js";
import { z } from "zod";

const checkoutService = new CheckoutService();

const createPreferenceSchema = z.object({
  productCode: z.enum(["PRE_DIAGNOSTIC", "PRE_DIAGNOSTIC_PLUS", "FULL_DIAGNOSTIC", "FULL_DIAGNOSTIC_PLUS", "INVITE_PACK", "LIVRO_ESG", "CONSULTING_1H"]),
  quantity: z.number().int().positive().optional().default(1),
});

export class CheckoutController {
  async getCatalogPrices(_request: Request, response: Response) {
    try {
      const prices = await checkoutService.getCatalogPrices();
      return response.json({ prices });
    } catch (error) {
      console.error("[checkout.catalogPrices] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      return response.status(500).json({ message: "Não foi possível carregar os preços dos produtos." });
    }
  }

  async createPreference(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const parsedBody = createPreferenceSchema.parse(request.body);
      const { productCode, quantity } = parsedBody;

      console.info("[checkout.controller.createPreference] Request received", {
        supabaseUserId,
        productCode,
        quantity,
      });

      const session = await checkoutService.createPreference(supabaseUserId, productCode, quantity);
      return response.status(201).json(session);
    } catch (error) {
      console.error("[checkout.createPreference] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          message: "Parâmetros de requisição inválidos",
          errors: error.errors,
        });
      }

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao processar checkout",
      });
    }
  }
}
