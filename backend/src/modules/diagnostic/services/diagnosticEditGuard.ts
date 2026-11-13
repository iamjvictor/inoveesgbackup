import type { Prisma, DiagnosticKind, DiagnosticStatus } from "@prisma/client";

type DiagnosticEditTransaction = Pick<Prisma.TransactionClient, "$queryRaw">;

export async function assertDiagnosticCanBeEdited(
  tx: DiagnosticEditTransaction,
  diagnosticId: string,
  organizationId: string,
): Promise<DiagnosticKind> {
  const rows = await tx.$queryRaw<Array<{
    id: string;
    organizationId: string;
    status: DiagnosticStatus;
    kind: DiagnosticKind;
  }>>`
    SELECT "id", "organizationId", "status", "kind"
    FROM "diagnostics"
    WHERE "id" = ${diagnosticId}::uuid
    FOR UPDATE
  `;
  const diagnostic = rows[0];
  if (!diagnostic) throw new Error("Diagnóstico não encontrado");
  if (diagnostic.organizationId !== organizationId) {
    throw new Error("Diagnóstico não pertence à sua empresa");
  }
  if (diagnostic.status === "COMPLETED") {
    throw new Error("Este diagnóstico já foi concluído e não pode ser editado.");
  }
  return diagnostic.kind;
}
