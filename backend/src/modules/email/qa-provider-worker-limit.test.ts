import test from "node:test";
import assert from "node:assert/strict";
import type { EmailService } from "./emailService.js";
import { EmailWorker } from "./worker.js";
import type { ClaimedEmail, EmailOutboxStore } from "./workerStore.js";

test("an outbox item already at the retry limit is failed without another provider call", async () => {
  const row: ClaimedEmail = { id: "exhausted", eventType: "WELCOME", recipient: "a@example.com", payload: { name: "Ana" }, attempts: 6, leaseToken: "lease" };
  const sent: unknown[][] = [];
  const failed: unknown[][] = [];
  const store: EmailOutboxStore = {
    claim: async () => [row],
    accept: async () => true,
    retry: async () => true,
    fail: async (...args) => { failed.push(args); return true; },
  };
  const emailService = { sendEvent: async (...args: unknown[]) => { sent.push(args); return { providerMessageId: "ses-accepted" }; } } as unknown as EmailService;
  await new EmailWorker(store, emailService, { enabled: true, maxAttempts: 5 }).runOnce();
  assert.equal(sent.length, 0, "provider must not receive work after retry budget is exhausted");
  assert.deepEqual(failed, [["exhausted", "lease", "Limite de tentativas excedido"]]);
});
