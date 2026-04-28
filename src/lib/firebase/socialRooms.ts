import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  updateDoc,
  where,
  query,
  type DocumentData,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export const SOCIAL_VOICE_ROOMS_COLLECTION = "social_voice_rooms";
export const SOCIAL_WATCH_PARTY_COLLECTION = "social_watch_parties";
export const VOICE_ROOM_INACTIVITY_MS = 30 * 60 * 1000;
export const VOICE_ROOM_MAX_PARTICIPANTS = 4;

export interface SocialVoiceRoom {
  id: string;
  name: string;
  createdBy: string;
  participantIds: string[];
  status: "active" | "closed";
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

function toIso(value: unknown) {
  if (typeof value === "string" && value) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapRoomDoc(id: string, data: DocumentData): SocialVoiceRoom {
  return {
    id,
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Untitled room",
    createdBy: typeof data.createdBy === "string" ? data.createdBy : "",
    participantIds: Array.isArray(data.participantIds) ? data.participantIds.filter((entry: unknown): entry is string => typeof entry === "string") : [],
    status: data.status === "closed" ? "closed" : "active",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    lastActivityAt: toIso(data.lastActivityAt ?? data.updatedAt ?? data.createdAt),
  };
}

export function isVoiceRoomExpired(room: Pick<SocialVoiceRoom, "lastActivityAt">, nowMs = Date.now()) {
  const lastActivityMs = new Date(room.lastActivityAt).getTime();
  if (!Number.isFinite(lastActivityMs)) return false;
  return nowMs - lastActivityMs >= VOICE_ROOM_INACTIVITY_MS;
}

export function subscribeActiveVoiceRooms(onData: (rooms: SocialVoiceRoom[]) => void, onError?: (error: Error) => void) {
  if (!firestore) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(firestore, SOCIAL_VOICE_ROOMS_COLLECTION),
    (snapshot) => {
      const nowMs = Date.now();
      const rooms = snapshot.docs
        .map((entry) => mapRoomDoc(entry.id, entry.data()))
        .filter((room) => room.status === "active" && !isVoiceRoomExpired(room, nowMs) && room.participantIds.length > 0)
        .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

      onData(rooms);
    },
    (error) => {
      onData([]);
      onError?.(error);
    },
  );
}

async function getUserActiveRooms(userId: string) {
  if (!firestore || !userId) return [] as SocialVoiceRoom[];

  const userRoomsQuery = query(
    collection(firestore, SOCIAL_VOICE_ROOMS_COLLECTION),
    where("participantIds", "array-contains", userId),
  );

  const snapshot = await getDocs(userRoomsQuery);
  const nowMs = Date.now();
  return snapshot.docs
    .map((entry) => mapRoomDoc(entry.id, entry.data()))
    .filter((room) => room.status === "active" && !isVoiceRoomExpired(room, nowMs));
}

async function getUserActiveWatchPartyRooms(userId: string) {
  if (!firestore || !userId) return [] as SocialVoiceRoom[];

  const userRoomsQuery = query(
    collection(firestore, SOCIAL_WATCH_PARTY_COLLECTION),
    where("participantIds", "array-contains", userId),
  );

  const snapshot = await getDocs(userRoomsQuery);
  const nowMs = Date.now();
  return snapshot.docs
    .map((entry) => mapRoomDoc(entry.id, entry.data()))
    .filter((room) => room.status === "active" && !isVoiceRoomExpired(room, nowMs));
}

export async function createVoiceRoom(userId: string, roomName: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!userId) throw new Error("You must be logged in to create a room.");

  const trimmedName = roomName.trim();
  if (!trimmedName) throw new Error("Room name is required.");

  const activeRooms = await getUserActiveRooms(userId);
  if (activeRooms.length) {
    throw new Error("You are already in an active room.");
  }

  const now = new Date().toISOString();
  const roomDoc = await addDoc(collection(firestore, SOCIAL_VOICE_ROOMS_COLLECTION), {
    name: trimmedName,
    createdBy: userId,
    participantIds: [userId],
    status: "active",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });

  return roomDoc.id;
}

