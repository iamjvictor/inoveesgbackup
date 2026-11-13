CREATE TABLE "email_outbox" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "eventKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseUntil" TIMESTAMP(3),
  "leaseToken" TEXT,
  "providerMessageId" TEXT,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_outbox_eventKey_key" ON "email_outbox"("eventKey");
CREATE INDEX "email_outbox_status_nextAttemptAt_idx" ON "email_outbox"("status", "nextAttemptAt");

ALTER TABLE "email_outbox" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "email_outbox" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "email_outbox" FROM authenticated;
  END IF;
END
$$;
