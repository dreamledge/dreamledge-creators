export type CreatorCategory =
  | "comedy"
  | "skits"
  | "sports"
  | "reactions"
  | "education"
  | "motivation"
  | "beauty"
  | "fashion"
  | "lifestyle"
  | "commentary"
  | "gaming"
  | "podcast clips"
  | "fitness"
  | "news takes"
  | "storytelling";

export type CreatorGoal =
  | "grow audience"
  | "win contests"
  | "get discovered"
  | "find collaborators"
  | "build community"
  | "attract brands";

export type ContentPlatform = "tiktok" | "youtube" | "twitter" | "facebook" | "unknown";
export type FeedTab = "for-you" | "following" | "trending" | "new" | "contests" | "battles";
export type BattleStatus = "matchmaking" | "live" | "judging" | "completed" | "draw";
export type BattleType = "open battle" | "direct challenge" | "themed battle" | "category battle";
export type NotificationType =
  | "new follower"
  | "new comment"
  | "new reply"
  | "new like"
  | "battle invite"
  | "battle result"
  | "contest reminder"
  | "contest result"
  | "message received"
  | "crew invite";

export interface UserModel {
  id: string;
  username: string;
  displayName: string;
  email: string;
  photoUrl: string;
  bannerUrl: string;
  bio: string;
  categories: CreatorCategory[];
  goals: CreatorGoal[];
  socialLinks: Partial<Record<"tiktok" | "youtube" | "twitter" | "facebook", string>>;
  totalPoints: number;
  battleWins: number;
  contestWins: number;
  followerCount: number;
  followingCount: number;
  badges: string[];
  verified: boolean;
  rookie: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentModel {
  id: string;
  creatorId: string;
  platform: ContentPlatform;
  sourceUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
  caption: string;
  category: string;
  tags: string[];
  status: string;
  featured: boolean;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BattleModel {
  id: string;
  creatorAId: string;
  creatorBId: string;
  contentAId: string;
  contentBId: string;
  type: BattleType;
  category: string;
  theme: string;
  status: BattleStatus;
  creatorAWatchTime: number;
  creatorBWatchTime: number;
  creatorAJudged: boolean;
  creatorBJudged: boolean;
  creatorAScore: number;
  creatorBScore: number;
  winnerId: string | null;
  createdAt: string;
  startAt: string;
  endAt: string;
  updatedAt: string;
}

export interface BattleJudgmentModel {
  id: string;
  battleId: string;
  judgeCreatorId: string;
  targetCreatorId: string;
  watchedSeconds: number;
  originality: number;
  quality: number;
  creativity: number;
  averageScore: number;
  submittedAt: string;
}

export interface ContestModel {
  id: string;
  title: string;
  description: string;
  category: string;
  bannerUrl: string;
  rules: string;
  status: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface ContestEntryModel {
  id: string;
  contestId: string;
  creatorId: string;
  contentId: string;
  voteCount: number;
  judgeScore: number;
  rank: number;
  createdAt: string;
}

export interface ConversationModel {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface MessageModel {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  messageType: string;
  sharedContentId?: string;
  createdAt: string;
}

export interface CrewModel {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  ownerId: string;
  memberCount: number;
  totalPoints: number;
  createdAt: string;
}

export interface CrewMemberModel {
  id: string;
  crewId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface NotificationModel {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  targetId: string;
  targetType: string;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardSnapshotModel {
  id: string;
  userId: string;
  scope: "global" | "weekly" | "rookie" | "battle winners" | "category";
  category?: string;
  points: number;
  battleWins: number;
  contestWins: number;
  rank: number;
}

export interface ReportModel {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  photoUrl: string;
  onboardingComplete: boolean;
}
