import assert from "node:assert/strict";
import test from "node:test";

import { findSupplierInvite, mapSupplierInviteToDetail } from "./supplier-detail.controller";

const invite = {
  id: "invite-1",
  buyerOrganizationId: "buyer-1",
  supplierOrganizationId: "supplier-1",
  supplierEmail: "contato@fornecedor.com",
  token: "token",
  status: "ACCEPTED" as const,
  message: null,
  createdAt: "2026-09-10T12:00:00.000Z",
  acceptedAt: "2026-09-10T13:00:00.000Z",
  supplierOrganization: {
    id: "supplier-1",
    tradeName: "Fornecedor Real Ltda.",
    legalName: "Fornecedor Real Ltda.",
    industrySegment: "Agroindústria",
  },
  requestedDiagnostics: [
    {
      id: "diagnostic-1",
      status: "COMPLETED",
      percentageCompletion: 100,
      updatedAt: "2026-09-11T10:00:00.000Z",
      score: { overallScore: 82 },
    },
  ],
  relationship: { id: "relationship-1", status: "ACTIVE" as const, startedAt: "2026-09-10T13:00:00.000Z" },
};

test("mapeia convite real para os dados da tela de detalhe", () => {
  const detail = mapSupplierInviteToDetail(invite);

  assert.equal(detail.companyName, "Fornecedor Real Ltda.");
  assert.equal(detail.contactEmail, "contato@fornecedor.com");
  assert.equal(detail.status, "respondido");
  assert.equal(detail.progress, 100);
  assert.equal(detail.diagnostic?.score?.overallScore, 82);
});

test("localiza fornecedor por id do convite ou id da organização", () => {
  assert.equal(findSupplierInvite([invite], "invite-1"), invite);
  assert.equal(findSupplierInvite([invite], "supplier-1"), invite);
  assert.equal(findSupplierInvite([invite], "missing"), null);
});
