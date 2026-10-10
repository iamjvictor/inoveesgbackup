ALTER TABLE "diagnostic_scores"
ADD COLUMN IF NOT EXISTS "bioeconomyCircularScore" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "provenBioeconomyCircularScore" DECIMAL(5,2);
