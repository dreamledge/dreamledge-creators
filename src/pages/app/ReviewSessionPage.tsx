import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ContentCard } from "@/components/cards/ContentCard";
import { FeedProvider, useFeedContext } from "@/components/feed/FeedList";
import { CommentModal, CommentModalProvider } from "@/components/overlays/CommentModal";
import { mockContent, mockUsers } from "@/lib/constants/mockData";
import { MIN_WATCH_TIME } from "@/lib/constants/reviewSessions";
import type { ContentModel, ReviewCategory, ReviewScoreLabel, ReviewScores } from "@/types/models";

const MATCHMAKING_DURATION_MS = 3000;
const MATCHMAKING_FRAME_MS = 120;
const BLINK_DURATION_MS = 850;
const SCREENING_ENTRY_MS = 900;
const EYE_STAGE_MS = 1300;
const TITLE_REVEAL_MS = 1100;
const VIDEO_REVEAL_MS = 900;
const SUBMITTING_MS = 1000;
const RESTART_MATCHING_MS = 900;
const TALK_DURATION_MS = 180000;
const TALK_FALLBACK_MS = 12000;

type PostMatchPhase =
  | null
  | "screeningEntry"
  | "eye"
  | "titleReveal"
  | "videoReveal"
  | "videoWatching"
  | "reviewUnlocked"
  | "submitted"
  | "decision"
  | "talk"
  | "restarting";

const ORWELLIAN_PLACEHOLDER = {
  photoUrl: "",
  username: "waiting_match",
  displayName: "Waiting Match",
  role: "Waiting for match",
  verified: false,
};

const reviewOptions: { label: string; value: ReviewScoreLabel }[] = [
  { label: "Trash", value: "trash" },
  { label: "Ok", value: "ok" },
  { label: "Fire", value: "fire" },
];

function createEmptyScores(): ReviewScores {
  return { creativity: null, execution: null, entertainment: null };
}

function ReviewSessionVerifiedBadge() {
  return (
    <span className="review-session-verified-badge" aria-label="Verified user">
      <svg viewBox="0 0 20 20" className="verified-label__icon review-session-verified-icon">
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path d="M8.55 12.95 5.9 10.3l1.05-1.05 1.6 1.6 4.5-4.5 1.05 1.05-5.55 5.55Z" fill="white" />
      </svg>
    </span>
  );
}

function OrwellianEyeAvatar({ blinking }: { blinking: boolean }) {
  return (
    <div className={`review-session-orwellian-eye ${blinking ? "review-session-orwellian-eye-blinking" : ""}`} aria-label="Waiting match eye avatar">
      <div className="review-session-orwellian-sclera">
        <div className="review-session-orwellian-iris">
          <div className="review-session-orwellian-pupil" />
          <div className="review-session-orwellian-glint" />
        </div>
      </div>
      <div className="review-session-orwellian-lid review-session-orwellian-lid-top" />
      <div className="review-session-orwellian-lid review-session-orwellian-lid-bottom" />
    </div>
  );
}

function ReviewSessionFeedAutoplay({ content }: { content: ContentModel }) {
  const { setCurrentPlaying } = useFeedContext();

  useEffect(() => {
    setCurrentPlaying(content.id);
    return () => setCurrentPlaying(null);
  }, [content.id, setCurrentPlaying]);

  return <ContentCard content={content} />;
}

function ReviewSessionHomeStyleCard({ content }: { content: ContentModel }) {
  return (
    <CommentModalProvider>
      <FeedProvider>
        <div className="review-session-home-card-wrap">
          <ReviewSessionFeedAutoplay content={content} />
        </div>
        <CommentModal />
      </FeedProvider>
    </CommentModalProvider>
  );
}

