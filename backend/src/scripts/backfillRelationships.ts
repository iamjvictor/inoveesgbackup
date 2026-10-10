import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("Starting relationship backfill script...");

  // 1. Fetch all SupplierLinks
  const supplierLinks = await prisma.supplierLink.findMany();

  console.log(`Found ${supplierLinks.length} supplier links to process.`);

  let relationshipsCreated = 0;
  let diagnosticsUpdated = 0;

  for (const link of supplierLinks) {
    if (!link.supplierOrganizationId) {
      console.log(`Skipping link ${link.id} as it has no supplierOrganizationId.`);
      continue;
    }

    // Check if an ACTIVE relationship already exists
    const existingActive = await prisma.organizationRelationship.findFirst({
      where: {
        buyerOrganizationId: link.buyerOrganizationId,
        supplierOrganizationId: link.supplierOrganizationId,
        status: "ACTIVE",
      },
    });

    let relationshipId: string;

    if (!existingActive) {
      // Create new active relationship
      const rel = await prisma.organizationRelationship.create({
        data: {
          buyerOrganizationId: link.buyerOrganizationId,
          supplierOrganizationId: link.supplierOrganizationId,
          inviteId: link.inviteId,
          status: "ACTIVE",
          startedAt: link.invitedAt || link.createdAt || new Date(),
        },
      });
      relationshipId = rel.id;
      relationshipsCreated++;
      console.log(`Created relationship ${relationshipId} for buyer=${link.buyerOrganizationId} -> supplier=${link.supplierOrganizationId}`);
    } else {
      relationshipId = existingActive.id;
      console.log(`Found existing active relationship ${relationshipId} for buyer=${link.buyerOrganizationId} -> supplier=${link.supplierOrganizationId}`);
    }

    // Diagnostics no longer have relationshipId, skipping update.
  }

  console.log(`Backfill finished. Relationships created: ${relationshipsCreated}, Diagnostics updated: ${diagnosticsUpdated}.`);
}

main()
  .catch((e) => {
    console.error("Error in backfill script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
