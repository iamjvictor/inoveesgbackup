ALTER TABLE "budget_requests"
ADD COLUMN "requestedByUserId" UUID;

-- Preserve existing requests by assigning them to the primary organization contact
-- (or the oldest member when no primary contact is set).
UPDATE "budget_requests" br
SET "requestedByUserId" = (
  SELECT ou."userId"
  FROM "organization_users" ou
  WHERE ou."organizationId" = br."organizationId"
  ORDER BY ou."isPrimaryContact" DESC,
    CASE WHEN ou."membershipRole" = 'OWNER'::"MembershipRole" THEN 0 ELSE 1 END,
    ou."createdAt"
  LIMIT 1
)
WHERE br."requestedByUserId" IS NULL;

ALTER TABLE "budget_requests"
ADD CONSTRAINT "budget_requests_requestedByUserId_fkey"
FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "budget_requests_organizationId_requestedByUserId_status_idx"
ON "budget_requests"("organizationId", "requestedByUserId", "status");
