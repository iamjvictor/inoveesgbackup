-- The EXPIRED enum value was committed by the previous migration.
WITH pending_keys AS (
  SELECT
    o.id,
    ROW_NUMBER() OVER (
      PARTITION BY o."organizationId", o."checkoutKey"
      ORDER BY o."createdAt" DESC, o.id DESC
    ) AS row_number
  FROM "orders" o
  WHERE o.status = 'PENDING_PAYMENT'
    AND o."checkoutKey" IS NOT NULL
)
UPDATE "orders" o
SET
  status = 'EXPIRED'::"OrderStatus",
  "canceledAt" = CURRENT_TIMESTAMP
FROM pending_keys
WHERE o.id = pending_keys.id
  AND pending_keys.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_active_checkout_key_key"
  ON "orders"("organizationId", "checkoutKey")
  WHERE status = 'PENDING_PAYMENT' AND "checkoutKey" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "orders_organizationId_status_checkoutExpiresAt_idx"
  ON "orders"("organizationId", status, "checkoutExpiresAt");
