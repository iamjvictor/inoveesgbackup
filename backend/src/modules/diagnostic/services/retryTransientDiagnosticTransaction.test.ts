import test from "node:test";
import assert from "node:assert/strict";
import { isRetryableDiagnosticTransactionError, retryTransientDiagnosticTransaction } from "./retryTransientDiagnosticTransaction.js";

test("retries a known transient transaction conflict and resolves on the next attempt", async () => {
  let attempts = 0;
  const result = await retryTransientDiagnosticTransaction(async () => {
    attempts += 1;
    if (attempts === 1) throw { code: "P2034" };
    return "saved";
  }, { delay: () => 0 });

  assert.equal(result, "saved");
  assert.equal(attempts, 2);
});

test("retries at most three times for transient PostgreSQL deadlocks", async () => {
  let attempts = 0;
  await assert.rejects(retryTransientDiagnosticTransaction(async () => {
    attempts += 1;
    throw { code: "40P01" };
  }, { delay: () => 0 }));

  assert.equal(attempts, 3);
});

test("retries database connectivity failures with bounded attempts", async () => {
  let attempts = 0;
  const retries: number[] = [];
  await assert.rejects(retryTransientDiagnosticTransaction(async () => {
    attempts += 1;
    throw { code: "P1002" };
  }, { delay: () => 0, onRetry: (_error, failedAttempt) => retries.push(failedAttempt) }));

  assert.equal(attempts, 3);
  assert.deepEqual(retries, [1, 2]);
});

test("does not retry validation or authorization errors", async () => {
  let attempts = 0;
  const error = { code: "P2003" };
  await assert.rejects(retryTransientDiagnosticTransaction(async () => {
    attempts += 1;
    throw error;
  }, { delay: () => 0 }), (received) => received === error);

  assert.equal(attempts, 1);
  assert.equal(isRetryableDiagnosticTransactionError({ code: "40001" }), true);
  assert.equal(isRetryableDiagnosticTransactionError(new Error("permission denied")), false);
});
