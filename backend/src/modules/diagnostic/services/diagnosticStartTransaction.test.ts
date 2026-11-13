import test from "node:test";
import assert from "node:assert/strict";
import { assertDiagnosticStartAccess, startOrReuseOpenDiagnostic } from "./diagnosticStartTransaction.js";

function createFakeDatabase(initial: { open?: any; completed?: any } = {}) {
  const state = { open: initial.open ?? null, completed: initial.completed ?? null, creates: 0, locks: 0 };
  let locked = false;
  const waiters: Array<() => void> = [];
  const acquire = async () => {
    if (!locked) {
      locked = true;
      return;
    }
    await new Promise<void>((resolve) => waiters.push(resolve));
  };
  const release = () => {
    const next = waiters.shift();
    if (next) next();
    else locked = false;
  };

  const db = {
    async $transaction<T>(callback: (tx: any) => Promise<T>) {
      let ownsLock = false;
      const tx = {
        async $queryRaw() {
          state.locks += 1;
          await acquire();
          ownsLock = true;
          return [];
        },
        diagnostic: {
          async findFirst(args: any) {
            if (args.where.status?.in) return state.open;
            return state.completed;
          },
          async create(args: any) {
            state.creates += 1;
            state.open = {
              id: `draft-${state.creates}`,
              kind: args.data.kind,
              status: args.data.status,
              createdAt: new Date(0),
              updatedAt: new Date(0),
            };
            return state.open;
          },
        },
      };
      try {
        return await callback(tx);
      } finally {
        if (ownsLock) release();
      }
    },
  };
  return { db: db as any, state };
}

const params = { organizationId: "org-test", kind: "FULL_DIAGNOSTIC" as const, consultoriaAccess: false };

test("concurrent starts serialize per organization and create exactly one draft", async () => {
  const { db, state } = createFakeDatabase();
  const results = await Promise.all(Array.from({ length: 12 }, () => startOrReuseOpenDiagnostic(db, params)));

  assert.equal(state.locks, 12);
  assert.equal(state.creates, 1);
  assert.equal(new Set(results.map(({ diagnostic }) => diagnostic.id)).size, 1);
  assert.equal(results.filter(({ createdNewDiagnostic }) => createdNewDiagnostic).length, 1);
});

test("start reuses an existing open diagnostic without creating another", async () => {
  const existing = { id: "existing", kind: "PRE_DIAGNOSTIC", status: "ACTIVE", createdAt: new Date(0), updatedAt: new Date(0) };
  const { db, state } = createFakeDatabase({ open: existing });
  const result = await startOrReuseOpenDiagnostic(db, params);

  assert.equal(result.diagnostic.id, "existing");
  assert.equal(result.createdNewDiagnostic, false);
  assert.equal(state.creates, 0);
});

test("completed diagnostic cannot be restarted without consultoria access", async () => {
  const { db, state } = createFakeDatabase({ completed: { id: "completed" } });
  await assert.rejects(startOrReuseOpenDiagnostic(db, params), /já concluiu este diagnóstico/);
  assert.equal(state.creates, 0);
});

test("company without pre-diagnostic access is rejected before start", () => {
  assert.throws(() => assertDiagnosticStartAccess(true, false), /precisa adquirir o Pré-Diagnóstico/);
  assert.doesNotThrow(() => assertDiagnosticStartAccess(true, true));
  assert.doesNotThrow(() => assertDiagnosticStartAccess(false, false));
});
