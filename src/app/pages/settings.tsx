import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { clearToken, getToken, isGuestMode, setGuestMode } from "../services/authStore";
import { clearGuestChats, clearGuestJournals } from "../services/guestStorage";

type Gender = "male" | "female" | "other";

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

export function Settings() {
  const navigate = useNavigate();
  const guest = isGuestMode();
  const token = getToken();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender | "">("");

  useEffect(() => {
    if (guest) return;
    if (!token) return;

    setIsLoading(true);
    setError(null);
    apiRequest<MeResponse>("/auth/me", { token })
      .then((res) => {
        setEmail(res.user.email);
        setName(res.user.name || "");
        setAge(typeof res.user.age === "number" ? String(res.user.age) : "");
        const g = (res.user.gender || "") as Gender | "";
        setGender(g);
      })
      .catch((err: any) => setError(err?.message || "Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, [guest, token]);

  const handleLogout = () => {
    clearToken();
    setGuestMode(false);
    clearGuestJournals();
    clearGuestChats();
    navigate("/onboarding");
  };

  const handleSave = async () => {
    if (!token) return;
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
      setIsLoading(true);
      const res = await apiRequest<MeResponse>("/auth/profile", {
        method: "PUT",
        token,
        body: { name: name.trim(), age: ageNum, gender },
      });
      setName(res.user.name || "");
      setAge(typeof res.user.age === "number" ? String(res.user.age) : "");
      setGender((res.user.gender || "") as Gender | "");
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 shadow-lg">
        <h1
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          style={{ fontFamily: "Alata, sans-serif" }}
        >
          Account & Settings
        </h1>

        <div className="mt-6 space-y-4 text-gray-700">
          {guest ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              You are currently using OpenArms as a guest. Your data is not saved after this session ends.
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
              <div className="font-medium">You are signed in.</div>
              {email && <div className="text-sm text-gray-600 mt-1">{email}</div>}
            </div>
          )}

          {!guest && (
            <div className="p-4 rounded-xl bg-white border border-purple-100">
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold text-gray-800">Profile</div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl border border-purple-100 text-sm font-medium text-gray-700 hover:bg-purple-50 transition-all"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-purple-100 text-sm font-medium text-gray-700 hover:bg-purple-50 transition-all"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-60"
                      disabled={isLoading}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500">Name</div>
                  {isEditing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full px-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="Your name"
                    />
                  ) : (
                    <div className="mt-1 text-gray-800">{name || "—"}</div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500">Age</div>
                  {isEditing ? (
                    <input
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      inputMode="numeric"
                      className="mt-1 w-full px-4 py-3 rounded-xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="Age"
                    />
                  ) : (
                    <div className="mt-1 text-gray-800">{age || "—"}</div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500">Gender</div>
                  {isEditing ? (
                    <div className="mt-2 grid grid-cols-3 gap-2">
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
                  ) : (
                    <div className="mt-1 text-gray-800">
                      {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "—"}
                    </div>
                  )}
                </div>
              </div>

              {isLoading && <div className="mt-4 text-sm text-gray-600">Loading...</div>}
              {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
