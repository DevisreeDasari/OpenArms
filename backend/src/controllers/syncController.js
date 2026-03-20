import { z } from "zod";
import { createJournalEntry } from "../models/journalModel.js";
import { createChatMessage } from "../models/chatModel.js";

const syncSchema = z.object({
  journals: z
    .array(
      z.object({
        title: z.string().optional(),
        content: z.string().min(1),
        createdAt: z.string().optional(),
      })
    )
    .optional(),
  chats: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        message: z.string().min(1),
        createdAt: z.string().optional(),
      })
    )
    .optional(),
});

export async function syncGuestData(req, res, next) {
  try {
    const userId = req.user?.userId;
    const body = syncSchema.parse(req.body);

    const journals = body.journals || [];
    const chats = body.chats || [];

    for (const j of journals) {
      await createJournalEntry({
        userId,
        title: j.title || "Untitled",
        content: j.content,
      });
    }

    for (const c of chats) {
      await createChatMessage({ userId, role: c.role, message: c.message });
    }

    return res.json({ ok: true, imported: { journals: journals.length, chats: chats.length } });
  } catch (err) {
    return next(err);
  }
}
