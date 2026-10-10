CREATE TABLE "evidence_scores" (
    "id" UUID NOT NULL,
    "diagnosticId" UUID NOT NULL,
    "axis" "Axis" NOT NULL,
    "provenScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "approvedEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "evidence_scores_diagnosticId_axis_key"
    ON "evidence_scores"("diagnosticId", "axis");
CREATE INDEX "evidence_scores_diagnosticId_idx"
    ON "evidence_scores"("diagnosticId");

ALTER TABLE "evidence_scores"
    ADD CONSTRAINT "evidence_scores_diagnosticId_fkey"
    FOREIGN KEY ("diagnosticId") REFERENCES "diagnostics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidence_scores" ENABLE ROW LEVEL SECURITY;
