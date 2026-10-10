import { prisma } from "../../../lib/prisma.js";
import { cache } from "../../../lib/cache.js";
import { BusinessCategoryCode, BusinessSegmentCode } from "@prisma/client";
import { buildAuthAccessContext } from "../models/accessContext.js";

interface CreateUserWithOrganizationInput {
  supabaseUserId: string;
  email: string;
  fullName: string;
  phone: string;
  companyName: string;
  cnpj: string;
  industrySegment?: string;
  businessCategoryCode?: BusinessCategoryCode;
  businessSegmentCode?: BusinessSegmentCode;
  size?: string;
  numberOfSuppliers?: string;
  annualRevenue?: string;
  ref?: string;
  cpf: string;
  cargoFuncao: string;
  grauParticipacao: string;
  tradeName: string;
  addressLine1: string;
  addressNumber: string;
  addressComplement?: string;
  country: string;
  state: string;
  city: string;
  site?: string;
  redesSociais?: string;
  naturezaJuridica: string;
  porte: string;
  tempoOperacao: string;
  alcanceMercado: string;
  esgJaPossui?: string[];
  esgInteresse?: string[];
  specificActivity?: string;
}

export class AuthRepository {
  async findAdminUserBySupabaseUserId(supabaseUserId: string) {
    return prisma.adminUser.findFirst({
      where: {
        user: {
          supabaseUserId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async existsAdminUserBySupabaseUserId(supabaseUserId: string) {
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        user: {
          supabaseUserId,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(adminUser);
  }

  private async invalidateAuthProfileCacheForOrganization(organizationId: string) {
    const orgUsers = await prisma.organizationUser.findMany({
      where: { organizationId },
      select: {
        user: {
          select: { supabaseUserId: true },
        },
      },
    });

    await Promise.all(
      orgUsers.map((orgUser) => cache.delete(`auth:profile:v2:${orgUser.user.supabaseUserId}`))
    );
  }

  private async invalidateAuthAccessCacheForOrganization(organizationId: string) {
    const orgUsers = await prisma.organizationUser.findMany({
      where: { organizationId },
      select: {
        user: {
          select: { supabaseUserId: true },
        },
      },
    });

    await Promise.all(
      orgUsers.map((orgUser) => cache.delete(`auth:access:v1:${orgUser.user.supabaseUserId}`))
    );
  }

  async invalidateUserCachesForOrganization(organizationId: string) {
    await Promise.all([
      this.invalidateAuthProfileCacheForOrganization(organizationId),
      this.invalidateAuthAccessCacheForOrganization(organizationId),
    ]);
  }

  async createUserWithOrganization(input: CreateUserWithOrganizationInput) {
    return prisma.$transaction(
      async (transaction) => {
        // Validação de duplicados (Fail-Fast)
        const existingEmail = await transaction.user.findUnique({
          where: { email: input.email }
        });
        if (existingEmail) {
          throw new Error("Este e-mail já está cadastrado.");
        }

        const existingCpf = await transaction.user.findFirst({
          where: { cpf: input.cpf }
        });
        if (existingCpf) {
          throw new Error("Este CPF já está cadastrado.");
        }

        const existingCnpj = await transaction.organization.findUnique({
          where: { cnpj: input.cnpj }
        });
        if (existingCnpj) {
          throw new Error("Este CNPJ já está cadastrado.");
        }

        const user = await transaction.user.create({
        data: {
          supabaseUserId: input.supabaseUserId,
          email: input.email,
          fullName: input.fullName,
          phone: input.phone,
          cpf: input.cpf,
          cargoFuncao: input.cargoFuncao,
          grauParticipacao: input.grauParticipacao,
        },
      });

      const organization = await transaction.organization.create({
        data: {
          legalName: input.companyName,
          tradeName: input.tradeName,
          cnpj: input.cnpj,
          primaryEmail: input.email,
          phone: input.phone,
          website: input.site?.trim() ? input.site.trim() : undefined,
          industrySegment: input.industrySegment,
          businessCategory: input.businessCategoryCode ? {
            connect: { code: input.businessCategoryCode }
          } : undefined,
          businessSegment: input.businessSegmentCode ? {
            connect: { code: input.businessSegmentCode }
          } : undefined,
          specificActivity: input.specificActivity,
          size: input.size,
          numberOfSuppliers: input.numberOfSuppliers,
          annualRevenue: input.annualRevenue,
          addressLine1: input.addressLine1,
          addressNumber: input.addressNumber,
          addressComplement: input.addressComplement,
          enderecoCompleto: [input.addressLine1, input.addressNumber, input.addressComplement].filter(Boolean).join(", "),
          municipioEstado: `${input.city} - ${input.state}`,
          country: input.country,
          state: input.state,
          city: input.city,
          redesSociais: input.redesSociais,
          naturezaJuridica: input.naturezaJuridica,
          porte: input.porte,
          tempoOperacao: input.tempoOperacao,
          alcanceMercado: input.alcanceMercado,
          esgJaPossui: input.esgJaPossui || [],
          esgInteresse: input.esgInteresse || [],
          status: "ACTIVE",
        },
      });

      const isSupplier = !!input.ref;
      const roleName = isSupplier ? "SUPPLIER" : "COMPANY";

      await transaction.organizationRole.create({
        data: {
          organizationId: organization.id,
          role: roleName,
          source: isSupplier ? "INVITE" : "SELF_SIGNUP",
        },
      });

      await transaction.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          membershipRole: "OWNER",
          isPrimaryContact: true,
          joinedAt: new Date(),
        },
      });

      if (isSupplier && input.ref) {
        const buyerOrganizationId = input.ref;

        // Tenta achar um convite pendente por e-mail e comprador
        const invite = await transaction.invite.findFirst({
          where: {
            buyerOrganizationId,
            supplierEmail: {
              equals: input.email,
              mode: "insensitive",
            },
            status: { in: ["PENDING", "SENT"] }
          }
        });

        let inviteId: string | null = null;

        if (invite) {
          inviteId = invite.id;
          await transaction.invite.update({
            where: { id: invite.id },
            data: {
              status: "ACCEPTED",
              acceptedAt: new Date(),
              supplierOrganizationId: organization.id
            }
          });
        } else {
          // 1. Verifica se o comprador tem saldo de convites
          const wallet = await transaction.inviteWallet.findUnique({
            where: { organizationId: buyerOrganizationId },
          });

          if (!wallet || wallet.balance <= 0) {
            throw new Error("A organização compradora não possui saldo de convites suficiente para homologar novos fornecedores.");
          }

          // 2. Decrementa o saldo do comprador
          await transaction.inviteWallet.update({
            where: { organizationId: buyerOrganizationId },
            data: {
              balance: {
                decrement: 1,
              },
            },
          });

          // 3. Cria um convite aceito automaticamente para manter a consistência da listagem
          const autoInvite = await transaction.invite.create({
            data: {
              buyerOrganizationId,
              supplierOrganizationId: organization.id,
              supplierEmail: input.email,
              token: `auto-${organization.id}-${Date.now()}`,
              status: "ACCEPTED",
              acceptedAt: new Date(),
            }
          });
          inviteId = autoInvite.id;

          // 4. Cria o histórico de transação de consumo
          await transaction.inviteTransaction.create({
            data: {
              organizationId: buyerOrganizationId,
              type: "CONSUMPTION",
              amount: 1,
              referenceType: "INVITE",
              referenceId: autoInvite.id,
            },
          });
        }

        // Evita duplicados ativos entre o mesmo par direcional e permite ciclos históricos
        const existingActiveRelationship = await transaction.organizationRelationship.findFirst({
          where: {
            buyerOrganizationId,
            supplierOrganizationId: organization.id,
            status: "ACTIVE",
          },
        });

        if (!existingActiveRelationship) {
          await transaction.organizationRelationship.create({
            data: {
              buyerOrganizationId,
              supplierOrganizationId: organization.id,
              inviteId: inviteId,
              status: "ACTIVE",
              startedAt: new Date(),
            },
          });
        }

        // Verifica se a organização fornecedora já possui um diagnóstico
        const existingDiagnostic = await transaction.diagnostic.findFirst({
          where: {
            organizationId: organization.id,
            kind: {
              in: ["SUPPLIER_DIAGNOSTIC", "PRE_DIAGNOSTIC", "FULL_DIAGNOSTIC"],
            },
          },
        });

        if (!existingDiagnostic) {
          // Cria o diagnóstico do fornecedor apenas se não possuir
          await transaction.diagnostic.create({
            data: {
              organizationId: organization.id,
              kind: "SUPPLIER_DIAGNOSTIC",
              status: "ACTIVE",
            }
          });
        }
      }

      // Populate cache on creation
      await cache.set(`auth:org-id:v2:${input.supabaseUserId}`, organization.id, 60 * 60 * 1000);

      return {
        user,
        organization,
      };
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
  }

  async promoteOrganizationToCompany(organizationId: string) {
    await prisma.organizationRole.upsert({
      where: {
        organizationId_role: {
          organizationId,
          role: "COMPANY",
        },
      },
      update: {
        source: "UPGRADE",
        removedAt: null,
      },
      create: {
        organizationId,
        role: "COMPANY",
        source: "UPGRADE",
      },
    });

    await Promise.all([
      this.invalidateAuthProfileCacheForOrganization(organizationId),
      this.invalidateAuthAccessCacheForOrganization(organizationId),
    ]);
  }

  async findBySupabaseUserId(supabaseUserId: string) {
    const cacheKey = `auth:profile:v2:${supabaseUserId}`;
    const cached = await cache.get<any>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      include: {
        organizationUsers: {
          include: {
            organization: {
              include: {
                roles: true,
                subscriptions: {
                  where: { status: "ACTIVE" },
                  include: { plan: { include: { product: true } } }
                },
                entitlements: {
                  where: { status: "ACTIVE" },
                  include: { featureFlag: true }
                },
                subjectDiagnostics: {
                  include: { score: true },
                  orderBy: { createdAt: "desc" }
                },
                orders: {
                  orderBy: { createdAt: "desc" },
                  include: {
                    items: {
                      include: {
                        product: true
                      }
                    },
                    payments: true
                  }
                },
                inviteWallet: true,
                businessCategory: true,
                businessSegment: true,
              },
            },
          },
        },
      },
    });

    await cache.set(cacheKey, user, 5 * 60 * 1000); // 5 minutes TTL
    return user;
  }

  async getAccessContextBySupabaseUserId(supabaseUserId: string) {
    const cacheKey = `auth:access:v1:${supabaseUserId}`;
    const cached = await cache.get<any>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const user = await this.findBySupabaseUserId(supabaseUserId);
    const accessContext = buildAuthAccessContext(user);

    await cache.set(cacheKey, accessContext, 5 * 60 * 1000);
    return accessContext;
  }

  /** Lightweight lookup — only fetches the organizationId. Use this instead of
   *  findBySupabaseUserId when you just need to resolve the org for the current user. */
  async findOrganizationIdBySupabaseUserId(supabaseUserId: string): Promise<string | null> {
    const cacheKey = `auth:org-id:v2:${supabaseUserId}`;
    const cached = await cache.get<string | null>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        user: { supabaseUserId },
      },
      select: {
        organizationId: true,
      },
    });
    const organizationId = orgUser?.organizationId ?? null;
    await cache.set(cacheKey, organizationId, 60 * 60 * 1000);
    return organizationId;
  }

