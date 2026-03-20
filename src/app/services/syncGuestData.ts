import { apiRequest } from "./apiClient";
import { loadGuestChats, loadGuestJournals, clearGuestChats, clearGuestJournals } from "./guestStorage";

export async function syncGuestData(token: string) {
  const journals = loadGuestJournals().map((j) => ({
    title: j.title,
    content: j.content,
    createdAt: j.date,
  }));

  const chats = loadGuestChats().map((c) => ({
    role: c.role,
    message: c.content,
    createdAt: c.timestamp,
  }));

  if (journals.length === 0 && chats.length === 0) return;

  await apiRequest("/sync", {
    method: "POST",
    token,
    body: { journals, chats },
  });

  clearGuestJournals();
  clearGuestChats();
}
