import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { syncGuestData } from "../controllers/syncController.js";

export const syncRouter = Router();

syncRouter.post("/", requireAuth, syncGuestData);
