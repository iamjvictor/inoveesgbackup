INSERT INTO "products" ("id", "code", "name", "description", "productKind", "active", "priceCents", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'BIOIMPACTO_EMPRESARIAL', 'Plano 2.2 — Bioimpacto Empresarial',
  'Serviço 2 com gestão contínua de evidências, análise de risco ESG e propostas de melhoria por 12 meses.',
  'SUBSCRIPTION'::"ProductKind", TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description",
  "productKind" = EXCLUDED."productKind", "active" = TRUE, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "plans" ("id", "productId", "billingPeriod", "priceCents", "currency", "trialDays", "isAutoRenew", "createdAt", "updatedAt")
SELECT gen_random_uuid(), p."id", 'YEAR'::"BillingPeriod", 3800000, 'BRL', NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "products" p WHERE p."code" = 'BIOIMPACTO_EMPRESARIAL'
ON CONFLICT ("productId") DO UPDATE SET "billingPeriod" = EXCLUDED."billingPeriod", "priceCents" = EXCLUDED."priceCents", "isAutoRenew" = FALSE, "updatedAt" = CURRENT_TIMESTAMP;
