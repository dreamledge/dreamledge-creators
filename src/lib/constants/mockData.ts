import { buildLeaderboard } from "@/lib/utils/leaderboard";
import type {
  BattleModel,
  ContestEntryModel,
  ContestModel,
  ContentModel,
  ConversationModel,
  CrewMemberModel,
  CrewModel,
  MessageModel,
  NotificationModel,
  ReportModel,
  UserModel,
} from "@/types/models";

export const LIVE_CONTENT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const mockUsers: UserModel[] = [];
export const mockContent: ContentModel[] = [];

export function isContentVisible(item: ContentModel, currentTime = Date.now()): boolean {
  if (!(item.platform === "twitch" && item.status === "live")) {
    return true;
  }

  const createdAt = new Date(item.createdAt).getTime();
  if (!Number.isFinite(createdAt)) {
    return false;
  }

  return currentTime - createdAt < LIVE_CONTENT_MAX_AGE_MS;
}

export function getVisibleMockContent(currentTime = Date.now()): ContentModel[] {
  return mockContent.filter((item) => isContentVisible(item, currentTime));
}

export const mockBattles: BattleModel[] = [];
export const mockContests: ContestModel[] = [];
export const mockContestEntries: ContestEntryModel[] = [];
export const mockConversations: ConversationModel[] = [];
export const mockMessages: MessageModel[] = [];
export const mockCrews: CrewModel[] = [];
export const mockCrewMembers: CrewMemberModel[] = [];
export const mockNotifications: NotificationModel[] = [];
export const mockReports: ReportModel[] = [];

export const mockLeaderboard = buildLeaderboard(mockUsers, "global");
export const mockWeeklyLeaderboard = buildLeaderboard(mockUsers, "weekly");
