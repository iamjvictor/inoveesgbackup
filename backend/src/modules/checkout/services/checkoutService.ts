import { prisma } from "../../../lib/prisma.js";
import { env } from "../../../config/env.js";
import { createMercadoPagoPreference, type MercadoPagoPayer } from "../../../lib/mercadopago.js";
import { DiagnosticRepository } from "../../diagnostic/repositories/diagnosticRepository.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { InviteRepository } from "../../invite/repositories/inviteRepository.js";
import { invalidateCurrentDiagnosticCache } from "../../diagnostic/services/diagnosticCache.js";
import type { Order, OrderItem, Product } from "@prisma/client";
import { getBioimpactoPriceCents } from "./bioimpactoPricing.js";

const CHECKOUT_TTL_HOURS = 24;

function checkoutExpiry() {
  return new Date(Date.now() + CHECKOUT_TTL_HOURS * 60 * 60 * 1000);
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export type CheckoutProductCode = "PRE_DIAGNOSTIC" | "PRE_DIAGNOSTIC_PLUS" | "FULL_DIAGNOSTIC" | "FULL_DIAGNOSTIC_PLUS" | "INVITE_PACK" | "LIVRO_ESG" | "CONSULTING_1H" | "BIOIMPACTO_EMPRESARIAL";

export type CheckoutPreferenceResult = {
  checkoutUrl: string;
  orderId: string;
  productCode: CheckoutProductCode;
  totalCents: number;
  diagnosticId?: string;
};

export type CheckoutOrderDetails = {
  id: string;
  status: Order["status"];
  totalCents: number;
  createdAt: Date;
  paidAt: Date | null;
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>;
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
    case "BIOIMPACTO_EMPRESARIAL":
      return { title: "Plano 2.2 — Bioimpacto Empresarial", description: "Diagnóstico estratégico e acompanhamento ESG por 12 meses." };
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

export function buildBackUrls(orderId: string, budgetId?: string) {
  const frontBase = env.frontendUrl.replace(/\/$/, "");
  const query = new URLSearchParams({ orderId });
  if (budgetId) query.set("budgetId", budgetId);
  const qStr = query.toString();
  return {
    success: `${frontBase}/app/checkout/success?${qStr}`,
    pending: `${frontBase}/app/checkout/pending?${qStr}`,
    failure: `${frontBase}/app/checkout/failure?${qStr}`,
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
  async getCatalogPrices(supabaseUserId?: string): Promise<Record<string, number>> {
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

    const prices = Object.fromEntries(
      products
        .filter((product): product is typeof product & { priceCents: number } => product.priceCents !== null)
        .map((product) => [product.code, product.priceCents]),
    );
    if (supabaseUserId) {
      const organizationId = await this.resolveOrganizationId(supabaseUserId);
      const organization = await prisma.organization.findUnique({ where: { id: organizationId },
        select: { porte: true, annualRevenue: true, size: true, numberOfSuppliers: true } });
      const bioimpactoPrice = organization ? getBioimpactoPriceCents(organization) : null;
      if (bioimpactoPrice !== null) prices.BIOIMPACTO_EMPRESARIAL = bioimpactoPrice;
    }
    return prices;
  }

  private async resolveOrganizationId(supabaseUserId: string): Promise<string> {
    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    return organizationId;
  }

  async getOrderDetails(supabaseUserId: string, orderId: string): Promise<CheckoutOrderDetails | null> {
    const organizationId = await this.resolveOrganizationId(supabaseUserId);
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        paidAt: true,
        items: {
          select: {
            quantity: true,
            unitPriceCents: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) return null;
    return {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
    };
  }

  async getPendingOrder(supabaseUserId: string): Promise<CheckoutOrderDetails | null> {
    const organizationId = await this.resolveOrganizationId(supabaseUserId);
    const now = new Date();

    await prisma.order.updateMany({
      where: {
        organizationId,
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: { lte: now },
      },
      data: { status: "EXPIRED", canceledAt: now },
    });

    const order = await prisma.order.findFirst({
      where: {
        organizationId,
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: { gt: now },
      },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        paidAt: true,
        items: {
          select: {
            quantity: true,
            unitPriceCents: true,
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!order) return null;
    return {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
    };
  }

  async cancelOrder(supabaseUserId: string, orderId: string): Promise<{ success: boolean; id: string; status: string }> {
    const organizationId = await this.resolveOrganizationId(supabaseUserId);

    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.status === "PAID") {
      throw new Error("Não é possível cancelar um pedido já pago");
    }

    if (order.status === "CANCELED") {
      return { success: true, id: order.id, status: "CANCELED" };
    }

    const now = new Date();
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELED",
        canceledAt: now,
        checkoutKey: null,
      },
    });

    for (const item of order.items) {
      const metadata = item.metadata as Record<string, unknown> | null;
      if (typeof metadata?.diagnosticId === "string" && metadata.diagnosticId.trim()) {
        await prisma.diagnostic.deleteMany({
          where: {
            id: metadata.diagnosticId.trim(),
            organizationId,
            status: "PENDING_PAYMENT",
          },
        }).catch(() => undefined);
      }
    }

    await this.clearCheckoutCache(organizationId);

    return { success: true, id: order.id, status: "CANCELED" };
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

  private async resolvePayer(supabaseUserId: string): Promise<MercadoPagoPayer | undefined> {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: {
        email: true,
        fullName: true,
        cpf: true,
        phone: true,
      },
    });

    if (!user || !user.email) return undefined;

    const names = (user.fullName || "").trim().split(/\s+/);
    const name = names[0] || undefined;
    const surname = names.length > 1 ? names.slice(1).join(" ") : undefined;
    const cleanCpf = (user.cpf || "").replace(/\D/g, "");

    return {
      email: user.email,
      name,
      surname,
      ...(cleanCpf.length === 11
        ? {
            identification: {
              type: "CPF",
              number: cleanCpf,
            },
          }
        : {}),
    };
  }

  async createPreference(
    supabaseUserId: string,
    productCode: CheckoutProductCode,
    quantity = 1,
    budgetId?: string,
  ): Promise<CheckoutPreferenceResult> {
    const organizationId = await this.resolveOrganizationId(supabaseUserId);

    console.info("[checkout.service.createPreference] Creating preference", {
      supabaseUserId,
      organizationId,
      productCode,
      quantity,
    });

    await this.clearCheckoutCache(organizationId);

    const payer = await this.resolvePayer(supabaseUserId);

    if (productCode === "INVITE_PACK") {
      return this.createInvitePackPreference(organizationId, quantity, productCode, budgetId, payer);
    }

    if (productCode === "BIOIMPACTO_EMPRESARIAL") {
      return this.createBioimpactoPreference(organizationId, budgetId, payer);
    }

    if (productCode === "LIVRO_ESG" || productCode === "CONSULTING_1H") {
      return this.createOneTimePreference(organizationId, productCode, budgetId, payer);
    }

    return this.createDiagnosticPreference(organizationId, productCode, budgetId, payer);
  }

  private async createOneTimePreference(
    organizationId: string,
    productCode: "LIVRO_ESG" | "CONSULTING_1H",
    budgetId?: string,
    payer?: MercadoPagoPayer,
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
        payer,
        backUrls: buildBackUrls(order.id, budgetId),
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

  private async createBioimpactoPreference(
    organizationId: string,
    budgetId?: string,
    payer?: MercadoPagoPayer,
  ): Promise<CheckoutPreferenceResult> {
    const [organization, product] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { porte: true, annualRevenue: true, size: true, numberOfSuppliers: true },
      }),
      prisma.product.findUnique({ where: { code: "BIOIMPACTO_EMPRESARIAL" } }),
    ]);
    if (!organization || !product?.active) throw new Error("Plano 2.2 indisponível");
    const priceCents = getBioimpactoPriceCents(organization);
    if (priceCents === null) throw new Error("Complete o perfil da empresa para calcular o valor do Plano 2.2");

    const existing = await prisma.order.findFirst({
      where: { organizationId, orderType: "SUBSCRIPTION", status: "PENDING_PAYMENT", checkoutExpiresAt: { gt: new Date() }, totalCents: priceCents,
        items: { some: { productId: product.id } } },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }) as PendingOrderWithItems | null;
    if (existing) return this.createCheckoutPreferenceFromOrder({
      order: existing, labels: resolveCheckoutLabels("BIOIMPACTO_EMPRESARIAL"), productCode: "BIOIMPACTO_EMPRESARIAL",
      diagnosticId: getDiagnosticIdFromOrder(existing), organizationId, createdNewOrder: false, budgetId, payer,
    });

    const diagnostic = await diagnosticRepository.createDraftDiagnostic(organizationId, undefined, "FULL_DIAGNOSTIC", "PENDING_PAYMENT");
    const order = await prisma.order.create({
      data: { organizationId, orderType: "SUBSCRIPTION", status: "PENDING_PAYMENT", checkoutKey: `BIOIMPACTO_EMPRESARIAL:${priceCents}`,
        checkoutExpiresAt: checkoutExpiry(), totalCents: priceCents,
        items: { create: { productId: product.id, quantity: 1, unitPriceCents: priceCents,
          metadata: { diagnosticId: diagnostic.id, productCode: "BIOIMPACTO_EMPRESARIAL" } } } },
      include: { items: { include: { product: true } } },
    }) as PendingOrderWithItems;
    return this.createCheckoutPreferenceFromOrder({
      order, labels: resolveCheckoutLabels("BIOIMPACTO_EMPRESARIAL"), productCode: "BIOIMPACTO_EMPRESARIAL",
      diagnosticId: diagnostic.id, organizationId, createdNewOrder: true, budgetId, payer,
    });
  }

  private async createDiagnosticPreference(
    organizationId: string,
    productCode: Exclude<CheckoutProductCode, "INVITE_PACK" | "LIVRO_ESG">,
    budgetId?: string,
    payer?: MercadoPagoPayer,
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
          budgetId,
          payer,
        });
      }

      return this.createCheckoutPreferenceFromOrder({
        order: createdOrder,
        labels,
        productCode,
        diagnosticId,
        organizationId,
        createdNewOrder: true,
        budgetId,
        payer,
      });
    }

    return this.createCheckoutPreferenceFromOrder({
      order: existingOrder,
      labels,
      productCode,
      diagnosticId,
      organizationId,
      createdNewOrder: false,
      budgetId,
      payer,
    });
  }

  private async createCheckoutPreferenceFromOrder(params: {
    order: PendingOrderWithItems;
    labels: ReturnType<typeof resolveCheckoutLabels>;
    productCode: Exclude<CheckoutProductCode, "INVITE_PACK" | "LIVRO_ESG">;
    diagnosticId: string | null;
    organizationId: string;
    createdNewOrder: boolean;
    budgetId?: string;
    payer?: MercadoPagoPayer;
  }): Promise<CheckoutPreferenceResult> {
    const { order, labels, productCode, diagnosticId, organizationId, createdNewOrder, budgetId, payer } = params;

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
        payer,
        backUrls: buildBackUrls(order.id, budgetId),
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
    productCode: CheckoutProductCode,
    budgetId?: string,
    payer?: MercadoPagoPayer,
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
        payer,
        backUrls: buildBackUrls(order.id, budgetId),
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
    const result = await prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error(`Pedido ${orderId} não encontrado`);
      if (order.status !== "PENDING_PAYMENT") return { order, changed: false };

      const enqueuePurchaseEmail = async (eventType: "PURCHASE_CONFIRMED" | "PURCHASE_FAILED", paymentStatus: "PAID" | "FAILED" | "CANCELED") => {
        const [organization, items] = await Promise.all([
          transaction.organization.findUnique({ where: { id: order.organizationId }, select: { primaryEmail: true, legalName: true } }),
          transaction.orderItem.findMany({ where: { orderId: order.id }, include: { product: { select: { name: true } } } }),
        ]);
        if (!organization?.primaryEmail) return;
        await transaction.emailOutbox.create({
          data: {
            eventKey: `purchase:${order.id}:${paymentStatus.toLowerCase()}`,
            eventType,
            recipient: organization.primaryEmail,
            payload: {
              name: organization.legalName,
              serviceNames: items.map((item) => item.product.name),
              amountCents: order.totalCents,
              paymentStatus,
            },
          },
        });
      };

      const targetStatus = success ? "PAID" : "FAILED";
      const claim = await transaction.order.updateMany({
        where: { id: orderId, status: "PENDING_PAYMENT" },
        data: success
          ? { status: targetStatus, paidAt: new Date() }
          : { status: targetStatus, canceledAt: new Date() },
      });
      if (claim.count !== 1) {
        const current = await transaction.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!current) throw new Error(`Pedido ${orderId} não encontrado`);
        return { order: current, changed: false };
      }

      if (order.orderType === "INVITE_PACK") {
        if (success) {
          await transaction.payment.create({ data: {
            orderId: order.id,
            provider: "MERCADOPAGO",
            providerReference: `pay-invite-order-${order.id}`,
            method: "PIX",
            status: "PAID",
            amountCents: order.totalCents,
            paidAt: new Date(),
          } });
          const quantity = order.items.reduce((total, item) => {
            const metadata = item.metadata as Record<string, unknown> | null;
            return total + (typeof metadata?.quantity === "number" ? metadata.quantity : item.quantity);
          }, 0);
          await transaction.inviteWallet.upsert({
            where: { organizationId: order.organizationId },
            create: { organizationId: order.organizationId, balance: quantity },
            update: { balance: { increment: quantity } },
          });
          await transaction.inviteTransaction.create({ data: {
            organizationId: order.organizationId,
            type: "PURCHASE",
            amount: quantity,
            referenceType: "ORDER",
            referenceId: order.id,
            notes: `Compra de ${quantity} convites via Checkout Mercado Pago`,
          } });
          await transaction.organizationRole.upsert({
            where: { organizationId_role: { organizationId: order.organizationId, role: "COMPANY" } },
            update: { source: "UPGRADE", removedAt: null },
            create: { organizationId: order.organizationId, role: "COMPANY", source: "UPGRADE" },
          });
          await enqueuePurchaseEmail("PURCHASE_CONFIRMED", "PAID");
        }
        return { order: { ...order, status: targetStatus }, changed: true, invalidate: true };
      }

      if (success) {
      const bioimpactoItem = order.items.find((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        return metadata?.productCode === "BIOIMPACTO_EMPRESARIAL";
      });
      const updatedOrder = { ...order, status: "PAID" as const, paidAt: new Date() };

      const diagnosticId = order.items.find((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        return typeof metadata?.diagnosticId === "string";
      })?.metadata as Record<string, unknown> | null;

      const resolvedDiagnosticId = typeof diagnosticId?.diagnosticId === "string"
        ? diagnosticId.diagnosticId
        : null;

      if (resolvedDiagnosticId) {
        await transaction.diagnostic.update({
          where: { id: resolvedDiagnosticId },
          data: {
            status: "ACTIVE",
          },
        });
      }

      if (bioimpactoItem) {
        const plan = await transaction.plan.findUnique({ where: { productId: bioimpactoItem.productId } });
        if (!plan) throw new Error("Plano 2.2 não cadastrado para o produto pago");
        const startsAt = updatedOrder.paidAt ?? new Date();
        const endsAt = new Date(startsAt);
        endsAt.setUTCFullYear(endsAt.getUTCFullYear() + 1);
        const existingSubscription = await transaction.subscription.findFirst({ where: { orderId: order.id } });
        if (!existingSubscription) await transaction.subscription.create({
          data: { organizationId: order.organizationId, planId: plan.id, orderId: order.id, status: "ACTIVE", startsAt, endsAt },
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
        await transaction.budgetRequest.update({
          where: { id: budgetRequestId },
          data: {
            status: "ATIVO",
          },
        });
      }

      await transaction.organizationRole.upsert({
        where: { organizationId_role: { organizationId: order.organizationId, role: "COMPANY" } },
        update: { source: "UPGRADE", removedAt: null },
        create: { organizationId: order.organizationId, role: "COMPANY", source: "UPGRADE" },
      });
      await transaction.payment.create({
        data: {
          orderId: order.id,
          provider: "MERCADOPAGO",
          providerReference: `pay-order-${order.id}`,
          method: "PIX",
          status: "PAID",
          amountCents: order.totalCents,
          paidAt: new Date(),
        },
      });
      await enqueuePurchaseEmail("PURCHASE_CONFIRMED", "PAID");

      return { order: updatedOrder, changed: true, invalidate: true };
    } else {
      const diagnosticId = order.items.find((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        return typeof metadata?.diagnosticId === "string";
      })?.metadata as Record<string, unknown> | null;

      const resolvedDiagnosticId = typeof diagnosticId?.diagnosticId === "string"
        ? diagnosticId.diagnosticId
        : null;

      if (resolvedDiagnosticId) {
        await transaction.diagnostic.update({
          where: { id: resolvedDiagnosticId },
          data: {
            status: "CANCELED",
          },
        });
      }

      await enqueuePurchaseEmail("PURCHASE_FAILED", "FAILED");

      return { order: { ...order, status: "FAILED" as const }, changed: true, invalidate: true };
    }
    }, { maxWait: 15000, timeout: 30000 });

    if (result.changed && result.invalidate) {
      await authRepository.invalidateUserCachesForOrganization(result.order.organizationId);
      if (result.order.orderType === "INVITE_PACK") {
        const { cache } = await import("../../../lib/cache.js");
        await Promise.all([
          cache.delete(`invite:stats:${result.order.organizationId}`),
          cache.delete(`invite:list:${result.order.organizationId}`),
          cache.delete(`invite:ranking:${result.order.organizationId}`),
        ]);
      }
    }
    return result.order;
  }
}
