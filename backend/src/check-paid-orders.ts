import { prisma } from "./lib/prisma.js";

async function main() {
  const org = await prisma.organization.findFirst({
    where: {
      tradeName: "testefantasia"
    },
    include: {
      orders: {
        where: {
          status: "PAID"
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  if (!org) {
    console.log("No organization found");
    return;
  }

  console.log("PAID ORDERS:", JSON.stringify(org.orders, null, 2));
}

main().catch(console.error);
