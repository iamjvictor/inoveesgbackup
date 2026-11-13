-- Keep the technical codes stable: checkout and entitlement rules depend on them.
INSERT INTO "products" (
  "id", "code", "name", "description", "productKind", "active", "priceCents", "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), 'FULL_DIAGNOSTIC', 'Serviço 2 — Diagnóstico Estratégico ESG',
   'Diagnóstico ESG com análise de evidências, plano de melhoria e selo de verificação.',
   'ONE_TIME'::"ProductKind", TRUE, 795000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'FULL_DIAGNOSTIC_PLUS', 'Pacote 2 — Diagnóstico Estratégico ESG + Consultoria',
   'Serviço 2 com duas consultorias de 1 hora.',
   'ONE_TIME'::"ProductKind", TRUE, 875000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "productKind" = EXCLUDED."productKind",
  "active" = TRUE,
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Legacy aliases remain available for historical orders and budget requests.
