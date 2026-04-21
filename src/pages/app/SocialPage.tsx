import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMessages } from "@/app/providers/MessagesProvider";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedBadge } from "@/components/ui/VerifiedLabel";

const SOCIAL_ROOM_RETURN_KEY = "dreamledge-social-room-return";

type SocialHubTab = "voice-chat" | "public-chat" | "watch-parties" | "game-night" | "creator-lounge";

const socialTabs: { key: SocialHubTab; label: string }[] = [
  { key: "voice-chat", label: "Voice Chat" },
  { key: "public-chat", label: "Public Chat" },
  { key: "watch-parties", label: "Watch Parties" },
  { key: "game-night", label: "Game Night" },
  { key: "creator-lounge", label: "Creator Lounge" },
];

const socialRooms: Record<SocialHubTab, { name: string; status: string; members: string }[]> = {
  "voice-chat": [
    { name: "Late Night Debates", status: "Live voice room", members: "128 listening" },
    { name: "Creator Feedback Lab", status: "Mic open", members: "42 joined" },
    { name: "Music & Reactions", status: "Now talking", members: "84 listening" },
  ],
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

type VoiceRoom = {
  id: string;
  category: string;
  openedAtMs: number;
  participantIds: string[];
  extraCount: number;
};

const voiceRooms: VoiceRoom[] = [
  { id: "vr-1", category: "Fandom", openedAtMs: Date.now() - (57 * 60 * 1000 + 40 * 1000), participantIds: ["u1", "u2", "u5"], extraCount: 0 },
  { id: "vr-2", category: "TV Shows", openedAtMs: Date.now() - (95 * 60 * 1000 + 12 * 1000), participantIds: ["u3", "u4", "u2"], extraCount: 2 },
  { id: "vr-3", category: "Universities", openedAtMs: Date.now() - (8 * 60 * 1000 + 7 * 1000), participantIds: ["u5", "u1"], extraCount: 0 },
  { id: "vr-4", category: "TV Shows", openedAtMs: Date.now() - (80 * 60 * 1000 + 52 * 1000), participantIds: ["u4", "u3", "u2"], extraCount: 3 },
];

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
  const activeRooms = useMemo(() => socialRooms[activeTab], [activeTab]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const userById = useMemo(() => new Map(mockUsers.map((entry) => [entry.id, entry])), []);

  const liveVoiceRooms = useMemo(
    () =>
      voiceRooms.map((room) => ({
        ...room,
        openTimeLabel: formatRoomOpenTime(nowMs - room.openedAtMs),
        openDurationLabel: formatRoomOpenHoursMinutes(nowMs - room.openedAtMs),
      })),
    [nowMs],
  );

  const joinableVoiceRooms = useMemo(
    () => liveVoiceRooms.filter((room) => room.participantIds.length + room.extraCount > 0 && room.participantIds.length + room.extraCount < 4),
    [liveVoiceRooms],
  );

  const joinedRoom = useMemo(() => liveVoiceRooms.find((room) => room.id === joinedRoomId) ?? null, [joinedRoomId, liveVoiceRooms]);

  const joinedRoomMembers = useMemo(() => {
    if (!joinedRoom) return [];

    const members = joinedRoom.participantIds
      .map((id) => userById.get(id))
      .filter((entry): entry is (typeof mockUsers)[number] => !!entry)
      .slice(0, 4);

    if (user && members.length < 4 && !members.some((entry) => entry.id === user.id)) {
      const currentUser = userById.get(user.id);
      if (currentUser) {
        members.push(currentUser);
      }
    }

    return members;
  }, [joinedRoom, user, userById]);

  const previewUser = useMemo(() => (profilePreviewUserId ? userById.get(profilePreviewUserId) ?? null : null), [profilePreviewUserId, userById]);

  const isPreviewUserFriend = useMemo(
    () => (previewUser ? (user?.followingIds ?? []).includes(previewUser.id) : false),
    [previewUser, user?.followingIds],
  );

  const handleJoinRoom = (room: VoiceRoom) => {
    const totalCount = room.participantIds.length + room.extraCount;
    if (totalCount >= 4) return;
    setJoinedRoomId(room.id);
  };

  const handleGoToNextOpenRoom = () => {
    if (!joinableVoiceRooms.length) return;
    const currentIndex = joinableVoiceRooms.findIndex((room) => room.id === joinedRoomId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % joinableVoiceRooms.length;
    setJoinedRoomId(joinableVoiceRooms[nextIndex].id);
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
      // Ignore storage failures and rely on route state
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

  if (joinedRoom) {
    return (
      <div className="messages-page">
        <div className="messages-header">
          <button type="button" className="messages-header__back" onClick={() => setJoinedRoomId(null)} aria-label="Back to social rooms">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="messages-header__title">Voice Room</h1>
        </div>

        <div className="social-voice-room">
          <div className="social-voice-room__hero">
            <div className="social-voice-room__live">Live {joinedRoom.openTimeLabel}</div>
            <div className="social-voice-room__clock">{joinedRoom.openTimeLabel}</div>
            <div className="social-voice-room__lang">EN</div>
          </div>

          <div className="social-voice-room__controls">
            <button type="button" className="social-voice-room__ctrl" aria-label="Grid view">▦</button>
            <button type="button" className="social-voice-room__ctrl" aria-label="Next open room" onClick={handleGoToNextOpenRoom}>◀</button>
            <button type="button" className="social-voice-room__ctrl" aria-label="Next open room" onClick={handleGoToNextOpenRoom}>▶</button>
            <button type="button" className="social-voice-room__ctrl" aria-label="Search">⌕</button>
          </div>

          <button type="button" className="social-voice-room__invite">+ Invite friends</button>

          <div className="social-voice-room__member-list">
            {joinedRoomMembers.map((member) => (
              <div key={member.id} className="social-voice-room__member">
                <div className="social-voice-room__member-main">
                  <img src={member.photoUrl} alt={member.displayName} className="social-voice-room__member-avatar" />
                  <span className="social-voice-room__member-name">{member.username}</span>
                  {member.verified ? <VerifiedBadge className="social-voice-room__member-verified" /> : null}
                </div>
                {member.id !== user?.id ? (
                  <div className="social-voice-room__member-actions">
                    <button
                      type="button"
                      className="social-voice-room__member-action"
                      aria-label={`Open ${member.username} profile`}
                      onClick={() => setProfilePreviewUserId(member.id)}
                    >
                      👥
                    </button>
                    <button type="button" className="social-voice-room__member-action" aria-label="Favorite user">❤</button>
                  </div>
                ) : null}
              </div>
            ))}
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
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="feed-tab-icon">{getSocialTabIcon(tab.key)}</span>
            <span className="feed-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "voice-chat" ? (
        <div className="social-hub-voice-list">
          {liveVoiceRooms.map((room) => (
            <div key={room.id} className="social-hub-voice-card">
              <div className="social-hub-voice-card__top">
                <div className="social-hub-voice-card__category">
                  <span className="social-hub-voice-card__mic" aria-hidden="true">🎙</span>
                  <span>{room.category}</span>
                </div>
                <span className="social-hub-voice-card__timer" title="Room open duration (hours:minutes)">{room.openDurationLabel}</span>
              </div>

              <div className="social-hub-voice-card__bottom">
                <div className="social-hub-voice-card__participants">
                  {room.participantIds.map((id) => {
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
                  {room.extraCount > 0 ? <span className="social-hub-voice-user__more">+{room.extraCount}</span> : null}
                </div>

                <button
                  type="button"
                  className="social-hub-voice-card__join"
                  onClick={() => handleJoinRoom(room)}
                  disabled={room.participantIds.length + room.extraCount >= 4}
                >
                  {room.participantIds.length + room.extraCount >= 4 ? "Full" : "Join"}
                </button>
              </div>
            </div>
          ))}
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
