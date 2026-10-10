import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECKING DATABASE STATUS ===");
  const users = await prisma.user.findMany({
    include: {
      organizationUsers: {
        include: {
          organization: {
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
          }
        }
      }
    }
  });

  for (const user of users) {
    console.log(`User: ${user.email} (${user.fullName})`);
    for (const ou of user.organizationUsers) {
      console.log(`  Organization: ${ou.organization.legalName} (CNPJ: ${ou.organization.cnpj})`);
      console.log(`    Orders:`);
      if (ou.organization.orders.length === 0) {
        console.log(`      No orders found.`);
      }
      for (const order of ou.organization.orders) {
        console.log(`      - Order ID: ${order.id}`);
        console.log(`        Type: ${order.orderType}`);
        console.log(`        Status: ${order.status}`);
        console.log(`        Total: R$ ${(order.totalCents / 100).toFixed(2)}`);
        console.log(`        Paid At: ${order.paidAt}`);
        console.log(`        Created At: ${order.createdAt}`);
        console.log(`        Items:`);
        for (const item of order.items) {
          console.log(`          * ${item.product.name} (Qty: ${item.quantity}) - R$ ${(item.unitPriceCents / 100).toFixed(2)}`);
        }
        console.log(`        Payments:`);
        for (const payment of order.payments) {
          console.log(`          * Method: ${payment.method}, Status: ${payment.status}, Paid At: ${payment.paidAt}`);
        }
      }
    }
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
