import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { ReviewScoreGroups } from "@/components/reviewSessions/ComicScoreGroup";
import { ReviewSummaryCard } from "@/components/reviewSessions/ReviewSummaryCard";
import { SessionSubmissionForm } from "@/components/reviewSessions/SessionSubmissionForm";
import { SessionVideoPlayer } from "@/components/reviewSessions/SessionVideoPlayer";
import { SocialLinksPanel } from "@/components/reviewSessions/SocialLinksPanel";
import { Button } from "@/components/ui/Button";
import { GradientCard } from "@/components/ui/GradientCard";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import { MIN_WATCH_TIME } from "@/lib/constants/reviewSessions";
import { mockUsers } from "@/lib/constants/mockData";
import { upsertReviewSession } from "@/lib/firebase/reviewSessions";
import {
  areScoresComplete,
  cancelSession,
  createEmptyScores,
  createReviewRecord,
  createReviewSession,
  maybeCompleteSession,
  maybeUnlockScoring,
  moveToSelection,
  saveSubmission,
  updateWatchProgress,
} from "@/features/reviewSessions/sessionLogic";
import type { ReviewContentType, ReviewScores, ReviewSessionModel, ReviewSessionSubmission, UserModel } from "@/types/models";

function fallbackCreator(currentUserId: string, authName?: string, authUsername?: string, authPhoto?: string): UserModel {
  const base = mockUsers[0];
  return {
    ...base,
    id: currentUserId,
    displayName: authName ?? base.displayName,
    username: authUsername ?? base.username,
    photoUrl: authPhoto ?? base.photoUrl,
    email: "prototype@dreamledge.app",
  };
}

function formatTimeLeft(targetIso: string | null) {
  if (!targetIso) return "--";
  return `${Math.max(0, Math.ceil((new Date(targetIso).getTime() - Date.now()) / 1000))}s`;
}

