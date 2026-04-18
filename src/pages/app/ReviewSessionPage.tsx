import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { mockUsers } from "@/lib/constants/mockData";

const MATCHMAKING_DURATION_MS = 3000;
const MATCHMAKING_FRAME_MS = 120;
const BLINK_DURATION_MS = 850;
const ORWELLIAN_PLACEHOLDER = {
  photoUrl: "",
  username: "waiting_match",
  displayName: "Waiting Match",
  role: "Waiting for match",
  verified: false,
};

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

export function ReviewSessionPage() {
  const { user } = useAuth();
  const [matchingMessage, setMatchingMessage] = useState("Tap start matching to begin pairing.");
  const [isMatching, setIsMatching] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const scaryEyeAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const matchableOpponents = useMemo(
    () => mockUsers.filter((entry) => entry.id !== currentCreator.id),
    [currentCreator.id],
  );
  const finalOpponent = useMemo(
    () => matchableOpponents.find((entry) => entry.username === "berto_brown") ?? matchableOpponents[0] ?? currentCreator,
    [currentCreator, matchableOpponents],
  );
  const [displayedOpponent, setDisplayedOpponent] = useState<typeof finalOpponent | null>(null);
  const matchIntervalRef = useRef<number | null>(null);
  const matchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayedOpponent(null);
    setIsMatching(false);
    setIsBlinking(false);
    setMatchingMessage("Tap start matching to begin pairing.");
  }, [currentCreator.id]);

  useEffect(() => {
    return () => {
      if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
      if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
      scaryEyeAudioRef.current?.pause();
      scaryEyeAudioRef.current = null;
    };
  }, []);

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

  const handleStartMatching = () => {
    if (isMatching || isBlinking || !matchableOpponents.length) return;

    if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
    if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);

    if (!scaryEyeAudioRef.current) {
      scaryEyeAudioRef.current = new Audio("/scaryeyesound.mp3");
    }

    scaryEyeAudioRef.current.currentTime = 0;
    void scaryEyeAudioRef.current.play().catch(() => undefined);

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
        setMatchingMessage(`Matched with @${finalOpponent.username}. Ready when you are.`);
      }, MATCHMAKING_DURATION_MS);
    }, BLINK_DURATION_MS);
  };

  return (
    <div className="review-session-matchup-page">
      <div className="review-session-match-card">
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
                <img className={`review-session-avatar ${isMatching ? "review-session-avatar-matching" : ""} ${isBlinking ? "review-session-avatar-blinking" : ""}`} src={rightProfile.photoUrl} alt={rightProfile.displayName} />
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
            disabled={isMatching || isBlinking}
          >
            {isBlinking ? "Initializing..." : isMatching ? "Matching..." : "Start Matching"}
          </button>
          <Link to="/app/create" className="cta-button edit-profile review-session-action-button review-session-action-link">
            Add Your Content
          </Link>
        </div>

        <div className="review-session-status">{matchingMessage}</div>
      </div>
    </div>
  );
}
