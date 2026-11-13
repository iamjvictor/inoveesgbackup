import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import test from "node:test";

const secret = `controller-test-${randomUUID()}`;
// The app selects the webhook secret at import time from the active mode.
// Keep this fixture independent from the developer's local .env configuration.
process.env.MERCADOPAGO_SANDBOX = "true";
process.env.MERCADOPAGO_WEBHOOK_SECRET_SANDBOX = secret;
delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
const { app } = await import("../../../app.js");

function signature(dataId: string, requestId: string) {
  const timestamp = "1742505638683";
  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${timestamp},v1=${v1}`;
}

test("rejects absent or invalid signatures before the payment provider is queried", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = (async () => {
    throw new Error("unexpected provider fetch");
  }) as typeof fetch;

  const server = app.listen(0);
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}/api/webhooks/mercadopago`;
    const httpFetch = originalFetch;
    const body = JSON.stringify({ type: "payment", data: { id: "123" } });
    const missing = await httpFetch(`${base}?data.id=123`, {
      method: "POST", headers: { "content-type": "application/json", "x-request-id": "req-1" }, body,
    });
    assert.equal(missing.status, 401);
    const invalid = await httpFetch(`${base}?data.id=123`, {
      method: "POST", headers: { "content-type": "application/json", "x-request-id": "req-1", "x-signature": "ts=1,v1=bad" }, body,
    });
    assert.equal(invalid.status, 401);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("accepts signed query data.id and ignores non-final payments without fetching a payment", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = (async (input, init) => {
    if (!String(input).startsWith("https://api.mercadopago.com/")) return originalFetch(input, init);
    fetchCalls += 1;
    return new Response(JSON.stringify({ id: "123", status: "pending" }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  const server = app.listen(0);
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const requestId = "req-signed";
    const httpFetch = originalFetch;
    const response = await httpFetch(`http://127.0.0.1:${address.port}/api/webhooks/mercadopago?type=payment&data.id=123`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-request-id": requestId, "x-signature": signature("123", requestId) },
      body: JSON.stringify({ type: "payment", data: { id: "123" } }),
    });
    assert.equal(response.status, 200);
    assert.equal(fetchCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
