import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ContentCard } from "@/components/cards/ContentCard";
import { FeedProvider } from "@/components/feed/FeedList";
import { CommentModal, CommentModalProvider } from "@/components/overlays/CommentModal";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import { subscribePublicFeed, subscribePublicUsers } from "@/lib/firebase/publicData";
import { leaveWaitingQueue, startMatchmaking } from "@/lib/firebase/matchmaking";
import { MIN_WATCH_TIME } from "@/lib/constants/reviewSessions";
import type { ContentModel, ReviewCategory, ReviewScoreLabel, ReviewScores, UserModel, ReviewSessionModel } from "@/types/models";
import { createReviewRecord } from "@/features/reviewSessions/sessionLogic";
import { upsertReviewSession, subscribeReviewSession, findOrCreateSession } from "@/lib/firebase/reviewSessions";
import { ReviewSummaryCard } from "@/components/reviewSessions/ReviewSummaryCard";

const MATCHMAKING_TIMEOUT_MS = 30000;
const SCREENING_ENTRY_MS = 1900;
const EYE_STAGE_MS = 1300;
const TITLE_REVEAL_MS = 2100;
const VIDEO_REVEAL_MS = 900;
const TALK_DURATION_MS = 180000;
const BLINK_DURATION_MS = 850;

type PostMatchPhase =
  | null
  | "screeningEntry"
  | "eye"
  | "titleReveal"
  | "videoReveal"
  | "videoWatching"
  | "reviewUnlocked"
  | "submitted"
  | "completed"
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

