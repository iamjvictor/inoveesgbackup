import { Router, type RequestHandler } from "express";
import { DiagnosticController } from "../modules/diagnostic/controllers/diagnosticController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export function createDiagnosticRoutes(
  diagnosticController = new DiagnosticController(),
  authenticate: RequestHandler = authMiddleware,
) {
  const routes = Router();

  routes.post("/simulate-pre-diag", authenticate, diagnosticController.simulatePurchase);
  routes.post("/confirm-payment", authenticate, diagnosticController.confirmPayment);
  routes.post("/start", authenticate, diagnosticController.startDiagnostic);
  routes.get("/current", authenticate, diagnosticController.getCurrentDiagnostic.bind(diagnosticController));
  routes.get("/current/report", authenticate, diagnosticController.downloadCurrentReport);
  routes.get("/history", authenticate, diagnosticController.getDiagnosticHistory);
  routes.get("/bioimpacto/history", authenticate, diagnosticController.getBioimpactoHistory);
  routes.post("/:id/evidences", authenticate, diagnosticController.uploadEvidences);
  routes.post("/:id/submit", authenticate, diagnosticController.submitResponses);
  return routes;
}

export const diagnosticRoutes = createDiagnosticRoutes();
