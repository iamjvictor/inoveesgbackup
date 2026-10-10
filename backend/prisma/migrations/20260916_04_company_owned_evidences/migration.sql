ALTER TABLE evidences
  ADD COLUMN IF NOT EXISTS "organizationId" uuid;

UPDATE evidences AS evidence
SET "organizationId" = diagnostic."organizationId"
FROM diagnostics AS diagnostic
WHERE diagnostic.id = evidence."diagnosticId"
  AND evidence."organizationId" IS NULL;

ALTER TABLE evidences
  ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE evidences
  ADD CONSTRAINT evidences_organizationId_fkey
  FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS evidences_organizationId_idx
  ON evidences ("organizationId");

ALTER TABLE evidence_scores
  ADD COLUMN IF NOT EXISTS "organizationId" uuid;

UPDATE evidence_scores AS evidence_score
SET "organizationId" = diagnostic."organizationId"
FROM diagnostics AS diagnostic
WHERE diagnostic.id = evidence_score."diagnosticId"
  AND evidence_score."organizationId" IS NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "organizationId", axis
      ORDER BY "provenScore" DESC, "updatedAt" DESC, id
    ) AS row_number
  FROM evidence_scores
)
DELETE FROM evidence_scores
WHERE id IN (SELECT id FROM ranked WHERE row_number > 1);

DROP INDEX IF EXISTS evidence_scores_diagnosticId_axis_key;

ALTER TABLE evidence_scores
  DROP CONSTRAINT IF EXISTS evidence_scores_diagnosticId_fkey,
  DROP COLUMN IF EXISTS "diagnosticId",
  ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE evidence_scores
  ADD CONSTRAINT evidence_scores_organizationId_fkey
  FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS evidence_scores_organizationId_axis_key
  ON evidence_scores ("organizationId", axis);

CREATE INDEX IF NOT EXISTS evidence_scores_organizationId_idx
  ON evidence_scores ("organizationId");
