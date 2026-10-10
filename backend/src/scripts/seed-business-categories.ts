import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("Starting seed script...");

  // 1. Seed Business Category: AGRONEGOCIO
  const category = await prisma.businessCategory.upsert({
    where: { code: "AGRONEGOCIO" },
    update: { name: "Agronegócio", active: true },
    create: {
      code: "AGRONEGOCIO",
      name: "Agronegócio",
      active: true,
    },
  });
  console.log(`Upserted category: ${category.name} (${category.id})`);

  // 2. Seed Business Segment: AGROINDUSTRIA
  const segmentAgroindustria = await prisma.businessSegment.upsert({
    where: { code: "AGROINDUSTRIA" },
    update: { name: "Agroindústria", active: true, categoryId: category.id },
    create: {
      code: "AGROINDUSTRIA",
      name: "Agroindústria",
      active: true,
      categoryId: category.id,
    },
  });
  console.log(`Upserted segment: ${segmentAgroindustria.name} (${segmentAgroindustria.id})`);

  // 3. Seed Business Segment: PRODUCAO
  const segmentProducao = await prisma.businessSegment.upsert({
    where: { code: "PRODUCAO" },
    update: { name: "Produção", active: true, categoryId: category.id },
    create: {
      code: "PRODUCAO",
      name: "Produção",
      active: true,
      categoryId: category.id,
    },
  });
  console.log(`Upserted segment: ${segmentProducao.name} (${segmentProducao.id})`);

  // 4. Seed Business Category: OLEO_E_GAS
  const oilAndGasCategory = await prisma.businessCategory.upsert({
    where: { code: "OLEO_E_GAS" },
    update: { name: "Óleo e Gás", active: true },
    create: { code: "OLEO_E_GAS", name: "Óleo e Gás", active: true },
  });
  console.log(`Upserted category: ${oilAndGasCategory.name} (${oilAndGasCategory.id})`);

  const oilAndGasSegment = await prisma.businessSegment.upsert({
    where: { code: "OLEO_E_GAS" },
    update: { name: "Óleo e Gás", active: true, categoryId: oilAndGasCategory.id },
    create: {
      code: "OLEO_E_GAS",
      name: "Óleo e Gás",
      active: true,
      categoryId: oilAndGasCategory.id,
    },
  });
  console.log(`Upserted segment: ${oilAndGasSegment.name} (${oilAndGasSegment.id})`);

  // 5. Seed Business Category: INFRAESTRUTURA
  const infrastructureCategory = await prisma.businessCategory.upsert({
    where: { code: "INFRAESTRUTURA" },
    update: { name: "Infraestrutura", active: true },
    create: { code: "INFRAESTRUTURA", name: "Infraestrutura", active: true },
  });
  console.log(`Upserted category: ${infrastructureCategory.name} (${infrastructureCategory.id})`);

  const infrastructureSegment = await prisma.businessSegment.upsert({
    where: { code: "INFRAESTRUTURA" },
    update: { name: "Infraestrutura", active: true, categoryId: infrastructureCategory.id },
    create: {
      code: "INFRAESTRUTURA",
      name: "Infraestrutura",
      active: true,
      categoryId: infrastructureCategory.id,
    },
  });
  console.log(`Upserted segment: ${infrastructureSegment.name} (${infrastructureSegment.id})`);

  // 6. Backfill existing organizations
  console.log("Starting backfill for existing organizations...");
  const organizations = await prisma.organization.findMany({
    where: {
      OR: [
        { businessCategoryId: null },
        { businessSegmentId: null },
      ],
    },
  });

  console.log(`Found ${organizations.length} organizations to backfill.`);

  let updatedCount = 0;
  for (const org of organizations) {
    const isSegmentProducao = org.industrySegment?.toLowerCase().includes("produca") || org.industrySegment?.toLowerCase().includes("produçã");
    const targetSegmentId = isSegmentProducao ? segmentProducao.id : segmentAgroindustria.id;

    await prisma.organization.update({
      where: { id: org.id },
      data: {
        businessCategoryId: category.id,
        businessSegmentId: targetSegmentId,
      },
    });
    updatedCount++;
  }

  console.log(`Backfill completed. ${updatedCount} organizations updated.`);
}

main()
  .catch((e) => {
    console.error("Error in seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
