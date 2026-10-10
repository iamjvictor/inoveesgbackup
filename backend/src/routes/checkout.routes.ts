import { Router } from "express";
import { CheckoutController } from "../modules/checkout/controllers/checkoutController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const checkoutController = new CheckoutController();

export const checkoutRoutes = Router();

checkoutRoutes.get("/catalog-prices", authMiddleware, checkoutController.getCatalogPrices);
checkoutRoutes.post("/preference", authMiddleware, checkoutController.createPreference);