export async function joinVoiceRoom(roomId: string, userId: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!roomId || !userId) throw new Error("Room and user are required.");

  const activeRooms = await getUserActiveRooms(userId);
  const roomAlreadyJoined = activeRooms.find((room) => room.id === roomId);
  if (activeRooms.length && !roomAlreadyJoined) {
    throw new Error("You are already in another active room.");
  }

  const activeWatchParties = await getUserActiveWatchPartyRooms(userId);
  const activeWatchParty = activeWatchParties[0];
  if (activeWatchParty) {
    if (activeWatchParty.createdBy === userId) {
      await closeWatchPartyRoom(activeWatchParty.id, userId);
    } else {
      await leaveWatchPartyRoom(activeWatchParty.id, userId);
    }
  }

  const roomRef = doc(firestore, SOCIAL_VOICE_ROOMS_COLLECTION, roomId);
  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) throw new Error("Room not found.");

    const room = mapRoomDoc(snapshot.id, snapshot.data());
    if (room.status !== "active" || isVoiceRoomExpired(room)) {
      throw new Error("This room is no longer active.");
    }

    const participants = room.participantIds;
    if (!participants.includes(userId) && participants.length >= VOICE_ROOM_MAX_PARTICIPANTS) {
      throw new Error("This room is full.");
    }

    const now = new Date().toISOString();
    if (participants.includes(userId)) {
      transaction.update(roomRef, {
        lastActivityAt: now,
        updatedAt: now,
      });
      return;
    }

    transaction.update(roomRef, {
      participantIds: arrayUnion(userId),
      lastActivityAt: now,
      updatedAt: now,
    });
  });
}

export async function leaveVoiceRoom(roomId: string, userId: string) {
  if (!firestore || !roomId || !userId) return;

  const roomRef = doc(firestore, SOCIAL_VOICE_ROOMS_COLLECTION, roomId);
  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) return;

    const room = mapRoomDoc(snapshot.id, snapshot.data());
    if (!room.participantIds.includes(userId)) return;

    const remainingParticipants = room.participantIds.filter((participantId) => participantId !== userId);
    if (!remainingParticipants.length) {
      transaction.delete(roomRef);
      return;
    }

    const now = new Date().toISOString();
    transaction.update(roomRef, {
      participantIds: arrayRemove(userId),
      lastActivityAt: now,
      updatedAt: now,
    });
  });
}

export async function touchVoiceRoom(roomId: string) {
  if (!firestore || !roomId) return;
  const now = new Date().toISOString();
  await updateDoc(doc(firestore, SOCIAL_VOICE_ROOMS_COLLECTION, roomId), {
    lastActivityAt: now,
    updatedAt: now,
  });
}

export async function pruneInactiveVoiceRooms() {
  if (!firestore) return 0;
  const db = firestore;

  const snapshot = await getDocs(collection(db, SOCIAL_VOICE_ROOMS_COLLECTION));
  const nowMs = Date.now();
  const staleRooms = snapshot.docs
    .map((entry) => ({ id: entry.id, room: mapRoomDoc(entry.id, entry.data()) }))
    .filter(({ room }) => room.status === "active" && isVoiceRoomExpired(room, nowMs));

  await Promise.all(staleRooms.map(({ id }) => deleteDoc(doc(db, SOCIAL_VOICE_ROOMS_COLLECTION, id))));
  return staleRooms.length;
}

export async function closeVoiceRoom(roomId: string, actorUserId: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!roomId || !actorUserId) throw new Error("Room and actor are required.");

  const roomRef = doc(firestore, SOCIAL_VOICE_ROOMS_COLLECTION, roomId);
  const snapshot = await getDoc(roomRef);
  if (!snapshot.exists()) return;

  const room = mapRoomDoc(snapshot.id, snapshot.data());
  if (room.createdBy !== actorUserId) {
    throw new Error("Only the room creator can end this room.");
  }

  await deleteDoc(roomRef);
}

export function subscribeActiveWatchPartyRooms(onData: (rooms: SocialVoiceRoom[]) => void, onError?: (error: Error) => void) {
  if (!firestore) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    collection(firestore, SOCIAL_WATCH_PARTY_COLLECTION),
    (snapshot) => {
      const nowMs = Date.now();
      const rooms = snapshot.docs
        .map((entry) => mapRoomDoc(entry.id, entry.data()))
        .filter((room) => room.status === "active" && !isVoiceRoomExpired(room, nowMs) && room.participantIds.length > 0)
        .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

      onData(rooms);
    },
    (error) => {
      onData([]);
      onError?.(error);
    },
  );
}

