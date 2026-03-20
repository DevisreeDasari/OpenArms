export type GuestJournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export type GuestChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const JOURNALS_KEY = "openarms_guest_journals";
const CHATS_KEY = "openarms_guest_chats";

export function loadGuestJournals(): GuestJournalEntry[] {
  try {
    const raw = sessionStorage.getItem(JOURNALS_KEY);
    return raw ? (JSON.parse(raw) as GuestJournalEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestJournals(entries: GuestJournalEntry[]) {
  sessionStorage.setItem(JOURNALS_KEY, JSON.stringify(entries));
}

export function clearGuestJournals() {
  sessionStorage.removeItem(JOURNALS_KEY);
}

export function loadGuestChats(): GuestChatMessage[] {
  try {
    const raw = sessionStorage.getItem(CHATS_KEY);
    return raw ? (JSON.parse(raw) as GuestChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestChats(messages: GuestChatMessage[]) {
  sessionStorage.setItem(CHATS_KEY, JSON.stringify(messages));
}

export function clearGuestChats() {
  sessionStorage.removeItem(CHATS_KEY);
}
