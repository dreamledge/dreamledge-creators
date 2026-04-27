import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { DEFAULT_AVATAR_URL, DEFAULT_CONTENT_THUMBNAIL } from "@/lib/constants/defaults";
import { isAlwaysVerifiedAccount } from "@/lib/utils/accountIdentity";
import type { ContentPlatform, ContentModel, UserModel } from "@/types/models";

const CONTENT_COLLECTION = "content";
const USERS_COLLECTION = "users";

function toIso(value: unknown) {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }

  return new Date().toISOString();
}

function normalizePlatform(raw: unknown): ContentPlatform {
  const value = typeof raw === "string" ? raw.toLowerCase() : "";
  if (value === "youtube" || value === "tiktok" || value === "twitter" || value === "facebook" || value === "twitch") {
    return value;
  }
  return "unknown";
}

function asStringArray(raw: unknown) {
  return Array.isArray(raw) ? raw.filter((entry): entry is string => typeof entry === "string") : [];
}

function mapUserDoc(id: string, data: DocumentData): UserModel {
  const followerIds = asStringArray(data.followerIds);
  const followingIds = asStringArray(data.followingIds);
  const email = typeof data.email === "string" ? data.email : "";
  const alwaysVerified = isAlwaysVerifiedAccount({ email });

  return {
    id,
    username: typeof data.username === "string" && data.username.trim() ? data.username : id,
    displayName: typeof data.displayName === "string" && data.displayName.trim() ? data.displayName : "Creator",
    email,
    photoUrl: typeof data.photoURL === "string" && data.photoURL.trim() ? data.photoURL : DEFAULT_AVATAR_URL,
    bannerUrl: typeof data.bannerUrl === "string" ? data.bannerUrl : "",
    bio: typeof data.bio === "string" ? data.bio : "",
    categories: [],
    goals: [],
    socialLinks: typeof data.socialLinks === "object" && data.socialLinks ? data.socialLinks : {},
    totalPoints: typeof data.totalPoints === "number" ? data.totalPoints : 0,
    battleWins: typeof data.battleWins === "number" ? data.battleWins : 0,
    contestWins: typeof data.contestWins === "number" ? data.contestWins : 0,
    followerCount: typeof data.followerCount === "number" ? data.followerCount : followerIds.length,
    followingCount: typeof data.followingCount === "number" ? data.followingCount : followingIds.length,
    followerIds,
    followingIds,
    badges: asStringArray(data.badges),
    verified: alwaysVerified || Boolean(data.verified),
    rookie: Boolean(data.rookie),
    matchmakingContentId: typeof data.matchmakingContentId === "string" ? data.matchmakingContentId : null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function mapContentDoc(id: string, data: DocumentData): ContentModel {
  return {
    id,
    creatorId: typeof data.creatorId === "string" ? data.creatorId : "",
    platform: normalizePlatform(data.platform),
    sourceUrl: typeof data.sourceUrl === "string" ? data.sourceUrl : "",
    embedUrl: typeof data.embedUrl === "string" ? data.embedUrl : "",
    thumbnailUrl: typeof data.thumbnailUrl === "string" && data.thumbnailUrl.trim() ? data.thumbnailUrl : DEFAULT_CONTENT_THUMBNAIL,
    title: typeof data.title === "string" ? data.title : "Untitled",
    caption: typeof data.caption === "string" ? data.caption : "",
    category: typeof data.category === "string" ? data.category : "",
    tags: asStringArray(data.tags),
    status: typeof data.status === "string" ? data.status : "published",
    featured: Boolean(data.featured),
    isDefaultForReview: Boolean(data.isDefaultForReview),
    likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
    likedBy: Array.isArray(data.likedBy) ? data.likedBy.filter((id: unknown) => typeof id === "string") : [],
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    saveCount: typeof data.saveCount === "number" ? data.saveCount : 0,
    shareCount: typeof data.shareCount === "number" ? data.shareCount : 0,
    voteCount: typeof data.voteCount === "number" ? data.voteCount : 0,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function mapUserSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs.map((entry) => mapUserDoc(entry.id, entry.data()));
}

function mapContentSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs
    .map((entry) => mapContentDoc(entry.id, entry.data()))
    .filter((entry) => Boolean(entry.creatorId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function subscribePublicUsers(onData: (users: UserModel[]) => void, onError?: (error: Error) => void) {
  if (!firestore) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(firestore, USERS_COLLECTION),
    (snapshot) => onData(mapUserSnapshot(snapshot)),
    (error) => {
      onData([]);
      onError?.(error);
    },
  );
}

export function subscribePublicFeed(onData: (content: ContentModel[]) => void, onError?: (error: Error) => void) {
  if (!firestore) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(firestore, CONTENT_COLLECTION),
    (snapshot) => onData(mapContentSnapshot(snapshot)),
    (error) => {
      onData([]);
      onError?.(error);
    },
  );
}

export function subscribeProfile(userId: string, onData: (profile: UserModel | null) => void, onError?: (error: Error) => void) {
  if (!firestore || !userId) {
    onData(null);
    return () => {};
  }

  return onSnapshot(
    doc(firestore, USERS_COLLECTION, userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      onData(mapUserDoc(snapshot.id, snapshot.data()));
    },
    (error) => {
      onData(null);
      onError?.(error);
    },
  );
}

export function subscribeCreatorContent(userId: string, onData: (content: ContentModel[]) => void, onError?: (error: Error) => void) {
  if (!firestore || !userId) {
    onData([]);
    return () => {};
  }

  const contentQuery = query(collection(firestore, CONTENT_COLLECTION), where("creatorId", "==", userId));

  return onSnapshot(
    contentQuery,
    (snapshot) => onData(mapContentSnapshot(snapshot)),
    (error) => {
      onData([]);
      onError?.(error);
    },
  );
}

export async function getUserById(userId: string): Promise<UserModel | null> {
  if (!firestore || !userId) return null;

  try {
    const userDoc = await getDoc(doc(firestore, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      return mapUserDoc(userDoc.id, userDoc.data());
    }
    return null;
  } catch {
    return null;
  }
}
