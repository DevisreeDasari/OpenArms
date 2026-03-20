import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { setToken } from "../services/authStore";

export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [token, setTokenParam] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTokenParam(params.get("token"));
  }, [params]);

  const handleSubmit = async () => {
    if (!token) return;
    setError(null);
    setStatus("loading");

    try {
      const res = await apiRequest<{ token: string }>("/auth/reset-password", {
        method: "POST",
        body: { token, newPassword },
      });
      setToken(res.token);
      setStatus("success");
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Reset failed");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-lavender-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800">Reset password</h2>
          <p className="text-slate-500">Choose a new password.</p>
        </div>

        {!token && <div className="text-sm text-red-600 text-center">Missing reset token</div>}

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
        />

        {status === "success" && <div className="text-sm text-green-700 text-center">Password reset. Redirecting...</div>}
        {error && <div className="text-sm text-red-600 text-center">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={!token || newPassword.trim().length < 6 || status === "loading"}
          className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {status === "loading" ? "Please wait..." : "Reset password"}
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
