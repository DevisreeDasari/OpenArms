import { Link } from "react-router-dom";
import { MessageCircle, BookOpen, Heart, Headphones, Wind, Sparkles } from "lucide-react";
import logo from "figma:asset/95ad626bb4833deaee31cb223ecc7bc04bd398fa.png";

const features = [
  {
    path: "/therapist",
    icon: MessageCircle,
    title: "AI Therapist",
    description: "Chat with an empathetic AI therapist anytime you need support",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    path: "/journal",
    icon: BookOpen,
    title: "Journal",
    description: "Express your thoughts and feelings in a private, safe space",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    path: "/mood-tracker",
    icon: Heart,
    title: "Mood Tracker",
    description: "Track your emotional journey and identify patterns",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    path: "/meditation",
    icon: Headphones,
    title: "Guided Meditation",
    description: "Find peace with guided meditation sessions",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    path: "/breathing",
    icon: Wind,
    title: "Breathing Exercises",
    description: "Calm your mind with simple breathing techniques",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    path: "/affirmations",
    icon: Sparkles,
    title: "Affirmations",
    description: "Start your day with positive, uplifting messages",
    gradient: "from-amber-500 to-orange-500",
  },
];

export function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <div className="inline-flex items-center justify-center mb-4">
          <img src={logo} alt="OpenArms Logo" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Alata, sans-serif' }}>
          Welcome to OpenArms
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your compassionate companion for mental wellness. We're here to support you on your journey to better mental health.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.path}
              to={feature.path}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-transparent hover:scale-105"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Quote Section */}
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-purple-100 mt-12">
        <p className="text-2xl font-medium text-gray-700 italic mb-4">
          "Taking care of your mental health is a sign of strength, not weakness."
        </p>
        <p className="text-gray-500">Remember: You are not alone on this journey</p>
      </div>
    </div>
  );
}