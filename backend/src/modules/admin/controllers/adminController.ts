import type { Request, Response } from "express";
import { AdminService } from "../services/adminService.js";
import { ConsultingService } from "../services/consultingService.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { cache } from "../../../lib/cache.js";
import { z } from "zod";

const adminService = new AdminService();
const consultingService = new ConsultingService();
const authRepository = new AuthRepository();

function parsePagination(request: Request, defaultLimit = 10) {
  const source = request.method === "GET" ? request.query : request.body;
  const pageValue = Number(source?.page ?? 1);
  const limitValue = Number(source?.limit ?? defaultLimit);

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1,
    limit: Number.isFinite(limitValue) && limitValue > 0 ? Math.min(Math.floor(limitValue), 50) : defaultLimit,
  };
}

export class AdminController {
  private async checkAdmin(request: Request, response: Response): Promise<boolean> {
    const user = (request as any).user;
    if (!user?.id) {
      response.status(401).json({ message: "Usuário não autenticado" });
      return false;
    }

    const cacheKey = `admin:check:${user.id}`;
    const cachedAdmin = await cache.get<boolean>(cacheKey);
    if (cachedAdmin) {
      return true;
    }

    const t0 = Date.now();
    const isAdmin = await authRepository.existsAdminUserBySupabaseUserId(user.id);
    console.log(`[admin.checkAdmin] DB lookup → ${Date.now() - t0}ms`);

    if (!isAdmin) {
      response.status(403).json({ message: "Acesso negado: Administrador não autenticado" });
      return false;
    }

    await cache.set(cacheKey, true, 30 * 60 * 1000);
    return true;
  }

  async getOverview(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const data = await adminService.getOverview();
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getBudgets(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request);
      const data = await adminService.getBudgets(pagination);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getClients(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request);
      const data = await adminService.getClients(pagination);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getConsulting(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request);
      const data = await adminService.getConsulting(pagination);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getSuppliers(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request);
      const data = await adminService.getSuppliers(pagination);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getEvidences(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request);
      const data = await adminService.getEvidences(pagination);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getEvidencePreview(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;
    try {
      const data = await adminService.getEvidencePreview((request as any).user.id, request.params.id);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(404).json({ message: error instanceof Error ? error.message : "Evidência não encontrada" });
    }
  }

  async getEvidenceNotes(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;
    if (!z.string().uuid().safeParse(request.params.id).success) {
      return response.status(400).json({ message: "Identificador de evidência inválido" });
    }
    try {
      const notes = await adminService.getEvidenceNotes((request as any).user.id, request.params.id);
      return response.status(200).json({ notes });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível carregar as observações";
      const status = message === "Evidência não encontrada" ? 404 : message === "Acesso administrativo não autorizado" ? 403 : 500;
      return response.status(status).json({ message });
    }
  }

  async createEvidenceNote(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;
    if (!z.string().uuid().safeParse(request.params.id).success) {
      return response.status(400).json({ message: "Identificador de evidência inválido" });
    }

    const content = typeof request.body?.content === "string" ? request.body.content.trim() : "";
    if (!content || content.length > 2000) {
      return response.status(400).json({ message: "A observação deve conter entre 1 e 2.000 caracteres" });
    }

    try {
      const note = await adminService.createEvidenceNote((request as any).user.id, request.params.id, content);
      return response.status(201).json(note);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível salvar a observação";
      const status = message === "Evidência não encontrada" ? 404 : message === "Acesso administrativo não autorizado" ? 403 : 500;
      return response.status(status).json({ message });
    }
  }

  async reviewEvidence(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;
    try {
      const status = request.body?.status;
      if (status !== "VERIFIED" && status !== "REJECTED") {
        return response.status(400).json({ message: "Status de revisão inválido" });
      }
      const data = await adminService.reviewEvidence((request as any).user.id, request.params.id, status, request.body?.comment);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ message: error instanceof Error ? error.message : "Não foi possível revisar a evidência" });
    }
  }

  async getAnalytics(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const data = await adminService.getAnalytics();
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getFinance(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request, 10);
      const productId = typeof request.body?.productId === "string" ? request.body.productId : "ALL";
      const status = typeof request.body?.status === "string" ? request.body.status : "ALL";
      const data = await adminService.getFinance(pagination, productId, status);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async getBooks(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const pagination = parsePagination(request);
      const data = await adminService.getBooks(pagination);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async respondToBudget(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { id } = request.params;
      const { proposalValueCents } = request.body;

      if (!id || typeof proposalValueCents !== "number") {
        return response.status(400).json({ message: "ID e valor da proposta (cents) inválidos ou não informados" });
      }

      const data = await adminService.respondToBudget(id, proposalValueCents);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(500).json({
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  }

  async scheduleConsulting(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { id } = request.params;
      const { startsAt, meetingUrl, orderId } = request.body;

      if (!id || !startsAt || !meetingUrl) {
        return response.status(400).json({ message: "ID, data e link do Google Meet são obrigatórios" });
      }

      const data = await consultingService.schedule(id, startsAt, meetingUrl, orderId);
      return response.status(200).json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      const statusCode = message.includes("já possui") ? 409 : 400;
      return response.status(statusCode).json({
        message,
      });
    }
  }

  async completeConsulting(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { orderId, appointmentId } = request.body ?? {};
      const data = await consultingService.complete(request.params.id, orderId, appointmentId);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ message: error instanceof Error ? error.message : "Erro inesperado" });
    }
  }

  async markConsultingNoShow(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { orderId, appointmentId } = request.body ?? {};
      const data = await consultingService.markNoShow(request.params.id, orderId, appointmentId);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ message: error instanceof Error ? error.message : "Erro inesperado" });
    }
  }

  async updateConsultingMeetingLink(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { orderId, appointmentId, meetingUrl } = request.body ?? {};
      const data = await consultingService.updateMeetingLink(request.params.id, meetingUrl, orderId, appointmentId);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ message: error instanceof Error ? error.message : "Erro inesperado" });
    }
  }

  async cancelConsulting(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { reason, orderId, appointmentId } = request.body ?? {};
      const data = await consultingService.cancel(request.params.id, reason, orderId, appointmentId);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ message: error instanceof Error ? error.message : "Erro inesperado" });
    }
  }

  async rescheduleConsulting(request: Request, response: Response) {
    if (!(await this.checkAdmin(request, response))) return;

    try {
      const { startsAt, orderId, appointmentId } = request.body ?? {};
      if (!startsAt) {
        return response.status(400).json({ message: "O novo horário é obrigatório" });
      }

      const data = await consultingService.reschedule(request.params.id, startsAt, orderId, appointmentId);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(400).json({ message: error instanceof Error ? error.message : "Erro inesperado" });
    }
  }
}
