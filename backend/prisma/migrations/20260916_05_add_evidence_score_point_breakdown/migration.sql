ALTER TABLE "evidence_scores"
  ADD COLUMN "approvedPoints" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "totalAvailablePoints" INTEGER NOT NULL DEFAULT 0;

UPDATE "evidence_scores"
SET
  "totalAvailablePoints" = CASE "axis"
    WHEN 'ENVIRONMENTAL'::"Axis" THEN 73
    WHEN 'BIOECONOMY_CIRCULAR'::"Axis" THEN 76
    WHEN 'SOCIAL'::"Axis" THEN 51
    WHEN 'GOVERNANCE'::"Axis" THEN 79
  END,
  "approvedPoints" = ROUND(("provenScore" * CASE "axis"
    WHEN 'ENVIRONMENTAL'::"Axis" THEN 73
    WHEN 'BIOECONOMY_CIRCULAR'::"Axis" THEN 76
    WHEN 'SOCIAL'::"Axis" THEN 51
    WHEN 'GOVERNANCE'::"Axis" THEN 79
  END) / 100)::INTEGER;
