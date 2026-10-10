ALTER TABLE public.evidence_scores
  ADD COLUMN IF NOT EXISTS "approvedPoints" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalAvailablePoints" integer NOT NULL DEFAULT 0;

UPDATE public.evidence_scores
SET
  "totalAvailablePoints" = CASE axis
    WHEN 'ENVIRONMENTAL'::"Axis" THEN 73
    WHEN 'BIOECONOMY_CIRCULAR'::"Axis" THEN 76
    WHEN 'SOCIAL'::"Axis" THEN 51
    WHEN 'GOVERNANCE'::"Axis" THEN 79
  END,
  "approvedPoints" = ROUND(("provenScore" * CASE axis
    WHEN 'ENVIRONMENTAL'::"Axis" THEN 73
    WHEN 'BIOECONOMY_CIRCULAR'::"Axis" THEN 76
    WHEN 'SOCIAL'::"Axis" THEN 51
    WHEN 'GOVERNANCE'::"Axis" THEN 79
  END) / 100)::integer;
