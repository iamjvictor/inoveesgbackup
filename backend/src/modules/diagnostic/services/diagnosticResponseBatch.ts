import { Prisma } from "@prisma/client";

export type DiagnosticResponseBatchRow = {
  id: string;
  diagnosticId: string;
  questionCode: string;
  questionOrder: number;
  axis: string;
  questionText: string;
  questionType: string;
  answerText: string;
  score: number | null;
  weight: string;
};

export function createDiagnosticResponseBatchUpsert(rows: DiagnosticResponseBatchRow[]) {
  if (rows.length === 0) throw new Error("Respostas são obrigatórias para salvar o pilar");

  // PostgreSQL does not allow one INSERT ... ON CONFLICT statement to affect
  // the same unique key twice. Preserve the previous sequential-upsert rule:
  // the last response for a questionOrder wins.
  const rowsByQuestionOrder = new Map<number, DiagnosticResponseBatchRow>();
  for (const row of rows) rowsByQuestionOrder.set(row.questionOrder, row);

  const values = Prisma.join([...rowsByQuestionOrder.values()].map((row) => Prisma.sql`(
    ${row.id}::uuid,
    ${row.diagnosticId}::uuid,
    ${row.questionCode},
    ${row.questionOrder},
    CAST(${row.axis} AS "Axis"),
    ${row.questionText},
    CAST(${row.questionType} AS "QuestionType"),
    ${row.answerText},
    ${row.score},
    CAST(${row.weight} AS decimal),
    NOW(),
    NOW()
  )`));

  return Prisma.sql`
    INSERT INTO "diagnostic_responses" (
      "id", "diagnosticId", "questionCode", "questionOrder", "axis",
      "questionText", "questionType", "answerText", "score", "weight",
      "answeredAt", "updatedAt"
    )
    VALUES ${values}
    ON CONFLICT ("diagnosticId", "questionOrder") DO UPDATE SET
      "questionCode" = EXCLUDED."questionCode",
      "axis" = EXCLUDED."axis",
      "questionText" = EXCLUDED."questionText",
      "questionType" = EXCLUDED."questionType",
      "answerText" = EXCLUDED."answerText",
      "score" = EXCLUDED."score",
      "weight" = EXCLUDED."weight",
      "answeredAt" = EXCLUDED."answeredAt",
      "updatedAt" = NOW()
  `;
}
