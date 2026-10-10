import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== DIAGNOSTICS AUDIT ===");
  const diagnostics = await prisma.diagnostic.findMany({
    include: {
      organization: true,
      score: true,
    }
  });

  for (const diag of diagnostics) {
    console.log(`Diagnostic ID: ${diag.id}`);
    console.log(`  Organization: ${diag.organization.legalName} (${diag.organization.cnpj})`);
    console.log(`  Kind: ${diag.kind}`);
    console.log(`  Status: ${diag.status}`);
    if (diag.score) {
      console.log(`  Score:`);
      console.log(`    overallScore: ${diag.score.overallScore}`);
      console.log(`    provenOverallScore: ${diag.score.provenOverallScore}`);
    } else {
      console.log(`  No score calculated.`);
    }
    console.log("-----------------------------------------");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
