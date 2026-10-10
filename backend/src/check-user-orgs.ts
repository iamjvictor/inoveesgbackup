import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== USER ORGS AUDIT ===");
  const users = await prisma.user.findMany({
    include: {
      organizationUsers: {
        include: {
          organization: true,
        }
      }
    }
  });

  for (const user of users) {
    console.log(`User: ${user.email}`);
    for (const ou of user.organizationUsers) {
      console.log(`  Org: ${ou.organization.legalName} (CNPJ: ${ou.organization.cnpj})`);
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
