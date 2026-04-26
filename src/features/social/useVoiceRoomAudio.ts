import { useEffect, useMemo, useRef, useState } from "react";
import { joinRoom, type JsonValue, type Room } from "trystero";

const TRYSTERO_APP_ID = "dreamledge-social-voice-v1";
const SPEAKING_THRESHOLD = 10;
const SPEAKING_HOLD_MS = 420;

type RemoteAudio = {
  peerId: string;
  userId: string;
  stream: MediaStream;
};

type StreamMetadata = {
  userId?: string;
};

function toMetadata(value: JsonValue | undefined): StreamMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as StreamMetadata;
}

function getAverageLevel(analyser: AnalyserNode, data: Uint8Array<ArrayBufferLike>) {
  analyser.getByteTimeDomainData(data as unknown as Uint8Array<ArrayBuffer>);
  let total = 0;
  for (let i = 0; i < data.length; i += 1) {
    total += Math.abs(data[i] - 128);
  }
  return total / data.length;
}

export function useVoiceRoomAudio(roomId: string | null, userId: string | null, enabled: boolean) {
  const [isMicReady, setIsMicReady] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [remoteAudios, setRemoteAudios] = useState<RemoteAudio[]>([]);
  const [speakingUserIds, setSpeakingUserIds] = useState<string[]>([]);
  const [audioContextState, setAudioContextState] = useState<"running" | "suspended" | "closed" | "interrupted" | "none">("none");

  const roomRef = useRef<Room | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioElementsRef = useRef(new Map<string, HTMLAudioElement>());
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const localAnalyserDataRef = useRef<Uint8Array<ArrayBufferLike> | null>(null);
  const remoteAnalysersRef = useRef(new Map<string, { analyser: AnalyserNode; data: Uint8Array<ArrayBufferLike>; userId: string }>());
  const speakingUntilRef = useRef(new Map<string, number>());
  const speakingLoopRef = useRef<number | null>(null);

  const peerCount = useMemo(() => remoteAudios.length, [remoteAudios.length]);

  const setMicMutedStateFromTracks = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      setIsMicMuted(true);
      return;
    }

    const tracks = stream.getAudioTracks();
    if (!tracks.length) {
      setIsMicMuted(true);
      return;
    }

    const allDisabled = tracks.every((track) => !track.enabled);
    setIsMicMuted(allDisabled);
  };

  const syncAudioContextState = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) {
      setAudioContextState("none");
      return;
    }
    setAudioContextState(audioContext.state);
  };

  const resumeAudioContext = async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    } finally {
      syncAudioContextState();
    }
  };

  const retryRemotePlayback = async () => {
    await resumeAudioContext();
    await Promise.all(
      Array.from(remoteAudioElementsRef.current.values()).map(async (audioElement) => {
        try {
          await audioElement.play();
        } catch {
          // Playback can still be blocked depending on browser policies.
        }
      }),
    );
  };

  const setMuted = async (nextMuted: boolean) => {
    const stream = localStreamRef.current;
    if (!stream) {
      setIsMicMuted(true);
      return;
    }

    await resumeAudioContext();
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMicMutedStateFromTracks();
    if (!nextMuted) {
      await retryRemotePlayback();
    }
  };

  useEffect(() => {
    if (!enabled || !roomId || !userId) {
      setIsMicReady(false);
      setIsMicMuted(true);
      setAudioError(null);
      setRemoteAudios([]);
      setSpeakingUserIds([]);
      setAudioContextState("none");
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = false;
        });

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        syncAudioContextState();

        const localSource = audioContext.createMediaStreamSource(stream);
        const localAnalyser = audioContext.createAnalyser();
        localAnalyser.fftSize = 512;
        localSource.connect(localAnalyser);
        localAnalyserRef.current = localAnalyser;
        localAnalyserDataRef.current = new Uint8Array(localAnalyser.frequencyBinCount);

        localStreamRef.current = stream;

        const room = joinRoom({ appId: TRYSTERO_APP_ID }, roomId);
        roomRef.current = room;

        room.onPeerJoin((peerId) => {
          if (!localStreamRef.current) return;
          room.addStream(localStreamRef.current, peerId, { userId });
        });

        room.onPeerLeave((peerId) => {
          setRemoteAudios((prev) => prev.filter((entry) => entry.peerId !== peerId));

          const audioElement = remoteAudioElementsRef.current.get(peerId);
          if (audioElement) {
            audioElement.pause();
            audioElement.srcObject = null;
            remoteAudioElementsRef.current.delete(peerId);
          }

          remoteAnalysersRef.current.delete(peerId);
          speakingUntilRef.current.delete(peerId);
        });

        room.onPeerStream((remoteStream, peerId, metadata) => {
          const streamMetadata = toMetadata(metadata);
          const remoteUserId = typeof streamMetadata.userId === "string" && streamMetadata.userId ? streamMetadata.userId : peerId;

          setRemoteAudios((prev) => {
            const next = prev.filter((entry) => entry.peerId !== peerId);
            next.push({ peerId, userId: remoteUserId, stream: remoteStream });
            return next;
          });

          const audioElement = new Audio();
          audioElement.autoplay = true;
          audioElement.setAttribute("playsinline", "true");
          audioElement.muted = false;
          audioElement.srcObject = remoteStream;
          remoteAudioElementsRef.current.set(peerId, audioElement);

          void audioElement.play().catch(() => {
            // Browsers may block until another user interaction.
          });

          const remoteSource = audioContext.createMediaStreamSource(remoteStream);
          const remoteAnalyser = audioContext.createAnalyser();
          remoteAnalyser.fftSize = 512;
          remoteSource.connect(remoteAnalyser);
          remoteAnalysersRef.current.set(peerId, {
            analyser: remoteAnalyser,
            data: new Uint8Array(remoteAnalyser.frequencyBinCount),
            userId: remoteUserId,
          });
        });

        room.addStream(stream, undefined, { userId });
        setMicMutedStateFromTracks();
        setIsMicReady(true);
        setAudioError(null);

        speakingLoopRef.current = window.setInterval(() => {
          const now = Date.now();
          const nextSpeaking = new Set<string>();

          const localAnalyser = localAnalyserRef.current;
          const localData = localAnalyserDataRef.current;
          if (localAnalyser && localData) {
            const localLevel = getAverageLevel(localAnalyser, localData);
            if (localLevel > SPEAKING_THRESHOLD) {
              speakingUntilRef.current.set(userId, now + SPEAKING_HOLD_MS);
            }
          }

          remoteAnalysersRef.current.forEach((entry, peerId) => {
            const remoteLevel = getAverageLevel(entry.analyser, entry.data);
            if (remoteLevel > SPEAKING_THRESHOLD) {
              speakingUntilRef.current.set(peerId, now + SPEAKING_HOLD_MS);
              speakingUntilRef.current.set(entry.userId, now + SPEAKING_HOLD_MS);
            }
          });

          speakingUntilRef.current.forEach((untilMs, key) => {
            if (untilMs >= now) {
              nextSpeaking.add(key);
            }
          });

          setSpeakingUserIds(Array.from(nextSpeaking));
        }, 120);
      } catch (error) {
        setAudioError(error instanceof Error ? error.message : "Unable to access microphone.");
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      setRemoteAudios([]);
      setSpeakingUserIds([]);
      setIsMicReady(false);
      setIsMicMuted(true);

      if (speakingLoopRef.current) {
        window.clearInterval(speakingLoopRef.current);
        speakingLoopRef.current = null;
      }

      const room = roomRef.current;
      roomRef.current = null;
      if (room) {
        void room.leave();
      }

      remoteAudioElementsRef.current.forEach((audioElement) => {
        audioElement.pause();
        audioElement.srcObject = null;
      });
      remoteAudioElementsRef.current.clear();
      remoteAnalysersRef.current.clear();
      speakingUntilRef.current.clear();

      const stream = localStreamRef.current;
      localStreamRef.current = null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const audioContext = audioContextRef.current;
      audioContextRef.current = null;
      if (audioContext) {
        void audioContext.close();
      }
      setAudioContextState("none");
    };
  }, [enabled, roomId, userId]);

  return {
    isMicReady,
    isMicMuted,
    setMuted,
    retryRemotePlayback,
    audioError,
    peerCount,
    remoteAudios,
    speakingUserIds,
    audioContextState,
  };
}
