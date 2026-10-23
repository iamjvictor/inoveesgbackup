import test from "node:test";
import assert from "node:assert/strict";
import { getEvidenceUploadDeadline } from "./evidence-upload-window";

test("calculates the final upload day from the São Paulo completion date", () => {
  const result = getEvidenceUploadDeadline("2026-10-01T03:00:00.000Z");

  assert.ok(result);
  assert.equal(result.label, "21/10/2026");
  assert.equal(result.closesAt.toISOString(), "2026-10-22T03:00:00.000Z");
});

test("handles completion near midnight in São Paulo using its local calendar day", () => {
  const result = getEvidenceUploadDeadline("2026-10-02T02:59:00.000Z");

  assert.ok(result);
  assert.equal(result.label, "21/10/2026");
});
