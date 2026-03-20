import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createJournal, listJournals, updateJournal, deleteJournal } from "../controllers/journalController.js";

export const journalRouter = Router();

journalRouter.get("/", requireAuth, listJournals);
journalRouter.post("/", requireAuth, createJournal);
journalRouter.put("/:id", requireAuth, updateJournal);
journalRouter.delete("/:id", requireAuth, deleteJournal);
