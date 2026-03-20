import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listChats, sendChat } from "../controllers/chatController.js";

export const chatRouter = Router();

chatRouter.get("/", requireAuth, listChats);
chatRouter.post("/", requireAuth, sendChat);
