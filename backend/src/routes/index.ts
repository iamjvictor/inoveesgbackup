import { Router } from "express";

import { authRoutes } from "./auth.routes.js";
import { budgetRoutes } from "./budget.routes.js";
import { diagnosticRoutes } from "./diagnostic.routes.js";
import { inviteRoutes } from "./invite.routes.js";
import { webhooksRoutes } from "./webhooks.routes.js";
import { checkoutRoutes } from "./checkout.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { consultingRoutes } from "./consulting.routes.js";
import { keepalive, keepaliveRateLimit } from "./keepalive.js";

export const routes = Router();

routes.get("/health", (_request, response) => {
  return response.json({ ok: true });
});

routes.get("/health/db", keepaliveRateLimit, keepalive);

routes.use("/auth", authRoutes);
routes.use("/budget", budgetRoutes);
routes.use("/diagnostic", diagnosticRoutes);
routes.use("/invite", inviteRoutes);
routes.use("/webhooks", webhooksRoutes);
routes.use("/checkout", checkoutRoutes);
routes.use("/admin", adminRoutes);
routes.use("/consulting", consultingRoutes);
