import test from "node:test";
import assert from "node:assert/strict";
import { getBioimpactoEvidenceUploadWindow, getEvidenceUploadWindow } from "./evidenceUploadWindow.js";

test("Serviço 2 e Pacote 2 aceitam envio até o fim do vigésimo dia após concluir o diagnóstico", () => {
  const completedAt = "2026-03-01T18:30:00-03:00";

  assert.equal(getEvidenceUploadWindow(completedAt, new Date("2026-03-01T18:30:00-03:00")).canUpload, true);
  assert.equal(getEvidenceUploadWindow(completedAt, new Date("2026-03-21T23:59:59-03:00")).canUpload, true);
  assert.equal(getEvidenceUploadWindow(completedAt, new Date("2026-03-22T00:00:00-03:00")).canUpload, false);
});

test("prazo de 20 dias respeita o fuso de São Paulo e bloqueia instantes anteriores à conclusão", () => {
  const completedAt = "2026-04-01T00:30:00+00:00"; // 31/03, 21:30 em São Paulo

  assert.equal(getEvidenceUploadWindow(completedAt, new Date("2026-03-31T21:29:59-03:00")).canUpload, false);
  assert.equal(getEvidenceUploadWindow(completedAt, new Date("2026-04-20T23:59:59-03:00")).canUpload, true);
  assert.equal(getEvidenceUploadWindow(completedAt, new Date("2026-04-21T00:00:00-03:00")).canUpload, false);
});

test("prazo de evidências exige uma data de conclusão válida", () => {
  const now = new Date("2026-05-10T12:00:00Z");
  assert.deepEqual(getEvidenceUploadWindow(null, now), { canUpload: false, deadline: null });
  assert.equal(getEvidenceUploadWindow("data-invalida", now).canUpload, false);
});

test("Plano 2.2 libera a janela recorrente do dia 1 ao 15 em meses sucessivos", () => {
  const paidAt = "2026-01-10T12:00:00-03:00";

  for (const date of ["2026-01-10T12:00:00-03:00", "2026-02-01T12:00:00-03:00", "2026-06-15T23:59:59-03:00", "2026-12-05T12:00:00-03:00"]) {
    assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date(date)).canUpload, true, date);
  }
  for (const date of ["2026-02-16T00:00:00-03:00", "2026-03-31T12:00:00-03:00", "2027-01-10T12:00:00-03:00"]) {
    assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date(date)).canUpload, false, date);
  }
});

test("Plano 2.2 não libera antes do pagamento, após a vigência ou com data inválida", () => {
  assert.equal(getBioimpactoEvidenceUploadWindow("2026-06-02T12:00:00-03:00", new Date("2026-06-01T12:00:00-03:00")).canUpload, false);
  assert.equal(getBioimpactoEvidenceUploadWindow("2026-06-02T12:00:00-03:00", new Date("2027-06-02T12:00:00-03:00")).canUpload, false);
  assert.equal(getBioimpactoEvidenceUploadWindow("inválido", new Date("2026-06-03T12:00:00-03:00")).canUpload, false);
});

test("janela do Plano 2.2 usa o calendário de São Paulo nas bordas do dia 1 e 15", () => {
  const paidAt = "2026-01-01T00:00:00Z";
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-01T02:59:59Z")).canUpload, false);
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-01T03:00:00Z")).canUpload, true);
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-16T02:59:59Z")).canUpload, true);
  assert.equal(getBioimpactoEvidenceUploadWindow(paidAt, new Date("2026-02-16T03:00:00Z")).canUpload, false);
});
