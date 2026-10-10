import test from "node:test";
import assert from "node:assert/strict";
import { canRequestUpgradeBudget } from "./upgrade-access";

test("allows budget requests for the strategic diagnosis", () => {
  assert.equal(canRequestUpgradeBudget("diag-estrat"), true);
  assert.equal(canRequestUpgradeBudget("diag-consultoria"), false);
  assert.equal(canRequestUpgradeBudget("assessoria-completa"), false);
});
