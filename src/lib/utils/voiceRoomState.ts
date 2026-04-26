const VOICE_ROOM_STORAGE_KEY = "dreamledge_last_voice_room";

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