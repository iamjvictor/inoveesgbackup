import type { Prisma, PrismaClient } from "@prisma/client";

type DiagnosticMutationTransaction = Pick<Prisma.TransactionClient, "$queryRaw">;
type DiagnosticMutationDatabase = Pick<PrismaClient, "$transaction">;

export async function lockDiagnosticMutation(
  tx: DiagnosticMutationTransaction,
  diagnosticId: string,
): Promise<void> {
  // Keep the lock inside the transaction while returning a Prisma-compatible
  // scalar (the advisory lock function itself returns PostgreSQL `void`).
  await tx.$queryRaw`SELECT 1 AS locked FROM (SELECT pg_advisory_xact_lock(hashtext(${diagnosticId}))) AS diagnostic_lock`;
}

export function withDiagnosticMutationLock<T>(
  db: DiagnosticMutationDatabase,
  diagnosticId: string,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return db.$transaction(async (tx) => {
    await lockDiagnosticMutation(tx, diagnosticId);
    return operation(tx);
  }, { maxWait: 15_000, timeout: 60_000 });
}