async function getUserActiveWatchParties(userId: string) {
  if (!firestore || !userId) return [] as SocialVoiceRoom[];

  const userRoomsQuery = query(
    collection(firestore, SOCIAL_WATCH_PARTY_COLLECTION),
    where("participantIds", "array-contains", userId),
  );

  const snapshot = await getDocs(userRoomsQuery);
  const nowMs = Date.now();
  return snapshot.docs
    .map((entry) => mapRoomDoc(entry.id, entry.data()))
    .filter((room) => room.status === "active" && !isVoiceRoomExpired(room, nowMs));
}

export async function createWatchPartyRoom(userId: string, roomName: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!userId) throw new Error("You must be logged in to create a room.");

  const trimmedName = roomName.trim();
  if (!trimmedName) throw new Error("Room name is required.");

  const activeRooms = await getUserActiveWatchParties(userId);
  if (activeRooms.length) {
    throw new Error("You are already in an active watch party.");
  }

  const now = new Date().toISOString();
  const roomDoc = await addDoc(collection(firestore, SOCIAL_WATCH_PARTY_COLLECTION), {
    name: trimmedName,
    createdBy: userId,
    participantIds: [userId],
    status: "active",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });

  return roomDoc.id;
}

export async function joinWatchPartyRoom(roomId: string, userId: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!roomId || !userId) throw new Error("Room and user are required.");

  const activeVoiceRooms = await getUserActiveRooms(userId);
  const activeVoiceRoom = activeVoiceRooms.find((room) => room.id !== roomId);
  if (activeVoiceRoom) {
    if (activeVoiceRoom.createdBy === userId) {
      await closeVoiceRoom(activeVoiceRoom.id, userId);
    } else {
      await leaveVoiceRoom(activeVoiceRoom.id, userId);
    }
  }

  const roomRef = doc(firestore, SOCIAL_WATCH_PARTY_COLLECTION, roomId);

  try {
    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(roomRef);
      if (!snapshot.exists()) throw new Error("Room does not exist.");

      const room = mapRoomDoc(snapshot.id, snapshot.data());
      if (room.status === "closed") throw new Error("Room is closed.");
      if (room.participantIds.length >= VOICE_ROOM_MAX_PARTICIPANTS) throw new Error("Room is full.");

      if (room.participantIds.includes(userId)) return;

      const now = new Date().toISOString();
      transaction.update(roomRef, {
        participantIds: arrayUnion(userId),
        lastActivityAt: now,
        updatedAt: now,
      });
    });
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to join room.");
  }
}

export async function leaveWatchPartyRoom(roomId: string, userId: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!roomId || !userId) throw new Error("Room and user are required.");

  const roomRef = doc(firestore, SOCIAL_WATCH_PARTY_COLLECTION, roomId);

  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) return;

    const room = mapRoomDoc(snapshot.id, snapshot.data());
    if (!room.participantIds.includes(userId)) return;

    const remainingParticipants = room.participantIds.filter((participantId) => participantId !== userId);
    if (!remainingParticipants.length) {
      transaction.delete(roomRef);
      return;
    }

    const now = new Date().toISOString();
    transaction.update(roomRef, {
      participantIds: arrayRemove(userId),
      lastActivityAt: now,
      updatedAt: now,
    });
  });
}

export async function touchWatchPartyRoom(roomId: string) {
  if (!firestore || !roomId) return;
  const now = new Date().toISOString();
  await updateDoc(doc(firestore, SOCIAL_WATCH_PARTY_COLLECTION, roomId), {
    lastActivityAt: now,
    updatedAt: now,
  });
}

export async function closeWatchPartyRoom(roomId: string, actorUserId: string) {
  if (!firestore) throw new Error("Firebase Firestore is not configured.");
  if (!roomId || !actorUserId) throw new Error("Room and actor are required.");

  const roomRef = doc(firestore, SOCIAL_WATCH_PARTY_COLLECTION, roomId);
  const snapshot = await getDoc(roomRef);
  if (!snapshot.exists()) return;

  const room = mapRoomDoc(snapshot.id, snapshot.data());
  if (room.createdBy !== actorUserId) {
    throw new Error("Only the room creator can end this room.");
  }

  await deleteDoc(roomRef);
}
