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

      const appointments = await prisma.consultingAppointment.findMany({
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
      const now = new Date();
      const scheduled = appointments.filter((item) => ["REQUESTED", "CONFIRMED"].includes(item.status) && item.startsAt);
      const appointment = scheduled
        .filter((item) => item.startsAt! >= now)
        .sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime())[0]
        ?? scheduled.sort((a, b) => b.startsAt!.getTime() - a.startsAt!.getTime())[0]
        ?? appointments[0]
        ?? null;

      return response.status(200).json({ appointment, appointments });
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro ao carregar consultoria",
      });
    }
  }
}
