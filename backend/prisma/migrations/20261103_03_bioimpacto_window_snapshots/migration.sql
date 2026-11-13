CREATE TABLE IF NOT EXISTS "bioimpacto_window_snapshots" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "orderId" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "windowNumber" INTEGER NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "approved" INTEGER NOT NULL DEFAULT 0,
  "rejected" INTEGER NOT NULL DEFAULT 0,
  "pending" INTEGER NOT NULL DEFAULT 0,
  "score" DECIMAL(5,2),
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bioimpacto_window_snapshots_orderId_windowNumber_key" UNIQUE ("orderId", "windowNumber")
);
CREATE INDEX IF NOT EXISTS "bioimpacto_window_snapshots_organizationId_orderId_idx"
  ON "bioimpacto_window_snapshots"("organizationId", "orderId");
