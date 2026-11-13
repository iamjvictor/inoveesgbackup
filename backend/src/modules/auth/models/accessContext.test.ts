import test from "node:test";
import assert from "node:assert/strict";
import { buildAuthAccessContext, hasEvidenceProductAccess } from "./accessContext.js";

test("only evidence products grant evidence access", () => {
  assert.equal(hasEvidenceProductAccess(["PRE_DIAGNOSTIC"]), false);
  assert.equal(hasEvidenceProductAccess(["PRE_DIAGNOSTIC_PLUS"]), false);
  assert.equal(hasEvidenceProductAccess(["ASSESSORIA_EVIDENCIAS"]), true);
  assert.equal(hasEvidenceProductAccess(["FULL_DIAGNOSTIC"]), true);
  assert.equal(hasEvidenceProductAccess(["FULL_DIAGNOSTIC_PLUS"]), true);
  assert.equal(hasEvidenceProductAccess(["BIOIMPACTO_EMPRESARIAL"]), true);
});

test("paid annual Bioimpacto grants diagnostic and evidence access only during its year", () => {
  const organization = (status: string, paidAt: Date) => ({ organizationUsers: [{ organization: {
    id: "company", roles: [{ role: "COMPANY", source: "TEST", assignedAt: paidAt }],
    orders: [{ id: "order", status, paidAt, items: [{ quantity: 1, unitPriceCents: 3_800_000,
      product: { code: "BIOIMPACTO_EMPRESARIAL", name: "Plano 2.2" } }] }],
  } }] });
  const recent = buildAuthAccessContext(organization("PAID", new Date()));
  assert.equal(recent?.hasAssessmentAccess, true);
  assert.equal(recent?.hasEvidenceAccess, true);
  assert.equal(recent?.hasPreDiagnosticAccess, true);
  assert.equal(buildAuthAccessContext(organization("PENDING_PAYMENT", new Date()))?.hasEvidenceAccess, false);
  assert.equal(buildAuthAccessContext(organization("PAID", new Date("2020-01-01T12:00:00Z")))?.hasEvidenceAccess, false);
});

test("product access matrix keeps pre-diagnostic, evidence, and consulting entitlements distinct", () => {
  const paidProductContext = (productCode: string, paid = true) => buildAuthAccessContext({
    organizationUsers: [{ organization: {
      id: "company",
      roles: [{ role: "COMPANY", source: "TEST", assignedAt: new Date("2026-01-01T00:00:00Z") }],
      orders: [{ id: `order-${productCode}`, status: paid ? "PAID" : "PENDING_PAYMENT", paidAt: new Date(), items: [{
        quantity: 1,
        unitPriceCents: 0,
        product: { code: productCode, name: productCode },
      }] }],
    } }],
  });

  const expectations = [
    { code: "PRE_DIAGNOSTIC", diagnostic: true, evidence: false },
    { code: "PRE_DIAGNOSTIC_PLUS", diagnostic: true, evidence: false },
    { code: "FULL_DIAGNOSTIC", diagnostic: true, evidence: true },
    { code: "FULL_DIAGNOSTIC_PLUS", diagnostic: true, evidence: true },
    { code: "BIOIMPACTO_EMPRESARIAL", diagnostic: true, evidence: true },
  ];

  for (const expected of expectations) {
    const context = paidProductContext(expected.code);
    assert.equal(context?.hasPreDiagnosticAccess, expected.diagnostic, `${expected.code} diagnostic access`);
    assert.equal(context?.hasAssessmentAccess, expected.diagnostic, `${expected.code} assessment access`);
    assert.equal(context?.hasEvidenceAccess, expected.evidence, `${expected.code} evidence access`);
  }

  for (const expected of expectations) {
    const unpaid = paidProductContext(expected.code, false);
    assert.equal(unpaid?.purchasedProductCodes.length, 0, `${expected.code} pending order must grant no access`);
    assert.equal(unpaid?.hasPreDiagnosticAccess, false, `${expected.code} pending order diagnostic access`);
    assert.equal(unpaid?.hasAssessmentAccess, false, `${expected.code} pending order assessment access`);
    assert.equal(unpaid?.hasEvidenceAccess, false, `${expected.code} pending order evidence access`);
  }
});
