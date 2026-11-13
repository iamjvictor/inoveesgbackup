import test from "node:test";
import assert from "node:assert/strict";
import { createDiagnosticResponseBatchUpsert } from "./diagnosticResponseBatch.js";

test("builds one parameterized upsert statement for the entire response module", () => {
  const sql = createDiagnosticResponseBatchUpsert([
    {
      id: "11111111-1111-4111-8111-111111111111",
      diagnosticId: "22222222-2222-4222-8222-222222222222",
      questionCode: "q-1",
      questionOrder: 1,
      axis: "ENVIRONMENTAL",
      questionText: "Question one",
      questionType: "MULTIPLE_CHOICE",
      answerText: "User supplied answer",
      score: 3,
      weight: "1.00",
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      diagnosticId: "22222222-2222-4222-8222-222222222222",
      questionCode: "q-2",
      questionOrder: 2,
      axis: "ENVIRONMENTAL",
      questionText: "Question two",
      questionType: "TEXT",
      answerText: "Second answer",
      score: null,
      weight: "2.00",
    },
  ]);

  assert.equal((sql.sql.match(/INSERT INTO/g) ?? []).length, 1);
  assert.match(sql.sql, /ON CONFLICT \("diagnosticId", "questionOrder"\) DO UPDATE/);
  assert.doesNotMatch(sql.sql, /User supplied answer|Second answer/);
  assert.ok(sql.values.includes("User supplied answer"));
  assert.ok(sql.values.includes("Second answer"));
});

test("rejects an empty response batch", () => {
  assert.throws(() => createDiagnosticResponseBatchUpsert([]), /Respostas são obrigatórias/);
});

test("deduplicates repeated question orders with the last answer winning", () => {
  const base = {
    id: "11111111-1111-4111-8111-111111111111",
    diagnosticId: "22222222-2222-4222-8222-222222222222",
    questionCode: "q-1",
    questionOrder: 1,
    axis: "ENVIRONMENTAL",
    questionText: "Question one",
    questionType: "TEXT",
    score: null,
    weight: "1.00",
  };
  const sql = createDiagnosticResponseBatchUpsert([
    { ...base, answerText: "stale answer" },
    { ...base, id: "33333333-3333-4333-8333-333333333333", answerText: "latest answer" },
  ]);

  assert.equal(sql.values.length, 10);
  assert.ok(sql.values.includes("latest answer"));
  assert.ok(!sql.values.includes("stale answer"));
});
