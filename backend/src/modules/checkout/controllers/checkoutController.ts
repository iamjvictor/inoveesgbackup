import type { Request, Response } from "express";
import { CheckoutService } from "../services/checkoutService.js";
import { z } from "zod";

const checkoutService = new CheckoutService();

const createPreferenceSchema = z.object({
  productCode: z.enum(["PRE_DIAGNOSTIC", "PRE_DIAGNOSTIC_PLUS", "FULL_DIAGNOSTIC", "FULL_DIAGNOSTIC_PLUS", "INVITE_PACK", "LIVRO_ESG", "CONSULTING_1H", "BIOIMPACTO_EMPRESARIAL"]),
  quantity: z.number().int().positive().optional().default(1),
  budgetId: z.string().uuid().optional(),
});

export class CheckoutController {
  async getCatalogPrices(request: Request, response: Response) {
    try {
      const prices = await checkoutService.getCatalogPrices((request as any).user?.id);
      return response.json({ prices });
    } catch (error) {
      console.error("[checkout.catalogPrices] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      return response.status(500).json({ message: "Não foi possível carregar os preços dos produtos." });
    }
  }

  async getPendingOrder(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const order = await checkoutService.getPendingOrder(supabaseUserId);
      return response.json(order);
    } catch (error) {
      console.error("[checkout.pendingOrder] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      return response.status(500).json({ message: "Não foi possível verificar pedidos em aberto." });
    }
  }

  async cancelOrder(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const parsedId = z.string().uuid().safeParse(request.params.id);
    if (!parsedId.success) {
      return response.status(400).json({ message: "Identificador de pedido inválido" });
    }

    try {
      const result = await checkoutService.cancelOrder(supabaseUserId, parsedId.data);
      return response.json(result);
    } catch (error) {
      console.error("[checkout.cancelOrder] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      const message = error instanceof Error ? error.message : "Erro ao cancelar pedido";
      if (message === "Pedido não encontrado") {
        return response.status(404).json({ message });
      }
      return response.status(400).json({ message });
    }
  }

  async getOrderDetails(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const parsedId = z.string().uuid().safeParse(request.params.id);
    if (!parsedId.success) {
      return response.status(400).json({ message: "Identificador de pedido inválido" });
    }

    try {
      const order = await checkoutService.getOrderDetails(supabaseUserId, parsedId.data);
      if (!order) return response.status(404).json({ message: "Pedido não encontrado" });
      return response.json(order);
    } catch (error) {
      console.error("[checkout.orderDetails] Request failed", {
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof Error && error.message === "Empresa não encontrada para o usuário atual") {
        return response.status(404).json({ message: "Pedido não encontrado" });
      }
      return response.status(500).json({ message: "Não foi possível carregar os dados do pedido." });
    }
  }

  async createPreference(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const parsedBody = createPreferenceSchema.parse(request.body);
      const { productCode, quantity, budgetId } = parsedBody;

      console.info("[checkout.controller.createPreference] Request received", {
        supabaseUserId,
        productCode,
        quantity,
      });

      const session = await checkoutService.createPreference(supabaseUserId, productCode, quantity, budgetId);
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
