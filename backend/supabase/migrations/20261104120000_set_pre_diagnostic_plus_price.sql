-- PRE_DIAGNOSTIC_PLUS passa a custar 55000 centavos: Serviço 01 + uma consultoria de 1 hora.
UPDATE "products"
SET "priceCents" = 55000,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'PRE_DIAGNOSTIC_PLUS'
  AND "priceCents" IS DISTINCT FROM 55000;
