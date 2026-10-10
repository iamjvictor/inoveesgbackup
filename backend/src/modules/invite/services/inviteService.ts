import { InviteRepository } from "../repositories/inviteRepository.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { cache } from "../../../lib/cache.js";
import { CheckoutService } from "../../checkout/services/checkoutService.js";
import { prisma } from "../../../lib/prisma.js";

const inviteRepository = new InviteRepository();
const authRepository = new AuthRepository();
const checkoutService = new CheckoutService();

async function resolveOrganizationId(supabaseUserId: string): Promise<string> {
  const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

  if (!organizationId) {
    throw new Error("Empresa não encontrada para o usuário atual");
  }

  return organizationId;
}

export class InviteService {
  async acceptInvite(supabaseUserId: string, token: string) {
    const supplierOrganizationId = await resolveOrganizationId(supabaseUserId);
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: { email: true },
    });

    if (!user) throw new Error("Usuário fornecedor não encontrado");

    const result = await prisma.$transaction(async (transaction) => {
      const invite = await transaction.invite.findUnique({
        where: { token },
        include: {
          buyerOrganization: { select: { id: true, tradeName: true, legalName: true } },
        },
      });

      if (!invite) throw new Error("Convite não encontrado ou inválido");
      if (invite.expiresAt && invite.expiresAt <= new Date()) {
        throw new Error("Este convite expirou");
      }
      if (invite.status === "CANCELED" || invite.status === "EXPIRED") {
        throw new Error("Este convite não está mais disponível");
      }
      if (invite.supplierOrganizationId && invite.supplierOrganizationId !== supplierOrganizationId) {
        throw new Error("Este convite já está vinculado a outro fornecedor");
      }
      if (invite.supplierEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
        throw new Error("Faça login com o e-mail que recebeu este convite");
      }
      if (invite.buyerOrganizationId === supplierOrganizationId) {
        throw new Error("A empresa fornecedora não pode se vincular a si mesma");
      }

      const [companyRole, paidOrder] = await Promise.all([
        transaction.organizationRole.findUnique({
          where: {
            organizationId_role: {
              organizationId: supplierOrganizationId,
              role: "COMPANY",
            },
          },
          select: { id: true, removedAt: true },
        }),
        transaction.order.findFirst({
          where: {
            organizationId: supplierOrganizationId,
            status: "PAID",
          },
          select: { id: true },
        }),
      ]);

      // Uma empresa que já comprou ou já possui papel COMPANY pode atuar
      // como fornecedora sem ter seu papel principal alterado.
      if (!companyRole && !paidOrder) {
        await transaction.organizationRole.upsert({
          where: {
            organizationId_role: {
              organizationId: supplierOrganizationId,
              role: "SUPPLIER",
            },
          },
          update: { removedAt: null },
          create: {
            organizationId: supplierOrganizationId,
            role: "SUPPLIER",
            source: "INVITE",
          },
        });
      }

      const acceptedInvite = await transaction.invite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: invite.acceptedAt ?? new Date(),
          supplierOrganizationId,
        },
      });

      const relationship = await transaction.organizationRelationship.findFirst({
        where: {
          buyerOrganizationId: invite.buyerOrganizationId,
          supplierOrganizationId,
        },
        orderBy: { createdAt: "desc" },
      });

      if (relationship) {
        await transaction.organizationRelationship.update({
          where: { id: relationship.id },
          data: {
            status: "ACTIVE",
            inviteId: invite.id,
            startedAt: relationship.status === "INACTIVE" ? new Date() : relationship.startedAt,
            endedAt: null,
            endedReason: null,
          },
        });
      } else {
        await transaction.organizationRelationship.create({
          data: {
            buyerOrganizationId: invite.buyerOrganizationId,
            supplierOrganizationId,
            inviteId: invite.id,
            status: "ACTIVE",
          },
        });
      }

      const diagnostic = await transaction.diagnostic.findFirst({
        where: {
          organizationId: supplierOrganizationId,
          kind: { in: ["SUPPLIER_DIAGNOSTIC", "PRE_DIAGNOSTIC", "FULL_DIAGNOSTIC"] },
        },
      });

      if (!diagnostic) {
        await transaction.diagnostic.create({
          data: {
            organizationId: supplierOrganizationId,
            kind: "SUPPLIER_DIAGNOSTIC",
            status: "ACTIVE",
          },
        });
      }

      return { acceptedInvite, buyerOrganization: invite.buyerOrganization };
    });

    await Promise.all([
      this.invalidateInviteCache(result.buyerOrganization.id),
      authRepository.invalidateUserCachesForOrganization(supplierOrganizationId),
    ]);

    return {
      buyerOrganization: result.buyerOrganization,
      status: result.acceptedInvite.status,
    };
  }

  async acceptGenericInvite(supabaseUserId: string, buyerOrganizationId: string) {
    const supplierOrganizationId = await resolveOrganizationId(supabaseUserId);
    const user = await prisma.user.findUnique({ where: { supabaseUserId }, select: { email: true } });
    if (!user) throw new Error("Usuário fornecedor não encontrado");
    if (supplierOrganizationId === buyerOrganizationId) {
      throw new Error("A empresa fornecedora não pode se vincular a si própria");
    }

    const invite = await prisma.$transaction(async (transaction) => {
      const buyerOrganization = await transaction.organization.findUnique({
        where: { id: buyerOrganizationId },
        select: { id: true },
      });
      if (!buyerOrganization) throw new Error("Empresa âncora não encontrada");

      const existingRelationship = await transaction.organizationRelationship.findFirst({
        where: { buyerOrganizationId, supplierOrganizationId, status: "ACTIVE" },
      });
      if (existingRelationship) {
        if (!existingRelationship.inviteId) return null;
        return transaction.invite.findUnique({
          where: { id: existingRelationship.inviteId },
          include: { buyerOrganization: { select: { id: true, tradeName: true, legalName: true } } },
        });
      }

      const walletUpdate = await transaction.inviteWallet.updateMany({
        where: { organizationId: buyerOrganizationId, balance: { gt: 0 } },
        data: { balance: { decrement: 1 } },
      });
      if (walletUpdate.count === 0) {
        throw new Error("A empresa âncora não possui convites disponíveis");
      }

      const { randomUUID } = await import("crypto");
      const autoInvite = await transaction.invite.create({
        data: {
          buyerOrganizationId,
          supplierEmail: user.email,
          token: `auto-${randomUUID()}`,
          status: "PENDING",
        },
        include: { buyerOrganization: { select: { id: true, tradeName: true, legalName: true } } },
      });

      await transaction.inviteTransaction.create({
        data: {
          organizationId: buyerOrganizationId,
          type: "CONSUMPTION",
          amount: 1,
          referenceType: "INVITE",
          referenceId: autoInvite.id,
          notes: "Vínculo confirmado por link público",
        },
      });

      return autoInvite;
    });

    if (!invite) {
      const existing = await prisma.organizationRelationship.findFirst({
        where: { buyerOrganizationId, supplierOrganizationId, status: "ACTIVE" },
        include: { buyerOrganization: { select: { id: true, tradeName: true, legalName: true } } },
      });
      if (!existing) throw new Error("Não foi possível preparar o convite");
      return { buyerOrganization: existing.buyerOrganization, status: "ACTIVE" };
    }

    return this.acceptInvite(supabaseUserId, invite.token);
  }

  async getStats(supabaseUserId: string) {
    const organizationId = await resolveOrganizationId(supabaseUserId);

    const cacheKey = `invite:stats:${organizationId}`;
    const cached = await cache.get<Awaited<ReturnType<InviteRepository["getStats"]>>>(cacheKey);
    if (cached) {
      console.log(`[inviteService.getStats] cache HIT for org=${organizationId}`);
      return cached;
    }

    const stats = await inviteRepository.getStats(organizationId);
    await cache.set(cacheKey, stats, 30_000); // 30 seconds TTL
    return stats;
  }

  private async invalidateInviteCache(organizationId: string) {
    await Promise.all([
      cache.delete(`invite:stats:${organizationId}`),
      cache.delete(`invite:list:${organizationId}`),
      cache.delete(`invite:ranking:${organizationId}`),
    ]);
  }

  async createCheckoutSession(
    supabaseUserId: string,
    quantity: number,
    option: "standard" | "evidence"
  ) {
    if (option !== "standard") {
      throw new Error("Apenas o Pré-Diagnóstico (tipo Standard) está disponível para compra.");
    }

    const session = await checkoutService.createPreference(supabaseUserId, "INVITE_PACK", quantity);

    return {
      checkoutUrl: session.checkoutUrl,
      orderId: session.orderId,
      totalCents: session.totalCents,
      productCode: session.productCode,
    };
  }

  async confirmPayment(orderId: string, simulateStatus: "success" | "failure") {
    const order = await inviteRepository.findOrderById(orderId);

    if (!order) {
      throw new Error("Pedido de convites não encontrado");
    }

    await inviteRepository.confirmOrderPayment(orderId, simulateStatus === "success");

    // Invalidate stats/list cache so the next getStats/listInvites reflects updated balance
    await this.invalidateInviteCache(order.organizationId);
    await authRepository.invalidateUserCachesForOrganization(order.organizationId);

    return {
      success: simulateStatus === "success",
      orderId,
    };
  }

  async listInvites(supabaseUserId: string) {
    const organizationId = await resolveOrganizationId(supabaseUserId);
    
    const cacheKey = `invite:list:${organizationId}`;
    const cached = await cache.get<Awaited<ReturnType<InviteRepository["listInvites"]>>>(cacheKey);
    if (cached) {
      return cached;
    }

    const list = await inviteRepository.listInvites(organizationId);
    await cache.set(cacheKey, list, 30_000); // 30 seconds TTL
    return list;
  }

  async listRanking(supabaseUserId: string) {
    const buyerOrganizationId = await resolveOrganizationId(supabaseUserId);
    
    const cacheKey = `invite:ranking:${buyerOrganizationId}`;
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const list = await inviteRepository.listRanking(buyerOrganizationId);
    await cache.set(cacheKey, list, 30_000); // 30 seconds TTL
    return list;
  }

  async createInvite(supabaseUserId: string, supplierEmail: string, message?: string) {
    const organizationId = await resolveOrganizationId(supabaseUserId);

    if (!supplierEmail) {
      throw new Error("E-mail do fornecedor é obrigatório");
    }

    const { randomUUID } = await import("crypto");
    const token = randomUUID();

    const invite = await inviteRepository.createInvite(organizationId, supplierEmail, token, message);

    // Invalidate stats/list so the invite count updates immediately on next load
    await this.invalidateInviteCache(organizationId);

    return {
      invite,
      inviteLink: `/convite/fornecedor?token=${token}`,
    };
  }

  async terminateRelationship(supabaseUserId: string, supplierOrganizationId: string, endedReason: string) {
    const buyerOrganizationId = await resolveOrganizationId(supabaseUserId);
    const result = await inviteRepository.terminateRelationship(buyerOrganizationId, supplierOrganizationId, endedReason);
    await this.invalidateInviteCache(buyerOrganizationId);
    return result;
  }

  async reactivateRelationship(supabaseUserId: string, supplierOrganizationId: string) {
    const buyerOrganizationId = await resolveOrganizationId(supabaseUserId);
    const result = await inviteRepository.reactivateRelationship(buyerOrganizationId, supplierOrganizationId);
    await this.invalidateInviteCache(buyerOrganizationId);
    return result;
  }
}
