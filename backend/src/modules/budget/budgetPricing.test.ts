import test from "node:test";
import assert from "node:assert/strict";
import { getBudgetProposalPriceCents } from "./budgetPricing.js";

test("does not expose a service base price as a proposal before admin response", () => {
  assert.equal(getBudgetProposalPriceCents("SOLICITADO", null, 700000), null);
  assert.equal(getBudgetProposalPriceCents("RESPONDIDO", 700000, 500000), 700000);
  assert.equal(getBudgetProposalPriceCents("RESPONDIDO", null, 500000), null);
});
