DO $$ BEGIN
  CREATE TYPE "EvidenceCategory" AS ENUM (
    'REGULARIZATION',
    'CONSERVATION',
    'NATURAL_RESOURCES',
    'SUSTAINABLE_PRODUCTION',
    'PEOPLE_AND_SOCIAL',
    'GOVERNANCE',
    'TRACEABILITY_AND_QUALITY',
    'PHOTOGRAPHIC'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "evidences"
ADD COLUMN IF NOT EXISTS "evidenceCategory" "EvidenceCategory";

ALTER TABLE "evidences"
ADD COLUMN IF NOT EXISTS "storageBucket" TEXT NOT NULL DEFAULT 'diagnostic-evidences';
