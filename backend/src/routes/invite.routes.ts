import { Router } from "express";
import { InviteController } from "../modules/invite/controllers/inviteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const inviteController = new InviteController();

export const inviteRoutes = Router();

inviteRoutes.get("/public-info", inviteController.getPublicInfo);
inviteRoutes.get("/", authMiddleware, inviteController.listInvites);
inviteRoutes.get("/ranking", authMiddleware, inviteController.listRanking);
inviteRoutes.post("/accept", authMiddleware, inviteController.acceptInvite);
inviteRoutes.post("/", authMiddleware, inviteController.createInvite);
inviteRoutes.get("/stats", authMiddleware, inviteController.getStats);
inviteRoutes.post("/simulate-purchase", authMiddleware, inviteController.createCheckoutSession);
inviteRoutes.post("/confirm-payment", authMiddleware, inviteController.confirmPayment);
inviteRoutes.post("/relationship/terminate", authMiddleware, inviteController.terminateRelationship);
inviteRoutes.post("/relationship/reactivate", authMiddleware, inviteController.reactivateRelationship);
