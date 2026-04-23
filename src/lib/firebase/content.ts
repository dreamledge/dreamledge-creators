import { addDoc, collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { DEFAULT_CONTENT_THUMBNAIL } from "@/lib/constants/defaults";
import type { ContentModel, ContentPlatform } from "@/types/models";

export const CONTENT_COLLECTION = "content";

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
  "likeCount",
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
    likeCount: 0,
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
