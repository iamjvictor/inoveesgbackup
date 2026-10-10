import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";

const authRepository = new AuthRepository();

export class ConsultingController {
  async getCurrent(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

      if (!organizationId) {
        return response.status(404).json({ message: "Organização não encontrada" });
      }

      const appointment = await prisma.consultingAppointment.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          startsAt: true,
          endsAt: true,
          timezone: true,
          meetingUrl: true,
        },
      });

      return response.status(200).json({ appointment });
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro ao carregar consultoria",
      });
    }
  }
}
