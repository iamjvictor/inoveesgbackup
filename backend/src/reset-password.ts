import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RESETTING TEST PASSWORDS ===");
  
  const emails = ['teste2@gmail.com', 'teste4@gmail.com'];
  
  for (const email of emails) {
    // We can run a raw SQL query because supabase auth.users is in the auth schema
    const result = await prisma.$executeRawUnsafe(
      `UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')) WHERE email = $1`,
      email
    );
    console.log(`Updated password for ${email}: ${result} rows affected`);
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
