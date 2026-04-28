import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { VerifiedBadge } from "@/components/ui/VerifiedLabel";
import { mockUsers } from "@/lib/constants/mockData";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import { subscribePublicUsers } from "@/lib/firebase/publicData";
import { saveLastVoiceRoom, getLastVoiceRoom, clearLastVoiceRoom } from "@/lib/utils/voiceRoomState";
import {
  VOICE_ROOM_MAX_PARTICIPANTS,
  closeVoiceRoom,
  createVoiceRoom,
  joinVoiceRoom,
  leaveVoiceRoom,
  pruneInactiveVoiceRooms,
  subscribeActiveVoiceRooms,
  touchVoiceRoom,
  type SocialVoiceRoom,
} from "@/lib/firebase/socialRooms";
import { useVoiceRoomAudio } from "@/features/social/useVoiceRoomAudio";
import type { UserModel } from "@/types/models";

const SOCIAL_ROOM_RETURN_KEY = "dreamledge-social-room-return";

type SocialHubTab = "voice-chat" | "public-chat" | "watch-parties" | "game-night" | "creator-lounge";

type SocialMember = {
  id: string;
  username: string;
  displayName: string;
  photoUrl: string;
  verified: boolean;
  bio: string;
};

const socialTabs: { key: SocialHubTab; label: string }[] = [
  { key: "voice-chat", label: "Voice Chat" },
  { key: "public-chat", label: "Public Chat" },
  { key: "watch-parties", label: "Watch Parties" },
  { key: "game-night", label: "Game Night" },
  { key: "creator-lounge", label: "Creator Lounge" },
];

const socialRooms: Record<Exclude<SocialHubTab, "voice-chat">, { name: string; status: string; members: string }[]> = {
  "public-chat": [
    { name: "General Chat", status: "Open thread", members: "1.2k active" },
    { name: "Hot Takes", status: "Trending topic", members: "510 active" },
    { name: "Memes Only", status: "Fast mode", members: "740 active" },
  ],
  "watch-parties": [
    { name: "Creator Clash Stream", status: "Party in progress", members: "221 watching" },
    { name: "Clip Breakdown Room", status: "Starting soon", members: "59 waiting" },
    { name: "Throwback Reel Night", status: "Queued", members: "96 waiting" },
  ],
  "game-night": [
    { name: "Trivia Sprint", status: "Round 3", members: "36 players" },
    { name: "Guess the Clip", status: "Live game", members: "77 players" },
    { name: "Speed Poll Arena", status: "Open lobby", members: "112 players" },
  ],
  "creator-lounge": [
    { name: "Collab Finder", status: "Networking", members: "89 online" },
    { name: "Brand Deal Tips", status: "Advice thread", members: "154 online" },
    { name: "Editing Workflow", status: "Q&A room", members: "61 online" },
  ],
};

function formatRoomOpenTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function formatRoomOpenHoursMinutes(elapsedMs: number) {
  const totalMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function getElapsedMs(nowMs: number, iso: string) {
  const parsed = new Date(iso).getTime();
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, nowMs - parsed);
}

function toSocialMember(entry: Pick<UserModel, "id" | "username" | "displayName" | "photoUrl" | "verified" | "bio">): SocialMember {
  return {
    id: entry.id,
    username: entry.username,
    displayName: entry.displayName,
    photoUrl: entry.photoUrl,
    verified: entry.verified,
    bio: entry.bio,
  };
}

