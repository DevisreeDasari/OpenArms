import { createHashRouter, redirect } from "react-router-dom";
import { Layout } from "./components/layout";
import { Home } from "./pages/home";
import { Therapist } from "./pages/therapist";
import { Journal } from "./pages/journal";
import { MoodTracker } from "./pages/mood-tracker";
import { Meditation } from "./pages/meditation";
import { Breathing } from "./pages/breathing";
import { Affirmations } from "./pages/affirmations";
import { Onboarding } from "./pages/onboarding";
import { VerifyEmail } from "./pages/verify-email";
import { ForgotPassword } from "./pages/forgot-password";
import { ResetPassword } from "./pages/reset-password";
import { Settings } from "./pages/settings";
import { CompleteProfile } from "./pages/complete-profile";
import { getToken, isGuestMode } from "./services/authStore";

function requireSession() {
  const token = getToken();
  if (token || isGuestMode()) return null;
  return redirect("/onboarding");
}

export const router = createHashRouter([
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/verify-email",
    Component: VerifyEmail,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/",
    Component: Layout,
    loader: requireSession,
    children: [
      { index: true, Component: Home },
      { path: "therapist", Component: Therapist },
      { path: "journal", Component: Journal },
      { path: "mood-tracker", Component: MoodTracker },
      { path: "meditation", Component: Meditation },
      { path: "breathing", Component: Breathing },
      { path: "affirmations", Component: Affirmations },
      { path: "settings", Component: Settings },
      { path: "complete-profile", Component: CompleteProfile },
    ],
  },
]);