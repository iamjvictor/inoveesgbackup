import test from "node:test";
import assert from "node:assert/strict";
import { getBioimpactoEvidenceUploadWindow } from "./evidenceUploadWindow.js";

test("Bioimpacto upload window opens on São Paulo day 1 and closes after day 15", () => {
  const paidAt = "2026-01-01T12:00:00-03:00";
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-01T12:00:00-03:00")).canUpload, true);
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-15T23:59:00-03:00")).canUpload, true);
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-16T00:00:00-03:00")).canUpload, false);
});

test("Bioimpacto monthly window requires paid start and expires at one year", () => {
  assert.equal(getBioimpactoEvidenceUploadWindow(null, new Date()).canUpload, false);
  assert.equal(getBioimpactoEvidenceUploadWindow("2026-01-01T00:00:00Z", new Date("2027-01-01T00:00:00Z")).canUpload, false);
});
