import test from "node:test";
import assert from "node:assert/strict";
import type { EmailService } from "./emailService.js";
import { EmailWorker, isTransientEmailError } from "./worker.js";
import type { ClaimedEmail, EmailOutboxStore } from "./workerStore.js";

class FakeStore implements EmailOutboxStore {
  rows: ClaimedEmail[] = [];
  accepted: unknown[][] = [];
  retried: unknown[][] = [];
  failed: unknown[][] = [];
  async claim(batchSize: number) { return this.rows.slice(0, batchSize); }
  async accept(...args: [string, string, string]) { this.accepted.push(args); return true; }
  async retry(...args: [string, string, number, string]) { this.retried.push(args); return true; }
  async fail(...args: [string, string, string]) { this.failed.push(args); return true; }
}
const row = (overrides: Partial<ClaimedEmail> = {}): ClaimedEmail => ({
  id: "row-1", eventType: "WELCOME", recipient: "a@example.com", payload: { name: "Ana" }, attempts: 1, leaseToken: "lease-1", ...overrides,
});
const service = (sendEvent: (...args: any[]) => Promise<any>) => ({ sendEvent }) as unknown as EmailService;

test("worker does not claim outbox items while sending is disabled", async () => {
  const store = new FakeStore();
  const worker = new EmailWorker(store, service(async () => ({ providerMessageId: "x" })), { enabled: false });
  assert.equal(await worker.runOnce(), 0);
  assert.equal(store.rows.length, 0);
});

test("worker sends supported outbox event and marks accepted using its lease token", async () => {
  const store = new FakeStore();
  store.rows = [row()];
  const sent: unknown[][] = [];
  const worker = new EmailWorker(store, service(async (...args) => { sent.push(args); return { providerMessageId: "ses-1" }; }), { enabled: true });
  assert.equal(await worker.runOnce(), 1);
  assert.deepEqual(sent, [["WELCOME", "a@example.com", { name: "Ana", diagnosticKind: undefined, serviceNames: undefined, amountCents: undefined, paymentStatus: undefined }]]);
  assert.deepEqual(store.accepted, [["row-1", "lease-1", "ses-1"]]);
});

test("worker retries transient SES errors and fails permanent or exhausted attempts", async () => {
  const transientStore = new FakeStore();
  transientStore.rows = [row({ attempts: 2 })];
  const transientWorker = new EmailWorker(transientStore, service(async () => { throw Object.assign(new Error("busy"), { name: "ThrottlingException" }); }), { enabled: true });
  await transientWorker.runOnce();
  assert.deepEqual(transientStore.retried, [["row-1", "lease-1", 60, "ThrottlingException: busy"]]);

  const permanentStore = new FakeStore();
  permanentStore.rows = [row()];
  const permanentWorker = new EmailWorker(permanentStore, service(async () => { throw new Error("invalid address"); }), { enabled: true });
  await permanentWorker.runOnce();
  assert.equal(permanentStore.failed.length, 1);

  const exhaustedStore = new FakeStore();
  exhaustedStore.rows = [row({ attempts: 5 })];
  const exhaustedWorker = new EmailWorker(exhaustedStore, service(async () => { throw Object.assign(new Error("busy"), { name: "TimeoutError" }); }), { enabled: true });
  await exhaustedWorker.runOnce();
  assert.equal(exhaustedStore.failed.length, 1);
});

test("worker exhausts expired or already claimed rows before attempting another send", async () => {
  const store = new FakeStore();
  store.rows = [row({ attempts: 6 })];
  let sent = 0;
  const worker = new EmailWorker(store, service(async () => { sent++; return { providerMessageId: "x" }; }), { enabled: true, maxAttempts: 5 });
  await worker.runOnce();
  assert.equal(sent, 0);
  assert.deepEqual(store.failed, [["row-1", "lease-1", "Limite de tentativas excedido"]]);
});

test("worker marks malformed outbox messages failed without sending", async () => {
  const store = new FakeStore();
  store.rows = [row({ eventType: "OTHER" })];
  let sent = 0;
  const worker = new EmailWorker(store, service(async () => { sent++; return { providerMessageId: "x" }; }), { enabled: true });
  await worker.runOnce();
  assert.equal(sent, 0);
  assert.equal(store.failed.length, 1);
});

test("transient classification includes 429 and server errors but excludes ordinary client errors", () => {
  assert.equal(isTransientEmailError({ $metadata: { httpStatusCode: 503 } }), true);
  assert.equal(isTransientEmailError({ $metadata: { httpStatusCode: 429 } }), true);
  assert.equal(isTransientEmailError({ $metadata: { httpStatusCode: 400 } }), false);
});
