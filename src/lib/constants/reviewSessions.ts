import type { ReviewCategory, ReviewScoreLabel } from "@/types/models";

export const SELECTION_TIME = 30000;
export const MIN_WATCH_TIME = 15000;
export const SCORING_TIME = 60000;
export const WATCHING_TIMEOUT = 90000;

export const reviewScoreValues: Record<ReviewScoreLabel, number> = {
  trash: 1,
  ok: 2,
  fire: 3,
};

export const reviewCategories: { key: ReviewCategory; label: string }[] = [
  { key: "creativity", label: "Creativity" },
  { key: "execution", label: "Execution" },
  { key: "entertainment", label: "Entertainment" },
];
