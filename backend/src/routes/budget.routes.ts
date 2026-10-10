import { Router } from "express";
import { BudgetController } from "../modules/budget/controllers/budgetController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const budgetController = new BudgetController();

export const budgetRoutes = Router();

budgetRoutes.post("/", authMiddleware, budgetController.create);
budgetRoutes.get("/", authMiddleware, budgetController.list);
budgetRoutes.post("/:id/accept", authMiddleware, budgetController.accept);
budgetRoutes.post("/:id/decline", authMiddleware, budgetController.decline);
