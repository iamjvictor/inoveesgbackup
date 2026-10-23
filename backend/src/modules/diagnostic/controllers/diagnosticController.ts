import type { Request, Response } from "express";
import { DiagnosticService } from "../services/diagnosticService.js";
import { z } from "zod";
import { getDatabaseErrorPayload, getDatabaseErrorStatusCode } from "../../../lib/databaseErrors.js";

const diagnosticService = new DiagnosticService();

const evidenceUploadSchema = z.object({
  groupCode: z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]),
  files: z.array(
      z.object({
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        base64Data: z.string().min(1),
        sizeBytes: z.number().int().nonnegative(),
        documentType: z.string().trim().min(1).optional(),
        requirementCode: z.string().trim().min(1).optional(),
        expectedDocument: z.string().trim().min(1).optional(),
        acceptedTypes: z.array(z.string().trim().min(1)).optional(),
        primaryAxis: z.string().trim().min(1).optional(),
        scoringAxes: z.array(z.string().trim().min(1)).optional(),
        points: z.number().int().nonnegative().optional(),
        strategicObjectives: z.array(z.string().trim().min(1)).optional(),
        gapIfMissing: z.string().optional(),
        recommendedService: z.string().optional(),
      })
  ).min(1),
});

export class DiagnosticController {
  async startDiagnostic(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      console.info("[diagnostic.controller.startDiagnostic] Request received", {
        supabaseUserId,
      });

      const result = await diagnosticService.startDiagnostic(supabaseUserId);

      return response.status(200).json(result);
    } catch (error) {
      console.error("[diagnostic.startDiagnostic] Failed to prepare diagnostic", {
        error: error instanceof Error ? error.message : error,
      });

      const message = error instanceof Error ? error.message : "Erro ao iniciar diagnóstico";
      const statusCode = getDatabaseErrorStatusCode(error) === 503
        ? 503
        : message.toLowerCase().includes("consultoria")
          ? 409
          : 400;

      return response.status(statusCode).json(
        statusCode === 503 ? getDatabaseErrorPayload(error, message) : { message }
      );
    }
  }

  async simulatePurchase(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      console.info("[diagnostic.controller.simulatePurchase] Request received", {
        supabaseUserId,
      });

      const session = await diagnosticService.createCheckoutSession(supabaseUserId);

      console.info("[diagnostic.simulatePurchase] Checkout session created successfully", {
        checkoutUrl: session.checkoutUrl,
        diagnosticId: session.diagnosticId,
      });

      return response.status(201).json(session);
    } catch (error) {
      console.error("[diagnostic.simulatePurchase] Request failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao processar simulação",
      });
    }
  }

  async confirmPayment(request: Request, response: Response) {
    const { diagnosticId, simulateStatus } = request.body;

    if (!diagnosticId || !simulateStatus) {
      return response.status(400).json({ message: "diagnosticId e simulateStatus são obrigatórios" });
    }

    try {
      console.info("[diagnostic.controller.confirmPayment] Request received", {
        diagnosticId,
        simulateStatus,
      });

      const result = await diagnosticService.confirmPayment(diagnosticId, simulateStatus);

      return response.status(200).json(result);
    } catch (error) {
      console.error("[diagnostic.confirmPayment] Confirming payment failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao confirmar pagamento",
      });
    }
  }

  async getCurrentDiagnostic(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      console.info("[diagnostic.controller.getCurrentDiagnostic] Request received", {
        supabaseUserId,
      });

      const result = await diagnosticService.getCurrentDiagnostic(supabaseUserId);

      return response.status(200).json(result);
    } catch (error) {
      console.error("[diagnostic.getCurrentDiagnostic] Fetching current diagnostic failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(getDatabaseErrorStatusCode(error)).json(
        getDatabaseErrorPayload(error, "Erro ao buscar diagnóstico atual")
      );
    }
  }

  async submitResponses(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { id } = request.params;
    const responsesInput = Array.isArray(request.body?.responses) ? request.body.responses : [];
    const responsibilityDeclarationAccepted = request.body?.responsibilityDeclarationAccepted === true;
    const finalize = request.body?.finalize === true;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!id) {
      return response.status(400).json({ message: "ID do diagnóstico é obrigatório" });
    }

    if (finalize && !responsibilityDeclarationAccepted) {
      return response.status(400).json({ message: "Você deve declarar a responsabilidade pelas informações prestadas para concluir o diagnóstico" });
    }

    try {
      console.info("[diagnostic.controller.submitResponses] Request received", {
        supabaseUserId,
        diagnosticId: id,
        responsesCount: responsesInput.length,
        finalize,
      });

      if (!finalize) {
        if (!responsesInput.length) {
          return response.status(400).json({ message: "Respostas são obrigatórias para salvar o pilar" });
        }

        // 1. Salvar as respostas no banco
        await diagnosticService.saveResponses(
          supabaseUserId,
          id,
          responsesInput
        );

        return response.status(200).json({
          success: true,
          savedOnly: true,
        });
      }

      // 2. Calcular a pontuação final usando apenas o que já foi salvo no banco
      const result = await diagnosticService.calculateScore(supabaseUserId, id, responsibilityDeclarationAccepted);

      return response.status(200).json(result);
    } catch (error) {
      console.error("[diagnostic.submitResponses] Submitting responses failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(getDatabaseErrorStatusCode(error)).json(
        getDatabaseErrorPayload(error, "Erro ao enviar respostas do diagnóstico")
      );
    }
  }

  async uploadEvidences(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;
    const { id } = request.params;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    const parsed = evidenceUploadSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        message: "Payload inválido para upload de evidências",
        issues: parsed.error.flatten(),
      });
    }

    try {
      console.info("[diagnostic.controller.uploadEvidences] Request received", {
        supabaseUserId,
        diagnosticId: id,
        groupCode: parsed.data.groupCode,
        filesCount: parsed.data.files.length,
      });

      const result = await diagnosticService.uploadEvidenceFiles(supabaseUserId, id, parsed.data);

      return response.status(201).json(result);
    } catch (error) {
      console.error("[diagnostic.uploadEvidences] Upload failed", {
        error: error instanceof Error ? error.message : error,
      });

      const message = error instanceof Error ? error.message : "Erro ao enviar evidências";
      const statusCode = /Assessoria de Evidências|diagnóstico autodeclarado|prazo de 20 dias/.test(message) ? 403 : 400;
      return response.status(statusCode).json({
        message,
      });
    }
  }

  async getDiagnosticHistory(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      console.info("[diagnostic.controller.getDiagnosticHistory] Request received", {
        supabaseUserId,
      });

      const result = await diagnosticService.getDiagnosticHistory(supabaseUserId);

      return response.status(200).json(result);
    } catch (error) {
      console.error("[diagnostic.getDiagnosticHistory] Fetching diagnostic history failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(getDatabaseErrorStatusCode(error)).json(
        getDatabaseErrorPayload(error, "Erro ao buscar histórico de diagnósticos")
      );
    }
  }

  async downloadCurrentReport(request: Request, response: Response) {
    const supabaseUserId = (request as any).user?.id;

    if (!supabaseUserId) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      console.info("[diagnostic.controller.downloadCurrentReport] Request received", {
        supabaseUserId,
      });

      const { buffer: pdfBuffer, fileName } = await diagnosticService.generateReportPDF(supabaseUserId);

      const asciiFileName = fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w. -]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      response.setHeader("Content-Type", "application/pdf");
      response.setHeader(
        "Content-Disposition",
        `inline; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );
      response.setHeader("Content-Length", pdfBuffer.length);

      return response.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("[diagnostic.downloadCurrentReport] PDF generation failed", {
        error: error instanceof Error ? error.message : error,
      });

      return response.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao gerar o PDF do relatório",
      });
    }
  }
}
