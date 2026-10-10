import { Router } from "express";
import { MercadoPagoWebhookController } from "../modules/webhooks/controllers/mercadopagoWebhookController.js";

const mercadopagoWebhookController = new MercadoPagoWebhookController();

export const webhooksRoutes = Router();

webhooksRoutes.post("/mercadopago", (request, response) => mercadopagoWebhookController.handle(request, response));
