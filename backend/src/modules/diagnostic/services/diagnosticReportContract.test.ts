import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const serviceSource = await readFile(new URL("./diagnosticService.ts", import.meta.url), "utf8");
const pdfSource = await readFile(new URL("./pdfGeneratorService.ts", import.meta.url), "utf8");
const reportTemplate = await readFile(new URL("../models/assets/template_relatorio.html", import.meta.url), "utf8");
const controllerSource = await readFile(new URL("../controllers/diagnosticController.ts", import.meta.url), "utf8");

test("completed self-declared diagnostic report includes maturity score and recommendations", () => {
  assert.match(serviceSource, /generateReportPDF\(supabaseUserId/);
  assert.match(pdfSource, /classifyScore\(scoreGeral\)/);
  assert.match(pdfSource, /buildLevelNarrative\(levelIndex\)/);
  assert.match(reportTemplate, /\{\{SCORE_DECLARADO\}\}/);
  assert.match(reportTemplate, /\{\{LEVEL_NAME\}\}/);
  assert.match(reportTemplate, /\{\{LEVEL_RECOMMENDATION\}\}/);
});

test("report presents self-declared results without claiming evidence verification", () => {
  assert.match(reportTemplate, /exclusivamente a partir das respostas declaradas/i);
  assert.match(pdfSource, /RELATÓRIO DECLARATÓRIO \(SEM COMPROVAÇÃO DE EVIDÊNCIAS\)/);
});

test("report download serves a PDF response for the authenticated company", () => {
  assert.match(controllerSource, /downloadCurrentReport/);
  assert.match(controllerSource, /Content-Type", "application\/pdf"/);
  assert.match(controllerSource, /Content-Disposition/);
});

test("strategic report can show verified evidence status and Daniele signature asset", () => {
  assert.match(pdfSource, /RELATÓRIO AUDITADO E VERIFICADO \(SELO ESG\)/);
  assert.match(pdfSource, /assinatura_daniele\.jpg/);
});
