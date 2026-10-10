import test from "node:test";
import assert from "node:assert/strict";
import { hasEvidenceProductAccess } from "./accessContext.js";

test("only evidence products grant evidence access", () => {
  assert.equal(hasEvidenceProductAccess(["PRE_DIAGNOSTIC"]), false);
  assert.equal(hasEvidenceProductAccess(["PRE_DIAGNOSTIC_PLUS"]), false);
  assert.equal(hasEvidenceProductAccess(["ASSESSORIA_EVIDENCIAS"]), true);
  assert.equal(hasEvidenceProductAccess(["FULL_DIAGNOSTIC"]), true);
});
