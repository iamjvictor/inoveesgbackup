import { Router } from "express";
import { CheckoutController } from "../modules/checkout/controllers/checkoutController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const checkoutController = new CheckoutController();

export const checkoutRoutes = Router();

checkoutRoutes.get("/catalog-prices", authMiddleware, checkoutController.getCatalogPrices);
checkoutRoutes.get("/orders/pending", authMiddleware, checkoutController.getPendingOrder);
checkoutRoutes.post("/orders/:id/cancel", authMiddleware, checkoutController.cancelOrder);
checkoutRoutes.get("/orders/:id", authMiddleware, checkoutController.getOrderDetails);
checkoutRoutes.post("/preference", authMiddleware, checkoutController.createPreference);
