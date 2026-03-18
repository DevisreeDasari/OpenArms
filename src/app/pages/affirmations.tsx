import { useState } from "react";
import { RefreshCw, Heart, Share2, Bookmark } from "lucide-react";

const affirmations = [
  "I am worthy of love and respect.",
  "I choose peace and calm over stress and worry.",
  "I am growing and becoming a better version of myself every day.",
  "My feelings are valid and I honor them.",
  "I am capable of handling whatever comes my way.",
  "I deserve to take up space in this world.",
  "I am enough, exactly as I am.",
  "I choose to focus on what I can control.",
  "I am grateful for this moment and all it brings.",
  "I trust in my ability to overcome challenges.",
  "I am surrounded by love and support.",
  "I release what no longer serves me.",
  "I am resilient, strong, and brave.",
  "I choose to be kind to myself today.",
  "My mental health matters and I prioritize it.",
  "I am doing my best, and that is enough.",
  "I deserve rest and self-care.",
  "I celebrate my progress, no matter how small.",
  "I am allowed to set boundaries that protect my peace.",
  "I trust the journey I am on.",
  "I am not defined by my past.",
  "I am worthy of good things happening to me.",
  "I choose hope over fear.",
  "I am learning and that's what matters.",
  "I honor my needs and speak up for myself.",
];

const categories = [
  { name: "All", gradient: "from-purple-500 to-pink-500" },
  { name: "Self-Love", gradient: "from-pink-500 to-rose-500" },
  { name: "Strength", gradient: "from-blue-500 to-cyan-500" },
  { name: "Peace", gradient: "from-green-500 to-emerald-500" },
  { name: "Growth", gradient: "from-amber-500 to-orange-500" },
];

export function Affirmations() {
  const [currentAffirmation, setCurrentAffirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const getNewAffirmation = () => {
    let newAffirmation;
    do {
      newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    } while (newAffirmation === currentAffirmation && affirmations.length > 1);
    setCurrentAffirmation(newAffirmation);
  };

  const handleSave = () => {
    if (saved.includes(currentAffirmation)) {
      setSaved(saved.filter((a) => a !== currentAffirmation));
    } else {
      setSaved([...saved, currentAffirmation]);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Affirmation",
          text: currentAffirmation,
        });
      } catch (err) {
        // User cancelled share or share failed
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(currentAffirmation);
      alert("Affirmation copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Daily Affirmations</h1>
        <p className="text-gray-600">Nurture your mind with positive thoughts</p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === category.name
                ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                : "bg-white text-gray-700 border border-purple-100 hover:border-purple-300"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Main Affirmation Card */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-2xl p-12 text-white min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center space-y-8">
          <Heart className="w-16 h-16 mx-auto text-white/80" fill="currentColor" />
          
          <blockquote className="text-3xl md:text-4xl font-bold leading-relaxed px-4">
            "{currentAffirmation}"
          </blockquote>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={getNewAffirmation}
              className="px-6 py-3 bg-white text-purple-600 rounded-full hover:bg-white/90 transition-all shadow-lg font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              New Affirmation
            </button>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSave}
              className={`p-3 rounded-full transition-all ${
                saved.includes(currentAffirmation)
                  ? "bg-white text-purple-600"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
              title={saved.includes(currentAffirmation) ? "Unsave" : "Save"}
            >
              <Bookmark
                className="w-5 h-5"
                fill={saved.includes(currentAffirmation) ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Saved Affirmations */}
      {saved.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Saved Affirmations ({saved.length})
            </h3>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              {showSaved ? "Hide" : "Show"}
            </button>
          </div>

          {showSaved && (
            <div className="space-y-3">
              {saved.map((affirmation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg"
                >
                  <Heart className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                  <p className="text-gray-700 flex-1">{affirmation}</p>
                  <button
                    onClick={() => setSaved(saved.filter((a) => a !== affirmation))}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Bookmark className="w-5 h-5" fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use Affirmations</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Read your affirmation slowly and mindfully</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Repeat it several times, letting the words sink in</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Visualize the affirmation becoming true in your life</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Practice daily for the best results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            <span>Save your favorites to revisit when you need encouragement</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
