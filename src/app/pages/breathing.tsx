import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, RotateCcw } from "lucide-react";

type BreathingPattern = {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  gradient: string;
};

const patterns: BreathingPattern[] = [
  {
    id: "1",
    name: "Box Breathing",
    description: "Equal counts for calm and focus",
    inhale: 4,
    hold: 4,
    exhale: 4,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    name: "4-7-8 Technique",
    description: "For relaxation and sleep",
    inhale: 4,
    hold: 7,
    exhale: 8,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "3",
    name: "Calm Breathing",
    description: "Simple and effective",
    inhale: 4,
    hold: 0,
    exhale: 6,
    gradient: "from-green-500 to-emerald-500",
  },
];

type Phase = "inhale" | "hold" | "exhale" | "ready";

export function Breathing() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(patterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        const pattern = selectedPattern;
        
        if (phase === "inhale" && prev >= pattern.inhale) {
          if (pattern.hold > 0) {
            setPhase("hold");
          } else {
            setPhase("exhale");
          }
          return 0;
        } else if (phase === "hold" && prev >= pattern.hold) {
          setPhase("exhale");
          return 0;
        } else if (phase === "exhale" && prev >= pattern.exhale) {
          setPhase("inhale");
          return 0;
        }
        
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, selectedPattern]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("inhale");
    setCount(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("ready");
    setCount(0);
  };

  const getPhaseText = () => {
    if (phase === "ready") return "Ready to begin";
    if (phase === "inhale") return "Breathe In";
    if (phase === "hold") return "Hold";
    if (phase === "exhale") return "Breathe Out";
  };

  const getCircleSize = () => {
    if (phase === "ready") return 120;
    if (phase === "inhale") return 200;
    if (phase === "hold") return 200;
    if (phase === "exhale") return 120;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Breathing Exercises</h1>
        <p className="text-gray-600">Calm your mind with guided breathing techniques</p>
      </div>

      {/* Pattern Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            onClick={() => {
              setSelectedPattern(pattern);
              handleReset();
            }}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              selectedPattern.id === pattern.id
                ? `border-transparent bg-gradient-to-br ${pattern.gradient} text-white shadow-lg`
                : "border-purple-100 bg-white hover:border-purple-300"
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${
              selectedPattern.id === pattern.id ? "text-white" : "text-gray-900"
            }`}>
              {pattern.name}
            </h3>
            <p className={`text-sm mb-3 ${
              selectedPattern.id === pattern.id ? "text-white/90" : "text-gray-600"
            }`}>
              {pattern.description}
            </p>
            <div className={`text-xs ${
              selectedPattern.id === pattern.id ? "text-white/80" : "text-gray-500"
            }`}>
              {pattern.inhale}s in · {pattern.hold > 0 ? `${pattern.hold}s hold · ` : ""}{pattern.exhale}s out
            </div>
          </button>
        ))}
      </div>

      {/* Breathing Circle */}
      <div className={`bg-gradient-to-br ${selectedPattern.gradient} rounded-2xl shadow-2xl p-12`}>
        <div className="flex flex-col items-center justify-center min-h-[500px] text-white">
          {/* Animated Circle */}
          <div className="relative mb-8">
            <motion.div
              animate={{
                width: getCircleSize(),
                height: getCircleSize(),
              }}
              transition={{
                duration: phase === "inhale" ? selectedPattern.inhale :
                         phase === "hold" ? selectedPattern.hold :
                         phase === "exhale" ? selectedPattern.exhale : 0.5,
                ease: "easeInOut",
              }}
              className="rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {phase === "ready" ? "●" : 
                   phase === "inhale" ? selectedPattern.inhale - count :
                   phase === "hold" ? selectedPattern.hold - count :
                   selectedPattern.exhale - count}
                </div>
              </div>
            </motion.div>

            {/* Pulse Ring */}
            {isActive && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border-4 border-white"
              />
            )}
          </div>

          {/* Phase Text */}
          <h2 className="text-4xl font-bold mb-8">{getPhaseText()}</h2>

          {/* Instructions */}
          {!isActive && phase === "ready" && (
            <p className="text-white/80 mb-8 text-center max-w-md">
              Find a comfortable position. Focus on your breath and let everything else fade away.
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-sm"
              disabled={!isActive && phase === "ready"}
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            
            {!isActive ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-white text-purple-600 hover:bg-white/90 rounded-full transition-all shadow-lg font-semibold flex items-center gap-2"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                {phase === "ready" ? "Start" : "Resume"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-8 py-4 bg-white text-purple-600 hover:bg-white/90 rounded-full transition-all shadow-lg font-semibold flex items-center gap-2"
              >
                <Pause className="w-5 h-5" fill="currentColor" />
                Pause
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breathing Tips</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Practice in a quiet, comfortable space</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Breathe through your nose when possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Focus on slow, deep breaths from your diaphragm</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>If you feel lightheaded, take a break and breathe normally</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
