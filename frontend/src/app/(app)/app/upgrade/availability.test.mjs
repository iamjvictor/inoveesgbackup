import test from "node:test";
import assert from "node:assert/strict";
import { isDemandServiceAvailable, shouldShowComingSoonOverlay } from "./availability.ts";

test("blocks the three temporarily unavailable demand services", () => {
  assert.deepEqual(
    ["cadeia-fornecedores", "capacitacao", "livro-esg"].map(isDemandServiceAvailable),
    [false, false, false],
  );
});

test("keeps the other demand services available", () => {
  assert.equal(isDemandServiceAvailable("pre-diag"), true);
  assert.equal(isDemandServiceAvailable("consulting-1h"), true);
});

test("shows the coming-soon overlay only for unavailable plans", () => {
  assert.equal(shouldShowComingSoonOverlay(false), true);
  assert.equal(shouldShowComingSoonOverlay(true), false);
});
