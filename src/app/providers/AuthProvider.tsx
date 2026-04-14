import { createContext, useContext, useMemo, useState } from "react";
import { getStoredAuthUser, setStoredAuthUser } from "@/features/auth/useAuthStorage";
import { mockUsers } from "@/lib/constants/mockData";
import type { AuthUser, SocialPlatform } from "@/types/models";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string) => void;
  signup: (email: string, displayName: string, username?: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfile: (data: { displayName?: string; username?: string; bio?: string; socialLinks?: Record<SocialPlatform, string> }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const loading = false;

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: (email: string) => {
      const matched = mockUsers.find((entry) => entry.email === email) ?? mockUsers[0];
      const next: AuthUser = {
        id: matched.id,
        email,
        displayName: matched.displayName,
        username: matched.username,
        photoUrl: matched.photoUrl,
        onboardingComplete: true,
      };
      setUser(next);
      setStoredAuthUser(next);
    },
    signup: (email: string, displayName: string, username?: string) => {
      const next: AuthUser = {
        id: "prototype-user",
        email,
        displayName,
        username: username?.trim() || displayName.toLowerCase().replace(/\s+/g, ""),
        photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
        onboardingComplete: false,
      };
      setUser(next);
      setStoredAuthUser(next);
    },
    logout: () => {
      setUser(null);
      setStoredAuthUser(null);
    },
    completeOnboarding: () => {
      if (!user) return;
      const next = { ...user, onboardingComplete: true };
      setUser(next);
      setStoredAuthUser(next);
    },
    updateProfile: (data) => {
      if (!user) return;
      const next: AuthUser = {
        ...user,
        ...data,
      };
      setUser(next);
      setStoredAuthUser(next);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
