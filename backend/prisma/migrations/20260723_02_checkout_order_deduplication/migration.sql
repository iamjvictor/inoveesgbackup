ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "checkoutKey" TEXT,
  ADD COLUMN IF NOT EXISTS "checkoutExpiresAt" TIMESTAMP(3);

WITH candidates AS (
  SELECT
    o.id,
    o."organizationId",
    o."createdAt",
    CASE
      WHEN oi.metadata->>'budgetRequestId' IS NOT NULL
        THEN CONCAT('BUDGET:', oi.metadata->>'budgetRequestId')
      ELSE CONCAT(p.code, ':', oi.quantity)
    END AS checkout_key
  FROM "orders" o
  INNER JOIN "order_items" oi ON oi."orderId" = o.id
  INNER JOIN "products" p ON p.id = oi."productId"
  WHERE o.status = 'PENDING_PAYMENT'
), pending_keys AS (
  SELECT
    candidates.*,
    ROW_NUMBER() OVER (
      PARTITION BY candidates."organizationId", candidates.checkout_key
      ORDER BY candidates."createdAt" DESC, candidates.id DESC
    ) AS row_number
  FROM candidates
)
UPDATE "orders" o
SET
  "checkoutKey" = pending_keys.checkout_key,
  "checkoutExpiresAt" = o."createdAt" + INTERVAL '24 hours'
FROM pending_keys
WHERE o.id = pending_keys.id;