  async updateProfile(
    supabaseUserId: string,
    data: {
      user?: {
        fullName?: string;
        phone?: string;
        cpf?: string;
        cargoFuncao?: string;
        grauParticipacao?: string;
      };
      organization?: {
        legalName?: string;
        tradeName?: string;
        cnpj?: string;
        logoUrl?: string;
        logoStoragePath?: string;
        primaryEmail?: string;
        phone?: string;
        website?: string;
        industrySegment?: string;
        businessCategoryCode?: string;
        businessSegmentCode?: string;
        specificActivity?: string;
        enderecoCompleto?: string;
        municipioEstado?: string;
        addressLine1?: string;
        addressNumber?: string;
        addressComplement?: string;
        country?: string;
        state?: string;
        city?: string;
        redesSociais?: string;
        naturezaJuridica?: string;
        porte?: string;
        tempoOperacao?: string;
        alcanceMercado?: string;
      };
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { supabaseUserId },
        data: data.user || {},
      });

      let organization = null;
      if (data.organization) {
        const orgUser = await tx.organizationUser.findFirst({
          where: { userId: user.id },
          select: { organizationId: true },
        });

        if (orgUser?.organizationId) {
          const { businessCategoryCode, businessSegmentCode, ...restOrg } = data.organization;
          organization = await tx.organization.update({
            where: { id: orgUser.organizationId },
            data: {
              ...restOrg,
              businessCategory: businessCategoryCode ? {
                connect: { code: businessCategoryCode as BusinessCategoryCode }
              } : undefined,
              businessSegment: businessSegmentCode ? {
                connect: { code: businessSegmentCode as BusinessSegmentCode }
              } : undefined,
            },
          });
        }
      }

      const cacheKey = `auth:profile:v2:${supabaseUserId}`;
      await cache.delete(cacheKey);

      return { user, organization };
    });
  }
}
