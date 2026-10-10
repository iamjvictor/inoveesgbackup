-- Standalone one-hour consulting session.
ALTER TABLE "services"
ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 60;

INSERT INTO "products" ("id", "code", "name", "description", "productKind", "active", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'CONSULTING_1H',
  'Consultoria ESG — Call de 1 hora',
  'Sessão individual de consultoria ESG com duração de 1 hora.',
  'ONE_TIME'::"ProductKind",
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "productKind" = EXCLUDED."productKind",
  "active" = TRUE,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "services" ("id", "productId", "pricingType", "basePriceCents", "currency", "requiresApproval", "durationMinutes", "createdAt", "updatedAt")
SELECT gen_random_uuid(), p."id", 'FIXED'::"PricingType", 25000, 'BRL', FALSE, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "products" p
WHERE p."code" = 'CONSULTING_1H'
ON CONFLICT ("productId") DO UPDATE SET
  "pricingType" = EXCLUDED."pricingType",
  "basePriceCents" = EXCLUDED."basePriceCents",
  "currency" = EXCLUDED."currency",
  "requiresApproval" = EXCLUDED."requiresApproval",
  "durationMinutes" = EXCLUDED."durationMinutes",
  "updatedAt" = CURRENT_TIMESTAMP;
