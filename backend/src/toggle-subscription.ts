import { prisma } from "./lib/prisma.js";
import { cache } from "./lib/cache.js";

async function main() {
  const tradeName = "testefantasia";
  
  // 1. Encontra a organização
  const org = await prisma.organization.findFirst({
    where: { tradeName }
  });

  if (!org) {
    console.error(`Organização com tradeName "${tradeName}" não encontrada.`);
    return;
  }

  // 2. Procura se já tem uma assinatura ativa
  const existingSub = await prisma.subscription.findFirst({
    where: {
      organizationId: org.id,
      status: "ACTIVE"
    }
  });

  if (existingSub) {
    // Desativa a assinatura
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: { status: "CANCELED" }
    });
    console.log(`Assinatura ativa de "${tradeName}" foi DESATIVADA.`);
  } else {
    // 3. Garante que existe o produto e plano corporativo no banco
    let product = await prisma.product.findUnique({
      where: { code: "CORPORATE_PLAN" }
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          code: "CORPORATE_PLAN",
          name: "Plano Corporativo ESG",
          productKind: "SUBSCRIPTION",
          active: true
        }
      });
    }

    let plan = await prisma.plan.findUnique({
      where: { productId: product.id }
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          productId: product.id,
          billingPeriod: "YEAR",
          priceCents: 499000, // R$ 4.990,00
          currency: "BRL"
        }
      });
    }

    // 4. Cria a assinatura ativa para a organização
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: plan.id,
        status: "ACTIVE",
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
      }
    });
    console.log(`Assinatura ativa de "${tradeName}" foi ATIVADA.`);
  }

  // 5. Invalida cache de todos os perfis de usuário desta organização
  const orgUsers = await prisma.organizationUser.findMany({
    where: { organizationId: org.id },
    include: { user: true }
  });

  for (const ou of orgUsers) {
    const key = `auth:profile:v2:${ou.user.supabaseUserId}`;
    await cache.delete(key);
    console.log(`Cache limpo para o usuário: ${ou.user.email} (chave: ${key})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
