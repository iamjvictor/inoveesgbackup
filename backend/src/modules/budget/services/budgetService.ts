import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { BudgetRepository } from "../repositories/budgetRepository.js";
import { prisma } from "../../../lib/prisma.js";
import { getBudgetProposalPriceCents } from "../budgetPricing.js";

const authRepository = new AuthRepository();
const budgetRepository = new BudgetRepository();

const PRODUCT_CODE_ALIASES: Record<string, string> = {
  "diag-estrat": "full-diagnostic",
  "diag-consultoria": "diag-consultoria",
  "assessoria-completa": "assessoria-completa",
};

interface CreateBudgetServiceInput {
  supabaseUserId: string;
  productCode?: string;
  items?: Array<{ id: string }>;
  months?: number;
}

export class BudgetService {
  async createRequest(input: CreateBudgetServiceInput) {
    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(input.supabaseUserId);

    if (!organizationId) {
      throw new Error("Organização não encontrada para o usuário atual.");
    }

    const membership = await prisma.organizationUser.findFirst({
      where: { organizationId, user: { supabaseUserId: input.supabaseUserId } },
      select: { userId: true },
    });
    if (!membership) {
      throw new Error("Usuário não pertence à organização informada.");
    }

    const requestedCodes = this.resolveRequestedCodes(input);

    if (requestedCodes.length === 0) {
      throw new Error("Nenhum produto válido foi informado para orçamento.");
    }

    const budgetRequests = [];

    for (const code of requestedCodes) {
      const product = await prisma.product.findUnique({
        where: { code },
      });

      if (!product) {
        throw new Error(`Produto não encontrado para orçamento: ${code}`);
      }

      const budgetRequest = await budgetRepository.create({
        organizationId,
        productId: product.id,
        requestedByUserId: membership.userId,
        status: "SOLICITADO",
        months: input.months,
      });

      budgetRequests.push(budgetRequest);
    }

    return budgetRequests.length === 1 ? budgetRequests[0] : budgetRequests;
  }

  async listByUser(supabaseUserId: string) {
    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      throw new Error("Organização não encontrada para o usuário atual.");
    }

    const membership = await prisma.organizationUser.findFirst({
      where: { organizationId, user: { supabaseUserId } },
      select: { userId: true },
    });
    if (!membership) {
      throw new Error("Usuário não pertence à organização informada.");
    }

    return budgetRepository.findByOrganizationId(organizationId, membership.userId);
  }

  async acceptRequest(id: string, supabaseUserId: string) {
    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      throw new Error("Organização não encontrada para o usuário atual.");
    }

    const membership = await this.findMembership(organizationId, supabaseUserId);

    const budget = await prisma.budgetRequest.findFirst({
      where: { id, organizationId, requestedByUserId: membership.userId },
      include: {
        product: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!budget) {
      throw new Error("Solicitação de orçamento não encontrada.");
    }

    const priceCents = getBudgetProposalPriceCents(
      budget.status,
      budget.proposedPriceCents,
      budget.product?.service?.basePriceCents,
    );
    if (priceCents === undefined || priceCents === null) {
      throw new Error("Preço da proposta comercial ainda não foi definido pelo administrador.");
    }

    // Check if an order already exists for this budget request
    const checkoutKey = `BUDGET:${budget.id}`;
    const checkoutExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pendingOrders = await prisma.order.findMany({
      where: {
        organizationId,
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: { gt: new Date() },
        items: {
          some: {
            metadata: {
              path: ["budgetRequestId"],
              equals: budget.id,
            },
          },
        },
      },
      include: {
        items: true,
      },
    });

    const existingOrder = pendingOrders[0];

    let order = existingOrder;
    if (!order) {
      try {
        order = await prisma.order.create({
          data: {
          organizationId,
          orderType: "ONE_TIME",
          status: "PENDING_PAYMENT",
          checkoutKey,
          checkoutExpiresAt,
          totalCents: priceCents,
          items: {
            create: {
              productId: budget.productId,
              quantity: 1,
              unitPriceCents: priceCents,
              metadata: {
                budgetRequestId: budget.id,
                months: budget.months,
              },
            },
          },
          },
          include: {
          items: true,
          },
        });
      } catch (error) {
        if (!(typeof error === "object" && error !== null && "code" in error && error.code === "P2002")) throw error;
        const concurrentOrder = await prisma.order.findFirst({
          where: { organizationId, checkoutKey, status: "PENDING_PAYMENT", checkoutExpiresAt: { gt: new Date() } },
          include: { items: true },
        });
        if (!concurrentOrder) throw error;
        order = concurrentOrder;
      }
    }

    const { env } = await import("../../../config/env.js");
    const { createMercadoPagoPreference } = await import("../../../lib/mercadopago.js");

    const backUrls = {
      success: `${env.frontendUrl}/app/meus-servicos?success=true&budgetId=${budget.id}`,
      failure: `${env.frontendUrl}/app/meus-servicos?error=true&budgetId=${budget.id}`,
      pending: `${env.frontendUrl}/app/meus-servicos?pending=true&budgetId=${budget.id}`,
    };

    const { checkoutUrl } = await createMercadoPagoPreference({
      title: budget.product.name,
      description: `Pagamento da proposta para o serviço: ${budget.product.name}`,
      unitPrice: priceCents / 100,
      quantity: 1,
      externalReference: order.id,
      metadata: {
        orderId: order.id,
        organizationId,
        budgetRequestId: budget.id,
      },
      backUrls,
    });

    const updatedBudget = await prisma.budgetRequest.update({
      where: { id },
      data: { status: "ACEITO" },
    });

    return {
      budget: updatedBudget,
      checkoutUrl,
    };
  }

  async declineRequest(id: string, supabaseUserId: string) {
    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      throw new Error("Organização não encontrada para o usuário atual.");
    }

    const membership = await this.findMembership(organizationId, supabaseUserId);

    const budget = await prisma.budgetRequest.findFirst({
      where: { id, organizationId, requestedByUserId: membership.userId },
    });

    if (!budget) {
      throw new Error("Solicitação de orçamento não encontrada.");
    }

    return prisma.budgetRequest.update({
      where: { id },
      data: { status: "RECUSADO" },
    });
  }

  private resolveRequestedCodes(input: CreateBudgetServiceInput) {
    if (input.productCode) {
      return [PRODUCT_CODE_ALIASES[input.productCode] ?? input.productCode];
    }

    const requestedItems = input.items ?? [];
    return requestedItems
      .map((item) => PRODUCT_CODE_ALIASES[item.id] ?? item.id)
      .filter((code) => code.length > 0);
  }

  private async findMembership(organizationId: string, supabaseUserId: string) {
    const membership = await prisma.organizationUser.findFirst({
      where: { organizationId, user: { supabaseUserId } },
      select: { userId: true },
    });

    if (!membership) {
      throw new Error("Usuário não pertence à organização informada.");
    }

    return membership;
  }
}
