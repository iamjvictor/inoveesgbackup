import { prisma } from "./lib/prisma.js";

async function main() {
  const products = await prisma.product.findMany();
  console.log("PRODUCTS:", JSON.stringify(products, null, 2));
}

main().catch(console.error);
