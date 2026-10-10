import test from "node:test";
import assert from "node:assert/strict";
import { canAccessEvidenceRoute, canAccessSuppliersRoute } from "./route-access.ts";

test("evidence route requires evidence access", () => {
  assert.equal(canAccessEvidenceRoute({ hasEvidenceAccess: false, hasPreDiagnosticAccess: true }), false);
  assert.equal(canAccessEvidenceRoute({ hasEvidenceAccess: true, hasPreDiagnosticAccess: false }), true);
});

test("suppliers route requires invite access", () => {
  assert.equal(canAccessSuppliersRoute({ hasInviteAccess: false }), false);
  assert.equal(canAccessSuppliersRoute({ hasInviteAccess: true }), true);
});
