import { prisma } from "./lib/prisma.js";

async function main() {
  const org = await prisma.organization.findFirst({
    where: {
      tradeName: "testefantasia"
    },
    include: {
      subscriptions: true,
      entitlements: {
        include: {
          featureFlag: true
        }
      },
      subjectDiagnostics: true,
      orders: {
        include: {
          items: true
        }
      }
    }
  });

  console.log("ORGANIZATION:", JSON.stringify(org, null, 2));
}

main().catch(console.error);
