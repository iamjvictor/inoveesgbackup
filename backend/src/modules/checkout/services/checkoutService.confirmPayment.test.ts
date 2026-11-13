import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "../../../lib/prisma.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { CheckoutService } from "./checkoutService.js";

function createOrder(status = "PENDING_PAYMENT") {
  return {
    id: "order-1",
    organizationId: "organization-1",
    orderType: "ONE_TIME",
    status,
    totalCents: 1,
    items: [],
  } as any;
}

function transactionFor(state: { order: any; payments: number; roles: number; emails: number }) {
  return {
    snapshot: () => ({ order: { ...state.order }, payments: state.payments, roles: state.roles, emails: state.emails }),
    restore: (snapshot: any) => { Object.assign(state, snapshot); },
    order: {
      findUnique: async () => state.order,
      updateMany: async ({ where, data }: any) => {
        // Synchronous status check models the atomic conditional UPDATE in the DB.
        if (state.order.id !== where.id || state.order.status !== where.status) return { count: 0 };
        state.order = { ...state.order, ...data };
        return { count: 1 };
      },
    },
    organization: { findUnique: async () => ({ primaryEmail: "qa@example.test", legalName: "Empresa Sintética" }) },
    orderItem: { findMany: async () => [] },
    emailOutbox: { create: async () => { state.emails += 1; } },
    organizationRole: { upsert: async () => { state.roles += 1; } },
    payment: { create: async () => { state.payments += 1; } },
    diagnostic: { update: async () => undefined },
    budgetRequest: { update: async () => undefined },
    plan: { findUnique: async () => null },
    subscription: { findFirst: async () => null, create: async () => undefined },
    inviteWallet: { upsert: async () => undefined },
    inviteTransaction: { create: async () => undefined },
  } as any;
}

async function withTransactionMock<T>(
  transaction: any,
  operation: () => Promise<T>,
  options: { failPayment?: boolean } = {},
) {
  const originalTransaction = (prisma as any).$transaction;
  const originalInvalidate = AuthRepository.prototype.invalidateUserCachesForOrganization;
  (prisma as any).$transaction = async (callback: (tx: any) => Promise<unknown>) => {
    const snapshot = transaction.snapshot();
    if (options.failPayment) {
      const originalCreate = transaction.payment.create;
      transaction.payment.create = async () => { throw new Error("simulated payment write failure"); };
      try {
        return await callback(transaction);
      } catch (error) {
        transaction.restore(snapshot);
        throw error;
      } finally {
        transaction.payment.create = originalCreate;
      }
    }
    return callback(transaction);
  };
  AuthRepository.prototype.invalidateUserCachesForOrganization = async () => undefined;
  try {
    return await operation();
  } finally {
    (prisma as any).$transaction = originalTransaction;
    AuthRepository.prototype.invalidateUserCachesForOrganization = originalInvalidate;
  }
}

test("repeated approved confirmation creates only one payment and one grant", async () => {
  const state = { order: createOrder(), payments: 0, roles: 0, emails: 0 };
  const tx = transactionFor(state);
  await withTransactionMock(tx, async () => {
    const service = new CheckoutService();
    await service.confirmPayment(state.order.id, true);
    await service.confirmPayment(state.order.id, true);
  });
  assert.equal(state.order.status, "PAID");
  assert.equal(state.payments, 1);
  assert.equal(state.roles, 1);
  assert.equal(state.emails, 1);
});

test("concurrent approvals use the conditional claim so only one applies effects", async () => {
  const state = { order: createOrder(), payments: 0, roles: 0, emails: 0 };
  const tx = transactionFor(state);
  const service = new CheckoutService();
  await withTransactionMock(tx, async () => {
    await Promise.all([
      service.confirmPayment(state.order.id, true),
      service.confirmPayment(state.order.id, true),
    ]);
  });
  assert.equal(state.order.status, "PAID");
  assert.equal(state.payments, 1);
  assert.equal(state.roles, 1);
  assert.equal(state.emails, 1);
});

test("failed payment write rejects confirmation so the webhook can retry", async () => {
  const state = { order: createOrder(), payments: 0, roles: 0, emails: 0 };
  const tx = transactionFor(state);
  await assert.rejects(
    withTransactionMock(tx, async () => new CheckoutService().confirmPayment(state.order.id, true), { failPayment: true }),
    /simulated payment write failure/,
  );
  assert.equal(state.order.status, "PENDING_PAYMENT");

  await withTransactionMock(tx, async () => new CheckoutService().confirmPayment(state.order.id, true));
  assert.equal(state.order.status, "PAID");
  assert.equal(state.payments, 1);
  assert.equal(state.roles, 1);
  assert.equal(state.emails, 1);
});

test("a later failure event does not regrade a paid order", async () => {
  const state = { order: createOrder("PAID"), payments: 0, roles: 0, emails: 0 };
  await withTransactionMock(transactionFor(state), async () => {
    await new CheckoutService().confirmPayment(state.order.id, false);
  });
  assert.equal(state.order.status, "PAID");
  assert.equal(state.payments, 0);
  assert.equal(state.roles, 0);
  assert.equal(state.emails, 0);
});
