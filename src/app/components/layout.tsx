import { Outlet, Link, useLocation } from "react-router-dom";
import { MessageCircle, BookOpen, Heart, Headphones, Wind, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "figma:asset/95ad626bb4833deaee31cb223ecc7bc04bd398fa.png";

const navItems = [
  { path: "/", icon: Heart, label: "Home" },
  { path: "/therapist", icon: MessageCircle, label: "AI Therapist" },
  { path: "/journal", icon: BookOpen, label: "Journal" },
  { path: "/mood-tracker", icon: Heart, label: "Mood Tracker" },
  { path: "/meditation", icon: Headphones, label: "Meditation" },
  { path: "/breathing", icon: Wind, label: "Breathing" },
  { path: "/affirmations", icon: Sparkles, label: "Affirmations" },
];

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src={logo} alt="OpenArms Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Alata, sans-serif' }}>
                OpenArms
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "text-gray-700 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "text-gray-700 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}