import test from "node:test";
import assert from "node:assert/strict";
import { getBudgetDisplayPrice, getInitialCardRotationIndex, hasOpenBudget, isBudgetOwnedByUser, shouldShowBudgetCard } from "./budget-card";

test("identifies unpaid budget requests that should appear as a card", () => {
  assert.equal(hasOpenBudget("SOLICITADO"), true);
  assert.equal(hasOpenBudget("RESPONDIDO"), true);
  assert.equal(hasOpenBudget("ACEITO"), true);
  assert.equal(hasOpenBudget("ATIVO"), false);
  assert.equal(hasOpenBudget("RECUSADO"), false);
});

test("alternates budget and consulting cards when both exist", () => {
  assert.equal(shouldShowBudgetCard(true, true, 0), false);
  assert.equal(shouldShowBudgetCard(true, true, 1), true);
  assert.equal(shouldShowBudgetCard(true, false, 0), true);
  assert.equal(shouldShowBudgetCard(false, true, 1), false);
});

test("starts with the budget card when an open budget exists", () => {
  assert.equal(getInitialCardRotationIndex(true), 1);
  assert.equal(getInitialCardRotationIndex(false), 0);
});

test("does not select a budget belonging to another user", () => {
  assert.equal(isBudgetOwnedByUser({ requestedByUserId: "user-1" }, "user-1"), true);
  assert.equal(isBudgetOwnedByUser({ requestedByUserId: "user-2" }, "user-1"), false);
  assert.equal(isBudgetOwnedByUser({ requestedByUserId: null }, "user-1"), false);
});

test("hides the proposal value until the budget is responded", () => {
  assert.equal(getBudgetDisplayPrice("SOLICITADO", null), "Aguardando proposta");
  assert.equal(getBudgetDisplayPrice("SOLICITADO", 700000), "Aguardando proposta");
  assert.equal(getBudgetDisplayPrice("RESPONDIDO", 3045599), "R$ 30.455,99");
});
