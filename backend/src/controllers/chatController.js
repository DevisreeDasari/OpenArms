import { z } from "zod";
import OpenAI from "openai";

import { listChatMessages, createChatMessage } from "../models/chatModel.js";

const sendSchema = z.object({
  message: z.string().min(1),
});

const systemPrompt =
  "You are a calm, empathetic AI therapist who listens carefully and responds supportively.";

const fallbackReplies = [
  "I hear you, and what you're feeling makes sense. Would you like to share a bit more about what's been going on?",
  "That sounds really difficult. You're not alone in this—what part feels the hardest right now?",
  "Thank you for trusting me with that. What do you think you need most in this moment—comfort, clarity, or a next step?",
  "It can be exhausting to carry that. What has helped you cope, even a little, in the past?",
  "I'm here with you. If we slow it down, what emotion is strongest for you right now?",
];

function buildFallbackReply(userText) {
  const trimmed = (userText || "").trim();
  const base = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  if (!trimmed) return base;

  if (trimmed.length < 40) {
    return `${base} You said: "${trimmed}".`;
  }
  return base;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function listChats(req, res, next) {
  try {
    const userId = req.user?.userId;
    const messages = await listChatMessages(userId, 100);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
}

export async function sendChat(req, res, next) {
  try {
    const userId = req.user?.userId;
    const body = sendSchema.parse(req.body);

    await createChatMessage({ userId, role: "user", message: body.message });

    const history = await listChatMessages(userId, 20);

    const client = getOpenAIClient();
    if (!client) {
      const assistantText = buildFallbackReply(body.message);
      await createChatMessage({ userId, role: "assistant", message: assistantText });
      return res.status(201).json({ reply: assistantText });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.message })),
      ],
    });

    const assistantText = response.choices?.[0]?.message?.content?.trim() || "";

    await createChatMessage({ userId, role: "assistant", message: assistantText || "(no response)" });

    return res.status(201).json({ reply: assistantText });
  } catch (err) {
    return next(err);
  }
}
