import { useState } from "react";
import { Smile, Meh, Frown, Laugh, Angry } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Mood = {
  emoji: string;
  label: string;
  value: number;
  icon: typeof Smile;
  color: string;
};

type MoodEntry = {
  date: string;
  mood: number;
  note: string;
};

const moods: Mood[] = [
  { emoji: "😄", label: "Great", value: 5, icon: Laugh, color: "from-green-500 to-emerald-500" },
  { emoji: "🙂", label: "Good", value: 4, icon: Smile, color: "from-blue-500 to-cyan-500" },
  { emoji: "😐", label: "Okay", value: 3, icon: Meh, color: "from-yellow-500 to-amber-500" },
  { emoji: "😔", label: "Bad", value: 2, icon: Frown, color: "from-orange-500 to-red-500" },
  { emoji: "😢", label: "Terrible", value: 1, icon: Angry, color: "from-red-500 to-pink-500" },
];

const sampleData: MoodEntry[] = [
  { date: "Mar 8", mood: 4, note: "" },
  { date: "Mar 9", mood: 3, note: "" },
  { date: "Mar 10", mood: 5, note: "" },
  { date: "Mar 11", mood: 4, note: "" },
  { date: "Mar 12", mood: 2, note: "" },
  { date: "Mar 13", mood: 3, note: "" },
  { date: "Mar 14", mood: 4, note: "" },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [moodData, setMoodData] = useState<MoodEntry[]>(sampleData);

  const handleSaveMood = () => {
    if (selectedMood === null) return;

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const newEntry: MoodEntry = {
      date: today,
      mood: selectedMood,
      note: note,
    };

    // Remove today's entry if it exists and add the new one
    setMoodData((prev) => {
      const filtered = prev.filter((entry) => entry.date !== today);
      return [...filtered.slice(-6), newEntry];
    });

    setSelectedMood(null);
    setNote("");
  };

  const averageMood = moodData.length > 0
    ? (moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length).toFixed(1)
    : "0";

  const todayEntry = moodData.find(
    (entry) =>
      entry.date === new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">How are you feeling today?</h1>
        <p className="text-gray-600">Track your mood and notice patterns over time</p>
      </div>

      {/* Mood Selection */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`group flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all ${
                  selectedMood === mood.value
                    ? `border-transparent bg-gradient-to-br ${mood.color} text-white scale-110`
                    : "border-purple-100 hover:border-purple-300 hover:scale-105"
                }`}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <Icon
                  className={`w-8 h-8 ${
                    selectedMood === mood.value ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span
                  className={`font-medium ${
                    selectedMood === mood.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Note Input */}
        {selectedMood !== null && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Want to add a note about how you're feeling? (optional)"
              className="w-full h-24 resize-none border border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex justify-center">
              <button
                onClick={handleSaveMood}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Save Mood
              </button>
            </div>
          </div>
        )}

        {/* Today's Mood Display */}
        {todayEntry && selectedMood === null && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">You already logged your mood today:</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-full">
              <span className="text-3xl">
                {moods.find((m) => m.value === todayEntry.mood)?.emoji}
              </span>
              <span className="font-semibold text-gray-900">
                {moods.find((m) => m.value === todayEntry.mood)?.label}
              </span>
            </div>
            {todayEntry.note && (
              <p className="mt-3 text-gray-600 italic">"{todayEntry.note}"</p>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Mood (7 days)</h3>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {averageMood}
            </div>
            <div className="text-gray-600 mt-2">out of 5</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak</h3>
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {moodData.length}
            </div>
            <div className="text-gray-600 mt-2">days tracked</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
            <XAxis dataKey="date" stroke="#9333ea" />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#9333ea" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#faf5ff",
                border: "1px solid #e9d5ff",
                borderRadius: "0.5rem",
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ fill: "#9333ea", r: 6 }}
              activeDot={{ r: 8 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
