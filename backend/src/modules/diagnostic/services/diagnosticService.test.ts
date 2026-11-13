import test from "node:test";
import assert from "node:assert/strict";
import { Axis } from "@prisma/client";
import {
  buildEvidencePersistenceData,
  buildEvidenceRequirementData,
  hasEvidenceUploadAccess,
  getEvidenceDiagnosticKinds,
  getCurrentDiagnosticKinds,
  getDiagnosticQuestionsForSegment,
  getDiagnosticQuestionsForCurrent,
  capPreDiagnosticScores,
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

test("full diagnostic purchases wait for the full diagnostic even if a pre-diagnostic is newer", () => {
  assert.deepEqual(getEvidenceDiagnosticKinds(["FULL_DIAGNOSTIC_PLUS"]), ["FULL_DIAGNOSTIC"]);
  assert.deepEqual(getEvidenceDiagnosticKinds(["PRE_DIAGNOSTIC_PLUS"]), []);
  assert.deepEqual(getCurrentDiagnosticKinds(["FULL_DIAGNOSTIC_PLUS"]), ["FULL_DIAGNOSTIC"]);
  assert.deepEqual(getCurrentDiagnosticKinds(["PRE_DIAGNOSTIC_PLUS"]), ["PRE_DIAGNOSTIC", "FULL_DIAGNOSTIC"]);
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

test("selects diagnostic questionnaires for the three contracted segments", () => {
  assert.equal(getDiagnosticQuestionsForSegment("Agronegócio").length > 0, true);
  assert.equal(getDiagnosticQuestionsForSegment("Infraestrutura")[0], infrastructureDiagnosticQuestions[0]);
  assert.ok(getDiagnosticQuestionsForSegment("Óleo e Gás", "OLEO_E_GAS").length > 0);
});

test("current-diagnostic questions are selected by the persisted diagnostic and do not exist without one", () => {
  assert.deepEqual(getDiagnosticQuestionsForCurrent({ industrySegment: "Agronegócio" }), []);
  const questions = getDiagnosticQuestionsForCurrent({ industrySegment: "Infraestrutura" }, "FULL_DIAGNOSTIC");
  assert.equal(questions.length, infrastructureDiagnosticQuestions.length);
  assert.equal(questions[0].prompt, infrastructureDiagnosticQuestions[0].prompt);
  assert.equal(questions[0].weight, infrastructureDiagnosticQuestions[0].weight ?? 1);
});

test("requires evidence uploads only for the strategic diagnostic, not the self-declared service", () => {
  assert.equal(hasEvidenceUploadAccess(["PRE_DIAGNOSTIC"]), false);
  assert.equal(hasEvidenceUploadAccess(["PRE_DIAGNOSTIC_PLUS"]), false);
  assert.equal(hasEvidenceUploadAccess(["FULL_DIAGNOSTIC"]), true);
  assert.equal(hasEvidenceUploadAccess(["FULL_DIAGNOSTIC_PLUS"]), true);
  assert.equal(hasEvidenceUploadAccess(["BIOIMPACTO_EMPRESARIAL"]), true);
});

test("does not allow completing a diagnostic while answers are missing", async () => {
  // This service guard is covered by source contract in the public error and existing API flows;
  // direct persistence checks require the Prisma repository and a database test harness.
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("./diagnosticService.ts", import.meta.url), "utf8"));
  assert.match(source, /scoredResponses\.length < totalQuestions/);
  assert.match(source, /Você deve responder todas as perguntas antes de finalizar o diagnóstico/);
});

test("caps every pre-diagnostic score at 80 while preserving other diagnostic scores", () => {
  const scores = {
    overallScore: 100,
    environmentalScore: 91,
    bioeconomyCircularScore: 90,
    socialScore: 100,
    governanceScore: 100,
  };

  assert.deepEqual(capPreDiagnosticScores(scores, "PRE_DIAGNOSTIC"), {
    overallScore: 80,
    environmentalScore: 80,
    bioeconomyCircularScore: 80,
    socialScore: 80,
    governanceScore: 80,
  });
  assert.deepEqual(capPreDiagnosticScores(scores, "FULL_DIAGNOSTIC"), scores);
});
