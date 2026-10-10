import { Router } from "express";
import { AdminController } from "../modules/admin/controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const adminController = new AdminController();

export const adminRoutes = Router();

// Apply authMiddleware to all admin routes
adminRoutes.use(authMiddleware);

adminRoutes.get("/overview", (req, res) => adminController.getOverview(req, res));
adminRoutes.post("/overview/load", (req, res) => adminController.getOverview(req, res));
adminRoutes.get("/budgets", (req, res) => adminController.getBudgets(req, res));
adminRoutes.post("/budgets/list", (req, res) => adminController.getBudgets(req, res));
adminRoutes.post("/budgets/:id/respond", (req, res) => adminController.respondToBudget(req, res));
adminRoutes.get("/clients", (req, res) => adminController.getClients(req, res));
adminRoutes.post("/clients/list", (req, res) => adminController.getClients(req, res));
adminRoutes.get("/consultoria", (req, res) => adminController.getConsulting(req, res));
adminRoutes.post("/consultoria/list", (req, res) => adminController.getConsulting(req, res));
adminRoutes.get("/suppliers", (req, res) => adminController.getSuppliers(req, res));
adminRoutes.post("/suppliers/list", (req, res) => adminController.getSuppliers(req, res));
adminRoutes.get("/evidences", (req, res) => adminController.getEvidences(req, res));
adminRoutes.post("/evidences/list", (req, res) => adminController.getEvidences(req, res));
adminRoutes.get("/evidences/:id/preview", (req, res) => adminController.getEvidencePreview(req, res));
adminRoutes.get("/evidences/:id/notes", (req, res) => adminController.getEvidenceNotes(req, res));
adminRoutes.post("/evidences/:id/notes", (req, res) => adminController.createEvidenceNote(req, res));
adminRoutes.post("/evidences/:id/review", (req, res) => adminController.reviewEvidence(req, res));
adminRoutes.get("/analytics", (req, res) => adminController.getAnalytics(req, res));
adminRoutes.post("/analytics/load", (req, res) => adminController.getAnalytics(req, res));
adminRoutes.get("/financeiro", (req, res) => adminController.getFinance(req, res));
adminRoutes.post("/financeiro/load", (req, res) => adminController.getFinance(req, res));
adminRoutes.get("/livros", (req, res) => adminController.getBooks(req, res));
adminRoutes.post("/livros/load", (req, res) => adminController.getBooks(req, res));
adminRoutes.post("/consultoria/:id/schedule", (req, res) => adminController.scheduleConsulting(req, res));
adminRoutes.post("/consultoria/:id/complete", (req, res) => adminController.completeConsulting(req, res));
adminRoutes.post("/consultoria/:id/cancel", (req, res) => adminController.cancelConsulting(req, res));
adminRoutes.post("/consultoria/:id/reschedule", (req, res) => adminController.rescheduleConsulting(req, res));
