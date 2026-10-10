import { Router } from "express";

import { AuthController } from "../modules/auth/controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/admin/login", authController.adminLogin);
authRoutes.post("/admin/logout", authController.adminLogout);
authRoutes.post("/logout", authController.adminLogout);
authRoutes.post("/recover", authController.recoverPassword);
authRoutes.post("/recover/complete", authController.completePasswordRecovery);
authRoutes.get("/me", authMiddleware, authController.getMe);
authRoutes.get("/me/access", authMiddleware, authController.getAccessContext);
authRoutes.put("/profile", authMiddleware, authController.updateProfile);
authRoutes.post("/profile/logo", authMiddleware, authController.uploadCompanyLogo);