export function ReviewSessionPage() {
  const { user } = useAuth();
  const currentCreator = useMemo(() => {
    if (!user) return mockUsers[0];
    return mockUsers.find((entry) => entry.id === user.id) ?? fallbackCreator(user.id, user.displayName, user.username, user.photoUrl);
  }, [user]);
  const [session, setSession] = useState<ReviewSessionModel | null>(null);
  const [reviewScores, setReviewScores] = useState<ReviewScores>(createEmptyScores());
  const matchmakingRef = useRef<number | null>(null);
  const opponentSubmissionRef = useRef<number | null>(null);
  const opponentWatchRef = useRef<number | null>(null);
  const opponentReviewRef = useRef<number | null>(null);

  const opponent = session?.creatorB ? (mockUsers.find((entry) => entry.id === session.creatorB) ?? null) : null;

  useEffect(() => {
    if (!session) return;
    void upsertReviewSession(session);
  }, [session]);

  useEffect(() => {
    return () => {
      if (matchmakingRef.current) window.clearTimeout(matchmakingRef.current);
      if (opponentSubmissionRef.current) window.clearTimeout(opponentSubmissionRef.current);
      if (opponentWatchRef.current) window.clearInterval(opponentWatchRef.current);
      if (opponentReviewRef.current) window.clearTimeout(opponentReviewRef.current);
    };
  }, []);

  useEffect(() => {
    if (!session || session.status !== "selection" || session.creatorBSubmission || !opponent) return;
    opponentSubmissionRef.current = window.setTimeout(() => {
      const autoSubmission: ReviewSessionSubmission = {
        creatorId: opponent.id,
        contentUrl: opponent.socialLinks.youtube ?? opponent.socialLinks.instagram ?? "https://example.com/clip",
        contentType: ((opponent.socialLinks.youtube ? "youtube" : opponent.socialLinks.instagram ? "instagram" : "clip_url") as ReviewContentType),
        thumbnailUrl: opponent.bannerUrl,
        submittedAt: new Date().toISOString(),
        playbackUrl: "/landingpagebackround.mp4",
      };
      setSession((current) => (current ? saveSubmission(current, "B", autoSubmission) : current));
    }, 2200);

    return () => {
      if (opponentSubmissionRef.current) window.clearTimeout(opponentSubmissionRef.current);
    };
  }, [opponent, session]);

  useEffect(() => {
    if (!session || session.status !== "watching") return;
    if (session.creatorBWatchProgress.hasMetMinimumWatchRequirement) return;

    opponentWatchRef.current = window.setInterval(() => {
      setSession((current) => {
        if (!current || current.status !== "watching") return current;
        const nextProgress = updateWatchProgress(
          current.creatorBWatchProgress,
          Math.min(MIN_WATCH_TIME, current.creatorBWatchProgress.watchedMilliseconds + 1000),
          Math.min(MIN_WATCH_TIME, current.creatorBWatchProgress.lastPlaybackPosition + 1000),
        );
        return maybeUnlockScoring({ ...current, creatorBWatchProgress: nextProgress, updatedAt: new Date().toISOString() });
      });
    }, 1000);

    return () => {
      if (opponentWatchRef.current) window.clearInterval(opponentWatchRef.current);
    };
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "scoring" || session.creatorBReviewForA || !opponent) return;
    opponentReviewRef.current = window.setTimeout(() => {
      setSession((current) => {
        if (!current || !opponent) return current;
        return maybeCompleteSession({
          ...current,
          creatorBReviewForA: createReviewRecord(opponent.id, current.creatorA, {
            creativity: "fire",
            execution: "ok",
            entertainment: "fire",
          }),
          updatedAt: new Date().toISOString(),
        });
      });
    }, 3500);

    return () => {
      if (opponentReviewRef.current) window.clearTimeout(opponentReviewRef.current);
    };
  }, [opponent, session]);

  const startSession = () => {
    const fresh = createReviewSession(currentCreator.id);
    setSession(fresh);
    matchmakingRef.current = window.setTimeout(() => {
      const matchedOpponent = mockUsers.find((entry) => entry.id !== currentCreator.id) ?? mockUsers[1];
      setSession((current) => (current ? moveToSelection(current, matchedOpponent.id) : current));
    }, 1400);
  };

  const handleUserSubmission = (submission: ReviewSessionSubmission) => {
    setSession((current) => (current ? saveSubmission(current, "A", submission) : current));
  };

  const handleWatchProgress = (watchedMilliseconds: number, lastPlaybackPosition: number) => {
    setSession((current) => {
      if (!current) return current;
      const nextProgress = updateWatchProgress(current.creatorAWatchProgress, watchedMilliseconds, lastPlaybackPosition);
      return maybeUnlockScoring({ ...current, creatorAWatchProgress: nextProgress, updatedAt: new Date().toISOString() });
    });
  };

  const submitReview = () => {
    if (!session || !opponent || !areScoresComplete(reviewScores) || !session.creatorAWatchProgress.hasMetMinimumWatchRequirement) return;
    setSession((current) => {
      if (!current || !opponent) return current;
      return maybeCompleteSession({
        ...current,
        creatorAReviewForB: createReviewRecord(current.creatorA, opponent.id, reviewScores),
        updatedAt: new Date().toISOString(),
      });
    });
  };

  const currentTimer = session?.status === "selection"
    ? formatTimeLeft(session.selectionExpiresAt)
    : session?.status === "watching"
      ? formatTimeLeft(session.watchingDeadlineAt)
      : session?.status === "scoring"
        ? formatTimeLeft(session.scoringExpiresAt)
        : "--";

  return (
    <div className="space-y-6 pb-8">
      <GradientCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">Creator session</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Random 1v1 review room</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Start a random creator-to-creator session, submit one clip each, watch 15 real seconds, unlock scoring, review each other, and finish with a summary. No winners. No spectators.
            </p>
          </div>
          {!session ? <Button className="bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white" onClick={startSession}>Start Session</Button> : null}
        </div>
      </GradientCard>

      {!session ? (
        <div className="bubble-card rounded-[38px] p-6 text-center text-zinc-400">
          Tap <span className="font-semibold text-white">Start Session</span> to enter matchmaking for a random judge-for-judge creator review room.
        </div>
      ) : null}

      {session ? (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="bubble-card rounded-[38px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Status</p>
                  <h2 className="mt-2 text-2xl font-semibold capitalize text-white">{session.status}</h2>
                </div>
                <div className="rounded-[999px] border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">{currentTimer}</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[30px] border border-white/10 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">creatorA</p>
                  <VerifiedLabel text={currentCreator.displayName} verified={currentCreator.verified} className="mt-2 font-semibold text-white" textClassName="font-semibold text-white" iconClassName="verified-label__icon--tiny" />
                </div>
                <div className="rounded-[30px] border border-white/10 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">creatorB</p>
                  <VerifiedLabel text={opponent?.displayName ?? "Searching..."} verified={opponent?.verified} className="mt-2 font-semibold text-white" textClassName="font-semibold text-white" iconClassName="verified-label__icon--tiny" />
                </div>
              </div>
            </div>

            {session.status === "waiting" ? (
              <div className="bubble-card rounded-[38px] p-6 text-zinc-300">Entering matchmaking... pairing you into a random 1v1 creator session.</div>
            ) : null}

            {session.status === "selection" ? (
              <SessionSubmissionForm creatorId={currentCreator.id} onSubmit={handleUserSubmission} />
            ) : null}

            {session.status === "selection" && session.creatorASubmission ? (
              <div className="bubble-card rounded-[36px] p-5 text-sm text-zinc-300">Your video is locked in. Waiting for the matched creator to submit theirs before watching begins.</div>
            ) : null}

            {(session.status === "watching" || session.status === "scoring" || session.status === "completed") ? (
              <>
                <SessionVideoPlayer
                  submission={session.creatorBSubmission}
                  watchProgress={session.creatorAWatchProgress}
                  onWatchProgress={handleWatchProgress}
                  canTrackWatch={session.status === "watching" || session.status === "scoring"}
                />
                <div className="bubble-card rounded-[34px] p-4">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Watch progress</span>
                    <span>{Math.min(15, Math.floor(session.creatorAWatchProgress.watchedMilliseconds / 1000))} / 15s</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-[999px] bg-zinc-800">
                    <div className="h-full rounded-[999px] bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${Math.min(100, (session.creatorAWatchProgress.watchedMilliseconds / MIN_WATCH_TIME) * 100)}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">Scoring unlocks only after both creators watch at least 15 real seconds. Replay is allowed, but fast-forward seeking is blocked before the minimum is met.</p>
                </div>
                {opponent ? <SocialLinksPanel creator={opponent} /> : null}
              </>
            ) : null}
          </div>

          <div className="space-y-4">
            {(session.status === "watching" || session.status === "scoring" || session.status === "completed") && opponent ? (
              <div className="bubble-card rounded-[38px] p-5">
                <div className="flex items-center gap-3">
                  <img src={opponent.photoUrl} alt={opponent.displayName} className="h-16 w-16 rounded-[28px] object-cover" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Reviewing now</p>
                    <VerifiedLabel text={opponent.displayName} verified={opponent.verified} className="text-xl font-semibold text-white" textClassName="text-xl font-semibold text-white" iconClassName="h-[16px] w-[16px]" />
                    <VerifiedLabel text={`@${opponent.username}`} verified={false} className="text-sm text-zinc-400" textClassName="text-sm text-zinc-400" />
                  </div>
                </div>
              </div>
            ) : null}

            {(session.status === "watching" || session.status === "scoring" || session.status === "completed") ? (
              <div className="bubble-card rounded-[38px] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Scoring</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Judge-for-judge review</h3>
                  </div>
                  <div className={`rounded-[999px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${session.creatorAWatchProgress.hasMetMinimumWatchRequirement && session.status !== "watching" ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>
                    {session.creatorAWatchProgress.hasMetMinimumWatchRequirement && session.status !== "watching" ? "Unlocked" : "Locked"}
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-400">Rate only the other creator. Creativity. Execution. Entertainment. No winners or public judges.</p>
                <div className="mt-5">
                  <ReviewScoreGroups
                    scores={reviewScores}
                    onChange={(category, value) => setReviewScores((current) => ({ ...current, [category]: value }))}
                    disabled={!session.creatorAWatchProgress.hasMetMinimumWatchRequirement || session.status === "watching" || session.status === "completed"}
                    sessionId={session.id}
                  />
                </div>
                <Button
                  className="mt-5 w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!session.creatorAWatchProgress.hasMetMinimumWatchRequirement || !areScoresComplete(reviewScores) || session.status === "completed"}
                  onClick={submitReview}
                >
                  Submit review
                </Button>
              </div>
            ) : null}

            {session.status === "completed" && opponent ? (
              <>
                <ReviewSummaryCard title="Your review for creatorB" creator={opponent} review={session.creatorAReviewForB} />
                <ReviewSummaryCard title="creatorB review for you" creator={currentCreator} review={session.creatorBReviewForA} />
              </>
            ) : null}

            {session.status !== "completed" ? (
              <Button onClick={() => setSession((current) => (current ? cancelSession(current) : current))}>Leave session</Button>
            ) : (
              <Link to="/app/home" className="inline-flex w-full items-center justify-center rounded-[999px] border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/10">Back to home</Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
