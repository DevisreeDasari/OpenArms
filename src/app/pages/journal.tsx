import { useState } from "react";
import { Plus, Trash2, Calendar, Search } from "lucide-react";

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

  const handleNewEntry = () => {
    setIsEditing(true);
    setSelectedEntry(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleSave = () => {
    if (!editTitle.trim() && !editContent.trim()) return;

    if (selectedEntry) {
      // Update existing entry
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === selectedEntry.id
            ? { ...entry, title: editTitle, content: editContent, date: new Date() }
            : entry
        )
      );
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: editTitle || "Untitled",
        content: editContent,
        date: new Date(),
      };
      setEntries((prev) => [newEntry, ...prev]);
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
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
