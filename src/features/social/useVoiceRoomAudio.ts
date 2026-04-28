import { useEffect, useRef, useState, useCallback } from "react";
import { joinRoom, type JsonValue, type Room } from "trystero";

const DEFAULT_TRYSTERO_APP_ID = "dreamledge-social-voice-v1";
const SPEAKING_THRESHOLD = 5;
const SPEAKING_HOLD_MS = 420;

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

const TURN_SERVERS = [
  { urls: "turn:openrelay.metered.ca:443" },
  { urls: "turn:openrelay.metered.ca:443?transport=tcp" },
];

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [...ICE_SERVERS],
  iceCandidatePoolSize: 10,
};

const TRICKLE_ICE = true;

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

const applyAudioBitrateLimit = (pc: RTCPeerConnection) => {
  try {
    const sender = pc.getSenders().find(s => s.track && s.track.kind === "audio");
    if (sender) {
      const params = sender.getParameters();
      if (!params.encodings) {
        params.encodings = [{}];
      }
      params.encodings[0].maxBitrate = 20000;
      sender.setParameters(params);
    }
  } catch (e) {
    console.warn("Bitrate setting failed", e);
  }
};

export function useVoiceRoomAudio(roomId: string | null, userId: string | null, enabled: boolean, appId?: string) {
  const trysteroAppId = appId ?? DEFAULT_TRYSTERO_APP_ID;
  const [isMicReady, setIsMicReady] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [remoteAudios, setRemoteAudios] = useState<RemoteAudio[]>([]);
  const [speakingUserIds, setSpeakingUserIds] = useState<string[]>([]);
  const [audioContextState, setAudioContextState] = useState<"running" | "suspended" | "closed" | "interrupted" | "none">("none");
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | "connecting" | "disconnected">("disconnected");
  const [peerCount, setPeerCount] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioElementsRef = useRef(new Map<string, HTMLAudioElement>());
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const localAnalyserDataRef = useRef<Uint8Array<ArrayBufferLike> | null>(null);
  const remoteAnalysersRef = useRef(new Map<string, { analyser: AnalyserNode; data: Uint8Array<ArrayBufferLike>; userId: string }>());
  const speakingUntilRef = useRef(new Map<string, number>());
  const speakingLoopRef = useRef<number | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);

  const cleanupAll = useCallback(() => {
    if (speakingLoopRef.current) {
      window.clearInterval(speakingLoopRef.current);
      speakingLoopRef.current = null;
    }

    remoteAudioElementsRef.current.forEach((audioElement) => {
      audioElement.pause();
      audioElement.srcObject = null;
    });
    remoteAudioElementsRef.current.clear();
    remoteAnalysersRef.current.clear();
    speakingUntilRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const resumeAudioContext = useCallback(async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    } finally {
      setAudioContextState(audioContext.state);
    }
  }, []);

  const retryRemotePlayback = useCallback(async () => {
    await resumeAudioContext();
    await Promise.all(
      Array.from(remoteAudioElementsRef.current.values()).map(async (audioElement) => {
        try {
          await audioElement.play();
        } catch {
          // Playback can still be blocked
        }
      }),
    );
  }, [resumeAudioContext]);

  const initializeMedia = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      return stream;
    } catch {
      return null;
    }
  }, []);

  const setMuted = useCallback(async (nextMuted: boolean) => {
    const stream = localStreamRef.current;
    let audioContext = audioContextRef.current;

    if (!stream) {
      if (!audioContext) {
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        setAudioContextState(audioContext.state);
      }

      const newStream = await initializeMedia();
      if (!newStream) {
        setIsMicMuted(true);
        setAudioError("Unable to access microphone");
        return;
      }

      const audioTracks = newStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !nextMuted;
      });

      localStreamRef.current = newStream;
      const localSource = audioContext.createMediaStreamSource(newStream);
      const localAnalyser = audioContext.createAnalyser();
      localAnalyser.fftSize = 512;
      localSource.connect(localAnalyser);
      localAnalyserRef.current = localAnalyser;
      localAnalyserDataRef.current = new Uint8Array(localAnalyser.frequencyBinCount);

      if (roomRef.current && userId) {
        const peersMap = roomRef.current.getPeers();
        Object.keys(peersMap).forEach((peerId) => {
          roomRef.current?.addStream(newStream, peerId, { userId });
        });
        Object.values(peersMap).forEach(pc => applyAudioBitrateLimit(pc));
      }

      setIsMicReady(true);
      setIsMicMuted(nextMuted);
      return;
    }

    setIsMicMuted(nextMuted);
    await resumeAudioContext();

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    if (!nextMuted) {
      await retryRemotePlayback();
    }
  }, [initializeMedia, resumeAudioContext, retryRemotePlayback, userId]);

  useEffect(() => {
    if (!enabled || !roomId || !userId) {
      setIsMicReady(false);
      setIsMicMuted(true);
      setAudioError(null);
      setRemoteAudios([]);
      setSpeakingUserIds([]);
      setAudioContextState("none");
      setConnectionState("disconnected");
      setPeerCount(0);

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      roomRef.current = null;
      return;
    }

    setConnectionState("connecting");

    let isCleanedUp = false;

    const init = async () => {
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        setAudioContextState(audioContext.state);

        const room = joinRoom(
          {
            appId: trysteroAppId,
            rtcConfig: RTC_CONFIG,
            trickleIce: TRICKLE_ICE,
            turnConfig: TURN_SERVERS,
          },
          roomId
        );

        if (isCleanedUp) {
          room.leave();
          return;
        }

        roomRef.current = room;

        room.onPeerJoin((peerId) => {
          console.log("Peer joined:", peerId);
          const stream = localStreamRef.current;
          if (stream && userId) {
            room.addStream(stream, peerId, { userId });
            setTimeout(() => {
              const peersMap = room.getPeers();
              const pc = peersMap[peerId];
              if (pc) applyAudioBitrateLimit(pc);
            }, 500);
          }
        });

        room.onPeerLeave((peerId) => {
          console.log("Peer left:", peerId);

          setRemoteAudios((prev) => prev.filter((entry) => entry.peerId !== peerId));

          const audioElement = remoteAudioElementsRef.current.get(peerId);
          if (audioElement) {
            audioElement.pause();
            audioElement.srcObject = null;
            remoteAudioElementsRef.current.delete(peerId);
          }

          remoteAnalysersRef.current.delete(peerId);
          speakingUntilRef.current.delete(peerId);
          
          setPeerCount(remoteAudioElementsRef.current.size);
        });

        room.onPeerStream((remoteStream, peerId, metadata) => {
          console.log("Received stream from peer:", peerId);

          const streamMetadata = toMetadata(metadata);
          const remoteUserId = typeof streamMetadata.userId === "string" && streamMetadata.userId ? streamMetadata.userId : peerId;

          setRemoteAudios((prev) => {
            const next = prev.filter((entry) => entry.peerId !== peerId);
            next.push({ peerId, userId: remoteUserId, stream: remoteStream });
            return next;
          });

          setPeerCount((prev) => prev + 1);

          const audioElement = new Audio();
          audioElement.autoplay = true;
          audioElement.setAttribute("playsinline", "");
          audioElement.setAttribute("webkit-playsinline", "");
          audioElement.muted = false;
          audioElement.srcObject = remoteStream;
          remoteAudioElementsRef.current.set(peerId, audioElement);

          audioElement.play().catch(() => {});

          const remoteSource = audioContext.createMediaStreamSource(remoteStream);
          const remoteAnalyser = audioContext.createAnalyser();
          remoteAnalyser.fftSize = 512;
          remoteSource.connect(remoteAnalyser);
          remoteAnalysersRef.current.set(peerId, {
            analyser: remoteAnalyser,
            data: new Uint8Array(remoteAnalyser.frequencyBinCount),
            userId: remoteUserId,
          });

          setConnectionState("connected");
        });

        speakingLoopRef.current = window.setInterval(() => {
          const now = Date.now();
          const nextSpeaking = new Set<string>();

          const localAnalyser = localAnalyserRef.current;
          const localData = localAnalyserDataRef.current;
          if (localAnalyser && localData && userId) {
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

        const existingPeers = room.getPeers();
        if (Object.keys(existingPeers).length > 0) {
          console.log("Late joiner - existing peers:", Object.keys(existingPeers));
          if (localStreamRef.current && userId) {
            setTimeout(() => {
              const peersMap = room.getPeers();
              Object.keys(peersMap).forEach((peerId) => {
                if (localStreamRef.current) {
                  room.addStream(localStreamRef.current, peerId, { userId });
                }
              });
              Object.values(peersMap).forEach(pc => applyAudioBitrateLimit(pc));
            }, 1000);
          }
        }

        cleanupRef.current = () => {
          if (speakingLoopRef.current) {
            window.clearInterval(speakingLoopRef.current);
          }
          room.leave();
          cleanupAll();
        };

        setConnectionState("connected");
      } catch (error) {
        console.error("Failed to initialize voice room:", error);
        setAudioError(error instanceof Error ? error.message : "Unable to access microphone.");
        setConnectionState("disconnected");
      }
    };

    init();

    return () => {
      isCleanedUp = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      roomRef.current = null;
      setConnectionState("disconnected");
    };
  }, [enabled, roomId, userId, cleanupAll]);

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
    connectionState,
  };
}