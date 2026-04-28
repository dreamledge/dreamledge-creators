const VOICE_ROOM_STORAGE_KEY = "dreamledge_last_voice_room";
const WATCH_PARTY_STORAGE_KEY = "dreamledge_last_watch_party";

export function saveLastVoiceRoom(roomId: string) {
  try {
    localStorage.setItem(VOICE_ROOM_STORAGE_KEY, roomId);
  } catch {
    // localStorage not available
  }
}

export function getLastVoiceRoom(): string | null {
  try {
    return localStorage.getItem(VOICE_ROOM_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearLastVoiceRoom() {
  try {
    localStorage.removeItem(VOICE_ROOM_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

export function saveLastWatchPartyRoom(roomId: string) {
  try {
    localStorage.setItem(WATCH_PARTY_STORAGE_KEY, roomId);
  } catch {
    // localStorage not available
  }
}

export function getLastWatchPartyRoom(): string | null {
  try {
    return localStorage.getItem(WATCH_PARTY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearLastWatchPartyRoom() {
  try {
    localStorage.removeItem(WATCH_PARTY_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}