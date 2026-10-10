ALTER TABLE "products"
ADD COLUMN "priceCents" INTEGER;

ALTER TABLE "products"
ADD CONSTRAINT "products_priceCents_nonnegative_check"
CHECK ("priceCents" IS NULL OR "priceCents" >= 0);

INSERT INTO "products" (
  "id", "code", "name", "description", "productKind", "active", "priceCents", "createdAt", "updatedAt"
)
VALUES
  (gen_random_uuid(), 'PRE_DIAGNOSTIC', 'Diagnóstico autodeclarável ESG', 'Questionário de pré-diagnóstico ESG autodeclarável.', 'ONE_TIME'::"ProductKind", TRUE, 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'PRE_DIAGNOSTIC_PLUS', 'Pré-Diagnóstico ESG + Consultoria', 'Pré-diagnóstico autodeclarável com uma hora de consultoria.', 'ONE_TIME'::"ProductKind", TRUE, 50000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'CONSULTING_1H', 'Consultoria ESG — Call de 1 hora', 'Sessão individual de consultoria ESG com duração de 1 hora.', 'ONE_TIME'::"ProductKind", TRUE, 30000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'LIVRO_ESG', 'Livro Bioeconomia & ESG', 'Compra do livro digital Bioeconomia & ESG.', 'ONE_TIME'::"ProductKind", TRUE, 4190, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET "priceCents" = EXCLUDED."priceCents",
    "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "services" AS service
SET "basePriceCents" = product."priceCents"
FROM "products" AS product
WHERE product.id = service."productId"
  AND product.code = 'CONSULTING_1H'
  AND product."priceCents" IS NOT NULL;
