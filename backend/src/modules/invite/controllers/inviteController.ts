import type { Request, Response } from "express";
import { InviteService } from "../services/inviteService.js";

const inviteService = new InviteService();

export class InviteController {
  async getStats(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const stats = await inviteService.getStats(supabaseUserId);
      return response.status(200).json(stats);
    } catch (error) {
      console.error("[invite.getStats] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar estatísticas de convites",
      });
    }
  }

  async createCheckoutSession(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { quantity, option } = request.body;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const session = await inviteService.createCheckoutSession(supabaseUserId, Number(quantity), option);
      return response.status(201).json(session);
    } catch (error) {
      console.error("[invite.createCheckoutSession] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao gerar checkout de convites",
      });
    }
  }

  async confirmPayment(request: Request, response: Response) {
    const { orderId, simulateStatus } = request.body;

    if (!orderId || !simulateStatus) {
      return response.status(400).json({ message: "orderId e simulateStatus são obrigatórios" });
    }

    try {
      const result = await inviteService.confirmPayment(orderId, simulateStatus);
      return response.status(200).json(result);
    } catch (error) {
      console.error("[invite.confirmPayment] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao confirmar pagamento de convites",
      });
    }
  }

  async listInvites(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const invites = await inviteService.listInvites(supabaseUserId);
      return response.status(200).json(invites);
    } catch (error) {
      console.error("[invite.listInvites] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao listar convites",
      });
    }
  }

  async listRanking(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const ranking = await inviteService.listRanking(supabaseUserId);
      return response.status(200).json(ranking);
    } catch (error) {
      console.error("[invite.listRanking] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao listar ranking de fornecedores",
      });
    }
  }


  async acceptInvite(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { token, ref } = request.body;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }
    if (typeof token !== "string" && typeof ref !== "string") {
      return response.status(400).json({ message: "Token ou referência do convite é obrigatório" });
    }

    try {
      const result = typeof token === "string"
        ? await inviteService.acceptInvite(supabaseUserId, token.trim())
        : await inviteService.acceptGenericInvite(supabaseUserId, ref.trim());
      return response.status(200).json(result);
    } catch (error) {
      return response.status(400).json({
        message: error instanceof Error ? error.message : "Não foi possível aceitar o convite",
      });
    }
  }

  async createInvite(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { supplierEmail, message } = request.body;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const result = await inviteService.createInvite(supabaseUserId, supplierEmail, message);
      return response.status(201).json(result);
    } catch (error) {
      console.error("[invite.createInvite] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar convite de fornecedor",
      });
    }
  }

  async getPublicInfo(request: Request, response: Response) {
    const { ref, token } = request.query;

    if (!ref && !token) {
      return response.status(400).json({ message: "Parâmetro ref ou token é obrigatório" });
    }

    try {
      const { prisma } = await import("../../../lib/prisma.js");
      let organizationId = ref as string;
      let inviteEmail: string | undefined;
      let isTokenInvite = false;

      if (token && typeof token === "string") {
        const invite = await prisma.invite.findUnique({
          where: { token },
          select: { buyerOrganizationId: true, supplierEmail: true, status: true },
        });
        if (invite) {
          if (invite.status === "ACCEPTED") {
            return response.status(400).json({
              message: "Este convite já foi aceito e utilizado para cadastro.",
              code: "INVITE_ALREADY_USED"
            });
          }
          organizationId = invite.buyerOrganizationId;
          inviteEmail = invite.supplierEmail;
          isTokenInvite = true;
        } else {
          return response.status(404).json({
            message: "Convite não encontrado ou inválido.",
            code: "INVALID_TOKEN"
          });
        }
      }

      if (!organizationId) {
        return response.status(404).json({ message: "Convite não encontrado" });
      }

      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { tradeName: true, legalName: true },
      });

      if (!organization) {
        return response.status(404).json({ message: "Organização não encontrada" });
      }

      // Se for link genérico (sem token), valida se há saldo disponível na wallet da organização compradora
      if (!isTokenInvite) {
        const wallet = await prisma.inviteWallet.findUnique({
          where: { organizationId },
          select: { balance: true },
        });

        if (!wallet || wallet.balance <= 0) {
          return response.status(400).json({
            message: "O link de convite está inativo pois o limite de fornecedores contratados pela organização compradora foi atingido.",
            code: "LIMIT_EXCEEDED"
          });
        }
      }

      return response.status(200).json({
        name: organization.tradeName || organization.legalName,
        ref: organizationId,
        email: inviteEmail,
      });
    } catch (error) {
      console.error("[invite.getPublicInfo] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar informações da organização",
      });
    }
  }

  async terminateRelationship(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const { supplierOrganizationId, endedReason } = request.body;

    if (!supplierOrganizationId) {
      return response.status(400).json({ message: "ID da organização fornecedora é obrigatório." });
    }

    try {
      const result = await inviteService.terminateRelationship(supabaseUserId, supplierOrganizationId, endedReason || "Encerrado pelo comprador");
      return response.status(200).json(result);
    } catch (error) {
      console.error("[invite.terminateRelationship] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao encerrar relacionamento.",
      });
    }
  }

  async reactivateRelationship(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const { supplierOrganizationId } = request.body;

    if (!supplierOrganizationId) {
      return response.status(400).json({ message: "ID da organização fornecedora é obrigatório." });
    }

    try {
      const result = await inviteService.reactivateRelationship(supabaseUserId, supplierOrganizationId);
      return response.status(200).json(result);
    } catch (error) {
      console.error("[invite.reactivateRelationship] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao reativar relacionamento.",
      });
    }
  }
}
