import { Router } from "express";
import { DiagnosticController } from "../modules/diagnostic/controllers/diagnosticController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const diagnosticController = new DiagnosticController();

export const diagnosticRoutes = Router();

diagnosticRoutes.post("/simulate-pre-diag", authMiddleware, diagnosticController.simulatePurchase);
diagnosticRoutes.post("/confirm-payment", authMiddleware, diagnosticController.confirmPayment);
diagnosticRoutes.post("/start", authMiddleware, diagnosticController.startDiagnostic);
diagnosticRoutes.get("/current", authMiddleware, diagnosticController.getCurrentDiagnostic);
diagnosticRoutes.get("/current/report", authMiddleware, diagnosticController.downloadCurrentReport);
diagnosticRoutes.get("/history", authMiddleware, diagnosticController.getDiagnosticHistory);
diagnosticRoutes.post("/:id/evidences", authMiddleware, diagnosticController.uploadEvidences);
diagnosticRoutes.post("/:id/submit", authMiddleware, diagnosticController.submitResponses);
