import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { setToken } from "../services/authStore";

type MeResponse = {
  user: {
    name?: string | null;
    age?: number | null;
    gender?: string | null;
  };
};

export function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing verification token");
      return;
    }

    setStatus("loading");
    apiRequest<{ token: string }>("/auth/verify-email", { method: "POST", body: { token } })
      .then((res) => {
        setToken(res.token);
        setStatus("success");

        return apiRequest<MeResponse>("/auth/me", { token: res.token }).then((me) => {
          const missing = !me?.user?.name || !me?.user?.age || !me?.user?.gender;
          navigate(missing ? "/complete-profile" : "/");
        });
      })
      .catch((err: any) => {
        setError(err?.message || "Verification failed");
        setStatus("idle");
      });
  }, [navigate, params]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-lavender-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800">Verify your email</h2>
          <p className="text-slate-500">We’re confirming your email address.</p>
        </div>

        {status === "loading" && <div className="text-sm text-slate-600 text-center">Please wait...</div>}
        {status === "success" && <div className="text-sm text-green-700 text-center">Verified. Redirecting...</div>}
        {error && <div className="text-sm text-red-600 text-center">{error}</div>}

        <button
          onClick={() => navigate("/onboarding")}
          className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-full font-medium hover:bg-slate-50 transition-all"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
