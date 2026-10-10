import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { ConsultingController } from "../modules/consulting/controllers/consultingController.js";

const consultingController = new ConsultingController();

export const consultingRoutes = Router();

consultingRoutes.get("/current", authMiddleware, (req, res) => consultingController.getCurrent(req, res));
