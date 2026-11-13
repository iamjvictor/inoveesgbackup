import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { CheckoutController } from "./checkoutController.js";
import { CheckoutService } from "../services/checkoutService.js";

function responseRecorder() {
  const result: { statusCode?: number; body?: unknown } = {};
  const response = {
    status(code: number) { result.statusCode = code; return this; },
    json(body: unknown) { result.body = body; return this; },
  };
  return { result, response };
}

test("order details controller requires authentication before querying the order", async (t) => {
  const serviceMock = mock.method(CheckoutService.prototype, "getOrderDetails", async () => {
    throw new Error("must not query an order without a user");
  });
  const { result, response } = responseRecorder();
  await new CheckoutController().getOrderDetails({ user: undefined, params: { id: "fdd6d03e-7211-4bb1-bab6-8a791c142c08" } } as never, response as never);
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { message: "Usuário não autenticado" });
  assert.equal(serviceMock.mock.callCount(), 0);
  t.mock.restoreAll();
});

test("order details controller rejects malformed IDs before querying the service", async (t) => {
  const serviceMock = mock.method(CheckoutService.prototype, "getOrderDetails", async () => null);
  const { result, response } = responseRecorder();
  await new CheckoutController().getOrderDetails({ user: { id: "user-1" }, params: { id: "foreign-order" } } as never, response as never);
  assert.equal(result.statusCode, 400);
  assert.equal(serviceMock.mock.callCount(), 0);
  t.mock.restoreAll();
});

test("an order not visible to the user's organization is returned as a non-disclosing 404", async (t) => {
  const serviceMock = mock.method(CheckoutService.prototype, "getOrderDetails", async () => null);
  const { result, response } = responseRecorder();
  await new CheckoutController().getOrderDetails({ user: { id: "user-1" }, params: { id: "fdd6d03e-7211-4bb1-bab6-8a791c142c08" } } as never, response as never);
  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.body, { message: "Pedido não encontrado" });
  assert.equal(JSON.stringify(result.body).includes("foreign"), false);
  t.mock.restoreAll();
});
