import test from "node:test";
import assert from "node:assert/strict";
import { buildBudgetOwnerFilter } from "./budgetRepository.js";

test("budget queries are scoped to the logged user and organization", () => {
  assert.deepEqual(buildBudgetOwnerFilter("organization-id", "user-id"), {
    organizationId: "organization-id",
    requestedByUserId: "user-id",
  });
});