function createMinimalUserModel(user: UserModel | MatchProfile): UserModel {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    photoUrl: user.photoUrl,
    verified: user.verified,
    email: '',
    bannerUrl: '',
    bio: '',
    categories: [],
    goals: [],
    socialLinks: {},
    totalPoints: 0,
    battleWins: 0,
    contestWins: 0,
    followerCount: 0,
    followingCount: 0,
    followerIds: [],
    followingIds: [],
    badges: [],
    rookie: false,
    matchmakingContentId: null,
    fcmToken: null,
    notificationsEnabled: true,
    createdAt: '',
    updatedAt: ''
  };
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
    const [reviewScores, setReviewScores] = useState<ReviewScores>(createEmptyScores());
    const [watchElapsedMs, setWatchElapsedMs] = useState(0);
    const [reviewUnlockFlash, setReviewUnlockFlash] = useState(false);
    const [talkRemainingMs, setTalkRemainingMs] = useState(TALK_DURATION_MS);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [reviewSessionData, setReviewSessionData] = useState<ReviewSessionModel | null>(null);
  const scaryEyeAudioRef = useRef<HTMLAudioElement | null>(null);
  const availableCreatorsRef = useRef<UserModel[]>([]);
  const matchIntervalRef = useRef<number | null>(null);
  const matchTimeoutRef = useRef<number | null>(null);
  const continuationTimeoutsRef = useRef<number[]>([]);
  const watchIntervalRef = useRef<number | null>(null);
  const talkIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribeUsers = subscribePublicUsers(setAvailableCreators);
    const unsubscribeContent = subscribePublicFeed(setAvailableContent);

    const handleBeforeUnload = () => {
      if (currentCreator?.id) {
        leaveWaitingQueue(currentCreator.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

     return () => {
       unsubscribeUsers();
       unsubscribeContent();
        if (currentCreator?.id) {
         leaveWaitingQueue(currentCreator.id);
        }
       window.removeEventListener('beforeunload', handleBeforeUnload);
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

  useEffect(() => {
    availableCreatorsRef.current = availableCreators;
  }, [availableCreators]);

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

   const clearContinuationTimers = useCallback(() => {
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
    }, []);

   // Talk mode toast handling - temporarily disabled for simplicity
   // const handleTalkToast = () => {
   //   setTalkToastMode(true);
   //   setTimeout(() => setTalkToastMode(false), 3000);
   // };

  const resetPostMatchState = useCallback(() => {
    clearContinuationTimers();
    setPostMatchPhase(null);
    setActiveMatchContent(null);
    setReviewScores(createEmptyScores());
    setWatchElapsedMs(0);
    setReviewUnlockFlash(false);
    setTalkRemainingMs(TALK_DURATION_MS);
  }, [clearContinuationTimers]);

  const resetToIdle = useCallback(() => {
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
  }, [resetPostMatchState]);

    useEffect(() => {
      resetToIdle();
    }, [currentCreator.id, resetToIdle]);

    // Subscribe to review session updates when we have a session ID
    useEffect(() => {
      if (!currentSessionId) return;

      const unsubscribe = subscribeReviewSession(
        currentSessionId,
        (session) => {
          if (!session) return;

          // Store the session data for use in the completed screen
          setReviewSessionData(session);

          // Check if both users have submitted their reviews
          if (session.creatorAReviewForB && session.creatorBReviewForA) {
            // Both users have submitted - transition to completed phase
            setPostMatchPhase("completed");
          }
        },
        (error) => {
          console.error('Error subscribing to review session:', error);
        }
      );

      // Cleanup subscription on unmount or when sessionId changes
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, [currentSessionId]);

  useEffect(() => {
    return () => {
      resetPostMatchState();
      if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
      if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
      scaryEyeAudioRef.current?.pause();
      scaryEyeAudioRef.current = null;
    };
  }, [resetPostMatchState]);

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
     // First, try to find content marked as default for review
     const defaultContent = availableContent
       .filter((item) => item.creatorId === opponentId && item.status !== "live" && item.isDefaultForReview)
       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

     if (defaultContent) return defaultContent;

     // Fallback to most recent content (original behavior)
     const directMatch = availableContent
       .filter((item) => item.creatorId === opponentId && item.status !== "live")
       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

     return directMatch ?? availableContent.find((item) => item.status !== "live") ?? null;
   };

  const beginPostMatchFlow = (matchedOpponent: MatchProfile) => {
    const matchedContent = resolveOpponentContent(matchedOpponent.id);
    setActiveMatchContent(matchedContent);
    setReviewScores(createEmptyScores());
    setWatchElapsedMs(0);
    setReviewUnlockFlash(false);
    setTalkRemainingMs(TALK_DURATION_MS);
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

    if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
    resetPostMatchState();
    setIsMatching(true);
    setIsBlinking(true);
    setDisplayedOpponent(null);
    setMatchingMessage("Searching for opponent...");

    if (playSound) {
      if (!scaryEyeAudioRef.current) {
        scaryEyeAudioRef.current = new Audio("/scaryeyesound.mp3");
      }
      scaryEyeAudioRef.current.currentTime = 0;
      void scaryEyeAudioRef.current.play().catch(() => undefined);
    }

    matchTimeoutRef.current = window.setTimeout(async () => {
      setIsBlinking(false);

      const cleanup = startMatchmaking(
        currentCreator.id,
        (opponentId) => {
          cleanup();

          const matchedOpponent = availableCreatorsRef.current.find((creator) => creator.id === opponentId);
          const opponentProfile: MatchProfile = matchedOpponent
            ? {
                id: matchedOpponent.id,
                photoUrl: matchedOpponent.photoUrl,
                username: matchedOpponent.username,
                displayName: matchedOpponent.displayName,
                verified: matchedOpponent.verified,
              }
            : {
                id: opponentId,
                photoUrl: DEFAULT_AVATAR_URL,
                username: "creator",
                displayName: "Matched Creator",
                verified: false,
              };

          setDisplayedOpponent(opponentProfile);
          setIsMatching(false);
          setMatchingMessage("");
          beginPostMatchFlow(opponentProfile);
        },
        MATCHMAKING_TIMEOUT_MS
      );

       // Only set up timeout if we didn't get an immediate match
       // The startMatchmaking function returns a cleanup function that handles timeouts
       // if there was no immediate match
       if (typeof cleanup === 'function') {
         matchTimeoutRef.current = window.setTimeout(async () => {
           cleanup();
           await leaveWaitingQueue(currentCreator.id);
           setDisplayedOpponent(null);
           setIsMatching(false);
           setMatchingMessage("No users in queue. Try again later.");
         }, MATCHMAKING_TIMEOUT_MS);
       }
    }, BLINK_DURATION_MS);
  };

  const handleStartMatching = () => {
    startMatchmakingSequence({ playSound: true });
  };

      const handleSubmitReview = async () => {
        if (!reviewUnlocked || !allReviewSelected) return;
  
        // Save review record for current user
        if (currentCreator?.id && displayedOpponent?.id) {
          // Create review record for current user
          const reviewForCurrentUser = createReviewRecord(currentCreator.id, displayedOpponent.id, reviewScores);
          
          // Find or create session between current user and opponent
          try {
            const session: ReviewSessionModel = await findOrCreateSession(
              currentCreator.id,
              displayedOpponent.id
            );
            
            // Update the session with current user's review
            const updatedSession: ReviewSessionModel = {
              ...session,
              creatorAReviewForB: 
                session.creatorA === currentCreator.id 
                  ? reviewForCurrentUser 
                  : session.creatorAReviewForB,
              creatorBReviewForA: 
                session.creatorB === currentCreator.id 
                  ? reviewForCurrentUser 
                  : session.creatorBReviewForA,
              updatedAt: new Date().toISOString()
            };
            
            await upsertReviewSession(updatedSession);
            setCurrentSessionId(updatedSession.id);
            console.log('Updated review session:', updatedSession.id);
          } catch (error) {
            console.error('Error saving review session:', error);
          }
          
          // Mark that the current user has submitted their review
          // In practice, we'll rely on Firebase subscription to detect when both have submitted
        }
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
     if (currentCreator?.id) {
       await leaveWaitingQueue(currentCreator.id);
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
                   <div className="review-session-talk-card">
                     <span className="review-session-stage-kicker">Post-Review Room</span>
                     <h2>{formatTalkTime(talkRemainingMs)}</h2>
                     <p>Talk time remaining</p>
                     <p>Waiting for other creator...</p>
                   </div>
                 </div>
               ) : null}
             
             {postMatchPhase === "completed" && activeMatchContent && displayedOpponent && reviewSessionData ? (
               <div className="review-session-complete-screen">
                 <div className="review-session-complete-card">
                   <span className="review-session-stage-kicker">Review Complete</span>
                   <h2>Session Results</h2>
                   
                   <div className="review-session-results-grid">
                     {/* User's review of opponent */}
                     <div className="review-session-result-column">
                       <h3>Your Review of @{displayedOpponent.username}</h3>
                       <ReviewSummaryCard 
                         title="Your Score" 
                         creator={createMinimalUserModel(currentCreator)} 
                         review={reviewSessionData.creatorAReviewForB} 
                       />
                     </div>
                     
                     {/* Opponent's review of user */}
                     <div className="review-session-result-column">
                       <h3>@{displayedOpponent.username}'s Review of You</h3>
                       <ReviewSummaryCard 
                         title="Their Score" 
                         creator={createMinimalUserModel(displayedOpponent)} 
                         review={reviewSessionData.creatorBReviewForA} 
                       />
                     </div>
                   </div>
                   
                   <div className="review-session-tally-section">
                     <h3>Combined Results</h3>
                     <div className="review-session-tally-grid">
                       <div className="review-session-tally-item">
                         <span>Creativity:</span>
                         <span className="review-session-tally-value">
                           {reviewSessionData.creatorAReviewForB?.scores.creativity === 'trash' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.creativity === 'trash' ? 1 : 0} Trash, 
                           {reviewSessionData.creatorAReviewForB?.scores.creativity === 'ok' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.creativity === 'ok' ? 1 : 0} Ok, 
                           {reviewSessionData.creatorAReviewForB?.scores.creativity === 'fire' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.creativity === 'fire' ? 1 : 0} Fire
                         </span>
                       </div>
                       <div className="review-session-tally-item">
                         <span>Execution:</span>
                         <span className="review-session-tally-value">
                           {reviewSessionData.creatorAReviewForB?.scores.execution === 'trash' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.execution === 'trash' ? 1 : 0} Trash, 
                           {reviewSessionData.creatorAReviewForB?.scores.execution === 'ok' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.execution === 'ok' ? 1 : 0} Ok, 
                           {reviewSessionData.creatorAReviewForB?.scores.execution === 'fire' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.execution === 'fire' ? 1 : 0} Fire
                         </span>
                       </div>
                       <div className="review-session-tally-item">
                         <span>Entertainment:</span>
                         <span className="review-session-tally-value">
                           {reviewSessionData.creatorAReviewForB?.scores.entertainment === 'trash' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.entertainment === 'trash' ? 1 : 0} Trash, 
                           {reviewSessionData.creatorAReviewForB?.scores.entertainment === 'ok' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.entertainment === 'ok' ? 1 : 0} Ok, 
                           {reviewSessionData.creatorAReviewForB?.scores.entertainment === 'fire' ? 1 : 0} + 
                           {reviewSessionData.creatorBReviewForA?.scores.entertainment === 'fire' ? 1 : 0} Fire
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="review-session-actions">
                     <button 
                       type="button" 
                       className="cta-button edit-profile review-session-action-button"
                       onClick={handleLeaveComment}
                     >
                       Leave a Comment
                     </button>
                     <button 
                       type="button" 
                       className="cta-button edit-profile review-session-action-button"
                       onClick={handleReturnToStart}
                     >
                       Leave Room
                     </button>
                   </div>
                 </div>
               </div>
             ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
