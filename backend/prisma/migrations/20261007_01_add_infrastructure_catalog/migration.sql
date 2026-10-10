ALTER TYPE "BusinessCategoryCode" ADD VALUE IF NOT EXISTS 'INFRAESTRUTURA';
ALTER TYPE "BusinessSegmentCode" ADD VALUE IF NOT EXISTS 'INFRAESTRUTURA';

INSERT INTO "business_categories" ("id", "code", "name", "active", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'INFRAESTRUTURA'::"BusinessCategoryCode", 'Infraestrutura', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET "name" = EXCLUDED."name", "active" = TRUE, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "business_segments" ("id", "categoryId", "code", "name", "active", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", 'INFRAESTRUTURA'::"BusinessSegmentCode", 'Infraestrutura', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "business_categories"
WHERE "code" = 'INFRAESTRUTURA'::"BusinessCategoryCode"
ON CONFLICT ("code") DO UPDATE
SET "categoryId" = EXCLUDED."categoryId", "name" = EXCLUDED."name", "active" = TRUE, "updatedAt" = CURRENT_TIMESTAMP;
