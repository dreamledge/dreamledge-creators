import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { DEFAULT_CONTENT_THUMBNAIL } from "@/lib/constants/defaults";
import type { ContentModel, ContentPlatform, NotificationType } from "@/types/models";

export const CONTENT_COLLECTION = "content";
export const NOTIFICATIONS_COLLECTION = "notifications";

export const CONTENT_REQUIRED_FIELDS = [
  "creatorId",
  "platform",
  "sourceUrl",
  "embedUrl",
  "thumbnailUrl",
  "title",
  "caption",
  "category",
  "tags",
  "status",
  "featured",
  "isDefaultForReview",
  "likeCount",
  "likedBy",
  "commentCount",
  "saveCount",
  "shareCount",
  "voteCount",
  "createdAt",
  "updatedAt",
] as const;

type RequiredField = (typeof CONTENT_REQUIRED_FIELDS)[number];

export interface CreateContentInput {
  creatorId: string;
  sourceUrl: string;
  embedUrl: string;
  platform: ContentPlatform;
  title: string;
  caption: string;
  category: string;
  tags?: string[];
  thumbnailUrl?: string;
  status?: string;
  featured?: boolean;
  isDefaultForReview?: boolean;
}

function sanitizeText(value: string, fallback = "") {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function sanitizeTags(tags: string[] | undefined) {
  if (!tags) return [];
  const normalized = tags
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);

  return Array.from(new Set(normalized));
}

export function buildContentPayload(input: CreateContentInput): Omit<ContentModel, "id"> {
  const now = new Date().toISOString();

  return {
    creatorId: sanitizeText(input.creatorId),
    platform: input.platform,
    sourceUrl: sanitizeText(input.sourceUrl),
    embedUrl: sanitizeText(input.embedUrl),
    thumbnailUrl: sanitizeText(input.thumbnailUrl ?? DEFAULT_CONTENT_THUMBNAIL, DEFAULT_CONTENT_THUMBNAIL),
    title: sanitizeText(input.title, "Untitled"),
    caption: sanitizeText(input.caption),
    category: sanitizeText(input.category, "general"),
    tags: sanitizeTags(input.tags),
    status: sanitizeText(input.status ?? "published", "published"),
    featured: Boolean(input.featured),
    isDefaultForReview: Boolean(input.isDefaultForReview ?? false),
    likeCount: 0,
    likedBy: [],
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
    voteCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function validateContentContract(payload: Omit<ContentModel, "id">) {
  const missing = CONTENT_REQUIRED_FIELDS.filter((field) => payload[field as RequiredField] === undefined || payload[field as RequiredField] === null);

  if (missing.length) {
    return {
      valid: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    };
  }

  if (!payload.creatorId) {
    return { valid: false, message: "creatorId is required." };
  }

  if (payload.platform === "unknown") {
    return { valid: false, message: "Unsupported platform. Use TikTok, YouTube, X, or Facebook URLs." };
  }

  if (!payload.sourceUrl || !payload.embedUrl) {
    return { valid: false, message: "A valid source and embed URL are required." };
  }

  return { valid: true, message: "ok" };
}

export async function publishContent(input: CreateContentInput) {
  if (!firestore) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const payload = buildContentPayload(input);
  const contract = validateContentContract(payload);
  if (!contract.valid) {
    throw new Error(contract.message);
  }

  const snapshot = await addDoc(collection(firestore, CONTENT_COLLECTION), payload);
  return { id: snapshot.id, payload };
}

export async function deleteContent(contentId: string, _creatorId: string) {
  if (!firestore) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const contentRef = doc(firestore, CONTENT_COLLECTION, contentId);
  await deleteDoc(contentRef);
}

export async function setMatchmakingContent(userId: string, contentId: string) {
  if (!firestore) return;
  
  const userRef = doc(firestore, "users", userId);
  await updateDoc(userRef, { matchmakingContentId: contentId });
}

export async function setContentAsDefaultReview(userId: string, contentId: string) {
  if (!firestore) return;

  // First, find any existing default content for this user and unset it
  const userContentQuery = query(
    collection(firestore, CONTENT_COLLECTION),
    where("creatorId", "==", userId),
    where("isDefaultForReview", "==", true)
  );

  const userContentSnapshot = await getDocs(userContentQuery);
  
  // Unset any existing defaults
  const unsetPromises = userContentSnapshot.docs
    .filter(doc => doc.id !== contentId) // Don't unset the one we're setting
    .map(doc => 
      updateDoc(doc.ref, { isDefaultForReview: false })
    );
  
  await Promise.all(unsetPromises);

  // Set the new content as default for review
  const contentRef = doc(firestore, CONTENT_COLLECTION, contentId);
  await updateDoc(contentRef, { isDefaultForReview: true });
}

export async function toggleContentLike(
  contentId: string,
  userId: string,
  creatorId: string,
  userName: string
): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured");

  const contentRef = doc(firestore, CONTENT_COLLECTION, contentId);
  const contentSnap = await getDocs(query(collection(firestore, CONTENT_COLLECTION), where("__name__", "==", contentId)));
  if (contentSnap.empty) return;

  const contentData = contentSnap.docs[0].data();
  const likedBy: string[] = Array.isArray(contentData.likedBy) ? contentData.likedBy : [];
  const isLiked = likedBy.includes(userId);

  await updateDoc(contentRef, {
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: isLiked ? increment(-1) : increment(1),
    updatedAt: new Date().toISOString(),
  });

  // Send notification if liker is not the content creator
  if (!isLiked && userId !== creatorId) {
    await addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), {
      userId: creatorId,
      type: "new like" as NotificationType,
      actorId: userId,
      actorName: userName,
      targetId: contentId,
      targetType: "content",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
}
