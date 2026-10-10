import { prisma } from "../../../lib/prisma.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";

const authRepository = new AuthRepository();

export class InviteRepository {
  async getStats(organizationId: string) {
    const t0 = Date.now();

    // Run independent queries in parallel
    const [totalTransactions, wallet, diagnostics, invitesList] = await Promise.all([
      // 1. Total invites purchased
      prisma.inviteTransaction.aggregate({
        where: { organizationId, type: "PURCHASE" },
        _sum: { amount: true },
      }),

      // 2. Wallet balance
      prisma.inviteWallet.findUnique({
        where: { organizationId },
        select: { balance: true },
      }),

      // 3. Completed supplier diagnostics for avg score
      prisma.diagnostic.findMany({
        where: {
          kind: "SUPPLIER_DIAGNOSTIC",
          status: "COMPLETED",
          score: { isNot: null },
          organization: {
            supplierRelationships: {
              some: {
                buyerOrganizationId: organizationId,
                status: "ACTIVE",
              },
            },
          },
        },
        select: {
          score: { select: { overallScore: true } },
        },
      }),

      // 4. Combined invites and links list to compute exact registered/answered stats
      this.listInvites(organizationId),
    ]);

    const totalInvitesPurchased = totalTransactions._sum.amount ?? 0;

    const registeredCount = invitesList.filter(
      (i) => i.status === "ACCEPTED" || i.supplierOrganizationId !== null
    ).length;
    const consumedInvites = registeredCount;
    const availableInvites = Math.max(0, totalInvitesPurchased - consumedInvites);

    const answeredCount = invitesList.filter((i) =>
      i.requestedDiagnostics.some((d) => d.status === "COMPLETED")
    ).length;
    const notAnsweredCount = invitesList.length - answeredCount;

    let averageSupplierScore = 0;
    if (diagnostics.length > 0) {
      const sum = diagnostics.reduce(
        (acc, curr) => acc + Number(curr.score?.overallScore ?? 0),
        0
      );
      averageSupplierScore = Math.round(sum / diagnostics.length);
    }

    console.log(`[inviteRepo.getStats] organizationId=${organizationId} → ${Date.now() - t0}ms`);

    return {
      totalInvitesPurchased,
      availableInvites,
      consumedInvites,
      connectedSuppliersCount: registeredCount,
      answeredCount,
      notAnsweredCount,
      averageSupplierScore,
    };
  }

