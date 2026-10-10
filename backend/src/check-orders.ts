import { prisma } from "./lib/prisma.js";

async function main() {
  const org = await prisma.organization.findFirst({
    where: {
      tradeName: "testefantasia"
    },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true
            }
          },
          payments: true
        }
      }
    }
  });

  if (!org) {
    console.log("No organization found");
    return;
  }

  console.log("ORDERS:", JSON.stringify(org.orders, null, 2));
}

main().catch(console.error);
