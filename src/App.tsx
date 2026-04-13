import { useEffect, useState } from "react";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router";
import { SplashScreen } from "@/components/ui/SplashScreen";

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFadeSplash(true), 2000);
    const removeTimer = window.setTimeout(() => setShowSplash(false), 2450);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <AppProviders>
      {showSplash ? <SplashScreen fading={fadeSplash} /> : null}
      <AppRouter />
    </AppProviders>
  );
}
