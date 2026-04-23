import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "@/app/router/RouteGuards";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { AppLayout } from "@/app/layouts/AppLayout";
import { AdminLayout } from "@/app/layouts/AdminLayout";
import { MessagesLayout } from "@/app/layouts/MessagesLayout";
import { LandingPage } from "@/pages/public/LandingPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { FaqPage } from "@/pages/public/FaqPage";
import { HowItWorksPage } from "@/pages/public/HowItWorksPage";
import { PrivacyPage } from "@/pages/public/PrivacyPage";
import { TermsPage } from "@/pages/public/TermsPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { SignupPage } from "@/pages/public/SignupPage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { HomePage } from "@/pages/app/HomePage";
import { ExplorePage } from "@/pages/app/ExplorePage";
import { CreatePage } from "@/pages/app/CreatePage";
import { SelectMatchmakingContentPage } from "@/pages/app/SelectMatchmakingContentPage";
import { ReviewSessionPage } from "@/pages/app/ReviewSessionPage";
import { BattlesPage } from "@/pages/app/BattlesPage";
import { BattleDetailPage } from "@/pages/app/BattleDetailPage";
import { ContestsPage } from "@/pages/app/ContestsPage";
import { ContestDetailPage } from "@/pages/app/ContestDetailPage";
import { LeaderboardsPage } from "@/pages/app/LeaderboardsPage";
import { MessagesPage } from "@/pages/app/MessagesPage";
import { SocialPage } from "@/pages/app/SocialPage";
import { ConversationPage } from "@/pages/app/ConversationPage";
import { CrewsPage } from "@/pages/app/CrewsPage";
import { CrewDetailPage } from "@/pages/app/CrewDetailPage";
import { NotificationsPage } from "@/pages/app/NotificationsPage";
import { PublicProfilePage } from "@/pages/app/PublicProfilePage";
import { MyProfilePage } from "@/pages/app/MyProfilePage";
import { SettingsPage } from "@/pages/app/SettingsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminContestsPage } from "@/pages/admin/AdminContestsPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import { AdminFeaturedPage } from "@/pages/admin/AdminFeaturedPage";
import { AdminBattlesPage } from "@/pages/admin/AdminBattlesPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app/home" element={<HomePage />} />
          <Route path="/app/explore" element={<ExplorePage />} />
          <Route path="/app/create" element={<CreatePage />} />
          <Route path="/app/review-select" element={<SelectMatchmakingContentPage />} />
          <Route path="/app/review-session" element={<ReviewSessionPage />} />
          <Route path="/app/battles" element={<BattlesPage />} />
          <Route path="/app/battles/:battleId" element={<BattleDetailPage />} />
          <Route path="/app/contests" element={<ContestsPage />} />
          <Route path="/app/contests/:contestId" element={<ContestDetailPage />} />
          <Route path="/app/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/app/crews" element={<CrewsPage />} />
          <Route path="/app/crews/:crewId" element={<CrewDetailPage />} />
          <Route path="/app/notifications" element={<NotificationsPage />} />
          <Route path="/app/profile/:userId" element={<PublicProfilePage />} />
          <Route path="/app/me" element={<MyProfilePage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/social" element={<SocialPage />} />
          <Route path="/app/messages" element={<MessagesPage />} />
        </Route>

        <Route element={<MessagesLayout />}>
          <Route path="/app/messages/:conversationId" element={<ConversationPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/contests" element={<AdminContestsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/featured" element={<AdminFeaturedPage />} />
          <Route path="/admin/battles" element={<AdminBattlesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
