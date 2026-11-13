import { prisma } from "../lib/prisma.js";
import { supabaseAdminClient } from "../lib/supabase.js";

async function main() {
  console.log("Buscando usuários cadastrados no banco...");
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      status: true,
      supabaseUserId: true,
      createdAt: true,
      adminUser: {
        select: { adminRole: true }
      },
      organizationUsers: {
        select: { membershipRole: true, organization: { select: { legalName: true } } }
      }
    },
  });

  console.log("Usuários encontrados:", JSON.stringify(users, null, 2));

  const { data, error } = await supabaseAdminClient.auth.admin.listUsers({ page: 1, perPage: 10 });
  if (error) {
    console.error("Erro ao listar Supabase users:", error);
  } else {
    console.log("Supabase Auth users:", data.users.map(u => ({ id: u.id, email: u.email, confirmed: !!u.email_confirmed_at })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
