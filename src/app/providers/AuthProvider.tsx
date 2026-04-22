import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  type Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, type Firestore } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import type { AuthUser, SocialPlatform } from "@/types/models";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  verified?: boolean;
  bio: string;
  createdAt: string;
  followingIds?: string[];
  socialLinks?: Partial<Record<SocialPlatform, string>>;
  bannerUrl?: string;
}

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  user: AuthUser | null;
  loading: boolean;
  signUp: (input: { email: string; password: string; displayName?: string; username?: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, displayName: string, username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  completeOnboarding: () => void;
  updateProfile: (data: {
    displayName?: string;
    username?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: Partial<Record<SocialPlatform, string>>;
    bannerUrl?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function sanitizeUsername(raw: string, fallbackEmail: string) {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  if (cleaned) return cleaned;
  return (fallbackEmail.split("@")[0] ?? "creator").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function toAuthUser(currentUser: User, profile: UserProfile | null): AuthUser {
  const fallbackUsername = sanitizeUsername(profile?.username ?? "", currentUser.email ?? "creator@dreamledge.app");

  return {
    id: currentUser.uid,
    email: currentUser.email ?? profile?.email ?? "",
    displayName: profile?.displayName || currentUser.displayName || "",
    username: profile?.username || fallbackUsername,
    photoUrl: profile?.photoURL || currentUser.photoURL || DEFAULT_AVATAR_URL,
    verified: profile?.verified ?? false,
    onboardingComplete: true,
    followingIds: profile?.followingIds ?? [],
    bio: profile?.bio ?? "",
    socialLinks: profile?.socialLinks ?? {},
    bannerUrl: profile?.bannerUrl ?? "",
  };
}

async function getUserProfile(uid: string) {
  if (!firestore) return null;
  const userRef = doc(firestore, "users", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

async function ensureUserProfile(currentUser: User, input?: { displayName?: string; username?: string }) {
  if (!firestore) return null;
  const userRef = doc(firestore, "users", currentUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }

  const displayName = input?.displayName?.trim() ?? currentUser.displayName ?? "";
  const profile: UserProfile = {
    uid: currentUser.uid,
    email: currentUser.email ?? "",
    displayName,
    username: sanitizeUsername(input?.username ?? "", currentUser.email ?? "creator@dreamledge.app"),
    photoURL: currentUser.photoURL ?? DEFAULT_AVATAR_URL,
    verified: false,
    bio: "",
    createdAt: new Date().toISOString(),
    followingIds: [],
    socialLinks: {},
    bannerUrl: "",
  };

  await setDoc(userRef, profile, { merge: true });
  return profile;
}

function requireFirebaseServices(): { auth: Auth; store: Firestore } {
  if (!firebaseAuth || !firestore) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* values to your .env file.");
  }

  return { auth: firebaseAuth, store: firestore };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      try {
        if (!nextUser) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setCurrentUser(nextUser);
        const profile = await ensureUserProfile(nextUser);
        setUserProfile(profile);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      userProfile,
      user: currentUser ? toAuthUser(currentUser, userProfile) : null,
      loading,
      signUp: async ({ email, password, displayName = "", username = "" }) => {
        const { auth } = requireFirebaseServices();
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateFirebaseProfile(credential.user, { displayName: displayName.trim() });
        }

        const profile = await ensureUserProfile(credential.user, {
          displayName,
          username,
        });

        setCurrentUser(credential.user);
        setUserProfile(profile);
      },
      signIn: async ({ email, password }) => {
        const { auth } = requireFirebaseServices();
        const credential = await signInWithEmailAndPassword(auth, email, password);
        setCurrentUser(credential.user);
        const profile = await ensureUserProfile(credential.user);
        setUserProfile(profile);
      },
      login: async (email, password) => {
        const { auth } = requireFirebaseServices();
        await signInWithEmailAndPassword(auth, email, password);
      },
      signup: async (email, displayName, username, password = "") => {
        if (!password) {
          throw new Error("Password is required.");
        }

        const { auth } = requireFirebaseServices();
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateFirebaseProfile(credential.user, { displayName: displayName.trim() });
        }

        const profile = await ensureUserProfile(credential.user, {
          displayName,
          username,
        });

        setCurrentUser(credential.user);
        setUserProfile(profile);
      },
      logout: async () => {
        const { auth } = requireFirebaseServices();
        await signOut(auth);
      },
      toggleFollow: async (targetUserId) => {
        if (!currentUser || !firestore) return;
        const latestProfile = userProfile ?? (await getUserProfile(currentUser.uid));
        const baseFollowingIds = latestProfile?.followingIds ?? [];
        const nextFollowingIds = baseFollowingIds.includes(targetUserId)
          ? baseFollowingIds.filter((id) => id !== targetUserId)
          : [...baseFollowingIds, targetUserId];

        await updateDoc(doc(firestore, "users", currentUser.uid), {
          followingIds: nextFollowingIds,
        });

        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                followingIds: nextFollowingIds,
              }
            : prev,
        );
      },
      completeOnboarding: () => {
        // Auth now relies on Firebase as source of truth and no onboarding gate.
      },
      updateProfile: async ({ displayName, username, bio, photoUrl, socialLinks, bannerUrl }) => {
        if (!currentUser || !firestore) {
          throw new Error("Unable to save profile right now.");
        }

        const updatePayload: Partial<UserProfile> = {};
        if (displayName !== undefined) updatePayload.displayName = displayName;
        if (username !== undefined) updatePayload.username = sanitizeUsername(username, currentUser.email ?? "creator@dreamledge.app");
        if (bio !== undefined) updatePayload.bio = bio;
        if (photoUrl !== undefined) updatePayload.photoURL = photoUrl;
        if (socialLinks !== undefined) updatePayload.socialLinks = socialLinks;
        if (bannerUrl !== undefined) updatePayload.bannerUrl = bannerUrl;

        await setDoc(
          doc(firestore, "users", currentUser.uid),
          {
            ...updatePayload,
            uid: currentUser.uid,
            email: currentUser.email ?? "",
          },
          { merge: true },
        );

        const normalizedPhotoUrl = photoUrl?.trim();
        const canSyncPhotoToAuth = normalizedPhotoUrl ? /^https?:\/\//i.test(normalizedPhotoUrl) : false;

        if (displayName !== undefined || canSyncPhotoToAuth) {
          const authPayload: { displayName?: string | null; photoURL?: string | null } = {};
          if (displayName !== undefined) {
            authPayload.displayName = displayName;
          }
          if (canSyncPhotoToAuth) {
            authPayload.photoURL = normalizedPhotoUrl;
          }

          try {
            await updateFirebaseProfile(currentUser, authPayload);
          } catch {}
        }

        setUserProfile((prev) => {
          const baseProfile: UserProfile = prev ?? {
            uid: currentUser.uid,
            email: currentUser.email ?? "",
            displayName: currentUser.displayName ?? "",
            username: sanitizeUsername("", currentUser.email ?? "creator@dreamledge.app"),
            photoURL: currentUser.photoURL ?? DEFAULT_AVATAR_URL,
            verified: false,
            bio: "",
            createdAt: new Date().toISOString(),
            followingIds: [],
            socialLinks: {},
            bannerUrl: "",
          };

          return {
            ...baseProfile,
            ...updatePayload,
            uid: currentUser.uid,
            email: currentUser.email ?? baseProfile.email,
          };
        });
      },
    }),
    [currentUser, loading, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
