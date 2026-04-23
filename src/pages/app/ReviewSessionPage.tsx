import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ContentCard } from "@/components/cards/ContentCard";
import { FeedProvider } from "@/components/feed/FeedList";
import { CommentModal, CommentModalProvider } from "@/components/overlays/CommentModal";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import { subscribePublicFeed, subscribePublicUsers } from "@/lib/firebase/publicData";
import { joinMatchmaking, leaveMatchmaking, findAndClaimMatchmakingOpponent } from "@/lib/firebase/matchmaking";
import { MIN_WATCH_TIME } from "@/lib/constants/reviewSessions";
import type { ContentModel, ReviewCategory, ReviewScoreLabel, ReviewScores, UserModel } from "@/types/models";

const MATCHMAKING_DURATION_MS = 60000;
const MATCHMAKING_FRAME_MS = 120;
const BLINK_DURATION_MS = 850;
const SCREENING_ENTRY_MS = 1900;
const EYE_STAGE_MS = 1300;
const TITLE_REVEAL_MS = 2100;
const VIDEO_REVEAL_MS = 900;
const SUBMITTING_MS = 1000;
const TALK_DURATION_MS = 180000;
const CONTENT_SELECTION_MS = 10000;

type PostMatchPhase =
  | null
  | "contentSelection"
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
  verified: false,
};

const reviewOptions: { label: string; value: ReviewScoreLabel }[] = [
  { label: "Trash", value: "trash" },
  { label: "Ok", value: "ok" },
  { label: "Fire", value: "fire" },
];

const reviewCategoryLabels: Record<ReviewCategory, string> = {
  creativity: "Creativity",
  execution: "Execution",
  entertainment: "Engagement",
};

type MatchProfile = {
  id: string;
  photoUrl: string;
  username: string;
  displayName: string;
  verified: boolean;
};

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

