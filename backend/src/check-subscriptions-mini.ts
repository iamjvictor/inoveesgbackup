import { prisma } from "./lib/prisma.js";

async function main() {
  const org = await prisma.organization.findFirst({
    where: {
      tradeName: "testefantasia"
    },
    include: {
      subscriptions: true,
      entitlements: {
        include: {
          featureFlag: true
        }
      },
      subjectDiagnostics: true
    }
  });

  if (!org) {
    console.log("No organization found");
    return;
  }

  console.log("SUBSCRIPTIONS:", org.subscriptions);
  console.log("ENTITLEMENTS:", org.entitlements.map(e => ({ code: e.featureFlag.code, status: e.status })));
  console.log("DIAGNOSTICS:", org.subjectDiagnostics.map(d => ({ id: d.id, status: d.status, kind: d.kind })));
}

main().catch(console.error);
