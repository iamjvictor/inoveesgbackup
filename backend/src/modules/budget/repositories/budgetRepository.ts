import { prisma } from "../../../lib/prisma.js";

export interface CreateBudgetInput {
  organizationId: string;
  productId: string;
  requestedByUserId: string;
  status?: "SOLICITADO" | "RESPONDIDO" | "ACEITO" | "RECUSADO";
  months?: number;
}

export function buildBudgetOwnerFilter(organizationId: string, requestedByUserId: string) {
  return { organizationId, requestedByUserId };
}

export class BudgetRepository {
  async create(input: CreateBudgetInput) {
    return prisma.budgetRequest.create({
      data: {
        organizationId: input.organizationId,
        productId: input.productId,
        requestedByUserId: input.requestedByUserId,
        status: input.status ?? "SOLICITADO",
        months: input.months,
      },
    });
  }

  async findByOrganizationId(organizationId: string, requestedByUserId: string) {
    return prisma.budgetRequest.findMany({
      where: {
        ...buildBudgetOwnerFilter(organizationId, requestedByUserId),
      },
      include: {
        product: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
