INSERT INTO "products" (
  "id", "code", "name", "description", "productKind", "active", "priceCents", "createdAt", "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'FULL_DIAGNOSTIC',
  'Diagnóstico Estratégico ESG',
  'Diagnóstico estratégico ESG com análise de evidências, plano de melhoria e selo de verificação.',
  'ONE_TIME'::"ProductKind",
  TRUE,
  795000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "productKind" = EXCLUDED."productKind",
  "active" = TRUE,
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "products" (
  "id", "code", "name", "description", "productKind", "active", "priceCents", "createdAt", "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'FULL_DIAGNOSTIC_PLUS',
  'Diagnóstico Estratégico ESG + Consultoria',
  'Diagnóstico estratégico ESG com duas consultorias de 1 hora.',
  'ONE_TIME'::"ProductKind",
  TRUE,
  875000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "productKind" = EXCLUDED."productKind",
  "active" = TRUE,
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = CURRENT_TIMESTAMP;
