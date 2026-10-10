INSERT INTO public.evidence_scores (id, "diagnosticId", axis, "provenScore", "approvedEvidenceCount", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  diagnostics.id,
  axes.axis,
  0,
  0,
  now(),
  now()
FROM public.diagnostics AS diagnostics
CROSS JOIN (VALUES
  ('ENVIRONMENTAL'::"Axis"),
  ('BIOECONOMY_CIRCULAR'::"Axis"),
  ('SOCIAL'::"Axis"),
  ('GOVERNANCE'::"Axis")
) AS axes(axis)
WHERE EXISTS (
  SELECT 1 FROM public.evidences
  WHERE public.evidences."diagnosticId" = diagnostics.id
)
ON CONFLICT ("diagnosticId", axis) DO NOTHING;
