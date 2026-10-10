import { Prisma, PrismaClient } from "@prisma/client";
import { getDiagnosticQuestionsForSegment } from "../modules/diagnostic/services/diagnosticService.js";

const prisma = new PrismaClient();

class RollbackTest extends Error {}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

function uniqueCnpj(index: number) {
  const suffix = `${Date.now()}${index}`.slice(-14);
  return suffix.padStart(14, "0");
}

async function createOrganization(
  tx: Prisma.TransactionClient,
  index: number,
  name: string
) {
  return tx.organization.create({
    data: {
      legalName: name,
      tradeName: name,
      cnpj: uniqueCnpj(index),
      businessCategory: { connect: { code: "AGRONEGOCIO" } },
      businessSegment: { connect: { code: "PRODUCAO" } },
      industrySegment: "Produção",
      specificActivity: "CAFE",
    },
  });
}

async function main() {
  console.log("=== TESTE DE INTEGRAÇÃO — DIAGNÓSTICO AUTODECLARÁVEL ===");
  console.log("Todas as alterações serão revertidas ao final.");

  try {
    await prisma.$transaction(async (tx) => {
      // CP-01: empresa normal compra o autodeclaratório.
      const company = await createOrganization(tx, 1, "TESTE — Empresa compradora");
      await tx.organizationRole.create({
        data: {
          organizationId: company.id,
          role: "COMPANY",
          source: "SELF_SIGNUP",
        },
      });

      const companyDiagnostic = await tx.diagnostic.create({
        data: {
          organizationId: company.id,
          kind: "PRE_DIAGNOSTIC",
          status: "ACTIVE",
        },
      });

      const companyQuestions = getDiagnosticQuestionsForSegment(
        "Produção",
        "PRODUCAO",
        "AGRONEGOCIO",
        "PRE_DIAGNOSTIC"
      );

      assert(companyDiagnostic.kind === "PRE_DIAGNOSTIC", "Empresa compradora possui PRE_DIAGNOSTIC");
      assert(companyQuestions.length === 75, "Empresa compradora recebe 75 questões");

      // CP-02: fornecedor entra por convite e responde sem comprar.
      const freeSupplier = await createOrganization(tx, 2, "TESTE — Fornecedor gratuito");
      await tx.organizationRole.create({
        data: {
          organizationId: freeSupplier.id,
          role: "SUPPLIER",
          source: "INVITE",
        },
      });

      const supplierDiagnostic = await tx.diagnostic.create({
        data: {
          organizationId: freeSupplier.id,
          kind: "SUPPLIER_DIAGNOSTIC",
          status: "ACTIVE",
        },
      });

      const supplierQuestions = getDiagnosticQuestionsForSegment(
        "Produção",
        "PRODUCAO",
        "AGRONEGOCIO",
        "SUPPLIER_DIAGNOSTIC"
      );

      assert(supplierDiagnostic.kind === "SUPPLIER_DIAGNOSTIC", "Fornecedor gratuito possui SUPPLIER_DIAGNOSTIC");
      assert(supplierQuestions.length === 36, "Fornecedor de produção recebe 36 questões");

      // CP-03: fornecedor compra e passa a responder o diagnóstico empresarial.
      const upgradingSupplier = await createOrganization(tx, 3, "TESTE — Fornecedor comprador");
      await tx.organizationRole.create({
        data: {
          organizationId: upgradingSupplier.id,
          role: "SUPPLIER",
          source: "INVITE",
        },
      });
      await tx.diagnostic.create({
        data: {
          organizationId: upgradingSupplier.id,
          kind: "SUPPLIER_DIAGNOSTIC",
          status: "ACTIVE",
        },
      });

      await tx.organizationRole.create({
        data: {
          organizationId: upgradingSupplier.id,
          role: "COMPANY",
          source: "UPGRADE",
        },
      });
      const purchasedDiagnostic = await tx.diagnostic.create({
        data: {
          organizationId: upgradingSupplier.id,
          kind: "PRE_DIAGNOSTIC",
          status: "ACTIVE",
        },
      });

      const anchor = await createOrganization(tx, 4, "TESTE — Empresa âncora");
      await tx.organizationRole.create({
        data: {
          organizationId: anchor.id,
          role: "COMPANY",
          source: "SELF_SIGNUP",
        },
      });
      const relationship = await tx.organizationRelationship.create({
        data: {
          buyerOrganizationId: anchor.id,
          supplierOrganizationId: upgradingSupplier.id,
          status: "ACTIVE",
        },
      });

      const upgradingRoles = await tx.organizationRole.findMany({
        where: { organizationId: upgradingSupplier.id, removedAt: null },
      });
      const upgradingDiagnostics = await tx.diagnostic.findMany({
        where: { organizationId: upgradingSupplier.id },
      });
      const purchasedQuestions = getDiagnosticQuestionsForSegment(
        "Produção",
        "PRODUCAO",
        "AGRONEGOCIO",
        "PRE_DIAGNOSTIC"
      );

      assert(upgradingRoles.some((role) => role.role === "COMPANY" && role.source === "UPGRADE"), "Fornecedor comprador recebe COMPANY / UPGRADE");
      assert(!upgradingRoles.some((role) => role.role === "SUPPLIER"), "Fornecedor comprador deixa de ter SUPPLIER ativo após a compra");
      assert(upgradingDiagnostics.some((diagnostic) => diagnostic.kind === "SUPPLIER_DIAGNOSTIC"), "Diagnóstico de fornecedor é preservado");
      assert(upgradingDiagnostics.some((diagnostic) => diagnostic.id === purchasedDiagnostic.id && diagnostic.kind === "PRE_DIAGNOSTIC"), "Novo diagnóstico empresarial é criado separadamente");
      assert(relationship.status === "ACTIVE", "Fornecedor comprador continua relacionado à empresa âncora");
      assert(purchasedQuestions.length === 75, "Fornecedor que comprou recebe 75 questões no PRE_DIAGNOSTIC");

      // CP-04: empresa já concluída recebe convite e apenas cria o vínculo.
      const existingCompany = await createOrganization(tx, 5, "TESTE — Empresa já diagnosticada");
      await tx.organizationRole.create({
        data: {
          organizationId: existingCompany.id,
          role: "COMPANY",
          source: "UPGRADE",
        },
      });
      const completedDiagnostic = await tx.diagnostic.create({
        data: {
          organizationId: existingCompany.id,
          kind: "PRE_DIAGNOSTIC",
          status: "COMPLETED",
          completedAt: new Date(),
          responsibilityDeclarationAccepted: true,
        },
      });
      const savedScore = await tx.diagnosticScore.create({
        data: {
          diagnosticId: completedDiagnostic.id,
          overallScore: 80,
          environmentalScore: 80,
          bioeconomyCircularScore: 80,
          socialScore: 80,
          governanceScore: 80,
        },
      });
      await tx.organizationRelationship.create({
        data: {
          buyerOrganizationId: anchor.id,
          supplierOrganizationId: existingCompany.id,
          status: "ACTIVE",
        },
      });

      const existingRoles = await tx.organizationRole.findMany({
        where: { organizationId: existingCompany.id, removedAt: null },
      });
      const existingDiagnostics = await tx.diagnostic.findMany({
        where: { organizationId: existingCompany.id },
        include: { score: true },
      });

      assert(existingRoles.length === 1 && existingRoles[0]?.role === "COMPANY", "Empresa já compradora mantém somente COMPANY");
      assert(existingDiagnostics.length === 1, "Aceite do convite não cria novo diagnóstico");
      assert(existingDiagnostics[0]?.id === completedDiagnostic.id, "Diagnóstico concluído existente é reutilizado");
      assert(existingDiagnostics[0]?.score?.id === savedScore.id, "Score salvo é preservado");
      assert(!(await tx.organizationRole.findFirst({
        where: { organizationId: existingCompany.id, role: "SUPPLIER", removedAt: null },
      })), "Empresa já diagnosticada não recebe SUPPLIER ativo apenas por aceitar convite");

      // Regra transversal: specificActivity nunca altera a lista.
      const activities = ["CAFE", "ARROZ", "BANANA", "PROUZO_SEMENTES"];
      for (const activity of activities) {
        const questions = getDiagnosticQuestionsForSegment(
          "Produção",
          "PRODUCAO",
          "AGRONEGOCIO",
          "PRE_DIAGNOSTIC"
        );
        assert(questions.length === 75, `specificActivity=${activity} não altera o formulário empresarial`);
      }

      throw new RollbackTest("rollback esperado");
    }, {
      maxWait: 15_000,
      timeout: 60_000,
    });
  } catch (error) {
    if (!(error instanceof RollbackTest)) {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("=== TESTE CONCLUÍDO: todos os cenários passaram e foram revertidos ===");
}

main().catch((error) => {
  console.error("=== TESTE FALHOU ===");
  console.error(error);
  process.exitCode = 1;
});
