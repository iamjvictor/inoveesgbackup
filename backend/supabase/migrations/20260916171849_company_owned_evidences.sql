+ALTER TABLE public.evidences
  ADD COLUMN IF NOT EXISTS "organizationId" uuid;

UPDATE public.evidences AS evidence
SET "organizationId" = diagnostic."organizationId"
FROM public.diagnostics AS diagnostic
WHERE diagnostic.id = evidence."diagnosticId"
  AND evidence."organizationId" IS NULL;

ALTER TABLE public.evidences
  ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE public.evidences
  ADD CONSTRAINT evidences_organizationId_fkey
  FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS evidences_organizationId_idx
  ON public.evidences ("organizationId");

ALTER TABLE public.evidence_scores
  ADD COLUMN IF NOT EXISTS "organizationId" uuid;

UPDATE public.evidence_scores AS evidence_score
SET "organizationId" = diagnostic."organizationId"
FROM public.diagnostics AS diagnostic
WHERE diagnostic.id = evidence_score."diagnosticId"
  AND evidence_score."organizationId" IS NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "organizationId", axis
      ORDER BY "provenScore" DESC, "updatedAt" DESC, id
    ) AS row_number
  FROM public.evidence_scores
)
DELETE FROM public.evidence_scores
WHERE id IN (SELECT id FROM ranked WHERE row_number > 1);

DROP INDEX IF EXISTS public.evidence_scores_diagnosticId_axis_key;

ALTER TABLE public.evidence_scores
  DROP CONSTRAINT IF EXISTS evidence_scores_diagnosticId_fkey,
  DROP COLUMN IF EXISTS "diagnosticId",
  ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE public.evidence_scores
  ADD CONSTRAINT evidence_scores_organizationId_fkey
  FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS evidence_scores_organizationId_axis_key
  ON public.evidence_scores ("organizationId", axis);

CREATE INDEX IF NOT EXISTS evidence_scores_organizationId_idx
  ON public.evidence_scores ("organizationId");
