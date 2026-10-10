CREATE TABLE "evidence_notes" (
    "id" UUID NOT NULL,
    "evidenceId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "evidence_notes_evidenceId_createdAt_idx"
    ON "evidence_notes"("evidenceId", "createdAt");

ALTER TABLE "evidence_notes"
    ADD CONSTRAINT "evidence_notes_evidenceId_fkey"
    FOREIGN KEY ("evidenceId") REFERENCES "evidences"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "evidence_notes_authorUserId_fkey"
    FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "evidence_notes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "evidence_notes" FROM anon, authenticated;
