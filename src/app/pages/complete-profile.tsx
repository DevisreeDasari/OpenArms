import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { getToken, isGuestMode } from "../services/authStore";

type Gender = "male" | "female" | "other";

export function CompleteProfile() {
  const navigate = useNavigate();
  const token = getToken();
  const guest = isGuestMode();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (guest || !token) navigate("/onboarding");
  }, [guest, token, navigate]);

  if (guest || !token) return null;

  const handleSave = async () => {
    setError(null);

    const ageNum = Number(age);
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      setError("Please enter a valid age");
      return;
    }
    if (!gender) {
      setError("Please select your gender");
      return;
    }

    try {
      setIsSaving(true);
      await apiRequest("/auth/profile", {
        method: "PUT",
        token,
        body: { name: name.trim(), age: ageNum, gender },
      });
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 shadow-lg">
        <h1
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          style={{ fontFamily: "Alata, sans-serif" }}
        >
          Complete your profile
        </h1>
        <p className="mt-2 text-gray-600">This helps us personalize your experience.</p>

        <div className="mt-6 space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />

          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Gender</div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value)}
                  className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                    gender === opt.value
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                      : "bg-white text-gray-700 border-purple-100 hover:bg-purple-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