  async createInvite(buyerOrganizationId: string, supplierEmail: string, token: string, message?: string) {
    return prisma.$transaction(
      async (tx) => {
        // 1. Check balance
        const wallet = await tx.inviteWallet.findUnique({
          where: { organizationId: buyerOrganizationId },
        });

        if (!wallet || wallet.balance <= 0) {
          throw new Error("Saldo de convites insuficiente");
        }

        // 2. Decrement balance
        await tx.inviteWallet.update({
          where: { organizationId: buyerOrganizationId },
          data: {
            balance: {
              decrement: 1,
            },
          },
        });

        // 3. Create Invite
        const invite = await tx.invite.create({
          data: {
            buyerOrganizationId,
            supplierEmail,
            token,
            message,
            status: "SENT",
          },
        });

        // 4. Create Transaction history
        await tx.inviteTransaction.create({
          data: {
            organizationId: buyerOrganizationId,
            type: "CONSUMPTION",
            amount: 1,
            referenceType: "INVITE",
            referenceId: invite.id,
            notes: `Convite enviado para ${supplierEmail}`,
          },
        });

        return invite;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );
  }

  async listInvites(buyerOrganizationId: string) {
    const t0 = Date.now();

    // 1. Buscar os convites reais
    const invites = await prisma.invite.findMany({
      where: {
        buyerOrganizationId,
      },
      select: {
        id: true,
        buyerOrganizationId: true,
        supplierOrganizationId: true,
        supplierEmail: true,
        token: true,
        status: true,
        message: true,
        createdAt: true,
        acceptedAt: true,
        supplierOrganization: {
          select: {
            id: true,
            tradeName: true,
            legalName: true,
            industrySegment: true,
            primaryEmail: true,
            phone: true,
            city: true,
            state: true,
            businessCategory: {
              select: {
                name: true,
              },
            },
            businessSegment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Buscar SupplierLinks que não possuem Invite associado no banco
    const inviteIds = invites.map((i) => i.id);
    const supplierLinks = await prisma.supplierLink.findMany({
      where: {
        buyerOrganizationId,
        OR: [
          { inviteId: null },
          { inviteId: { notIn: inviteIds } },
        ],
      },
      include: {
        supplierOrganization: {
          select: {
            id: true,
            tradeName: true,
            legalName: true,
            industrySegment: true,
            primaryEmail: true,
            phone: true,
            city: true,
            state: true,
            businessCategory: {
              select: {
                name: true,
              },
            },
            businessSegment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Obter todos os relacionamentos para esta âncora
    const relationships = await prisma.organizationRelationship.findMany({
      where: {
        buyerOrganizationId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    // 4. Buscar os diagnósticos ativos dos fornecedores associados
    const supplierOrgIds = [
      ...invites.map((i) => i.supplierOrganizationId).filter(Boolean),
      ...supplierLinks.map((l) => l.supplierOrganizationId).filter(Boolean),
    ] as string[];

    const diagnostics = await prisma.diagnostic.findMany({
      where: {
        organizationId: { in: supplierOrgIds },
      },
      select: {
        id: true,
        organizationId: true,
        status: true,
        kind: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        score: {
          select: {
            overallScore: true,
            environmentalScore: true,
            bioeconomyCircularScore: true,
            socialScore: true,
            governanceScore: true,
            provenOverallScore: true,
            provenEnvironmentalScore: true,
            provenBioeconomyCircularScore: true,
            provenSocialScore: true,
            provenGovernanceScore: true,
            maturityLevel: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const findRelationship = (supplierOrgId: string | null, inviteId: string | null) => {
      if (!supplierOrgId) return null;
      const rel = relationships.find(
        (r) => r.supplierOrganizationId === supplierOrgId && (inviteId ? r.inviteId === inviteId : true)
      ) || relationships.find((r) => r.supplierOrganizationId === supplierOrgId);

      return rel ? {
        id: rel.id,
        status: rel.status,
        startedAt: rel.startedAt,
        endedAt: rel.endedAt,
        endedReason: rel.endedReason,
      } : null;
    };

    const findDiagnosticsForSupplier = (supplierOrgId: string | null) => {
      if (!supplierOrgId) return [];
      const orgDiags = diagnostics.filter((d) => d.organizationId === supplierOrgId);
      
      // Sort: COMPLETED diagnostics first (newest to oldest), then pending diagnostics (newest to oldest)
      return orgDiags.sort((a, b) => {
        if (a.status === "COMPLETED" && b.status !== "COMPLETED") return -1;
        if (a.status !== "COMPLETED" && b.status === "COMPLETED") return 1;
        
        const dateA = a.completedAt || a.updatedAt || a.createdAt;
        const dateB = b.completedAt || b.updatedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    };

    const mappedInvites = invites.map((invite) => ({
      ...invite,
      requestedDiagnostics: findDiagnosticsForSupplier(invite.supplierOrganizationId),
      relationship: findRelationship(invite.supplierOrganizationId, invite.id),
    }));

    const mappedLinks = supplierLinks.map((link) => ({
      id: link.id,
      buyerOrganizationId: link.buyerOrganizationId,
      supplierOrganizationId: link.supplierOrganizationId,
      supplierEmail: link.supplierOrganization.primaryEmail || "",
      token: "",
      status: "ACCEPTED" as const,
      message: null,
      createdAt: link.invitedAt || link.createdAt,
      acceptedAt: link.createdAt,
      supplierOrganization: {
        id: link.supplierOrganization.id,
        tradeName: link.supplierOrganization.tradeName,
        legalName: link.supplierOrganization.legalName,
        industrySegment: link.supplierOrganization.industrySegment,
        primaryEmail: link.supplierOrganization.primaryEmail,
        phone: link.supplierOrganization.phone,
        city: link.supplierOrganization.city,
        state: link.supplierOrganization.state,
        businessCategory: link.supplierOrganization.businessCategory,
        businessSegment: link.supplierOrganization.businessSegment,
      },
      requestedDiagnostics: findDiagnosticsForSupplier(link.supplierOrganizationId),
      relationship: findRelationship(link.supplierOrganizationId, link.inviteId),
    }));

    // 5. Combinar e ordenar decrescentemente por data de criação
    const combined = [...mappedInvites, ...mappedLinks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`[inviteRepo.listInvites] org=${buyerOrganizationId} count=${combined.length} (invites=${invites.length}, links=${mappedLinks.length}) → ${Date.now() - t0}ms`);
    return combined;
  }

  async listRanking(buyerOrganizationId: string) {
    const t0 = Date.now();

    // 1. Fetch all organizations that act as suppliers (role SUPPLIER or having supplier relationships/links/invites/diagnostics)
    const suppliers = await prisma.organization.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            roles: {
              some: {
                role: "SUPPLIER",
                removedAt: null,
              },
            },
          },
          {
            supplierRelationships: {
              some: {},
            },
          },
          {
            supplierBuyerLinks: {
              some: {},
            },
          },
          {
            supplierInvites: {
              some: {},
            },
          },
          {
            subjectDiagnostics: {
              some: {
                kind: "SUPPLIER_DIAGNOSTIC",
              },
            },
          },
        ],
      },
      select: {
        id: true,
        tradeName: true,
        legalName: true,
        industrySegment: true,
        primaryEmail: true,
        phone: true,
        city: true,
        state: true,
        businessCategory: {
          select: {
            name: true,
          },
        },
        businessSegment: {
          select: {
            name: true,
          },
        },
        subjectDiagnostics: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
            status: true,
            kind: true,
            completedAt: true,
            score: {
              select: {
                overallScore: true,
                environmentalScore: true,
                bioeconomyCircularScore: true,
                socialScore: true,
                governanceScore: true,
                provenOverallScore: true,
                provenEnvironmentalScore: true,
                provenBioeconomyCircularScore: true,
                provenSocialScore: true,
                provenGovernanceScore: true,
                maturityLevel: true,
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
        },
        supplierRelationships: {
          where: {
            buyerOrganizationId,
          },
          select: {
            status: true,
          },
        },
      },
    });

    const mapped = suppliers.map((supplier) => {
      const completedDiag = supplier.subjectDiagnostics.find((d) => d.score !== null) || null;
      const isConnected = supplier.supplierRelationships.some((r) => r.status === "ACTIVE");

      return {
        id: supplier.id,
        tradeName: supplier.tradeName || supplier.legalName || "",
        legalName: supplier.legalName,
        industrySegment: supplier.industrySegment || "Outros",
        primaryEmail: supplier.primaryEmail,
        phone: supplier.phone,
        city: supplier.city,
        state: supplier.state,
        businessCategory: supplier.businessCategory,
        businessSegment: supplier.businessSegment,
        completedDiagnostic: completedDiag,
        isConnected,
      };
    });

    console.log(`[inviteRepo.listRanking] count=${mapped.length} → ${Date.now() - t0}ms`);
    return mapped;
  }


  async terminateRelationship(buyerOrganizationId: string, supplierOrganizationId: string, endedReason: string) {
    const activeRel = await prisma.organizationRelationship.findFirst({
      where: {
        buyerOrganizationId,
        supplierOrganizationId,
        status: "ACTIVE",
      },
    });

    if (!activeRel) {
      throw new Error("Nenhum relacionamento ativo encontrado para esta organização.");
    }

    return prisma.organizationRelationship.update({
      where: { id: activeRel.id },
      data: {
        status: "INACTIVE",
        endedAt: new Date(),
        endedReason,
      },
    });
  }

  async reactivateRelationship(buyerOrganizationId: string, supplierOrganizationId: string) {
    const inactiveRel = await prisma.organizationRelationship.findFirst({
      where: {
        buyerOrganizationId,
        supplierOrganizationId,
        status: "INACTIVE",
      },
      orderBy: {
        endedAt: "desc"
      }
    });

    if (!inactiveRel) {
      return prisma.organizationRelationship.create({
        data: {
          buyerOrganizationId,
          supplierOrganizationId,
          status: "ACTIVE",
          startedAt: new Date(),
        }
      });
    }

    return prisma.organizationRelationship.update({
      where: { id: inactiveRel.id },
      data: {
        status: "ACTIVE",
        endedAt: null,
        endedReason: null,
        startedAt: new Date(),
      },
    });
  }

  async createInviteOrder(organizationId: string, quantity: number, totalCents: number) {
    const checkoutKey = `INVITE_PACK:${quantity}`;
    const now = new Date();
    const checkoutExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await prisma.order.updateMany({
      where: { organizationId, checkoutKey, status: "PENDING_PAYMENT", checkoutExpiresAt: { lte: now } },
      data: { status: "EXPIRED", canceledAt: now },
    });

    const existingOrder = await prisma.order.findFirst({
      where: {
        organizationId,
        checkoutKey,
        orderType: "INVITE_PACK",
        status: "PENDING_PAYMENT",
        checkoutExpiresAt: { gt: now },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingOrder) {
      return existingOrder;
    }

    try {
      return await prisma.order.create({
        data: {
        organizationId,
        orderType: "INVITE_PACK",
        status: "PENDING_PAYMENT",
        checkoutKey,
        checkoutExpiresAt,
        totalCents,
        currency: "BRL",
        items: {
          create: {
            productId: await this.getOrCreateInviteProduct(),
            quantity,
            unitPriceCents: Math.round(totalCents / quantity),
            metadata: {
              quantity,
            },
          },
        },
        },
        include: {
        items: {
          include: {
            product: true,
          },
        },
        },
      });
    } catch (error) {
      if (!(typeof error === "object" && error !== null && "code" in error && error.code === "P2002")) throw error;
      const concurrentOrder = await prisma.order.findFirst({
        where: { organizationId, checkoutKey, status: "PENDING_PAYMENT", checkoutExpiresAt: { gt: new Date() } },
        include: { items: { include: { product: true } } },
      });
      if (concurrentOrder) return concurrentOrder;
      throw error;
    }
  }

  private async getOrCreateInviteProduct() {
    let product = await prisma.product.findUnique({
      where: { code: "INVITE_PACK_CUSTOM" },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          code: "INVITE_PACK_CUSTOM",
          name: "Pacote de Convites Personalizado",
          productKind: "INVITE_PACK",
          active: true,
        },
      });
    }

    return product.id;
  }

  async findOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
    });
  }

  async deleteOrder(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }

  async confirmOrderPayment(orderId: string, success: boolean) {
    return prisma.$transaction(
      async (transaction) => {
        const order = await transaction.order.findUnique({
          where: { id: orderId },
          include: {
            items: true,
          },
        });

        if (!order) {
          throw new Error("Pedido não encontrado");
        }

        if (order.status !== "PENDING_PAYMENT") {
          return order;
        }

        if (success) {
          // Update order status
          const updatedOrder = await transaction.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          });

          // Cria o registro na tabela de pagamentos
          await transaction.payment.create({
            data: {
              orderId: order.id,
              provider: "SIMULATED",
              providerReference: `pay-invite-${order.id}-${Date.now()}`,
              method: "PIX",
              status: "PAID",
              amountCents: order.totalCents,
              paidAt: new Date(),
            },
          });

          // Determine invite count from order items metadata or quantity
          const quantity = order.items.reduce((acc, item) => {
            const meta = item.metadata as any;
            return acc + (meta?.quantity ?? item.quantity);
          }, 0);

          // Update or create wallet
          const wallet = await transaction.inviteWallet.upsert({
            where: { organizationId: order.organizationId },
            create: {
              organizationId: order.organizationId,
              balance: quantity,
            },
            update: {
              balance: {
                increment: quantity,
              },
            },
          });

          // Create transaction history
          await transaction.inviteTransaction.create({
            data: {
              organizationId: order.organizationId,
              type: "PURCHASE",
              amount: quantity,
              referenceType: "ORDER",
              referenceId: order.id,
              notes: `Compra de ${quantity} convites via Checkout Mercado Pago`,
            },
          });

          await authRepository.promoteOrganizationToCompany(order.organizationId);

          return updatedOrder;
        } else {
          return transaction.order.update({
            where: { id: orderId },
            data: {
              status: "FAILED",
              canceledAt: new Date(),
            },
          });
        }
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );
  }
}
