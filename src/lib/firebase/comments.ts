import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { CommentModel, NotificationType } from "@/types/models";

const COMMENTS_COLLECTION = "comments";
const CONTENT_COLLECTION = "content";
const NOTIFICATIONS_COLLECTION = "notifications";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapCommentDoc(id: string, data: DocumentData): CommentModel {
  return {
    id,
    contentId: typeof data.contentId === "string" ? data.contentId : "",
    creatorId: typeof data.creatorId === "string" ? data.creatorId : "",
    userId: typeof data.userId === "string" ? data.userId : "",
    userName: typeof data.userName === "string" ? data.userName : "Anonymous",
    userPhoto: typeof data.userPhoto === "string" ? data.userPhoto : "",
    userVerified: Boolean(data.userVerified),
    content: typeof data.content === "string" ? data.content : "",
    likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
    replyCount: typeof data.replyCount === "number" ? data.replyCount : 0,
    replyToId: typeof data.replyToId === "string" ? data.replyToId : undefined,
    likedBy: Array.isArray(data.likedBy) ? data.likedBy.filter((id: unknown) => typeof id === "string") : [],
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function mapCommentSnapshot(snapshot: QuerySnapshot<DocumentData>): CommentModel[] {
  return snapshot.docs
    .map((doc) => mapCommentDoc(doc.id, doc.data()))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export interface AddCommentInput {
  contentId: string;
  creatorId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userVerified: boolean;
  content: string;
  replyToId?: string;
}

export async function addComment(input: AddCommentInput): Promise<{ id: string }> {
  if (!firestore) throw new Error("Firebase not configured");

  const now = new Date().toISOString();
  const commentPayload = {
    contentId: input.contentId,
    creatorId: input.creatorId,
    userId: input.userId,
    userName: input.userName,
    userPhoto: input.userPhoto,
    userVerified: input.userVerified,
    content: input.content.trim(),
    likeCount: 0,
    replyCount: 0,
    ...(input.replyToId ? { replyToId: input.replyToId } : {}),
    likedBy: [],
    createdAt: now,
    updatedAt: now,
  };

  const commentRef = await addDoc(collection(firestore, COMMENTS_COLLECTION), commentPayload);

  // Increment comment count on parent content
  const contentRef = doc(firestore, CONTENT_COLLECTION, input.contentId);
  await updateDoc(contentRef, { commentCount: increment(1), updatedAt: now });

  // If this is a reply, increment the parent comment's replyCount
  if (input.replyToId) {
    const parentCommentRef = doc(firestore, COMMENTS_COLLECTION, input.replyToId);
    await updateDoc(parentCommentRef, { replyCount: increment(1), updatedAt: now });
  }

  // Send notification if comment author is not content creator
  if (input.userId !== input.creatorId) {
    await addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), {
      userId: input.creatorId,
      type: "new comment" as NotificationType,
      actorId: input.userId,
      targetId: input.contentId,
      targetType: "content",
      read: false,
      createdAt: now,
    });
  }

  return { id: commentRef.id };
}

export function subscribeComments(
  contentId: string,
  onData: (comments: CommentModel[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!firestore) {
    onData([]);
    return () => {};
  }

  const commentsQuery = query(
    collection(firestore, COMMENTS_COLLECTION),
    where("contentId", "==", contentId)
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => onData(mapCommentSnapshot(snapshot)),
    (error) => {
      onData([]);
      onError?.(error);
    }
  );
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured");

  const commentRef = doc(firestore, COMMENTS_COLLECTION, commentId);
  const commentSnap = await getDocs(query(collection(firestore, COMMENTS_COLLECTION), where("__name__", "==", commentId)));
  if (commentSnap.empty) return;

  const commentData = commentSnap.docs[0].data();
  const likedBy: string[] = Array.isArray(commentData.likedBy) ? commentData.likedBy : [];
  const isLiked = likedBy.includes(userId);

  await updateDoc(commentRef, {
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: isLiked ? increment(-1) : increment(1),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteComment(commentId: string, userId: string, contentId: string): Promise<void> {
  if (!firestore) throw new Error("Firebase not configured");

  const commentRef = doc(firestore, COMMENTS_COLLECTION, commentId);
  const commentSnap = await getDocs(query(collection(firestore, COMMENTS_COLLECTION), where("__name__", "==", commentId)));
  if (commentSnap.empty) return;

  const commentData = commentSnap.docs[0].data();
  if (commentData.userId !== userId) throw new Error("Not authorized to delete this comment");

  await deleteDoc(commentRef);

  // Decrement comment count on parent content
  const contentRef = doc(firestore, CONTENT_COLLECTION, contentId);
  await updateDoc(contentRef, {
    commentCount: increment(-1),
    updatedAt: new Date().toISOString(),
  });
}
