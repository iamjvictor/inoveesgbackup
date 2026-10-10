import assert from "node:assert/strict";
import test from "node:test";
import { Axis } from "@prisma/client";
import { infrastructureDiagnosticQuestions } from "./diagnosticModel.js";

test("infrastructure questionnaire implements the 75-question contract", () => {
  assert.equal(infrastructureDiagnosticQuestions.length, 75);
  assert.deepEqual(
    infrastructureDiagnosticQuestions.map((question) => question.number),
    Array.from({ length: 75 }, (_, index) => index + 1),
  );

  const axisCounts = infrastructureDiagnosticQuestions.reduce<Record<string, number>>((counts, question) => {
    counts[question.axis] = (counts[question.axis] ?? 0) + 1;
    return counts;
  }, {});

  assert.deepEqual(axisCounts, {
    [Axis.ENVIRONMENTAL]: 21,
    [Axis.SOCIAL]: 17,
    [Axis.GOVERNANCE]: 23,
    [Axis.BIOECONOMY_CIRCULAR]: 14,
  });

  for (const question of infrastructureDiagnosticQuestions) {
    assert.ok(question.prompt.length > 20);
    assert.ok(question.category.startsWith("Pilar "));
    assert.ok(question.type);
    assert.ok([1, 1.25, 1.5].includes(question.weight ?? 0));
    assert.equal(question.options.length, 5);
  }
});

test("first and last infrastructure questions preserve the functional source text", () => {
  assert.match(infrastructureDiagnosticQuestions[0].prompt, /licenças, autorizações e requisitos ambientais/i);
  assert.match(infrastructureDiagnosticQuestions[74].prompt, /redução de emissões, resíduos, consumo de recursos/i);
});
