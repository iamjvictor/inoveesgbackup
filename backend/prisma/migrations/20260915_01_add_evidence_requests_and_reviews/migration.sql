CREATE TYPE "EvidenceRequestStatus" AS ENUM ('PENDING', 'RECEIVED', 'COMPLETE');

CREATE TABLE "evidence_requirements" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "segmentCode" TEXT,
    "name" TEXT NOT NULL,
    "expectedDocument" TEXT NOT NULL,
    "acceptedTypes" JSONB NOT NULL,
    "groupCode" TEXT NOT NULL,
    "primaryAxis" "Axis" NOT NULL,
    "scoringAxes" JSONB NOT NULL,
    "points" INTEGER NOT NULL,
    "strategicObjectives" JSONB NOT NULL,
    "gapIfMissing" TEXT,
    "recommendedService" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_requirements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "evidence_requests" (
    "id" UUID NOT NULL,
    "diagnosticId" UUID NOT NULL,
    "requirementId" UUID NOT NULL,
    "diagnosticResponseId" UUID,
    "assignedUserId" UUID,
    "status" "EvidenceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_requests_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "evidences"
    ADD COLUMN "requestId" UUID,
    ADD COLUMN "uploadedByUserId" UUID,
    ADD COLUMN "documentType" TEXT;

CREATE TABLE "evidence_reviews" (
    "id" UUID NOT NULL,
    "evidenceId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "previousStatus" "VerificationStatus" NOT NULL,
    "newStatus" "VerificationStatus" NOT NULL,
    "comment" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "evidence_requirements_code_categoryCode_segmentCode_key"
    ON "evidence_requirements"("code", "categoryCode", "segmentCode");
CREATE INDEX "evidence_requirements_categoryCode_segmentCode_active_idx"
    ON "evidence_requirements"("categoryCode", "segmentCode", "active");
CREATE UNIQUE INDEX "evidence_requests_diagnosticId_requirementId_key"
    ON "evidence_requests"("diagnosticId", "requirementId");
CREATE INDEX "evidence_requests_diagnosticId_status_idx"
    ON "evidence_requests"("diagnosticId", "status");
CREATE INDEX "evidence_requests_assignedUserId_status_idx"
    ON "evidence_requests"("assignedUserId", "status");
CREATE INDEX "evidences_requestId_idx" ON "evidences"("requestId");
CREATE INDEX "evidences_uploadedByUserId_idx" ON "evidences"("uploadedByUserId");
CREATE INDEX "evidence_reviews_evidenceId_reviewedAt_idx"
    ON "evidence_reviews"("evidenceId", "reviewedAt");
CREATE INDEX "evidence_reviews_reviewerUserId_reviewedAt_idx"
    ON "evidence_reviews"("reviewerUserId", "reviewedAt");

ALTER TABLE "evidence_requests"
    ADD CONSTRAINT "evidence_requests_diagnosticId_fkey"
    FOREIGN KEY ("diagnosticId") REFERENCES "diagnostics"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "evidence_requests_requirementId_fkey"
    FOREIGN KEY ("requirementId") REFERENCES "evidence_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "evidence_requests_diagnosticResponseId_fkey"
    FOREIGN KEY ("diagnosticResponseId") REFERENCES "diagnostic_responses"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "evidence_requests_assignedUserId_fkey"
    FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "evidences"
    ADD CONSTRAINT "evidences_requestId_fkey"
    FOREIGN KEY ("requestId") REFERENCES "evidence_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "evidences_uploadedByUserId_fkey"
    FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "evidence_reviews"
    ADD CONSTRAINT "evidence_reviews_evidenceId_fkey"
    FOREIGN KEY ("evidenceId") REFERENCES "evidences"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "evidence_reviews_reviewerUserId_fkey"
    FOREIGN KEY ("reviewerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
