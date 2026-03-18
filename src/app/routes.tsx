import { createHashRouter } from "react-router-dom";
import { Layout } from "./components/layout";
import { Home } from "./pages/home";
import { Therapist } from "./pages/therapist";
import { Journal } from "./pages/journal";
import { MoodTracker } from "./pages/mood-tracker";
import { Meditation } from "./pages/meditation";
import { Breathing } from "./pages/breathing";
import { Affirmations } from "./pages/affirmations";
import { Onboarding } from "./pages/onboarding";

export const router = createHashRouter([
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "therapist", Component: Therapist },
      { path: "journal", Component: Journal },
      { path: "mood-tracker", Component: MoodTracker },
      { path: "meditation", Component: Meditation },
      { path: "breathing", Component: Breathing },
      { path: "affirmations", Component: Affirmations },
    ],
  },
]);