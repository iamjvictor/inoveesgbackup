import type { PrismaClient, Diagnostic } from "@prisma/client";

type StartDatabase = Pick<PrismaClient, "$transaction">;

export function assertDiagnosticStartAccess(hasCompanyRole: boolean, hasPreDiagnosticAccess: boolean) {
  if (hasCompanyRole && !hasPreDiagnosticAccess) {
    throw new Error("Você precisa adquirir o Pré-Diagnóstico ou um plano de assessoria para iniciar a avaliação.");
  }
}

export async function startOrReuseOpenDiagnostic(
  db: StartDatabase,
  params: {
    organizationId: string;
    kind: "PRE_DIAGNOSTIC" | "FULL_DIAGNOSTIC" | "SUPPLIER_DIAGNOSTIC";
    consultoriaAccess: boolean;
  },
): Promise<{ diagnostic: Pick<Diagnostic, "id" | "kind" | "status" | "createdAt" | "updatedAt">; createdNewDiagnostic: boolean }> {
  return db.$transaction(async (tx) => {
    // The transaction-scoped advisory lock serializes the read/insert per company.
    await tx.$queryRaw`SELECT 1 AS locked FROM (SELECT pg_advisory_xact_lock(hashtext(${params.organizationId}))) AS organization_lock`;

    const currentDiagnostic = await tx.diagnostic.findFirst({
      where: { organizationId: params.organizationId, status: { in: ["DRAFT", "ACTIVE"] } },
      select: { id: true, kind: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    if (currentDiagnostic) return { diagnostic: currentDiagnostic, createdNewDiagnostic: false };

    const latestCompletedDiagnostic = await tx.diagnostic.findFirst({
      where: { organizationId: params.organizationId, status: "COMPLETED" },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });
    if (latestCompletedDiagnostic && !params.consultoriaAccess) {
      throw new Error("Você já concluiu este diagnóstico. Para refazer, contrate um plano de consultoria.");
    }

    const diagnostic = await tx.diagnostic.create({
      data: { organizationId: params.organizationId, kind: params.kind, status: "DRAFT" },
      select: { id: true, kind: true, status: true, createdAt: true, updatedAt: true },
    });
    return { diagnostic, createdNewDiagnostic: true };
  });
}
