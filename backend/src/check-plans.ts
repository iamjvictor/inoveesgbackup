import { prisma } from "./lib/prisma.js";

async function main() {
  const plans = await prisma.plan.findMany({
    include: {
      product: true
    }
  });

  console.log("PLANS:", JSON.stringify(plans, null, 2));
}

main().catch(console.error);