function getSocialTabIcon(tab: SocialHubTab) {
  switch (tab) {
    case "voice-chat":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
          <path d="M12 3a4 4 0 0 0-4 4v5a4 4 0 1 0 8 0V7a4 4 0 0 0-4-4zm-7 8a1 1 0 0 1 1 1 6 6 0 0 0 12 0 1 1 0 1 1 2 0 8 8 0 0 1-7 7.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.06A8 8 0 0 1 4 12a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "public-chat":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
          <path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6.5L8 21v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "watch-parties":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
          <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2l4-3v16l-4-3v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm8 3v8l6-4-6-4z" />
        </svg>
      );
    case "game-night":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
          <path d="M7 6h10a4 4 0 0 1 4 4v3a5 5 0 0 1-5 5h-1l-2-2h-2l-2 2H8a5 5 0 0 1-5-5v-3a4 4 0 0 1 4-4zm1 4v2h2v2h2v-2h2v-2h-2V8h-2v2H8zm8 1.5a1.5 1.5 0 1 0 0 .01V11.5zm2 2a1.5 1.5 0 1 0 0 .01V13.5z" />
        </svg>
      );
    case "creator-lounge":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
          <path d="M12 2 9.2 7.6 3 8.5l4.5 4.4-1.1 6.1L12 16l5.6 3-1.1-6.1L21 8.5l-6.2-.9L12 2zm-7 18h14v2H5v-2z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SocialPage() {
  const { user, toggleFollow } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { startConversation } = useMessages();

  const [activeTab, setActiveTab] = useState<SocialHubTab>("voice-chat");
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [profilePreviewUserId, setProfilePreviewUserId] = useState<string | null>(null);
  const [voiceRooms, setVoiceRooms] = useState<SocialVoiceRoom[]>([]);
  const [publicUsers, setPublicUsers] = useState<UserModel[]>([]);
  const [roomNameDraft, setRoomNameDraft] = useState("");
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [isEndingRoom, setIsEndingRoom] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const activeRooms = useMemo(() => {
    if (activeTab === "voice-chat") return [];
    return socialRooms[activeTab];
  }, [activeTab]);

  const userById = useMemo(() => {
    const map = new Map<string, SocialMember>();

    mockUsers.forEach((entry) => {
      map.set(entry.id, toSocialMember(entry));
    });

    publicUsers.forEach((entry) => {
      map.set(entry.id, toSocialMember(entry));
    });

    if (user?.id && !map.has(user.id)) {
      map.set(user.id, {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        photoUrl: user.photoUrl || DEFAULT_AVATAR_URL,
        verified: Boolean(user.verified),
        bio: user.bio ?? "",
      });
    }

    return map;
  }, [publicUsers, user]);

  const liveVoiceRooms = useMemo(
    () =>
      voiceRooms.map((room) => {
        const elapsedMs = getElapsedMs(nowMs, room.createdAt);
        return {
          ...room,
          openTimeLabel: formatRoomOpenTime(elapsedMs),
          openDurationLabel: formatRoomOpenHoursMinutes(elapsedMs),
        };
      }),
    [nowMs, voiceRooms],
  );

  const userActiveRoom = useMemo(
    () => (user?.id ? liveVoiceRooms.find((room) => room.participantIds.includes(user.id)) ?? null : null),
    [liveVoiceRooms, user?.id],
  );

  const joinedRoom = useMemo(
    () => liveVoiceRooms.find((room) => room.id === joinedRoomId) ?? null,
    [joinedRoomId, liveVoiceRooms],
  );

