import {
  MIN_WATCH_TIME,
  SCORING_TIME,
  SELECTION_TIME,
  WATCHING_TIMEOUT,
  reviewScoreValues,
} from "@/lib/constants/reviewSessions";
import type {
  ReviewScores,
  ReviewSessionModel,
  ReviewSessionSubmission,
  ReviewSubmissionRecord,
  ReviewWatchProgress,
} from "@/types/models";

export function createEmptyWatchProgress(): ReviewWatchProgress {
  return {
    watchedMilliseconds: 0,
    hasMetMinimumWatchRequirement: false,
    lastPlaybackPosition: 0,
    watchStartedAt: null,
  };
}

export function createEmptyScores(): ReviewScores {
  return {
    creativity: null,
    execution: null,
    entertainment: null,
  };
}

export function createReviewSession(creatorA: string): ReviewSessionModel {
  const now = new Date();
  return {
    id: `session-${now.getTime()}`,
    creatorA,
    creatorB: null,
    creatorASubmission: null,
    creatorBSubmission: null,
    creatorAWatchProgress: createEmptyWatchProgress(),
    creatorBWatchProgress: createEmptyWatchProgress(),
    creatorAReviewForB: null,
    creatorBReviewForA: null,
    status: "waiting",
    selectionExpiresAt: null,
    scoringExpiresAt: null,
    watchingDeadlineAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function moveToSelection(session: ReviewSessionModel, creatorB: string): ReviewSessionModel {
  const now = Date.now();
  return {
    ...session,
    creatorB,
    status: "selection",
    selectionExpiresAt: new Date(now + SELECTION_TIME).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };
}

export function saveSubmission(
  session: ReviewSessionModel,
  role: "A" | "B",
  submission: ReviewSessionSubmission,
): ReviewSessionModel {
  const next = {
    ...session,
    creatorASubmission: role === "A" ? submission : session.creatorASubmission,
    creatorBSubmission: role === "B" ? submission : session.creatorBSubmission,
    updatedAt: new Date().toISOString(),
  };

  if (next.creatorASubmission && next.creatorBSubmission) {
    const now = Date.now();
    return {
      ...next,
      status: "watching",
      watchingDeadlineAt: new Date(now + WATCHING_TIMEOUT).toISOString(),
    };
  }

  return next;
}

export function updateWatchProgress(progress: ReviewWatchProgress, watchedMilliseconds: number, playbackPosition: number): ReviewWatchProgress {
  return {
    watchedMilliseconds,
    hasMetMinimumWatchRequirement: watchedMilliseconds >= MIN_WATCH_TIME,
    lastPlaybackPosition: playbackPosition,
    watchStartedAt: progress.watchStartedAt ?? new Date().toISOString(),
  };
}

export function maybeUnlockScoring(session: ReviewSessionModel): ReviewSessionModel {
  if (session.creatorAWatchProgress.hasMetMinimumWatchRequirement && session.creatorBWatchProgress.hasMetMinimumWatchRequirement) {
    return {
      ...session,
      status: "scoring",
      scoringExpiresAt: new Date(Date.now() + SCORING_TIME).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return session;
}

export function areScoresComplete(scores: ReviewScores) {
  return Boolean(scores.creativity && scores.execution && scores.entertainment);
}

export function createReviewRecord(reviewerId: string, revieweeId: string, scores: ReviewScores): ReviewSubmissionRecord {
  return {
    reviewerId,
    revieweeId,
    scores,
    submittedAt: new Date().toISOString(),
  };
}

export function sessionReviewAverage(review: ReviewSubmissionRecord | null) {
  if (!review) return 0;
  return (
    reviewScoreValues[review.scores.creativity ?? "trash"] +
    reviewScoreValues[review.scores.execution ?? "trash"] +
    reviewScoreValues[review.scores.entertainment ?? "trash"]
  ) / 3;
}

export function maybeCompleteSession(session: ReviewSessionModel): ReviewSessionModel {
  if (session.creatorAReviewForB && session.creatorBReviewForA) {
    return {
      ...session,
      status: "completed",
      updatedAt: new Date().toISOString(),
    };
  }

  return session;
}

export function cancelSession(session: ReviewSessionModel): ReviewSessionModel {
  return {
    ...session,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
}

export function tallyReviewLabels(reviews: ReviewSubmissionRecord[]) {
  // Initialize counters for each category
  const tallies = {
    creativity: { trash: 0, ok: 0, fire: 0 },
    execution: { trash: 0, ok: 0, fire: 0 },
    entertainment: { trash: 0, ok: 0, fire: 0 }
  };

  // Tally each review
  reviews.forEach(review => {
    if (review?.scores) {
      if (review.scores.creativity) {
        tallies.creativity[review.scores.creativity as keyof typeof tallies.creativity]++;
      }
      if (review.scores.execution) {
        tallies.execution[review.scores.execution as keyof typeof tallies.execution]++;
      }
      if (review.scores.entertainment) {
        tallies.entertainment[review.scores.entertainment as keyof typeof tallies.entertainment]++;
      }
    }
  });

  return tallies;
}
