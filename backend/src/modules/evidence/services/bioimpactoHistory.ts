import { prisma } from "../../../lib/prisma.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";

const CODE = "BIOIMPACTO_EMPRESARIAL";
const authRepository = new AuthRepository();

function monthWindow(paidAt: Date, index: number) {
  const start = new Date(Date.UTC(paidAt.getUTCFullYear(), paidAt.getUTCMonth() + index, 1, 3));
  const end = new Date(Date.UTC(paidAt.getUTCFullYear(), paidAt.getUTCMonth() + index, 16, 3));
  return { start, end };
}

export async function getBioimpactoHistory(supabaseUserId: string, now = new Date()) {
  const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);
  if (!organizationId) throw new Error("Empresa não encontrada");
  const order = await prisma.order.findFirst({
    where: { organizationId, status: "PAID", items: { some: { product: { code: CODE } } } },
    orderBy: { paidAt: "desc" },
    include: { items: true },
  });
  if (!order?.paidAt) return null;
  const expiresAt = new Date(order.paidAt);
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);
  const diagnosticId = order.items.map((item) => (item.metadata as { diagnosticId?: string } | null)?.diagnosticId).find(Boolean);
  const diagnostic = diagnosticId ? await prisma.diagnostic.findUnique({ where: { id: diagnosticId }, include: { score: true } }) : null;
  const evidence = diagnosticId ? await prisma.evidence.findMany({ where: { organizationId, diagnosticId }, select: { uploadedAt: true, verificationStatus: true } }) : [];
  const snapshots = await prisma.bioimpactoWindowSnapshot.findMany({ where: { organizationId, orderId: order.id } });
  const windows = [];
  for (let index = 0; index < 13; index++) {
    const { start, end } = monthWindow(order.paidAt, index);
    if (start > now || start >= expiresAt) break;
    if (end <= order.paidAt) continue;
    const windowNumber: number = windows.length + 1;
    const current = evidence.filter((item) => item.uploadedAt && item.uploadedAt >= start && item.uploadedAt < end);
    const counts = {
      approved: current.filter((item) => item.verificationStatus === "VERIFIED").length,
      rejected: current.filter((item) => item.verificationStatus === "REJECTED").length,
      pending: current.filter((item) => item.verificationStatus === "PENDING").length,
    };
    const snapshot = snapshots.find((item) => item.windowNumber === windowNumber);
    const closed = now >= end;
    windows.push({ number: windowNumber, startsAt: (start < order.paidAt ? order.paidAt : start).toISOString(), endsAt: end.toISOString(), status: closed ? "CLOSED" : "OPEN",
      approved: snapshot?.approved ?? counts.approved, rejected: snapshot?.rejected ?? counts.rejected,
      pending: snapshot?.pending ?? counts.pending, score: snapshot?.score == null ? null : Number(snapshot.score) });
  }
  return { orderId: order.id, startsAt: order.paidAt.toISOString(), expiresAt: expiresAt.toISOString(),
    diagnosticId: diagnostic?.id ?? null, windows };
}
