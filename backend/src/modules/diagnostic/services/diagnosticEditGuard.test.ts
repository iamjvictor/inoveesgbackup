import test from "node:test";
import assert from "node:assert/strict";
import { assertDiagnosticCanBeEdited } from "./diagnosticEditGuard.js";

function mockTx(status: string, organizationId = "org-1") {
  const calls: unknown[] = [];
  return {
    calls,
    tx: {
      $queryRaw: async (...args: unknown[]) => {
        calls.push(args);
        return [{ id: "diag-1", organizationId, status, kind: "FULL_DIAGNOSTIC" }];
      },
    },
  };
}

test("allows editing an active diagnostic after locking its row", async () => {
  const { tx, calls } = mockTx("ACTIVE");
  await assertDiagnosticCanBeEdited(tx as never, "diag-1", "org-1");
  assert.equal(calls.length, 1);
});

test("rejects editing a completed diagnostic", async () => {
  const { tx } = mockTx("COMPLETED");
  await assert.rejects(
    assertDiagnosticCanBeEdited(tx as never, "diag-1", "org-1"),
    /já foi concluído/
  );
});

test("rejects editing another organization's diagnostic", async () => {
  const { tx } = mockTx("ACTIVE", "org-2");
  await assert.rejects(
    assertDiagnosticCanBeEdited(tx as never, "diag-1", "org-1"),
    /não pertence à sua empresa/
  );
});

test("rejects when the diagnostic does not exist", async () => {
  const tx = { $queryRaw: async () => [] };
  await assert.rejects(assertDiagnosticCanBeEdited(tx as never, "missing", "org-1"), /não encontrado/);
});
