import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Search } from "lucide-react";
import { apiRequest } from "../services/apiClient";
import { getToken, setToken } from "../services/authStore";
import { loadGuestJournals, saveGuestJournals, type GuestJournalEntry } from "../services/guestStorage";
import { syncGuestData } from "../services/syncGuestData";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: Date;
};

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    title: "A Good Day",
    content: "Today was a really good day. I spent time with friends and felt genuinely happy. It's important to remember these moments.",
    date: new Date(2026, 2, 13),
  },
  {
    id: "2",
    title: "Feeling Anxious",
    content: "I've been feeling a bit anxious about work lately. Writing helps me organize my thoughts and see things more clearly.",
    date: new Date(2026, 2, 12),
  },
];

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [hasAccessAsGuest, setHasAccessAsGuest] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const loadJournalsFromApi = async (token: string) => {
    const res = await apiRequest<{ journals: { id: string; title: string; content: string; created_at: string }[] }>(
      "/journal",
      {
        method: "GET",
        token,
      }
    );

    const mapped: JournalEntry[] = res.journals.map((j) => ({
      id: String(j.id),
      title: j.title,
      content: j.content,
      date: new Date(j.created_at),
    }));
    setEntries(mapped);
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      loadJournalsFromApi(token)
        .catch(() => {
          setEntries([]);
        });
      return;
    }

    if (!hasAccessAsGuest) return;

    const guest = loadGuestJournals();
    if (guest.length > 0) {
      const mapped: JournalEntry[] = guest.map((j) => ({
        id: j.id,
        title: j.title,
        content: j.content,
        date: new Date(j.date),
      }));
      setEntries(mapped);
    }
  }, [hasAccessAsGuest]);

  const handleAuthSubmit = async () => {
    setAuthError(null);
    setAuthInfo(null);
    setIsAuthLoading(true);

    try {
      const path = authMode === "signin" ? "/auth/login" : "/auth/register";
      const res = await apiRequest<any>(path, {
        method: "POST",
        body: { email, password },
      });

      if (authMode === "signup" && !res?.token) {
        setAuthInfo("Verification email sent. Please verify and then sign in.");
        setAuthMode("signin");
        return;
      }

      if (!res?.token) {
        setAuthError("Authentication failed");
        return;
      }

      setToken(res.token);
      await syncGuestData(res.token);
      setHasAccessAsGuest(false);
      await loadJournalsFromApi(res.token);
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleNewEntry = () => {
    setIsEditing(true);
    setSelectedEntry(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleSave = async () => {
    if (!editTitle.trim() && !editContent.trim()) return;

    const token = getToken();
    if (token) {
      try {
        if (selectedEntry) {
          const res = await apiRequest<{ journal: { id: string; title: string; content: string; created_at: string } }>(
            `/journal/${selectedEntry.id}`,
            {
              method: "PUT",
              token,
              body: { title: editTitle || "Untitled", content: editContent },
            }
          );

          setEntries((prev) =>
            prev.map((e) =>
              e.id === String(res.journal.id)
                ? { ...e, title: res.journal.title, content: res.journal.content }
                : e
            )
          );
        } else {
          const res = await apiRequest<{ journal: { id: string; title: string; content: string; created_at: string } }>(
            "/journal",
            {
              method: "POST",
              token,
              body: { title: editTitle || "Untitled", content: editContent },
            }
          );

          const newEntry: JournalEntry = {
            id: String(res.journal.id),
            title: res.journal.title,
            content: res.journal.content,
            date: new Date(res.journal.created_at),
          };
          setEntries((prev) => [newEntry, ...prev]);
        }

        setIsEditing(false);
        setSelectedEntry(null);
        setEditTitle("");
        setEditContent("");
      } catch {
        return;
      }

      return;
    }

    if (selectedEntry) {
      // Update existing entry
      const updated = { ...selectedEntry, title: editTitle, content: editContent, date: new Date() };
      setEntries((prev) => prev.map((entry) => (entry.id === selectedEntry.id ? updated : entry)));

      const current = loadGuestJournals();
      const next: GuestJournalEntry[] = current.map((j) =>
        j.id === selectedEntry.id
          ? { id: selectedEntry.id, title: updated.title, content: updated.content, date: updated.date.toISOString() }
          : j
      );
      saveGuestJournals(next);
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: editTitle || "Untitled",
        content: editContent,
        date: new Date(),
      };
      setEntries((prev) => [newEntry, ...prev]);

      const current = loadGuestJournals();
      const next: GuestJournalEntry[] = [
        { id: newEntry.id, title: newEntry.title, content: newEntry.content, date: newEntry.date.toISOString() },
        ...current,
      ];
      saveGuestJournals(next);
    }

    setIsEditing(false);
    setSelectedEntry(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setIsEditing(false);
    }

    const token = getToken();
    if (token) {
      apiRequest(`/journal/${id}`, {
        method: "DELETE",
        token,
      }).catch(() => {});
      return;
    }

    const current = loadGuestJournals();
    saveGuestJournals(current.filter((e) => e.id !== id));
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const token = getToken();
  if (!token && !hasAccessAsGuest) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">Journal</h2>
            <p className="text-sm text-gray-600 text-center">
              Choose how you want to continue.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setAuthMode("signup")}
                className={`px-4 py-2 rounded-lg transition-all border ${
                  authMode === "signup" ? "bg-purple-50 border-purple-300" : "border-purple-100 hover:bg-purple-50"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setAuthMode("signin")}
                className={`px-4 py-2 rounded-lg transition-all border ${
                  authMode === "signin" ? "bg-purple-50 border-purple-300" : "border-purple-100 hover:bg-purple-50"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setHasAccessAsGuest(true)}
                className="px-4 py-2 rounded-lg transition-all border border-purple-100 hover:bg-purple-50"
              >
                Guest
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
              />
            </div>

            {authInfo && <div className="text-sm text-green-700 text-center">{authInfo}</div>}
            {authError && <div className="text-sm text-red-600 text-center">{authError}</div>}

            <button
              onClick={handleAuthSubmit}
              disabled={!email.trim() || !password.trim() || isAuthLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isAuthLoading ? "Please wait..." : authMode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">My Journal</h2>
              <button
                onClick={handleNewEntry}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Entries */}
            <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleEdit(entry)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedEntry?.id === entry.id
                      ? "bg-purple-50 border-purple-300"
                      : "border-purple-100 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{entry.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{entry.content}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {entry.date.toLocaleDateString()}
                  </div>
                </div>
              ))}

              {filteredEntries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No entries found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Entry title..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-semibold border-none focus:outline-none placeholder:text-gray-300"
              />
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <textarea
                placeholder="Write your thoughts here..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-[calc(100vh-28rem)] resize-none border-none focus:outline-none placeholder:text-gray-300"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedEntry(null);
                    setEditTitle("");
                    setEditContent("");
                  }}
                  className="px-6 py-2 border border-purple-200 text-gray-700 rounded-lg hover:bg-purple-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-10 h-10 text-purple-500" />
                </div>
                <div>
                  <p className="text-xl text-gray-600 mb-2">Start writing</p>
                  <p className="text-gray-500">
                    Click the + button or select an entry to begin
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
