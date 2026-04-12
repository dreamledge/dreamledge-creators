import type { CreatorCategory, CreatorGoal } from "@/types/models";

export const creatorCategories: CreatorCategory[] = [
  "comedy",
  "skits",
  "sports",
  "reactions",
  "education",
  "motivation",
  "beauty",
  "fashion",
  "lifestyle",
  "commentary",
  "gaming",
  "podcast clips",
  "fitness",
  "news takes",
  "storytelling",
];

export const creatorGoals: CreatorGoal[] = [
  "grow audience",
  "win contests",
  "get discovered",
  "find collaborators",
  "build community",
  "attract brands",
];

export const contestCategories = [
  "funniest clip",
  "best creator of the week",
  "best educational content",
  "best commentary",
  "best sports creator",
  "best storytime",
  "best visual editing",
  "best motivational creator",
];

export const pointsSystem = {
  uploadContent: 5,
  receiveLike: 1,
  postComment: 1,
  battleWin: 20,
  contestWin: 50,
  featuredContent: 30,
  dailyStreak: 3,
};
