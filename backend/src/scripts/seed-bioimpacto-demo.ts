import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { supabaseAdminClient, supabaseAuthClient } from "../lib/supabase.js";

const email = "bioimpacto.demo.20261103@example.com";
const password = process.env.DEMO_PASSWORD;
if (!password) throw new Error("Defina DEMO_PASSWORD no ambiente");

const planProduct = await prisma.product.findUnique({ where: { code: "BIOIMPACTO_EMPRESARIAL" }, include: { plan: true } });
if (!planProduct?.plan) throw new Error("Plano 2.2 não cadastrado");

let user = await prisma.user.findUnique({ where: { email }, include: { organizationUsers: true } });
let createdAuthId: string | null = null;
if (!user) {
  const created = await supabaseAdminClient.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: "Cliente Demonstração Bioimpacto" },
  });
  if (created.error || !created.data.user) throw created.error ?? new Error("Falha ao criar login");
  createdAuthId = created.data.user.id;
  try {
    user = await prisma.$transaction(async (tx) => {
      const local = await tx.user.create({ data: { supabaseUserId: created.data.user!.id, email, fullName: "Cliente Demonstração Bioimpacto" } });
      const organization = await tx.organization.create({ data: {
        legalName: "Empresa Demonstração Bioimpacto 2.2", tradeName: "Demo Bioimpacto", cnpj: "99887766000103",
        primaryEmail: email, porte: "Pequena empresa", size: "6 a 19", numberOfSuppliers: "1 a 15",
        annualRevenue: "De R$ 360 mil a R$ 4,8 milhões",
        roles: { create: { role: "COMPANY", source: "MANUAL" } },
      } });
      await tx.organizationUser.create({ data: { organizationId: organization.id, userId: local.id, membershipRole: "OWNER", isPrimaryContact: true } });
      return tx.user.findUniqueOrThrow({ where: { id: local.id }, include: { organizationUsers: true } });
    });
  } catch (error) {
    await supabaseAdminClient.auth.admin.deleteUser(createdAuthId);
    throw error;
  }
}

const organizationId = user.organizationUsers[0]?.organizationId;
if (!organizationId) throw new Error("Conta sem empresa");
const paidAt = new Date("2026-08-01T12:00:00-03:00");
let order = await prisma.order.findFirst({ where: { organizationId, status: "PAID", items: { some: { productId: planProduct.id } } } });
if (!order) order = await prisma.order.create({ data: {
  organizationId, orderType: "SUBSCRIPTION", status: "PAID", totalCents: 3_800_000, paidAt,
  items: { create: { productId: planProduct.id, quantity: 1, unitPriceCents: 3_800_000,
    metadata: { productCode: "BIOIMPACTO_EMPRESARIAL" } } },
} });
if (!(await prisma.payment.findFirst({ where: { orderId: order.id } }))) {
  await prisma.payment.create({ data: { orderId: order.id, provider: "DEMO", providerReference: `demo-bioimpacto-${order.id}`,
    method: "MANUAL", status: "PAID", amountCents: 3_800_000, paidAt } });
}

let diagnostic = await prisma.diagnostic.findFirst({ where: { organizationId, kind: "FULL_DIAGNOSTIC" }, orderBy: { createdAt: "desc" } });
if (!diagnostic) diagnostic = await prisma.diagnostic.create({ data: {
  organizationId, kind: "FULL_DIAGNOSTIC", status: "COMPLETED", completedAt: new Date("2026-08-02T10:00:00-03:00"),
  responsibilityDeclarationAccepted: true,
  score: { create: { overallScore: 62, provenOverallScore: 74, maturityLevel: "ESTABLISHED" } },
} });
await prisma.orderItem.updateMany({ where: { orderId: order.id, productId: planProduct.id }, data: { metadata: { diagnosticId: diagnostic.id, productCode: "BIOIMPACTO_EMPRESARIAL" } } });

const endsAt = new Date(paidAt);
endsAt.setUTCFullYear(endsAt.getUTCFullYear() + 1);
if (!(await prisma.subscription.findFirst({ where: { orderId: order.id } }))) {
  await prisma.subscription.create({ data: { organizationId, planId: planProduct.plan.id, orderId: order.id, status: "ACTIVE", startsAt: paidAt, endsAt } });
}

const months = [
  { month: 8, approved: 3, rejected: 1, pending: 0, score: 62 },
  { month: 9, approved: 4, rejected: 1, pending: 0, score: 68 },
  { month: 10, approved: 5, rejected: 1, pending: 0, score: 74 },
  { month: 11, approved: 0, rejected: 0, pending: 2, score: null },
];
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlQAAAABJRU5ErkJggg==", "base64");
for (const [index, month] of months.entries()) {
  const statuses = [
    ...Array(month.approved).fill("VERIFIED"), ...Array(month.rejected).fill("REJECTED"), ...Array(month.pending).fill("PENDING"),
  ] as Array<"VERIFIED" | "REJECTED" | "PENDING">;
  for (const [evidenceIndex, status] of statuses.entries()) {
    const filePath = `demo-bioimpacto/${organizationId}/janela-${index + 1}/evidencia-${evidenceIndex + 1}.png`;
    const existing = await prisma.evidence.findFirst({ where: { organizationId, diagnosticId: diagnostic.id, filePath } });
    if (existing) continue;
    const uploadedAt = new Date(`2026-${String(month.month).padStart(2, "0")}-${String(3 + evidenceIndex).padStart(2, "0")}T10:00:00-03:00`);
    const upload = await supabaseAdminClient.storage.from("diagnostic-evidences").upload(filePath, png, { contentType: "image/png", upsert: true });
    if (upload.error) throw new Error(`Falha ao gravar evidência: ${upload.error.message}`);
    await prisma.evidence.create({ data: {
      organizationId, diagnosticId: diagnostic.id, uploadedByUserId: user.id, storageBucket: "diagnostic-evidences",
      fileName: `Evidência de demonstração ${evidenceIndex + 1}.png`, filePath, mimeType: "image/png", fileSizeBytes: png.length,
      uploadStatus: "COMPLETED", verificationStatus: status, uploadedAt,
      verifiedAt: status === "PENDING" ? null : new Date(uploadedAt.getTime() + 2 * 86_400_000),
      documentType: `Janela ${index + 1} — evidência ${evidenceIndex + 1}`,
    } });
  }
  if (index < 3) {
    await prisma.bioimpactoWindowSnapshot.upsert({
      where: { orderId_windowNumber: { orderId: order.id, windowNumber: index + 1 } },
      create: { organizationId, orderId: order.id, windowNumber: index + 1,
        startsAt: new Date(`2026-${String(month.month).padStart(2, "0")}-01T00:00:00-03:00`),
        endsAt: new Date(`2026-${String(month.month).padStart(2, "0")}-16T00:00:00-03:00`),
        approved: month.approved, rejected: month.rejected, pending: month.pending, score: month.score },
      update: { approved: month.approved, rejected: month.rejected, pending: month.pending, score: month.score },
    });
  }
}

const login = await supabaseAuthClient.auth.signInWithPassword({ email, password });
if (login.error || !login.data.user) throw login.error ?? new Error("Login de demonstração falhou");
console.log(JSON.stringify({ email, organizationId, orderId: order.id, diagnosticId: diagnostic.id, windows: 4, loginVerified: true }));
await prisma.$disconnect();