function ReviewSessionHomeStyleCard({ content, creator }: { content: ContentModel; creator: UserModel | null }) {
  return (
    <CommentModalProvider>
      <FeedProvider>
        <div className="review-session-home-card-wrap">
          <ContentCard content={content} creatorOverride={creator} hideActions={true} />
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
  const [availableCreators, setAvailableCreators] = useState<UserModel[]>([]);
  const [availableContent, setAvailableContent] = useState<ContentModel[]>([]);
  const [matchingMessage, setMatchingMessage] = useState("Tap start matching to begin pairing.");
  const [isMatching, setIsMatching] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [postMatchPhase, setPostMatchPhase] = useState<PostMatchPhase>(null);
  const [activeMatchContent, setActiveMatchContent] = useState<ContentModel | null>(null);
  const [userSelectedContent, setUserSelectedContent] = useState<ContentModel | null>(null);
  const [selectionCountdown, setSelectionCountdown] = useState(CONTENT_SELECTION_MS / 1000);
  const [reviewScores, setReviewScores] = useState<ReviewScores>(createEmptyScores());
  const [watchElapsedMs, setWatchElapsedMs] = useState(0);
  const [reviewUnlockFlash, setReviewUnlockFlash] = useState(false);
  const [talkRemainingMs, setTalkRemainingMs] = useState(TALK_DURATION_MS);
  const [talkToastMode] = useState(false);
  const scaryEyeAudioRef = useRef<HTMLAudioElement | null>(null);
  const matchIntervalRef = useRef<number | null>(null);
  const matchTimeoutRef = useRef<number | null>(null);
  const continuationTimeoutsRef = useRef<number[]>([]);
  const watchIntervalRef = useRef<number | null>(null);
  const talkIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribeUsers = subscribePublicUsers(setAvailableCreators);
    const unsubscribeContent = subscribePublicFeed(setAvailableContent);

    return () => {
      unsubscribeUsers();
      unsubscribeContent();
    };
  }, []);

  const currentCreator = useMemo(() => {
    if (!user) {
      return {
        id: "guest",
        displayName: "You",
        username: "you",
        photoUrl: DEFAULT_AVATAR_URL,
        verified: false,
      };
    }

    const matchedUser =
      availableCreators.find((entry) => entry.id === user.id) ??
      availableCreators.find((entry) => entry.username === user.username) ??
      availableCreators.find((entry) => entry.email === user.email);

    return {
      ...(matchedUser ?? {}),
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      photoUrl: user.photoUrl || DEFAULT_AVATAR_URL,
      verified: user.verified ?? false,
    };
  }, [availableCreators, user]);

  const usersById = useMemo(() => new Map(availableCreators.map((entry) => [entry.id, entry])), [availableCreators]);
  const [displayedOpponent, setDisplayedOpponent] = useState<MatchProfile | null>(null);
  const [matchmakingEntryId, setMatchmakingEntryId] = useState<string | null>(null);

  const allReviewSelected = useMemo(
    () => Object.values(reviewScores).every((value) => value !== null),
    [reviewScores],
  );
  const reviewUnlocked = postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk" || postMatchPhase === "restarting";
  const postMatchActive = postMatchPhase !== null;
  const isVideoPhase = postMatchPhase === "videoReveal" || postMatchPhase === "videoWatching" || postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk";
  const showJudgingPanel = postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted";
  const helperMessage = useMemo(() => {
    if (!isVideoPhase) return "";
    if (watchElapsedMs >= MIN_WATCH_TIME) return "Judging is unlocked";
    if (watchElapsedMs >= 10000) return "Judging is about to unlock";
    return "Watch before judging";
  }, [isVideoPhase, watchElapsedMs]);

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

  };

  const resetPostMatchState = () => {
    clearContinuationTimers();
    setPostMatchPhase(null);
    setActiveMatchContent(null);
    setReviewScores(createEmptyScores());
    setWatchElapsedMs(0);
    setReviewUnlockFlash(false);
    setTalkRemainingMs(TALK_DURATION_MS);
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

  const beginPostMatchFlow = () => {
    setReviewScores(createEmptyScores());
    setWatchElapsedMs(0);
    setReviewUnlockFlash(false);
    setTalkRemainingMs(TALK_DURATION_MS);
    setPostMatchPhase("contentSelection");
    setSelectionCountdown(CONTENT_SELECTION_MS / 1000);

    const countdownInterval = window.setInterval(() => {
      setSelectionCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    continuationTimeoutsRef.current.push(countdownInterval);

    const selectionTimeout = window.setTimeout(() => {
      const savedContentId = user?.matchmakingContentId;
      const userContent = userSelectedContent || availableContent.find((item) => item.id === savedContentId) || availableContent.find((item) => item.creatorId === currentCreator.id && item.status !== "live") || null;
      
      setActiveMatchContent(userContent);

      if (userContent) {
        window.clearInterval(countdownInterval);
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
      } else {
        setMatchingMessage("No content available for review.");
        setIsMatching(false);
        setPostMatchPhase(null);
      }
    }, CONTENT_SELECTION_MS);
    continuationTimeoutsRef.current.push(selectionTimeout);
  };

  const handleSelectContent = (content: ContentModel) => {
    setUserSelectedContent(content);
    window.clearInterval(continuationTimeoutsRef.current.pop() as unknown as number);
    window.clearTimeout(continuationTimeoutsRef.current.pop() as unknown as number);
    
    setActiveMatchContent(content);
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

  const startMatchmakingSequence = async ({ playSound }: { playSound: boolean }) => {
    if (isMatching || isBlinking) return;
    if (!currentCreator?.id) return;

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

    matchTimeoutRef.current = window.setTimeout(async () => {
      setIsBlinking(false);
      setIsMatching(true);
      setMatchingMessage("Searching for an opponent...");

      const entryId = await joinMatchmaking(currentCreator.id);
      setMatchmakingEntryId(entryId);

      const pollingInterval = window.setInterval(async () => {
        const opponentId = await findAndClaimMatchmakingOpponent(currentCreator.id);
        
        if (opponentId) {
          window.clearInterval(pollingInterval);
          setMatchmakingEntryId(null);

          const matchedOpponent = availableCreators.find(c => c.id === opponentId);
          if (matchedOpponent) {
            setDisplayedOpponent(matchedOpponent);
            setIsMatching(false);
            setMatchingMessage("");
            beginPostMatchFlow();
          } else {
            setMatchingMessage("No opponents found. Try again later.");
            setIsMatching(false);
          }
        }
      }, MATCHMAKING_FRAME_MS);

      matchTimeoutRef.current = window.setTimeout(async () => {
        window.clearInterval(pollingInterval);
        setMatchmakingEntryId(null);

        setDisplayedOpponent(null);
        setIsMatching(false);
        setMatchingMessage("No opponents found. Try again later.");
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

  const handleLeaveComment = () => {
    if (!activeMatchContent?.sourceUrl) {
      handleReturnToStart();
      return;
    }

    window.open(activeMatchContent.sourceUrl, "_blank", "noopener,noreferrer");
  };

  const handleReturnToStart = async () => {
    clearContinuationTimers();
    if (matchmakingEntryId) {
      await leaveMatchmaking(matchmakingEntryId);
      setMatchmakingEntryId(null);
    }
    resetToIdle();
  };

  const rightProfile = displayedOpponent
      ? {
        photoUrl: displayedOpponent.photoUrl,
        username: displayedOpponent.username,
        displayName: displayedOpponent.displayName,
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
            </div>
          </div>

          <div className="review-session-actions">
            <button
              type="button"
              className="cta-button edit-profile review-session-action-button"
              onClick={handleStartMatching}
              disabled={isMatching || isBlinking || postMatchActive}
            >
              {isBlinking ? "Initializing..." : isMatching ? matchingMessage || "Searching..." : "Start Matching"}
            </button>
            <Link to="/app/review-select" className="cta-button edit-profile review-session-action-button review-session-action-link">
              Add Your Content
            </Link>
          </div>

          <div className="review-session-status">{matchingMessage}</div>
        </div>

        {postMatchActive ? <div className="review-session-screening-overlay" /> : null}

        {postMatchActive ? (
          <div className="review-session-post-stage">
            {(postMatchPhase === "screeningEntry" || postMatchPhase === "restarting") ? (
              <div className="review-session-centered-stage review-session-title-stage">
                <span className="review-session-stage-kicker">Private Screening</span>
                <div className="review-session-title-content">
                  <h2 className="review-session-title-headline">{postMatchPhase === "restarting" ? "Finding next creator..." : "Entering Private Screening..."}</h2>
                </div>
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

            {postMatchPhase === "contentSelection" ? (
              <div className="review-session-centered-stage review-session-title-stage">
                <span className="review-session-stage-kicker">Select Content to Review</span>
                <div className="review-session-title-content">
                  <p className="review-session-title-credit">Choose a video you want your opponent to watch ({selectionCountdown}s remaining)</p>
                </div>
                <div className="review-session-content-selection-grid">
                  {availableContent
                    .filter((item) => item.creatorId === currentCreator.id && item.status !== "live")
                    .slice(0, 6)
                    .map((content) => (
                      <button
                        key={content.id}
                        type="button"
                        className="review-session-content-selection-card"
                        onClick={() => handleSelectContent(content)}
                      >
                        {content.thumbnailUrl ? (
                          <img src={content.thumbnailUrl} alt={content.title} className="review-session-content-selection-thumbnail" />
                        ) : (
                          <div className="review-session-content-selection-placeholder" />
                        )}
                        <span className="review-session-content-selection-title">{content.title}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : null}

            {postMatchPhase === "titleReveal" && activeMatchContent ? (
              <div className="review-session-centered-stage review-session-title-stage">
                <span className="review-session-stage-kicker">Now Playing</span>
                <div className="review-session-title-content">
                  <h2 className="review-session-title-headline">{activeMatchContent.title}</h2>
                  <p className="review-session-title-credit">by @{displayedOpponent?.username ?? "creator"}</p>
                </div>
              </div>
            ) : null}

            {(postMatchPhase === "videoReveal" || postMatchPhase === "videoWatching" || postMatchPhase === "reviewUnlocked" || postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk") && activeMatchContent ? (
              <div className="review-session-watch-stage">
                <div className={`review-session-video-stage ${postMatchPhase === "videoReveal" ? "review-session-video-card-revealing" : "review-session-video-card-live"} ${postMatchPhase === "submitted" || postMatchPhase === "decision" || postMatchPhase === "talk" ? "review-session-video-card-dimmed" : ""}`}>
                  <ReviewSessionHomeStyleCard content={activeMatchContent} creator={usersById.get(activeMatchContent.creatorId) ?? null} />
                  <div className="review-session-video-meta review-session-video-meta-homecard">
                    <div className={`review-session-watch-helper ${watchElapsedMs >= 10000 ? "review-session-watch-helper-emphasis" : ""}`}>
                      <span>{helperMessage}</span>
                      {!reviewUnlocked ? <small>Private room active</small> : <small>Rate anytime without finishing the full video</small>}
                    </div>
                  </div>
                  {!reviewUnlocked ? (
                    <div className="review-session-watch-progress">
                      <div className="review-session-watch-progress-bar" style={{ width: `${watchUnlockedProgress}%` }} />
                    </div>
                  ) : null}
                </div>

                {showJudgingPanel ? (
                  <>
                    <div className="review-session-scroll-hint">
                      <span>Scroll to rate</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    </div>
                    <div className="review-session-judging-panel">
                    <div className="review-session-judging-header">
                      <div>
                        <span className="review-session-stage-kicker">Rate this content</span>
                        <h3>{allReviewSelected ? "Ready to submit" : "Score the screening"}</h3>
                      </div>
                      <span className="review-session-unlocked-pill">Unlocked</span>
                    </div>

                    {(["creativity", "execution", "entertainment"] as ReviewCategory[]).map((category) => (
                      <div key={category} className="review-session-score-row">
                        <span className="review-session-score-label">{reviewCategoryLabels[category]}</span>
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
                  </>
                ) : null}
              </div>
            ) : null}

            {postMatchPhase === "decision" ? (
              <div className="review-session-decision-modal">
                <div className="review-session-decision-card">
                  <span className="review-session-stage-kicker">Review Submitted</span>
                  <h2>What do you want to do next?</h2>
                  <button type="button" className="cta-button edit-profile review-session-decision-button" onClick={handleLeaveComment}>
                    Leave a Comment
                  </button>
                  <button type="button" className="cta-button edit-profile review-session-decision-button" onClick={handleReturnToStart}>
                    Leave Room
                  </button>
                </div>
              </div>
            ) : null}

            {postMatchPhase === "talk" ? (
              <div className="review-session-talk-room">
                <div className={`review-session-talk-card ${talkToastMode ? "review-session-talk-toast" : ""}`}>
                  <span className="review-session-stage-kicker">Post-Review Room</span>
                  <h2>{formatTalkTime(talkRemainingMs)}</h2>
                  <p>Talk time remaining</p>
                  <p>Waiting for other creator...</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
