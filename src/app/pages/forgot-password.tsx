import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiClient";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setStatus("loading");
    try {
      await apiRequest<{ ok: true }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setStatus("sent");
    } catch (err: any) {
      setError(err?.message || "Request failed");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-lavender-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800">Forgot password</h2>
          <p className="text-slate-500">We’ll email you a reset link.</p>
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
        />

        {status === "sent" && (
          <div className="text-sm text-green-700 text-center">
            If an account exists, a reset link has been sent.
          </div>
        )}
        {error && <div className="text-sm text-red-600 text-center">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={!email.trim() || status === "loading"}
          className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {status === "loading" ? "Please wait..." : "Send reset link"}
        </button>

        <button
          onClick={() => navigate("/onboarding")}
          className="w-full text-slate-500 py-2 font-medium hover:text-slate-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
