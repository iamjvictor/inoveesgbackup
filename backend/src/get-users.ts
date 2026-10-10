import { prisma } from "./lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    include: {
      organizationUsers: {
        include: {
          organization: true
        }
      }
    }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));

  const wallets = await prisma.inviteWallet.findMany();
  console.log("WALLETS:", JSON.stringify(wallets, null, 2));

  const invites = await prisma.invite.findMany();
  console.log("INVITES:", JSON.stringify(invites, null, 2));
}

main().catch(console.error);
