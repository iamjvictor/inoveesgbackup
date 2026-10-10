import test from "node:test";
import assert from "node:assert/strict";
import { Axis } from "@prisma/client";
import {
  buildEvidencePersistenceData,
  buildEvidenceRequirementData,
  hasEvidenceUploadAccess,
  getDiagnosticQuestionsForSegment,
} from "./diagnosticService.js";
import { infrastructureDiagnosticQuestions } from "../models/diagnosticModel.js";

test("buildEvidenceRequirementData preserves the selected document contract", () => {
  const result = buildEvidenceRequirementData({
    code: "EV01",
    name: "Licenciamento e regularidade ambiental",
    groupCode: "A",
    categoryCode: "AGRONEGOCIO",
    segmentCode: "AGROINDUSTRIA",
    mimeType: "application/pdf",
  });

  assert.deepEqual(result, {
    code: "EV01",
    categoryCode: "AGRONEGOCIO",
    segmentCode: "AGROINDUSTRIA",
    name: "Licenciamento e regularidade ambiental",
    expectedDocument: "Licenciamento e regularidade ambiental",
    acceptedTypes: ["PDF"],
    groupCode: "A",
    primaryAxis: Axis.ENVIRONMENTAL,
    scoringAxes: ["Ambiental", "Governança"],
    points: 3,
    strategicObjectives: [],
    active: true,
    gapIfMissing: null,
    recommendedService: null,
  });
});

test("buildEvidenceRequirementData keeps scoring metadata from the evidence catalog", () => {
  const result = buildEvidenceRequirementData({
    code: "EV03",
    name: "Metas e plano ambiental",
    expectedDocument: "Plano ambiental, metas ou cronograma",
    groupCode: "C",
    categoryCode: "AGRONEGOCIO",
    segmentCode: "AGROINDUSTRIA",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    acceptedTypes: ["PDF", "DOCX", "XLSX"],
    primaryAxis: "Ambiental",
    scoringAxes: ["Ambiental", "Governança", "Bioeconomia"],
    points: 3,
    strategicObjectives: ["Certificação Sustentável", "Bioeconomia Circular"],
    gapIfMissing: "Falta de planejamento ambiental",
    recommendedService: "Plano de gestão ambiental",
  });

  assert.equal(result.points, 3);
  assert.deepEqual(result.acceptedTypes, ["PDF", "DOCX", "XLSX"]);
  assert.deepEqual(result.scoringAxes, ["Ambiental", "Governança", "Bioeconomia"]);
  assert.deepEqual(result.strategicObjectives, ["Certificação Sustentável", "Bioeconomia Circular"]);
  assert.equal(result.expectedDocument, "Plano ambiental, metas ou cronograma");
});

test("buildEvidencePersistenceData excludes requirement metadata from evidence rows", () => {
  const result = buildEvidencePersistenceData({
    diagnosticId: "diagnostic-id",
    organizationId: "organization-id",
    fileName: "metas.pdf",
    filePath: "metas.pdf",
    mimeType: "application/pdf",
    requirementCode: "EV03",
    expectedDocument: "Plano ambiental, metas ou cronograma",
    acceptedTypes: ["PDF"],
    points: 3,
  }, "request-id", "user-id");

  assert.deepEqual(result, {
    diagnosticId: "diagnostic-id",
    organizationId: "organization-id",
    fileName: "metas.pdf",
    filePath: "metas.pdf",
    mimeType: "application/pdf",
    requestId: "request-id",
    uploadedByUserId: "user-id",
  });
});

test("evidence upload access requires the purchased evidence product", () => {
  assert.equal(hasEvidenceUploadAccess(["PRE_DIAGNOSTIC"]), false);
  assert.equal(hasEvidenceUploadAccess(["ASSESSORIA_EVIDENCIAS"]), true);
  assert.equal(hasEvidenceUploadAccess(["assessoria-evidencias"]), true);
});

test("selects the infrastructure questionnaire by category, segment, or normalized name", () => {
  assert.strictEqual(
    getDiagnosticQuestionsForSegment("Infraestrutura", "INFRAESTRUTURA", "INFRAESTRUTURA")[0],
    infrastructureDiagnosticQuestions[0],
  );
  assert.strictEqual(
    getDiagnosticQuestionsForSegment("infraestrutura", " infraestrutura ", " infraestrutura ")[0],
    infrastructureDiagnosticQuestions[0],
  );
});
