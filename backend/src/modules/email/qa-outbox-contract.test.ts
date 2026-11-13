import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(resolve(here, path), "utf8");

test("email outbox schema has a durable unique event key and retry/lease state", () => {
  const schema = read("../../../prisma/schema.prisma");
  const model = schema.match(/model EmailOutbox\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(model, "Prisma model EmailOutbox must exist");
  assert.match(model!, /eventKey\s+String\s+@unique/);
  assert.match(model!, /eventType\s+String/);
  assert.match(model!, /recipient\s+String/);
  assert.match(model!, /payload\s+Json/);
  assert.match(model!, /status\s+String\s+@default\("PENDING"\)/);
  assert.match(model!, /attempts\s+Int/);
  assert.match(model!, /nextAttemptAt\s+DateTime/);
  assert.match(model!, /leaseUntil\s+DateTime\?/);
  assert.match(model!, /leaseToken\s+String\?/);
});

test("Supabase outbox migration protects the private queue from client roles", () => {
  const migrations = read("../../../supabase/migrations/20261104130000_add_email_outbox.sql");
  assert.match(migrations, /ENABLE ROW LEVEL SECURITY/i);
  assert.match(migrations, /REVOKE ALL ON TABLE public\.email_outbox FROM anon, authenticated/i);
  assert.match(migrations, /UNIQUE\s*\("eventKey"\)/i);
});

test("welcome event is created within the local user transaction", () => {
  const source = read("../auth/repositories/authRepository.ts");
  const transactionStart = source.indexOf("return prisma.$transaction(");
  const outboxWrite = source.indexOf("transaction.emailOutbox.create");
  const organizationWrite = source.indexOf("transaction.organization.create");
  assert.ok(transactionStart >= 0 && outboxWrite > transactionStart && outboxWrite < organizationWrite,
    "welcome outbox insert must be part of createUserWithOrganization transaction");
  assert.match(source.slice(outboxWrite, organizationWrite), /eventKey:\s*`welcome:\$\{user\.id\}`/);
});

test("diagnostic completion event is inserted in the score/status transaction with a stable diagnostic key", () => {
  const source = read("../diagnostic/services/diagnosticService.ts");
  const transactionStart = source.lastIndexOf("prisma.$transaction(async (tx) =>", source.indexOf("private async saveCalculatedScore"));
  const outboxWrite = source.indexOf("tx.emailOutbox.create", source.indexOf("private async saveCalculatedScore"));
  const statusWrite = source.indexOf('status: "COMPLETED"', source.indexOf("private async saveCalculatedScore"));
  assert.ok(transactionStart >= 0 && outboxWrite > transactionStart && statusWrite > transactionStart,
    "score, completion status, and notification intent must be committed in one transaction");
  assert.match(source.slice(outboxWrite, outboxWrite + 500), /eventKey:\s*`diagnostic-completed:\$\{diagnosticId\}`/);
});

test("Prisma migration also enables RLS and revokes client-role access", () => {
  const migration = read("../../../prisma/migrations/20261104_02_add_email_outbox/migration.sql");
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/i);
  assert.match(migration, /REVOKE ALL ON TABLE "email_outbox" FROM anon/i);
  assert.match(migration, /REVOKE ALL ON TABLE "email_outbox" FROM authenticated/i);
});

test("diagnostic completion targets the user who finalized the diagnostic", () => {
  const source = read("../diagnostic/services/diagnosticService.ts");
  const saveStart = source.indexOf("private async saveCalculatedScore");
  const body = source.slice(saveStart, source.indexOf("async startDiagnostic", saveStart));
  assert.match(source, /saveCalculatedScore\(diagnosticId, supabaseUserId,/);
  assert.match(body, /tx\.user\.findUnique\(\{ where: \{ supabaseUserId \}/);
  assert.match(body, /recipient:\s*recipient\.email/);
  assert.match(body, /where: \{ id: diagnosticId, status: \{ not: "COMPLETED" \} \}/);
});
