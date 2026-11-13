import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { isValidMercadoPagoSignature } from "./mercadopagoWebhookSignature.js";

const secret = "test-webhook-secret";
const requestId = "request-123";
const dataId = "payment-456";
const timestamp = "1742505638683";
const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
const hash = createHmac("sha256", secret).update(manifest).digest("hex");

test("accepts the official Mercado Pago signature manifest", () => {
  assert.equal(isValidMercadoPagoSignature({
    signature: `ts=${timestamp},v1=${hash}`,
    requestId,
    dataId,
    secret,
  }), true);
});

test("rejects absent and malformed signature inputs", () => {
  for (const input of [
    { signature: null, requestId, dataId, secret },
    { signature: `ts=${timestamp},v1=${hash}`, requestId: null, dataId, secret },
    { signature: `ts=${timestamp},v1=${hash}`, requestId, dataId: null, secret },
    { signature: `ts=${timestamp},v1=abcd`, requestId, dataId, secret },
    { signature: `ts=${timestamp},v1=${hash}`, requestId, dataId, secret: "" },
  ]) assert.equal(isValidMercadoPagoSignature(input), false);
});

test("rejects tampered identifiers, timestamps, request IDs and secrets", () => {
  assert.equal(isValidMercadoPagoSignature({ signature: `ts=${timestamp},v1=${hash}`, requestId, dataId: "other", secret }), false);
  assert.equal(isValidMercadoPagoSignature({ signature: `ts=${timestamp},v1=${hash}`, requestId: "other", dataId, secret }), false);
  assert.equal(isValidMercadoPagoSignature({ signature: `ts=1,v1=${hash}`, requestId, dataId, secret }), false);
  assert.equal(isValidMercadoPagoSignature({ signature: `ts=${timestamp},v1=${hash}`, requestId, dataId, secret: "wrong" }), false);
});
