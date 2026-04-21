import { useEffect, useMemo, useState } from "react";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedBadge } from "@/components/ui/VerifiedLabel";

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

const voiceRooms = [
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

export function MessagesPage() {
  const [activeTab, setActiveTab] = useState<SocialHubTab>("voice-chat");
  const activeRooms = useMemo(() => socialRooms[activeTab], [activeTab]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const userById = useMemo(() => new Map(mockUsers.map((user) => [user.id, user])), []);
  const liveVoiceRooms = useMemo(
    () =>
      voiceRooms.map((room) => ({
        ...room,
        openTimeLabel: formatRoomOpenTime(nowMs - room.openedAtMs),
      })),
    [nowMs],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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
            <button key={room.id} type="button" className="social-hub-voice-card">
              <div className="social-hub-voice-card__top">
                <div className="social-hub-voice-card__category">
                  <span className="social-hub-voice-card__mic" aria-hidden="true">🎙</span>
                  <span>{room.category}</span>
                </div>
                <span className="social-hub-voice-card__timer" title="Room open duration">{room.openTimeLabel}</span>
              </div>

              <div className="social-hub-voice-card__bottom">
                <div className="social-hub-voice-card__participants">
                  {room.participantIds.map((id) => {
                    const user = userById.get(id);
                    if (!user) return null;
                    return (
                      <div key={id} className="social-hub-voice-user">
                        <img src={user.photoUrl} alt={user.displayName} className="social-hub-voice-user__avatar" />
                        <div className="social-hub-voice-user__name-row">
                          <span className="social-hub-voice-user__name">{user.username}</span>
                          {user.verified ? <VerifiedBadge className="social-hub-voice-user__verified" /> : null}
                        </div>
                      </div>
                    );
                  })}
                  {room.extraCount > 0 ? <span className="social-hub-voice-user__more">+{room.extraCount}</span> : null}
                </div>

                <span className="social-hub-voice-card__join">Join</span>
              </div>
            </button>
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
