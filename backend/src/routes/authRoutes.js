import { Router } from "express";
import { forgotPassword, googleLogin, login, me, register, resetPassword, updateProfile, verifyEmail } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google", googleLogin);
authRouter.get("/me", requireAuth, me);
authRouter.put("/profile", requireAuth, updateProfile);