const {
    isMicMuted,
    setMuted,
    retryRemotePlayback,
    audioError,
    speakingUserIds,
  } = useVoiceRoomAudio(joinedRoom?.id ?? null, user?.id ?? null, Boolean(joinedRoom && user?.id));

  const speakingUserSet = useMemo(() => new Set(speakingUserIds), [speakingUserIds]);

  const joinedRoomMembers = useMemo(() => {
    if (!joinedRoom) return [] as SocialMember[];
    return joinedRoom.participantIds.slice(0, VOICE_ROOM_MAX_PARTICIPANTS).map((id) => {
      const member = userById.get(id);
      if (member) return member;
      return {
        id,
        username: `user-${id.slice(0, 4)}`,
        displayName: "Creator",
        photoUrl: DEFAULT_AVATAR_URL,
        verified: false,
        bio: "",
      };
    });
  }, [joinedRoom, userById]);

  const joinableVoiceRooms = useMemo(
    () =>
      liveVoiceRooms.filter(
        (room) => room.participantIds.includes(user?.id ?? "") || room.participantIds.length < VOICE_ROOM_MAX_PARTICIPANTS,
      ),
    [liveVoiceRooms, user?.id],
  );

  const previewUser = useMemo(
    () => (profilePreviewUserId ? userById.get(profilePreviewUserId) ?? null : null),
    [profilePreviewUserId, userById],
  );

  const isPreviewUserFriend = useMemo(
    () => (previewUser ? (user?.followingIds ?? []).includes(previewUser.id) : false),
    [previewUser, user?.followingIds],
  );

  const canCreateRoom = Boolean(user?.id) && !userActiveRoom;
  const canEndJoinedRoom = Boolean(joinedRoom && user?.id && joinedRoom.createdBy === user.id);

  const handleJoinRoom = async (room: SocialVoiceRoom) => {
    if (!user?.id) {
      setSocialError("You must be logged in to join a room.");
      return;
    }

    if (userActiveRoom && userActiveRoom.id !== room.id) {
      setSocialError("You are already in an active room. Leave it before joining another.");
      return;
    }

    try {
      setSocialError(null);
      saveLastVoiceRoom(room.id);
      await joinVoiceRoom(room.id, user.id);
      setJoinedRoomId(room.id);
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : "Unable to join room.");
    }
  };

  const handleCreateRoom = async () => {
    if (!user?.id) {
      setSocialError("You must be logged in to create a room.");
      return;
    }

    if (!canCreateRoom) {
      setSocialError("You are already in an active room.");
      return;
    }

    const trimmedName = roomNameDraft.trim();
    if (!trimmedName) {
      setSocialError("Please enter a room name.");
      return;
    }

    try {
      setSocialError(null);
      setIsSubmittingRoom(true);
      const roomId = await createVoiceRoom(user.id, trimmedName);
      setRoomNameDraft("");
      setIsCreateRoomOpen(false);
      setJoinedRoomId(roomId);
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : "Unable to create room.");
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleLeaveCurrentRoom = async () => {
    if (!user?.id || !joinedRoomId) {
      setJoinedRoomId(null);
      return;
    }

    try {
      setSocialError(null);
      clearLastVoiceRoom();
      await leaveVoiceRoom(joinedRoomId, user.id);
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : "Unable to leave room.");
    } finally {
      setJoinedRoomId(null);
      setProfilePreviewUserId(null);
    }
  };

  const handleEndCurrentRoom = async () => {
    if (!joinedRoom || !user?.id) return;

    try {
      setSocialError(null);
      setIsEndingRoom(true);
      clearLastVoiceRoom();
      await closeVoiceRoom(joinedRoom.id, user.id);
      setJoinedRoomId(null);
      setProfilePreviewUserId(null);
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : "Unable to end room.");
    } finally {
      setIsEndingRoom(false);
    }
  };

  const handleGoToNextOpenRoom = () => {
    if (!joinableVoiceRooms.length) return;
    const currentIndex = joinableVoiceRooms.findIndex((room) => room.id === joinedRoomId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % joinableVoiceRooms.length;
    void handleJoinRoom(joinableVoiceRooms[nextIndex]);
  };

  const handleSendMessageFromProfile = () => {
    if (!user || !previewUser || previewUser.id === user.id) return;
    const conversationId = startConversation([user.id, previewUser.id]);
    setProfilePreviewUserId(null);

    const returnContext = {
      returnToPath: "/app/social",
      returnToVoiceRoomId: joinedRoomId,
      returnToTab: activeTab,
    };

    try {
      window.sessionStorage.setItem(SOCIAL_ROOM_RETURN_KEY, JSON.stringify(returnContext));
    } catch {
      // Ignore storage failures and rely on route state.
    }

    navigate(`/app/messages/${conversationId}`, {
      state: returnContext,
    });
  };

  const handleAddFriend = () => {
    if (!previewUser || previewUser.id === user?.id || isPreviewUserFriend) return;
    toggleFollow(previewUser.id);
  };

  useEffect(() => {
    const unsubscribePublicUsers = subscribePublicUsers(setPublicUsers);
    const unsubscribeVoiceRooms = subscribeActiveVoiceRooms(setVoiceRooms, (error) => {
      setSocialError(error.message || "Unable to load social rooms right now.");
    });

    return () => {
      unsubscribePublicUsers();
      unsubscribeVoiceRooms();
    };
  }, []);

  useEffect(() => {
    void pruneInactiveVoiceRooms();
    const cleanup = window.setInterval(() => {
      void pruneInactiveVoiceRooms();
    }, 60_000);

    return () => window.clearInterval(cleanup);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const state = location.state as { restoreVoiceRoomId?: string; restoreTab?: SocialHubTab } | null;
    if (!state) return;
    if (state.restoreTab) setActiveTab(state.restoreTab);
    if (state.restoreVoiceRoomId) setJoinedRoomId(state.restoreVoiceRoomId);
  }, [location.state]);

  useEffect(() => {
    if (!user?.id || joinedRoomId) return;
    const lastRoomId = getLastVoiceRoom();
    if (!lastRoomId) return;
    const room = liveVoiceRooms.find((r) => r.id === lastRoomId);
    if (!room) return;
    if (!room.participantIds.includes(user.id)) return;
    const handleAutoRejoin = async () => {
      try {
        await joinVoiceRoom(room.id, user.id);
        setJoinedRoomId(room.id);
      } catch {
        // Auto-rejoin failed, ignore
      }
    };
    handleAutoRejoin();
  }, [user?.id, joinedRoomId, liveVoiceRooms]);

  useEffect(() => {
    if (!joinedRoomId) return;
    const exists = liveVoiceRooms.some((room) => room.id === joinedRoomId);
    if (!exists) {
      setJoinedRoomId(null);
      setProfilePreviewUserId(null);
    }
  }, [joinedRoomId, liveVoiceRooms]);

  useEffect(() => {
    if (!joinedRoomId) return;

    void touchVoiceRoom(joinedRoomId);
    const heartbeat = window.setInterval(() => {
      void touchVoiceRoom(joinedRoomId);
    }, 60_000);

    return () => window.clearInterval(heartbeat);
  }, [joinedRoomId]);

  useEffect(() => {
    if (!audioError) return;
    if (socialError === audioError) return;
    setSocialError(audioError);
  }, [audioError]);

  useEffect(() => {
    if (!joinedRoomId || !user?.id) return;

    const retryAudio = () => {
      retryRemotePlayback().catch(() => {});
    };

    const handleInteraction = () => {
      retryAudio();
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("click", handleInteraction);
    };

    document.addEventListener("touchstart", handleInteraction);
    document.addEventListener("click", handleInteraction);

    return () => {
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("click", handleInteraction);
    };
  }, [joinedRoomId, user?.id]);

  useEffect(() => {
    if (!joinedRoomId || !user?.id) return;

    let wasHidden = false;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        wasHidden = true;
        return;
      }

      if (wasHidden && joinedRoomId) {
        wasHidden = false;
        
        const room = liveVoiceRooms.find((r) => r.id === joinedRoomId);
        if (room && room.participantIds.includes(user.id)) {
          try {
            await retryRemotePlayback();
          } catch {
            // Retry failed, will try again on next interaction
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [joinedRoomId, user?.id, liveVoiceRooms]);

  if (joinedRoom) {
    const listenerCount = joinedRoomMembers.length;
    
    return (
      <div className="messages-page voice-room-page">
        <div className="messages-header voice-room-header">
          <button type="button" className="messages-header__back" onClick={() => void handleLeaveCurrentRoom()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="messages-header__title">{joinedRoom.name}</h1>
          <div className="voice-room-live-badge">
            <span className="voice-room-live-dot"></span>
            <span>LIVE</span>
          </div>
        </div>

        <div className="voice-room-content">
          <div className="voice-room-timer-card">
            <span className="voice-room-timer-label">DURATION</span>
            <span className="voice-room-timer">{joinedRoom.openTimeLabel}</span>
            <div className="voice-room-pills">
              <span className="voice-room-pill">EN</span>
              <span className="voice-room-pill">{listenerCount} listening</span>
            </div>
          </div>

          <div className="voice-room-controls">
            <button type="button" className="voice-room-control-btn" aria-label="Grid view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button type="button" className="voice-room-control-btn" aria-label="Previous room" onClick={handleGoToNextOpenRoom}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button type="button" className="voice-room-control-btn" aria-label="Next room" onClick={handleGoToNextOpenRoom}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button type="button" className="voice-room-control-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          </div>

          <div className="voice-room-actions">
            <button
              type="button"
              className="voice-room-action-btn voice-room-unmute-btn"
              aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              onClick={() => void setMuted(!isMicMuted)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMicMuted ? (
                  <path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4m-4 0h8"/>
                ) : (
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8"/>
                )}
              </svg>
              <span>{isMicMuted ? "Unmute" : "Mute"}</span>
            </button>
            {canEndJoinedRoom ? (
              <button type="button" className="voice-room-action-btn voice-room-end-btn" onClick={() => void handleEndCurrentRoom()} disabled={isEndingRoom}>
                {isEndingRoom ? "Ending..." : "End Room"}
              </button>
            ) : (
              <button type="button" className="voice-room-action-btn voice-room-leave-btn" onClick={() => void handleLeaveCurrentRoom()}>
                Leave
              </button>
            )}
          </div>

          <button type="button" className="voice-room-invite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span>Invite friends</span>
          </button>

          <div className="voice-room-member-section">
            <span className="voice-room-member-label">IN ROOM</span>
            <div className="voice-room-member-list">
              {joinedRoomMembers.map((member) => (
                <div key={member.id} className="voice-room-member">
                  <div className="voice-room-member-avatar-wrap">
                    <img
                      src={member.photoUrl}
                      alt={member.displayName}
                      className={`voice-room-member-avatar ${speakingUserSet.has(member.id) ? "voice-room-member-avatar--speaking" : ""}`}
                    />
                    <span className={`voice-room-member-status ${member.id === user?.id ? "voice-room-member-status--self" : ""}`}></span>
                  </div>
                  <div className="voice-room-member-info">
                    <span className="voice-room-member-name">
                      {member.displayName || member.username}
                      {member.verified && <VerifiedBadge className="voice-room-member-verified" />}
                    </span>
                    <span className="voice-room-member-role">
                      {member.id === joinedRoom.createdBy ? "Host" : "Listener"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {previewUser ? (
          <div className="social-profile-sheet-overlay" onClick={() => setProfilePreviewUserId(null)}>
            <div className="social-profile-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="social-profile-sheet__handle" />
              <button type="button" className="social-profile-sheet__close" onClick={() => setProfilePreviewUserId(null)} aria-label="Close profile modal">
                ×
              </button>
              <div className="social-profile-sheet__header">
                <img src={previewUser.photoUrl} alt={previewUser.displayName} className="social-profile-sheet__avatar" />
                <div className="social-profile-sheet__identity">
                  <div className="social-profile-sheet__name-row">
                    <span className="social-profile-sheet__name">{previewUser.displayName}</span>
                    {previewUser.verified ? <VerifiedBadge className="social-profile-sheet__verified" /> : null}
                  </div>
                  <span className="social-profile-sheet__username">@{previewUser.username}</span>
                </div>
              </div>
              <p className="social-profile-sheet__bio">{previewUser.bio}</p>
              <div className="social-profile-sheet__actions">
                <button type="button" className="social-profile-sheet__action" onClick={handleAddFriend} disabled={previewUser.id === user?.id || isPreviewUserFriend}>
                  {isPreviewUserFriend ? "Friend Added" : "Add Friend"}
                </button>
                <button type="button" className="social-profile-sheet__action social-profile-sheet__action-secondary" onClick={handleSendMessageFromProfile} disabled={previewUser.id === user?.id}>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1 className="messages-header__title">Social</h1>
      </div>

      <div className="feed-tabs-container" role="tablist" aria-label="Social channel categories">
        {socialTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`feed-tab ${activeTab === tab.key ? "feed-tab-active" : "feed-tab-inactive"}`}
            onClick={() => {
              setActiveTab(tab.key);
              setSocialError(null);
            }}
          >
            <span className="feed-tab-icon">{getSocialTabIcon(tab.key)}</span>
            <span className="feed-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "voice-chat" ? (
        <div className="social-create-room-wrap">
          <button
            type="button"
            className="cta-button edit-profile w-full"
            onClick={() => setIsCreateRoomOpen((value) => !value)}
            disabled={!canCreateRoom && !isCreateRoomOpen}
          >
            {isCreateRoomOpen ? "Close" : "Create Room"}
          </button>
          <p className="social-create-room-note">Each user can only be in one active room at a time.</p>

          {isCreateRoomOpen ? (
            <div className="social-create-room-form">
              <input
                value={roomNameDraft}
                onChange={(event) => setRoomNameDraft(event.target.value)}
                className="social-create-room-input"
                placeholder="Enter room name"
                maxLength={48}
              />
              <div className="social-create-room-actions">
                <button type="button" className="cta-button edit-profile" onClick={handleCreateRoom} disabled={isSubmittingRoom || !roomNameDraft.trim()}>
                  {isSubmittingRoom ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {socialError ? <p className="social-create-room-error">{socialError}</p> : null}

      {activeTab === "voice-chat" ? (
        <div className="social-hub-voice-list">
          {!liveVoiceRooms.length ? (
            <div className="social-hub-empty-state">No active voice rooms yet. Create one to get started.</div>
          ) : null}

          {liveVoiceRooms.map((room) => {
            const isMember = room.participantIds.includes(user?.id ?? "");
            const isFull = !isMember && room.participantIds.length >= VOICE_ROOM_MAX_PARTICIPANTS;

            return (
              <div key={room.id} className="social-hub-voice-card">
                <div className="social-hub-voice-card__top">
                  <div className="social-hub-voice-card__category">
                    <span className="social-hub-voice-card__mic" aria-hidden="true">🎙</span>
                    <span>{room.name}</span>
                  </div>
                  <span className="social-hub-voice-card__timer" title="Room open duration (hours:minutes)">{room.openDurationLabel}</span>
                </div>

                <div className="social-hub-voice-card__bottom">
                  <div className="social-hub-voice-card__participants">
                    {room.participantIds.slice(0, VOICE_ROOM_MAX_PARTICIPANTS).map((id) => {
                      const participant = userById.get(id);
                      if (!participant) return null;
                      return (
                        <div key={id} className="social-hub-voice-user">
                          <img src={participant.photoUrl} alt={participant.displayName} className="social-hub-voice-user__avatar" />
                          <div className="social-hub-voice-user__name-row">
                            <span className="social-hub-voice-user__name">{participant.username}</span>
                            {participant.verified ? <VerifiedBadge className="social-hub-voice-user__verified" /> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="social-hub-voice-card__join"
                    onClick={() => void handleJoinRoom(room)}
                    disabled={isFull}
                  >
                    {isMember ? "Open" : isFull ? "Full" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="social-hub-list">
          {activeRooms.map((room) => (
            <button key={room.name} type="button" className="social-hub-room">
              <div className="social-hub-room__title">{room.name}</div>
              <div className="social-hub-room__meta">{room.status}</div>
              <div className="social-hub-room__count">{room.members}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
