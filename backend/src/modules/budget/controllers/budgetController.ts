import type { Request, Response } from "express";
import { z } from "zod";
import { BudgetService } from "../services/budgetService.js";

const budgetService = new BudgetService();

const createBudgetSchema = z.object({
  productCode: z.string().trim().min(1).optional(),
  items: z.array(z.object({ id: z.string().trim().min(1) })).optional(),
  months: z.number().int().positive().optional(),
}).refine((data) => Boolean(data.productCode || (data.items?.length ?? 0) > 0), {
  message: "Informe um produto válido para orçamento",
});

export class BudgetController {
  async create(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    console.info("[budget.create] Request received", {
      supabaseUserId,
    });

    try {
      const input = createBudgetSchema.parse(request.body);
      const result = await budgetService.createRequest({
        supabaseUserId,
        productCode: input.productCode,
        items: input.items,
        months: input.months,
      });

      console.info("[budget.create] Request completed", {
        supabaseUserId,
        id: Array.isArray(result) ? result.map((item) => item.id) : result.id,
      });

      return response.status(201).json(result);
    } catch (error) {
      console.error("[budget.create] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async list(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const result = await budgetService.listByUser(supabaseUserId);
      return response.json(result);
    } catch (error) {
      console.error("[budget.list] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async accept(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { id } = request.params;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const result = await budgetService.acceptRequest(id, supabaseUserId);
      return response.json(result);
    } catch (error) {
      return response.status(400).json({
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }

  async decline(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { id } = request.params;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "User not authenticated" });
    }

    try {
      const result = await budgetService.declineRequest(id, supabaseUserId);
      return response.json(result);
    } catch (error) {
      return response.status(400).json({
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }
}