function formatTalkTime(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ReviewSessionPage() {
  const { user } = useAuth();
  const [matchingMessage, setMatchingMessage] = useState("Tap start matching to begin pairing.");
  const [isMatching, setIsMatching] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [postMatchPhase, setPostMatchPhase] = useState<PostMatchPhase>(null);
  const [activeMatchContent, setActiveMatchContent] = useState<ContentModel | null>(null);
  const [reviewScores, setReviewScores] = useState<ReviewScores>(createEmptyScores());
  const [watchElapsedMs, setWatchElapsedMs] = useState(0);
  const [reviewUnlockFlash, setReviewUnlockFlash] = useState(false);
  const [talkRemainingMs, setTalkRemainingMs] = useState(TALK_DURATION_MS);
  const [canTalkFallback, setCanTalkFallback] = useState(false);
  const scaryEyeAudioRef = useRef<HTMLAudioElement | null>(null);
  const matchIntervalRef = useRef<number | null>(null);
  const matchTimeoutRef = useRef<number | null>(null);
  const continuationTimeoutsRef = useRef<number[]>([]);
  const watchIntervalRef = useRef<number | null>(null);
  const talkIntervalRef = useRef<number | null>(null);
  const talkFallbackTimeoutRef = useRef<number | null>(null);

  const currentCreator = useMemo(() => {
    if (!user) return mockUsers[0];

    return (
      mockUsers.find((entry) => entry.id === user.id) ??
      mockUsers.find((entry) => entry.username === user.username) ??
      mockUsers.find((entry) => entry.email === user.email) ?? {
        ...mockUsers[0],
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        photoUrl: user.photoUrl,
        email: user.email,
      }
    );
  }, [user]);

  const matchableOpponents = useMemo(() => mockUsers.filter((entry) => entry.id !== currentCreator.id), [currentCreator.id]);
  const finalOpponent = useMemo(
    () => matchableOpponents.find((entry) => entry.username === "berto_brown") ?? matchableOpponents[0] ?? currentCreator,
    [currentCreator, matchableOpponents],
  );
  const [displayedOpponent, setDisplayedOpponent] = useState<typeof finalOpponent | null>(null);

  const allReviewSelected = useMemo(
    () => Object.values(reviewScores).every((value) => value !== null),
    [reviewScores],
  );
  const reviewUnlocked = postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk" || postMatchPhase === "restarting";
  const postMatchActive = postMatchPhase !== null;
  const isVideoPhase = postMatchPhase === "videoReveal" || postMatchPhase === "videoWatching" || postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk";

  const clearContinuationTimers = () => {
    continuationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    continuationTimeoutsRef.current = [];

    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }

    if (talkIntervalRef.current) {
      window.clearInterval(talkIntervalRef.current);
      talkIntervalRef.current = null;
    }

    if (talkFallbackTimeoutRef.current) {
      window.clearTimeout(talkFallbackTimeoutRef.current);
      talkFallbackTimeoutRef.current = null;
    }
  };

  const resetPostMatchState = () => {
    clearContinuationTimers();
    setPostMatchPhase(null);
    setActiveMatchContent(null);
    setReviewScores(createEmptyScores());
    setWatchElapsedMs(0);
    setReviewUnlockFlash(false);
    setTalkRemainingMs(TALK_DURATION_MS);
    setCanTalkFallback(false);
  };

  const resetToIdle = () => {
    if (matchIntervalRef.current) {
      window.clearInterval(matchIntervalRef.current);
      matchIntervalRef.current = null;
    }
    if (matchTimeoutRef.current) {
      window.clearTimeout(matchTimeoutRef.current);
      matchTimeoutRef.current = null;
    }

    resetPostMatchState();
    setDisplayedOpponent(null);
    setIsMatching(false);
    setIsBlinking(false);
    setMatchingMessage("Tap start matching to begin pairing.");
  };

  useEffect(() => {
    resetToIdle();
  }, [currentCreator.id]);

  useEffect(() => {
    return () => {
      resetPostMatchState();
      if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
      if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
      scaryEyeAudioRef.current?.pause();
      scaryEyeAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (postMatchPhase !== "videoWatching" && postMatchPhase !== "reviewUnlocked") {
      if (watchIntervalRef.current) {
        window.clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      return;
    }

    watchIntervalRef.current = window.setInterval(() => {
      setWatchElapsedMs((current) => current + 1000);
    }, 1000);

    return () => {
      if (watchIntervalRef.current) {
        window.clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
    };
  }, [postMatchPhase]);

  const resolveOpponentContent = (opponentId: string) => {
    const directMatch = mockContent
      .filter((item) => item.creatorId === opponentId && item.status !== "live")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return directMatch ?? mockContent.find((item) => item.status !== "live") ?? null;
  };

  const beginPostMatchFlow = (matchedOpponent: typeof finalOpponent) => {
    const matchedContent = resolveOpponentContent(matchedOpponent.id);
    setActiveMatchContent(matchedContent);
    setReviewScores(createEmptyScores());
    setWatchElapsedMs(0);
    setReviewUnlockFlash(false);
    setTalkRemainingMs(TALK_DURATION_MS);
    setCanTalkFallback(false);
    setPostMatchPhase("screeningEntry");

    const eyeTimeout = window.setTimeout(() => setPostMatchPhase("eye"), SCREENING_ENTRY_MS);
    const titleTimeout = window.setTimeout(() => setPostMatchPhase("titleReveal"), SCREENING_ENTRY_MS + EYE_STAGE_MS);
    const revealTimeout = window.setTimeout(() => setPostMatchPhase("videoReveal"), SCREENING_ENTRY_MS + EYE_STAGE_MS + TITLE_REVEAL_MS);
    const watchingTimeout = window.setTimeout(() => {
      setPostMatchPhase("videoWatching");
      setWatchElapsedMs(0);
    }, SCREENING_ENTRY_MS + EYE_STAGE_MS + TITLE_REVEAL_MS + VIDEO_REVEAL_MS);
    const unlockTimeout = window.setTimeout(() => {
      setPostMatchPhase("reviewUnlocked");
      setReviewUnlockFlash(true);
      const flashTimeout = window.setTimeout(() => setReviewUnlockFlash(false), 1200);
      continuationTimeoutsRef.current.push(flashTimeout);
    }, SCREENING_ENTRY_MS + EYE_STAGE_MS + TITLE_REVEAL_MS + VIDEO_REVEAL_MS + MIN_WATCH_TIME);

    continuationTimeoutsRef.current.push(eyeTimeout, titleTimeout, revealTimeout, watchingTimeout, unlockTimeout);
  };

  const startMatchmakingSequence = ({ playSound }: { playSound: boolean }) => {
    if (isMatching || isBlinking || !matchableOpponents.length) return;

    if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
    if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
    resetPostMatchState();

    if (playSound) {
      if (!scaryEyeAudioRef.current) {
        scaryEyeAudioRef.current = new Audio("/scaryeyesound.mp3");
      }
      scaryEyeAudioRef.current.currentTime = 0;
      void scaryEyeAudioRef.current.play().catch(() => undefined);
    }

    setIsBlinking(true);
    setDisplayedOpponent(null);

    matchTimeoutRef.current = window.setTimeout(() => {
      setIsBlinking(false);
      setIsMatching(true);
      setMatchingMessage("Matchmaking in progress. Scanning creators now.");

      matchIntervalRef.current = window.setInterval(() => {
        const randomOpponent = matchableOpponents[Math.floor(Math.random() * matchableOpponents.length)] ?? finalOpponent;
        setDisplayedOpponent(randomOpponent);
      }, MATCHMAKING_FRAME_MS);

      matchTimeoutRef.current = window.setTimeout(() => {
        if (matchIntervalRef.current) {
          window.clearInterval(matchIntervalRef.current);
          matchIntervalRef.current = null;
        }

        setDisplayedOpponent(finalOpponent);
        setIsMatching(false);
        setMatchingMessage("");
        beginPostMatchFlow(finalOpponent);
      }, MATCHMAKING_DURATION_MS);
    }, BLINK_DURATION_MS);
  };

  const handleStartMatching = () => {
    startMatchmakingSequence({ playSound: true });
  };

  const handleSubmitReview = () => {
    if (!reviewUnlocked || !allReviewSelected) return;

    setPostMatchPhase("submitted");
    const decisionTimeout = window.setTimeout(() => setPostMatchPhase("decision"), SUBMITTING_MS);
    continuationTimeoutsRef.current.push(decisionTimeout);
  };

  const handleStayAndTalk = () => {
    setPostMatchPhase("talk");
    setTalkRemainingMs(TALK_DURATION_MS);
    setCanTalkFallback(false);

    talkIntervalRef.current = window.setInterval(() => {
      setTalkRemainingMs((current) => {
        if (current <= 1000) {
          if (talkIntervalRef.current) {
            window.clearInterval(talkIntervalRef.current);
            talkIntervalRef.current = null;
          }
          handleRestartMatchmaking(true);
          return 0;
        }
        return current - 1000;
      });
    }, 1000);

    talkFallbackTimeoutRef.current = window.setTimeout(() => setCanTalkFallback(true), TALK_FALLBACK_MS);
  };

  const handleRestartMatchmaking = (fromTalk = false) => {
    clearContinuationTimers();
    setPostMatchPhase("restarting");
    setMatchingMessage(fromTalk ? "Session Complete. Finding next creator..." : "Finding next creator...");

    const restartTimeout = window.setTimeout(() => {
      resetToIdle();
      startMatchmakingSequence({ playSound: false });
    }, RESTART_MATCHING_MS);
    continuationTimeoutsRef.current.push(restartTimeout);
  };

  const rightProfile = displayedOpponent
    ? {
        photoUrl: displayedOpponent.photoUrl,
        username: displayedOpponent.username,
        displayName: displayedOpponent.displayName,
        role: "Ready to review",
        verified: displayedOpponent.verified,
      }
    : ORWELLIAN_PLACEHOLDER;

  const showOrwellianEye = !displayedOpponent;
  const watchUnlockedProgress = Math.min(100, (watchElapsedMs / MIN_WATCH_TIME) * 100);

  return (
    <div className={`review-session-matchup-page ${postMatchActive ? "review-session-matchup-page-screening" : ""}`}>
      <div className={`review-session-match-card ${postMatchActive ? "review-session-match-card-post" : ""} ${isVideoPhase ? "review-session-match-card-watch" : ""} ${reviewUnlockFlash ? "review-session-match-card-unlocked" : ""}`}>
        <div className={`review-session-intro-shell ${postMatchActive ? "review-session-intro-shell-faded" : ""}`}>
          <h1 className="review-session-match-title">Judge for Judge</h1>
          <p className="review-session-match-subtitle">Creator matchup loading</p>

          <div className="review-session-arena">
            <div className="review-session-beam review-session-beam-left" />
            <div className="review-session-beam review-session-beam-right" />

            <div className="review-session-user review-session-user-left">
              {currentCreator.verified ? <ReviewSessionVerifiedBadge /> : null}
              <div className="review-session-avatar-wrap">
                <img className="review-session-avatar" src={currentCreator.photoUrl} alt={currentCreator.displayName} />
              </div>
              <div className="review-session-username">@{currentCreator.username}</div>
              <div className="review-session-role">Ready to review</div>
            </div>

            <div className="review-session-center-badge">
              <div className="review-session-center-text">Match<br />Up</div>
            </div>

            <div className="review-session-user review-session-user-right">
              {rightProfile.verified ? <ReviewSessionVerifiedBadge /> : null}
              <div className={`review-session-avatar-wrap ${isMatching ? "review-session-avatar-wrap-matching" : ""}`}>
                {showOrwellianEye ? (
                  <OrwellianEyeAvatar blinking={isBlinking} />
                ) : (
                  <img className={`review-session-avatar ${isMatching ? "review-session-avatar-matching" : ""}`} src={rightProfile.photoUrl} alt={rightProfile.displayName} />
                )}
              </div>
              <div className="review-session-username">@{rightProfile.username}</div>
              <div className="review-session-role">{rightProfile.role}</div>
            </div>
          </div>

          <div className="review-session-actions">
            <button
              type="button"
              className="cta-button edit-profile review-session-action-button"
              onClick={handleStartMatching}
              disabled={isMatching || isBlinking || postMatchActive}
            >
              {isBlinking ? "Initializing..." : isMatching ? "Matching..." : "Start Matching"}
            </button>
            <Link to="/app/create" className="cta-button edit-profile review-session-action-button review-session-action-link">
              Add Your Content
            </Link>
          </div>

          <div className="review-session-status">{matchingMessage}</div>
        </div>

        {postMatchActive ? <div className="review-session-screening-overlay" /> : null}

        {postMatchActive ? (
          <div className="review-session-post-stage">
            {(postMatchPhase === "screeningEntry" || postMatchPhase === "restarting") ? (
              <div className="review-session-centered-stage review-session-screening-entry">
                <span className="review-session-stage-kicker">Private Screening</span>
                <h2>{postMatchPhase === "restarting" ? "Finding next creator..." : "Entering Private Screening..."}</h2>
              </div>
            ) : null}

            {postMatchPhase === "eye" ? (
              <div className="review-session-centered-stage review-session-eye-stage">
                <div className="review-session-eye-stage-avatar">
                  <OrwellianEyeAvatar blinking={false} />
                  <div className="review-session-eye-scan-beam" />
                </div>
              </div>
            ) : null}

            {postMatchPhase === "titleReveal" && activeMatchContent ? (
              <div className="review-session-centered-stage review-session-title-stage">
                <span className="review-session-stage-kicker">Now Playing</span>
                <h2>{activeMatchContent.title}</h2>
                <p>by @{finalOpponent.username}</p>
              </div>
            ) : null}

            {(postMatchPhase === "videoReveal" || postMatchPhase === "videoWatching" || postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk") && activeMatchContent ? (
              <div className="review-session-watch-stage">
                <div className={`review-session-video-stage ${postMatchPhase === "videoReveal" ? "review-session-video-card-revealing" : "review-session-video-card-live"} ${postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk" ? "review-session-video-card-dimmed" : ""}`}>
                  <ReviewSessionHomeStyleCard content={activeMatchContent} />
                  <div className="review-session-video-meta review-session-video-meta-homecard">
                    <div className="review-session-watch-helper">
                      <span>{reviewUnlocked ? "Review Unlocked" : "Watch before reviewing"}</span>
                      {!reviewUnlocked ? <small>{watchElapsedMs >= 5000 ? "Voting unlocks soon" : "Private room active"}</small> : <small>Vote anytime now - no need to finish the full video</small>}
                    </div>
                  </div>
                  {!reviewUnlocked ? (
                    <div className="review-session-watch-progress">
                      <div className="review-session-watch-progress-bar" style={{ width: `${watchUnlockedProgress}%` }} />
                    </div>
                  ) : null}
                </div>

                {reviewUnlocked ? (
                  <div className="review-session-judging-panel">
                    <div className="review-session-judging-header">
                      <div>
                        <span className="review-session-stage-kicker">Judging Tools</span>
                        <h3>{allReviewSelected ? "Ready to submit" : "Score the screening"}</h3>
                      </div>
                      <span className="review-session-unlocked-pill">Unlocked</span>
                    </div>

                    {(["creativity", "execution", "entertainment"] as ReviewCategory[]).map((category) => (
                      <div key={category} className="review-session-score-row">
                        <span className="review-session-score-label">{category}</span>
                        <div className="review-session-score-options">
                          {reviewOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`review-session-score-pill ${reviewScores[category] === option.value ? "is-selected" : ""}`}
                              onClick={() => setReviewScores((current) => ({ ...current, [category]: option.value }))}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button type="button" className="cta-button edit-profile review-session-submit-button" onClick={handleSubmitReview} disabled={!allReviewSelected || postMatchPhase === "submitted"}>
                      {postMatchPhase === "submitted" ? "Submitting Review..." : "Submit Review"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {postMatchPhase === "decision" ? (
              <div className="review-session-decision-modal">
                <div className="review-session-decision-card">
                  <span className="review-session-stage-kicker">Review Submitted</span>
                  <h2>What do you want to do next?</h2>
                  <button type="button" className="cta-button edit-profile review-session-decision-button" onClick={handleStayAndTalk}>
                    Stay &amp; Talk (Up to 3:00)
                  </button>
                  <button type="button" className="cta-button edit-profile review-session-decision-button" onClick={() => handleRestartMatchmaking(false)}>
                    Close &amp; Find Next Match
                  </button>
                </div>
              </div>
            ) : null}

            {postMatchPhase === "talk" ? (
              <div className="review-session-talk-room">
                <div className="review-session-talk-card">
                  <span className="review-session-stage-kicker">Post-Review Room</span>
                  <h2>Session ends in {formatTalkTime(talkRemainingMs)}</h2>
                  <p>Waiting for other creator...</p>
                  {canTalkFallback ? (
                    <button type="button" className="cta-button edit-profile review-session-decision-button" onClick={() => handleRestartMatchmaking(true)}>
                      Close &amp; Find Next Match
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
