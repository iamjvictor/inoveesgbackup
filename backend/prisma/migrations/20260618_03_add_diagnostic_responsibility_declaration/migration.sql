ALTER TABLE "diagnostics"
ADD COLUMN IF NOT EXISTS "responsibilityDeclarationAccepted" BOOLEAN NOT NULL DEFAULT FALSE;
