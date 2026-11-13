import test from "node:test";
import assert from "node:assert/strict";
import { withDiagnosticMutationLock } from "./diagnosticMutationLock.js";

function createSerializedTransactionMock() {
  const tails = new Map<string, Promise<void>>();
  return {
    $transaction: async <T>(operation: (tx: any) => Promise<T>) => {
      const releases: Array<() => void> = [];
      const tx = {
        $queryRaw: async (_strings: TemplateStringsArray, diagnosticId: string) => {
          const previous = tails.get(diagnosticId) ?? Promise.resolve();
          let release!: () => void;
          const current = new Promise<void>((resolve) => { release = resolve; });
          const tail = previous.then(() => current);
          tails.set(diagnosticId, tail);
          await previous;
          releases.push(release);
        },
      };
      try {
        return await operation(tx);
      } finally {
        releases.forEach((release) => release());
      }
    },
  };
}

test("serializes saves and finalization for the same diagnostic", async () => {
  const db = createSerializedTransactionMock();
  const events: string[] = [];
  const mutate = (name: string) => withDiagnosticMutationLock(db as never, "diag-1", async () => {
    events.push(`${name}:start`);
    await new Promise((resolve) => setTimeout(resolve, 5));
    events.push(`${name}:end`);
  });

  await Promise.all([mutate("save"), mutate("finalize")]);
  assert.ok(
    events.indexOf("save:end") < events.indexOf("finalize:start") ||
    events.indexOf("finalize:end") < events.indexOf("save:start"),
    `mutations overlapped: ${events.join(", ")}`
  );
});
