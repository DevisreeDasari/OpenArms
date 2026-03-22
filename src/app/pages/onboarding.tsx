import { useEffect, useRef, useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/95ad626bb4833deaee31cb223ecc7bc04bd398fa.png";
import { apiRequest } from "../services/apiClient";
import { setGuestMode, setToken } from "../services/authStore";
import { syncGuestData } from "../services/syncGuestData";

type MeResponse = {
  user: {
    id: string | number;
    email: string;
    isVerified: boolean;
    name?: string | null;
    age?: number | null;
    gender?: string | null;
  };
};

type OnboardingStep = 1 | 2 | 3 | 4;
type AuthMode = "login" | "signup";

const goals = [
  "Anxiety Relief",
  "Sleep Better",
  "Talk to Someone",
  "Stress Management",
  "Depression Support",
  "Self-Improvement",
  "Mindfulness",
  "Build Confidence",
];

export function Onboarding() {
  const navigate = useNavigate();
  const googleOnly = String(import.meta.env.VITE_GOOGLE_ONLY || "false").toLowerCase() === "true";
  const [step, setStep] = useState<OnboardingStep>(2);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = window as any;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;
    if (!w.google?.accounts?.id) return;
    if (!googleBtnRef.current) return;

    try {
      w.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setAuthError(null);
            setAuthInfo(null);
            setIsAuthLoading(true);

            const res = await apiRequest<{ token: string }>("/auth/google", {
              method: "POST",
              body: { idToken: response.credential },
            });
            setToken(res.token);
            await syncGuestData(res.token);

            const me = await apiRequest<MeResponse>("/auth/me", { token: res.token });
            const missing = !me?.user?.name || !me?.user?.age || !me?.user?.gender;
            navigate(missing ? "/complete-profile" : "/");
          } catch (err: any) {
            setAuthError(err?.message || "Google sign-in failed");
          } finally {
            setIsAuthLoading(false);
          }
        },
      });

      w.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
        shape: "pill",
      });
    } catch {
      return;
    }
  }, [navigate]);

  const handleGoalToggle = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleComplete = () => {
    // In a real app, this would save the onboarding data
    navigate("/");
  };

  const handleAuthContinue = async () => {
    setAuthError(null);
    setAuthInfo(null);
    setIsAuthLoading(true);

    try {
      const payload = { email, password };
      const path = authMode === "login" ? "/auth/login" : "/auth/register";
      const res = await apiRequest<any>(path, { method: "POST", body: payload });

      if (authMode === "signup" && !res?.token) {
        setAuthInfo(res?.message || "Verification email sent. Please verify and then log in.");
        setAuthMode("login");
        return;
      }

      if (!res?.token) {
        setAuthError("Authentication failed");
        return;
      }

      setToken(res.token);
      await syncGuestData(res.token);

      const me = await apiRequest<MeResponse>("/auth/me", { token: res.token });
      const missing = !me?.user?.name || !me?.user?.age || !me?.user?.gender;
      navigate(missing ? "/complete-profile" : "/");
    } catch (err: any) {
      if (authMode === "signup" && String(err?.message || "").toLowerCase().includes("email already in use")) {
        setAuthInfo("Verification pending. Please check your email for the verification link.");
        setAuthMode("login");
      } else {
        setAuthError(err?.message || "Authentication failed");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-lavender-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-8 py-12">
              {/* Logo */}
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative">
                  <img src={logo} alt="OpenArms Logo" className="w-48 h-48 object-contain" />
                </div>
                <h1 className="text-5xl font-bold text-slate-800" style={{ fontFamily: 'Alata, sans-serif' }}>
                  OpenArms
                </h1>
              </div>

              {/* Tagline */}
              <div className="space-y-4 px-6">
                <p className="text-2xl text-slate-700 font-light">
                  Your safe space for mental wellness
                </p>
                <p className="text-lg text-slate-500">
                  We're here to support you, every step of the way
                </p>
              </div>

              {/* Decorative dots */}
              <div className="flex justify-center gap-2 py-8">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>

              {/* Get Started Button */}
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Login/Register */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-semibold text-slate-800">Welcome back</h2>
                <p className="text-slate-500">Sign in to continue your journey</p>
              </div>

              {!googleOnly && (
                <>
                  {/* Toggle */}
                  <div className="bg-slate-100 rounded-full p-1 flex">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 py-3 rounded-full font-medium transition-all ${
                        authMode === "login"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 py-3 rounded-full font-medium transition-all ${
                        authMode === "signup"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4 pt-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                    />

                    {authMode === "login" && (
                      <button
                        onClick={() => navigate("/forgot-password")}
                        className="w-full text-right text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        type="button"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {authInfo && <div className="text-sm text-green-700 text-center">{authInfo}</div>}
                  {authError && <div className="text-sm text-red-600 text-center">{authError}</div>}

                  {/* Continue Button */}
                  <button
                    onClick={handleAuthContinue}
                    disabled={!email.trim() || !password.trim() || isAuthLoading}
                    className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    {isAuthLoading ? "Please wait..." : authMode === "login" ? "Login" : "Sign Up"}
                  </button>
                </>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-slate-500">or</span>
                </div>
              </div>

              {/* Google Button */}
              <div className="w-full flex justify-center">
                <div ref={googleBtnRef} />
              </div>

              {/* Guest Button */}
              <button
                onClick={handleContinueAsGuest}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-full font-medium text-lg hover:bg-slate-50 transition-all"
              >
                Continue as Guest
              </button>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        )}

        {/* Screen 3: Tell us about you */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-semibold text-slate-800">Tell us a bit about you</h2>
                <p className="text-slate-500">This helps us personalize your experience</p>
              </div>

              {/* Age Dropdown */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">Age</label>
                <select
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select your age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              {/* Gender Radio Buttons */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 block">Gender</label>
                <div className="space-y-3">
                  {["Female", "Male", "Non-binary", "Prefer not to say"].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        gender === option
                          ? "border-purple-400 bg-purple-50"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={gender === option}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-5 h-5 text-purple-400 focus:ring-purple-300"
                      />
                      <span className="text-slate-700 font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setStep(4)}
                disabled={!age || !gender}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        )}

        {/* Screen 4: Goals Selection */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-semibold text-slate-800">How can we help?</h2>
                <p className="text-slate-500">Select all that apply</p>
              </div>

              {/* Goal Chips */}
              <div className="flex flex-wrap gap-3 py-4">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`px-6 py-3 rounded-full font-medium transition-all ${
                      selectedGoals.includes(goal)
                        ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white shadow-md scale-105"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              {/* Info Text */}
              {selectedGoals.length > 0 && (
                <div className="bg-lavender-50 border border-purple-200 rounded-2xl p-4">
                  <p className="text-sm text-slate-600 text-center">
                    Great! We'll personalize your experience based on {selectedGoals.length}{" "}
                    {selectedGoals.length === 1 ? "goal" : "goals"}
                  </p>
                </div>
              )}

              {/* Complete Button */}
              <button
                onClick={handleComplete}
                disabled={selectedGoals.length === 0}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                Complete Setup
                <Heart className="w-5 h-5" fill="currentColor" />
              </button>

              {/* Skip Option */}
              <button
                onClick={handleComplete}
                className="w-full text-slate-500 py-2 font-medium hover:text-slate-700 transition-colors"
              >
                Skip for now
              </button>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-purple-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}