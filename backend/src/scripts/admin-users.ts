import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { prisma } from "../lib/prisma.js";
import { supabaseAdminClient } from "../lib/supabase.js";

export type AdminUserInput = { email: string; fullName: string; password: string; adminRole?: "SUPER_ADMIN" | "OPS" | "FINANCE" };

export function parseAdminUsers(raw: string): AdminUserInput[] {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("ADMIN_USERS_FILE deve conter um JSON válido"); }
  if (!Array.isArray(parsed) || parsed.length !== 3) throw new Error("Informe exatamente 3 usuários administrativos");

  const users = parsed.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Usuário ${index + 1} inválido`);
    const candidate = item as Record<string, unknown>;
    const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
    const fullName = typeof candidate.fullName === "string" ? candidate.fullName.trim() : "";
    const password = typeof candidate.password === "string" ? candidate.password : "";
    if (!email || !email.includes("@") || !fullName || password.length < 8) {
      throw new Error(`Usuário ${index + 1} inválido: e-mail, nome e senha de 8 caracteres são obrigatórios`);
    }
    const adminRole = candidate.adminRole === "OPS" || candidate.adminRole === "FINANCE" ? candidate.adminRole : "SUPER_ADMIN";
    return { email, fullName, password, adminRole } satisfies AdminUserInput;
  });
  if (new Set(users.map((user) => user.email)).size !== users.length) throw new Error("Os e-mails administrativos devem ser únicos");
  return users;
}

async function findAuthUserByEmail(email: string) {
  const { data, error } = await supabaseAdminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`Não foi possível consultar usuários do Supabase: ${error.message}`);
  return data.users.find((user) => user.email?.toLowerCase() === email);
}

async function provisionAdmin(input: AdminUserInput) {
  const existing = await findAuthUserByEmail(input.email);
  const result = existing
    ? await supabaseAdminClient.auth.admin.updateUserById(existing.id, { password: input.password, email_confirm: true, user_metadata: { full_name: input.fullName } })
    : await supabaseAdminClient.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true, user_metadata: { full_name: input.fullName } });
  if (result.error || !result.data.user) throw new Error(`Falha ao provisionar ${input.email}: ${result.error?.message ?? "usuário não retornado"}`);

  const user = await prisma.user.upsert({
    where: { supabaseUserId: result.data.user.id },
    update: { email: input.email, fullName: input.fullName, status: "ACTIVE" },
    create: { supabaseUserId: result.data.user.id, email: input.email, fullName: input.fullName, status: "ACTIVE" },
  });
  await prisma.adminUser.upsert({
    where: { userId: user.id },
    update: { adminRole: input.adminRole ?? "SUPER_ADMIN" },
    create: { userId: user.id, adminRole: input.adminRole ?? "SUPER_ADMIN" },
  });
}

async function main() {
  const inputPath = process.env.ADMIN_USERS_FILE ?? process.argv[2];
  if (!inputPath) throw new Error("Informe ADMIN_USERS_FILE ou passe o caminho do JSON como argumento");
  for (const user of parseAdminUsers(await readFile(resolve(inputPath), "utf8"))) {
    await provisionAdmin(user);
    console.log(`Administrador provisionado: ${user.email}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
}
