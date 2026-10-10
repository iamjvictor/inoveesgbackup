CREATE TABLE IF NOT EXISTS public.evidence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "diagnosticId" uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  axis "Axis" NOT NULL,
  "provenScore" numeric(5,2) NOT NULL DEFAULT 0,
  "approvedEvidenceCount" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidence_scores_diagnostic_axis_key UNIQUE ("diagnosticId", axis)
);

CREATE INDEX IF NOT EXISTS evidence_scores_diagnostic_id_idx
  ON public.evidence_scores ("diagnosticId");

ALTER TABLE public.evidence_scores ENABLE ROW LEVEL SECURITY;
