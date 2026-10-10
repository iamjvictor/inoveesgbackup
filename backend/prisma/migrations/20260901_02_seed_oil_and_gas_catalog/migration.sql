INSERT INTO "business_categories" ("id", "code", "name", "active", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'OLEO_E_GAS'::"BusinessCategoryCode", 'Óleo e Gás', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET "name" = EXCLUDED."name", "active" = TRUE, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "business_segments" ("id", "categoryId", "code", "name", "active", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", 'OLEO_E_GAS'::"BusinessSegmentCode", 'Óleo e Gás', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "business_categories"
WHERE "code" = 'OLEO_E_GAS'::"BusinessCategoryCode"
ON CONFLICT ("code") DO UPDATE
SET "categoryId" = EXCLUDED."categoryId", "name" = EXCLUDED."name", "active" = TRUE, "updatedAt" = CURRENT_TIMESTAMP;
