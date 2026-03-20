import { z } from "zod";
import { createJournalEntry, listJournalEntries, updateJournalEntry, deleteJournalEntry } from "../models/journalModel.js";

const createSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
});

const updateSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
});

export async function listJournals(req, res, next) {
  try {
    const userId = req.user?.userId;
    const journals = await listJournalEntries(userId);
    return res.json({ journals });
  } catch (err) {
    return next(err);
  }
}

export async function createJournal(req, res, next) {
  try {
    const userId = req.user?.userId;
    const body = createSchema.parse(req.body);

    const journal = await createJournalEntry({
      userId,
      title: body.title || "Untitled",
      content: body.content,
    });

    return res.status(201).json({ journal });
  } catch (err) {
    return next(err);
  }
}

export async function updateJournal(req, res, next) {
  try {
    const userId = req.user?.userId;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const body = updateSchema.parse(req.body);
    const updated = await updateJournalEntry({
      userId,
      id,
      title: body.title || "Untitled",
      content: body.content,
    });

    if (!updated) return res.status(404).json({ error: "Journal not found" });
    return res.json({ journal: updated });
  } catch (err) {
    return next(err);
  }
}

export async function deleteJournal(req, res, next) {
  try {
    const userId = req.user?.userId;
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const ok = await deleteJournalEntry({ userId, id });
    if (!ok) return res.status(404).json({ error: "Journal not found" });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
