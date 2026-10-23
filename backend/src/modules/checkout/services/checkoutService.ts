import { prisma } from "../../../lib/prisma.js";
import { env } from "../../../config/env.js";
import { createMercadoPagoPreference } from "../../../lib/mercadopago.js";
import { DiagnosticRepository } from "../../diagnostic/repositories/diagnosticRepository.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { InviteRepository } from "../../invite/repositories/inviteRepository.js";
import { invalidateCurrentDiagnosticCache } from "../../diagnostic/services/diagnosticCache.js";
import type { Order, OrderItem, Product } from "@prisma/client";

const CHECKOUT_TTL_HOURS = 24;

function checkoutExpiry() {
  return new Date(Date.now() + CHECKOUT_TTL_HOURS * 60 * 60 * 1000);
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export type CheckoutProductCode = "PRE_DIAGNOSTIC" | "PRE_DIAGNOSTIC_PLUS" | "FULL_DIAGNOSTIC" | "FULL_DIAGNOSTIC_PLUS" | "INVITE_PACK" | "LIVRO_ESG" | "CONSULTING_1H";

export type CheckoutPreferenceResult = {
  checkoutUrl: string;
  orderId: string;
  productCode: CheckoutProductCode;
  totalCents: number;
  diagnosticId?: string;
};

const CATALOG_PRICE_PRODUCT_CODES = [
  "PRE_DIAGNOSTIC",
  "PRE_DIAGNOSTIC_PLUS",
  "FULL_DIAGNOSTIC",
  "FULL_DIAGNOSTIC_PLUS",
  "CONSULTING_1H",
  "LIVRO_ESG",
] as const;

const diagnosticRepository = new DiagnosticRepository();
const authRepository = new AuthRepository();
const inviteRepository = new InviteRepository();

type PendingOrderWithItems = Order & {
  items: Array<OrderItem & { product: Product }>;
};

export function resolveCheckoutLabels(productCode: CheckoutProductCode) {
  switch (productCode) {
    case "PRE_DIAGNOSTIC":
      return {
        title: "Pré-Diagnóstico ESG",
        description: "Pagamento do acesso ao Pré-Diagnóstico ESG",
      };
    case "PRE_DIAGNOSTIC_PLUS":
      return {
        title: "Pré-Diagnóstico ESG + Consultoria",
        description: "Pagamento do acesso ao Pré-Diagnóstico ESG + 1h Consultoria",
      };
    case "FULL_DIAGNOSTIC":
      return {
        title: "Diagnóstico Estratégico ESG",
        description: "Diagnóstico estratégico ESG com análise de evidências, plano de melhoria e selo de verificação.",
      };
    case "FULL_DIAGNOSTIC_PLUS":
      return {
        title: "Diagnóstico Estratégico ESG + Consultoria",
        description: "Diagnóstico estratégico ESG com análise de evidências, plano de melhoria, selo de verificação e duas consultorias de 1 hora.",
      };
    case "INVITE_PACK":
      return {
        title: "Pacote de Convites",
        description: "Compra de pacote de convites para o diagnóstico ESG",
      };
    case "LIVRO_ESG":
      return {
        title: "Livro Bioeconomia & ESG",
        description: "Compra do livro digital Bioeconomia & ESG",
      };
    case "CONSULTING_1H":
      return {
        title: "Consultoria ESG — Call de 1 hora",
        description: "Sessão individual de consultoria ESG com duração de 1 hora.",
      };
  }
}

function buildBackUrls(budgetId?: string) {
  const base = `${env.frontendUrl.replace(/\/$/, "")}/app/meus-servicos`;
  const budgetParam = budgetId ? `&budgetId=${budgetId}` : "";
  return {
    success: `${base}?success=true${budgetParam}`,
    failure: `${base}?error=true${budgetParam}`,
    pending: `${base}?pending=true${budgetParam}`,
  };
}

function getDiagnosticIdFromOrder(order: PendingOrderWithItems) {
  for (const item of order.items) {
    const metadata = item.metadata as Record<string, unknown> | null;
    if (typeof metadata?.diagnosticId === "string" && metadata.diagnosticId.trim()) {
      return metadata.diagnosticId.trim();
    }
  }

  return null;
}

export class CheckoutService {
  async getCatalogPrices(): Promise<Record<string, number>> {
    const products = await prisma.product.findMany({
      where: {
        code: { in: [...CATALOG_PRICE_PRODUCT_CODES] },
        active: true,
      },
      select: {
        code: true,
        priceCents: true,
      },
    });

    return Object.fromEntries(
      products
        .filter((product): product is typeof product & { priceCents: number } => product.priceCents !== null)
        .map((product) => [product.code, product.priceCents]),
    );
  }

  private async resolveOrganizationId(supabaseUserId: string): Promise<string> {
    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    return organizationId;
  }

  private async clearCheckoutCache(organizationId: string) {
    await invalidateCurrentDiagnosticCache(organizationId);
  }

  private async getPricedProduct(productCode: Exclude<CheckoutProductCode, "INVITE_PACK">) {
    const product = await prisma.product.findUnique({
      where: { code: productCode },
    });

    if (!product) {
      throw new Error(`Produto não encontrado no catálogo: ${productCode}`);
    }

    if (product.priceCents == null || product.priceCents < 0) {
      throw new Error(`Preço não cadastrado para o produto: ${productCode}`);
    }

    return {
      product,
      labels: resolveCheckoutLabels(productCode),
      priceCents: product.priceCents,
    };
  }

  private async findPendingOrderByProduct(organizationId: string, orderType: "ONE_TIME" | "INVITE_PACK", productCode: string, quantity = 1) {
    const checkoutKey = `${productCode}:${quantity}`;
    const now = new Date();

    await prisma.order.updateMany({
      where: {
        organizationId,
        checkoutKey,
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: { lte: now },
      },
      data: { status: "EXPIRED", canceledAt: now },
    });

    return prisma.order.findFirst({
      where: {
        organizationId,
        checkoutKey,
        orderType,
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: { gt: now },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as Promise<PendingOrderWithItems | null>;
  }

  async createPreference(
    supabaseUserId: string,
    productCode: CheckoutProductCode,
    quantity = 1
  ): Promise<CheckoutPreferenceResult> {
    const organizationId = await this.resolveOrganizationId(supabaseUserId);

    console.info("[checkout.service.createPreference] Creating preference", {
      supabaseUserId,
      organizationId,
      productCode,
      quantity,
    });

    await this.clearCheckoutCache(organizationId);

    if (productCode === "INVITE_PACK") {
      return this.createInvitePackPreference(organizationId, quantity, productCode);
    }

    if (productCode === "LIVRO_ESG" || productCode === "CONSULTING_1H") {
      return this.createOneTimePreference(organizationId, productCode);
    }

    return this.createDiagnosticPreference(organizationId, productCode);
  }

  private async createOneTimePreference(
    organizationId: string,
    productCode: "LIVRO_ESG" | "CONSULTING_1H"
  ): Promise<CheckoutPreferenceResult> {
    const { product, labels, priceCents } = await this.getPricedProduct(productCode);

    if (productCode === "CONSULTING_1H") {
      await prisma.service.upsert({
        where: { productId: product.id },
        create: {
          productId: product.id,
          pricingType: "FIXED",
          basePriceCents: priceCents,
          currency: "BRL",
          requiresApproval: false,
          durationMinutes: 60,
        },
        update: {
          pricingType: "FIXED",
          basePriceCents: priceCents,
          durationMinutes: 60,
        },
      });
    }

    const existingOrder = await this.findPendingOrderByProduct(organizationId, "ONE_TIME", productCode, 1);
    let order = existingOrder;
    let createdNewOrder = !existingOrder;
    if (!order) {
      try {
        order = await prisma.order.create({
      data: {
        organizationId,
        orderType: "ONE_TIME",
        status: "PENDING_PAYMENT",
        checkoutKey: `${productCode}:1`,
        checkoutExpiresAt: checkoutExpiry(),
        totalCents: priceCents,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPriceCents: priceCents,
            metadata: {
              productCode,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
        }) as PendingOrderWithItems;
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
        order = await this.findPendingOrderByProduct(organizationId, "ONE_TIME", productCode, 1);
        if (!order) throw error;
        createdNewOrder = false;
      }
    }

    try {
      const { checkoutUrl } = await createMercadoPagoPreference({
        title: labels.title,
        description: labels.description,
        unitPrice: order.totalCents / 100,
        quantity: 1,
        externalReference: order.id,
        metadata: {
          orderId: order.id,
          organizationId,
          productCode,
        },
        backUrls: buildBackUrls(),
      });

      return {
        checkoutUrl,
        orderId: order.id,
        productCode,
        totalCents: order.totalCents,
      };
    } catch (error) {
      console.error("[checkout.service.createBookPreference] Failed, rolling back pending record", {
        orderId: order.id,
        productCode,
        error: error instanceof Error ? error.message : error,
      });

      if (createdNewOrder) {
        await prisma.order.delete({ where: { id: order.id } });
      }

      throw error;
    }
  }

  private async createDiagnosticPreference(
    organizationId: string,
    productCode: Exclude<CheckoutProductCode, "INVITE_PACK" | "LIVRO_ESG">
  ): Promise<CheckoutPreferenceResult> {
    const { product, labels, priceCents } = await this.getPricedProduct(productCode);

    const existingOrder = await this.findPendingOrderByProduct(organizationId, "ONE_TIME", productCode, 1);
    let diagnosticId: string | null = existingOrder ? getDiagnosticIdFromOrder(existingOrder) : null;

    if (!existingOrder) {
      const diagnostic = productCode === "FULL_DIAGNOSTIC" || productCode === "FULL_DIAGNOSTIC_PLUS"
        ? await diagnosticRepository.createDraftDiagnostic(organizationId, undefined, "FULL_DIAGNOSTIC", "PENDING_PAYMENT")
        : await diagnosticRepository.createPreDiagnostic(organizationId, "PENDING_PAYMENT");
      diagnosticId = diagnostic.id;

      let createdOrder: PendingOrderWithItems;
      try {
        createdOrder = await prisma.order.create({
        data: {
          organizationId,
          orderType: "ONE_TIME",
          status: "PENDING_PAYMENT",
          checkoutKey: `${productCode}:1`,
          checkoutExpiresAt: checkoutExpiry(),
          totalCents: priceCents,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPriceCents: priceCents,
              metadata: {
                diagnosticId: diagnostic.id,
                productCode,
              },
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        }) as PendingOrderWithItems;
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
        await prisma.diagnostic.delete({ where: { id: diagnostic.id } });
        const concurrentOrder = await this.findPendingOrderByProduct(organizationId, "ONE_TIME", productCode, 1);
        if (!concurrentOrder) throw error;
        return this.createCheckoutPreferenceFromOrder({
          order: concurrentOrder,
          labels,
          productCode,
          diagnosticId: getDiagnosticIdFromOrder(concurrentOrder),
          organizationId,
          createdNewOrder: false,
        });
      }

      return this.createCheckoutPreferenceFromOrder({
        order: createdOrder,
        labels,
        productCode,
        diagnosticId,
        organizationId,
        createdNewOrder: true,
      });
    }

    return this.createCheckoutPreferenceFromOrder({
      order: existingOrder,
      labels,
      productCode,
      diagnosticId,
      organizationId,
      createdNewOrder: false,
    });
  }

  private async createCheckoutPreferenceFromOrder(params: {
    order: PendingOrderWithItems;
    labels: ReturnType<typeof resolveCheckoutLabels>;
    productCode: Exclude<CheckoutProductCode, "INVITE_PACK" | "LIVRO_ESG">;
    diagnosticId: string | null;
    organizationId: string;
    createdNewOrder: boolean;
  }): Promise<CheckoutPreferenceResult> {
    const { order, labels, productCode, diagnosticId, organizationId, createdNewOrder } = params;

    try {
      const { checkoutUrl } = await createMercadoPagoPreference({
        title: labels.title,
        description: labels.description,
        unitPrice: order.totalCents / 100,
        quantity: 1,
        externalReference: order.id,
        metadata: {
          orderId: order.id,
          diagnosticId,
          organizationId,
          productCode,
        },
        backUrls: buildBackUrls(),
      });

      return {
        checkoutUrl,
        orderId: order.id,
        diagnosticId: diagnosticId ?? undefined,
        productCode,
        totalCents: order.totalCents,
      };
    } catch (error) {
      console.error("[checkout.service.createDiagnosticPreference] Failed, rolling back pending records", {
        diagnosticId,
        orderId: order.id,
        productCode,
        error: error instanceof Error ? error.message : error,
      });

      if (createdNewOrder && diagnosticId) {
        await prisma.diagnostic.delete({ where: { id: diagnosticId } });
      }

      if (createdNewOrder && order.id && order.status === "PENDING_PAYMENT") {
        await prisma.order.delete({ where: { id: order.id } });
      }

      throw error;
    }
  }

  private async createInvitePackPreference(
    organizationId: string,
    quantity: number,
    productCode: CheckoutProductCode
  ): Promise<CheckoutPreferenceResult> {
    const isValidQuantity =
      (quantity >= 15 && quantity <= 30) ||
      (quantity >= 31 && quantity <= 50) ||
      (quantity >= 51 && quantity <= 70) ||
      (quantity >= 71 && quantity <= 90) ||
      quantity === 100;

    if (!isValidQuantity) {
      throw new Error("Quantidade de convites inválida para as faixas de pacotes disponíveis.");
    }

    const pricePerInvite = 5000;
    const totalCents = quantity * pricePerInvite;
    const order = await inviteRepository.createInviteOrder(organizationId, quantity, totalCents);

    try {
      const { checkoutUrl } = await createMercadoPagoPreference({
        title: "Pacote de Convites",
        description: `Compra de ${quantity} convites para o diagnóstico ESG`,
        unitPrice: totalCents / 100,
        quantity: 1,
        externalReference: order.id,
        metadata: {
          orderId: order.id,
          organizationId,
          quantity,
          totalCents,
          productCode,
        },
        backUrls: buildBackUrls(),
      });

      return {
        checkoutUrl,
        orderId: order.id,
        productCode,
        totalCents,
      };
    } catch (error) {
      console.error("[checkout.service.createInvitePackPreference] Failed, rolling back pending order", {
        orderId: order.id,
        organizationId,
        quantity,
        error: error instanceof Error ? error.message : error,
      });

      await inviteRepository.deleteOrder(order.id);

      throw error;
    }
  }

  async confirmPayment(orderId: string, success: boolean): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error(`Pedido ${orderId} não encontrado`);
    }

    if (order.status !== "PENDING_PAYMENT") {
      return order;
    }

    if (order.orderType === "INVITE_PACK") {
      const { InviteService } = await import("../../invite/services/inviteService.js");
      const inviteService = new InviteService();
      return inviteService.confirmPayment(orderId, success ? "success" : "failure");
    }

    if (success) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      const diagnosticId = order.items.find((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        return typeof metadata?.diagnosticId === "string";
      })?.metadata as Record<string, unknown> | null;

      const resolvedDiagnosticId = typeof diagnosticId?.diagnosticId === "string"
        ? diagnosticId.diagnosticId
        : null;

      if (resolvedDiagnosticId) {
        await prisma.diagnostic.update({
          where: { id: resolvedDiagnosticId },
          data: {
            status: "ACTIVE",
          },
        });
      }

      // Check for budgetRequestId in order items metadata
      const budgetRequestItem = order.items.find((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        return typeof metadata?.budgetRequestId === "string";
      });

      const budgetRequestId = budgetRequestItem
        ? (budgetRequestItem.metadata as Record<string, unknown>).budgetRequestId as string
        : null;

      if (budgetRequestId) {
        await prisma.budgetRequest.update({
          where: { id: budgetRequestId },
          data: {
            status: "ATIVO",
          },
        });
      }

      await authRepository.promoteOrganizationToCompany(order.organizationId);
      await authRepository.invalidateUserCachesForOrganization(order.organizationId);

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "MERCADOPAGO",
          providerReference: `pay-order-${order.id}-${Date.now()}`,
          method: "PIX",
          status: "PAID",
          amountCents: order.totalCents,
          paidAt: new Date(),
        },
      });

      return updatedOrder;
    } else {
      const canceledOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          canceledAt: new Date(),
        },
      });

      const diagnosticId = order.items.find((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        return typeof metadata?.diagnosticId === "string";
      })?.metadata as Record<string, unknown> | null;

      const resolvedDiagnosticId = typeof diagnosticId?.diagnosticId === "string"
        ? diagnosticId.diagnosticId
        : null;

      if (resolvedDiagnosticId) {
        await prisma.diagnostic.update({
          where: { id: resolvedDiagnosticId },
          data: {
            status: "CANCELED",
          },
        });
      }

      await authRepository.invalidateUserCachesForOrganization(order.organizationId);

      return canceledOrder;
    }
  }
}
