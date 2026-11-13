CREATE TABLE IF NOT EXISTS public.email_outbox (
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
  CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "email_outbox_eventKey_key" UNIQUE ("eventKey")
);
CREATE INDEX IF NOT EXISTS "email_outbox_status_nextAttemptAt_idx"
  ON public.email_outbox("status", "nextAttemptAt");
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.email_outbox FROM anon, authenticated;
