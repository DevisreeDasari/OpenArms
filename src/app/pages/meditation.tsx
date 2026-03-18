import { useState } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

type MeditationSession = {
  id: string;
  title: string;
  duration: string;
  description: string;
  category: string;
  gradient: string;
};

const sessions: MeditationSession[] = [
  {
    id: "1",
    title: "Morning Mindfulness",
    duration: "10 min",
    description: "Start your day with clarity and calm",
    category: "Morning",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "2",
    title: "Stress Relief",
    duration: "15 min",
    description: "Release tension and find peace",
    category: "Stress",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "3",
    title: "Better Sleep",
    duration: "20 min",
    description: "Drift into peaceful slumber",
    category: "Sleep",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "4",
    title: "Anxiety Relief",
    duration: "12 min",
    description: "Calm your racing thoughts",
    category: "Anxiety",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "5",
    title: "Body Scan",
    duration: "18 min",
    description: "Connect with your physical self",
    category: "Body",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "6",
    title: "Loving Kindness",
    duration: "15 min",
    description: "Cultivate compassion and warmth",
    category: "Compassion",
    gradient: "from-purple-500 to-pink-500",
  },
];

export function Meditation() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Simulate progress for demo
    if (!isPlaying && progress < 100) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSelectSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Guided Meditation</h1>
        <p className="text-gray-600">Find peace and clarity with guided meditation sessions</p>
      </div>

      {selectedSession ? (
        /* Player View */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedSession(null)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to sessions
          </button>

          <div className={`bg-gradient-to-br ${selectedSession.gradient} rounded-2xl shadow-2xl p-8 md:p-12 text-white`}>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{selectedSession.duration}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold">{selectedSession.title}</h2>
              <p className="text-xl text-white/90">{selectedSession.description}</p>

              {/* Progress Circle */}
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="112"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/20"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="112"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 112}
                    strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
                    className="text-white transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{progress}%</div>
                    <div className="text-sm text-white/80 mt-1">Complete</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 pt-6">
                <button
                  onClick={handleReset}
                  className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-6 bg-white text-purple-600 hover:bg-white/90 rounded-full transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  )}
                </button>
              </div>

              <p className="text-sm text-white/70 pt-4">
                {isPlaying
                  ? "Take deep breaths and let yourself relax..."
                  : "Press play when you're ready to begin"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Sessions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session)}
              className="group text-left bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className={`h-32 bg-gradient-to-br ${session.gradient} p-6 flex items-end`}>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">{session.duration}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-purple-600 font-medium mb-2">{session.category}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                <p className="text-gray-600">{session.description}</p>
                <div className="mt-4 flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                  <span>Start session</span>
                  <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
