import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "../../../lib/prisma.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { buildBackUrls, CheckoutService } from "./checkoutService.js";

test("order details are queried within the authenticated user's organization and expose only the response contract", async () => {
  const originalFindOrg = AuthRepository.prototype.findOrganizationIdBySupabaseUserId;
  const originalFindFirst = (prisma.order as any).findFirst;
  let capturedQuery: any;
  AuthRepository.prototype.findOrganizationIdBySupabaseUserId = async (userId: string) => {
    assert.equal(userId, "user-1");
    return "organization-1";
  };
  (prisma.order as any).findFirst = async (query: any) => {
    capturedQuery = query;
    return {
      id: "order-1",
      status: "PAID",
      totalCents: 25000,
      createdAt: new Date("2026-11-01T10:00:00.000Z"),
      paidAt: new Date("2026-11-01T10:05:00.000Z"),
      items: [{ quantity: 1, unitPriceCents: 25000, product: { name: "Pré-Diagnóstico ESG" } }],
    };
  };

  try {
    const details = await new CheckoutService().getOrderDetails("user-1", "order-1");
    assert.deepEqual(capturedQuery.where, { id: "order-1", organizationId: "organization-1" });
    assert.deepEqual(details, {
      id: "order-1",
      status: "PAID",
      totalCents: 25000,
      createdAt: new Date("2026-11-01T10:00:00.000Z"),
      paidAt: new Date("2026-11-01T10:05:00.000Z"),
      items: [{ name: "Pré-Diagnóstico ESG", quantity: 1, unitPriceCents: 25000 }],
    });
    assert.equal("providerReference" in (details as object), false);
    assert.equal("method" in (details as object), false);
  } finally {
    AuthRepository.prototype.findOrganizationIdBySupabaseUserId = originalFindOrg;
    (prisma.order as any).findFirst = originalFindFirst;
  }
});

test("order details return null for an ID not visible to the authenticated organization", async () => {
  const originalFindOrg = AuthRepository.prototype.findOrganizationIdBySupabaseUserId;
  const originalFindFirst = (prisma.order as any).findFirst;
  AuthRepository.prototype.findOrganizationIdBySupabaseUserId = async () => "organization-1";
  (prisma.order as any).findFirst = async () => null;
  try {
    assert.equal(await new CheckoutService().getOrderDetails("user-1", "foreign-order"), null);
  } finally {
    AuthRepository.prototype.findOrganizationIdBySupabaseUserId = originalFindOrg;
    (prisma.order as any).findFirst = originalFindFirst;
  }
});

test("all Mercado Pago outcomes return to designated order result pages and preserve budgetId", () => {
  const urls = buildBackUrls("order id/123", "budget-id");
  assert.equal(new URL(urls.success).pathname, "/app/checkout/success");
  assert.equal(new URL(urls.pending).pathname, "/app/checkout/pending");
  assert.equal(new URL(urls.failure).pathname, "/app/checkout/failure");
  for (const url of [urls.success, urls.failure, urls.pending]) {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("orderId"), "order id/123");
    assert.equal(parsed.searchParams.get("budgetId"), "budget-id");
  }
});

test("getPendingOrder returns open order awaiting payment for the organization", async () => {
  const originalFindOrg = AuthRepository.prototype.findOrganizationIdBySupabaseUserId;
  const originalFindFirst = (prisma.order as any).findFirst;
  const originalUpdateMany = (prisma.order as any).updateMany;

  AuthRepository.prototype.findOrganizationIdBySupabaseUserId = async () => "organization-1";
  (prisma.order as any).updateMany = async () => ({ count: 0 });
  (prisma.order as any).findFirst = async () => ({
    id: "order-pending-1",
    status: "PENDING_PAYMENT",
    totalCents: 5600000,
    createdAt: new Date("2026-11-10T10:00:00.000Z"),
    paidAt: null,
    items: [{ quantity: 1, unitPriceCents: 5600000, product: { name: "Bioimpacto Empresarial" } }],
  });

  try {
    const pending = await new CheckoutService().getPendingOrder("user-1");
    assert.ok(pending);
    assert.equal(pending.id, "order-pending-1");
    assert.equal(pending.status, "PENDING_PAYMENT");
    assert.equal(pending.totalCents, 5600000);
    assert.equal(pending.items[0].name, "Bioimpacto Empresarial");
  } finally {
    AuthRepository.prototype.findOrganizationIdBySupabaseUserId = originalFindOrg;
    (prisma.order as any).findFirst = originalFindFirst;
    (prisma.order as any).updateMany = originalUpdateMany;
  }
});

test("cancelOrder updates status to CANCELED and deletes associated draft diagnostics", async () => {
  const originalFindOrg = AuthRepository.prototype.findOrganizationIdBySupabaseUserId;
  const originalFindFirst = (prisma.order as any).findFirst;
  const originalUpdate = (prisma.order as any).update;
  const originalDiagDeleteMany = (prisma.diagnostic as any).deleteMany;

  let updatedOrderData: any = null;
  let deletedDiagnosticWhere: any = null;

  AuthRepository.prototype.findOrganizationIdBySupabaseUserId = async () => "organization-1";
  (prisma.order as any).findFirst = async () => ({
    id: "order-pending-1",
    status: "PENDING_PAYMENT",
    organizationId: "organization-1",
    items: [
      {
        id: "item-1",
        metadata: { diagnosticId: "diag-draft-1", productCode: "BIOIMPACTO_EMPRESARIAL" },
      },
    ],
  });
  (prisma.order as any).update = async (params: any) => {
    updatedOrderData = params.data;
    return { id: "order-pending-1", status: "CANCELED" };
  };
  (prisma.diagnostic as any).deleteMany = async (params: any) => {
    deletedDiagnosticWhere = params.where;
    return { count: 1 };
  };

  try {
    const result = await new CheckoutService().cancelOrder("user-1", "order-pending-1");
    assert.equal(result.success, true);
    assert.equal(result.status, "CANCELED");
    assert.equal(updatedOrderData.status, "CANCELED");
    assert.equal(updatedOrderData.checkoutKey, null);
    assert.equal(deletedDiagnosticWhere.id, "diag-draft-1");
    assert.equal(deletedDiagnosticWhere.status, "PENDING_PAYMENT");
  } finally {
    AuthRepository.prototype.findOrganizationIdBySupabaseUserId = originalFindOrg;
    (prisma.order as any).findFirst = originalFindFirst;
    (prisma.order as any).update = originalUpdate;
    (prisma.diagnostic as any).deleteMany = originalDiagDeleteMany;
  }
});

test("cancelOrder rejects canceling an order that is already PAID", async () => {
  const originalFindOrg = AuthRepository.prototype.findOrganizationIdBySupabaseUserId;
  const originalFindFirst = (prisma.order as any).findFirst;

  AuthRepository.prototype.findOrganizationIdBySupabaseUserId = async () => "organization-1";
  (prisma.order as any).findFirst = async () => ({
    id: "order-paid-1",
    status: "PAID",
    organizationId: "organization-1",
    items: [],
  });

  try {
    await assert.rejects(
      () => new CheckoutService().cancelOrder("user-1", "order-paid-1"),
      /Não é possível cancelar um pedido já pago/
    );
  } finally {
    AuthRepository.prototype.findOrganizationIdBySupabaseUserId = originalFindOrg;
    (prisma.order as any).findFirst = originalFindFirst;
  }
});
