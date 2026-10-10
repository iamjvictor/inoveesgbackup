import { prisma } from "./lib/prisma.js";

async function main() {
  const org = await prisma.organization.findFirst({
    where: {
      tradeName: "testefantasia"
    },
    include: {
      subjectDiagnostics: true
    }
  });

  if (!org) {
    console.log("No organization found");
    return;
  }

  console.log("DIAGNOSTICS:", JSON.stringify(org.subjectDiagnostics, null, 2));
}

main().catch(console.error);
