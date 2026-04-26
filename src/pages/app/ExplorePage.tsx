import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { CreatorCard } from "@/components/cards/CreatorCard";
import { BattleCard } from "@/components/cards/BattleCard";
import { ContestCard } from "@/components/cards/ContestCard";
import { mockBattles, mockContests, mockUsers } from "@/lib/constants/mockData";
import { subscribePublicUsers } from "@/lib/firebase/publicData";
import type { UserModel } from "@/types/models";

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [publicUsers, setPublicUsers] = useState<UserModel[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribePublicUsers(setPublicUsers);
    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const currentUserId = user?.id;

    const mockUserIds = new Set(mockUsers.map((u) => u.id));
    const uniquePublicUsers = publicUsers.filter((u) => u.id !== currentUserId && !mockUserIds.has(u.id));

    const allUsers: UserModel[] = [...mockUsers.filter((u) => u.id !== currentUserId), ...uniquePublicUsers];

    if (!query) return allUsers;

    return allUsers.filter((user) => {
      const username = user.username.toLowerCase();
      const displayName = user.displayName.toLowerCase();
      return username.includes(query) || displayName.includes(query);
    });
  }, [searchQuery, user, publicUsers]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return filteredUsers.slice(0, 6);
  }, [filteredUsers, searchQuery]);

  const handleSelectSuggestion = (creator: UserModel) => {
    setSearchQuery("");
    navigate(`/app/profile/${creator.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="explore-page-hero">
        <div className="explore-page-title">
          <div className="home-header-text explore-header-text">
            <span>search for</span>
            <span className="home-header-creators">creators</span>
          </div>
        </div>
        <div className="searchBox explore-search-box">
          <input
            className="searchInput explore-search-input"
            type="text"
            placeholder="Search creators"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button type="button" className="searchButton explore-search-button" aria-label="Search creators">
            <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none">
              <g clipPath="url(#explore-search-clip)">
                <g filter="url(#explore-search-filter)">
                  <path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" shapeRendering="crispEdges"></path>
                </g>
              </g>
              <defs>
                <filter id="explore-search-filter" x="-0.418549" y="3.70435" width="29.7139" height="29.7139" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
                  <feOffset dy="4"></feOffset>
                  <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                  <feComposite in2="hardAlpha" operator="out"></feComposite>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_17"></feBlend>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_17" result="shape"></feBlend>
                </filter>
                <clipPath id="explore-search-clip">
                  <rect width="28.0702" height="28.0702" fill="white" transform="translate(0.403503 0.526367)"></rect>
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
        {searchSuggestions.length > 0 && (
          <div className="explore-suggestions">
            {searchSuggestions.map((creator) => (
              <button
                key={creator.id}
                type="button"
                className="explore-suggestion"
                onClick={() => handleSelectSuggestion(creator)}
              >
                <img src={creator.photoUrl} alt={creator.displayName} className="explore-suggestion-avatar" />
                <div className="explore-suggestion-info">
                  <span className="explore-suggestion-username">@{creator.username}</span>
                  <span className="explore-suggestion-displayname">{creator.displayName}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {filteredUsers.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{filteredUsers.map((user) => <CreatorCard key={user.id} creator={user} showSocialLinks />)}</div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-6 text-center text-sm text-zinc-400">
          No creators found for "{searchQuery.trim()}".
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-2">{mockBattles.map((battle) => <BattleCard key={battle.id} battle={battle} />)}</div>
      <div className="grid gap-4 xl:grid-cols-2">{mockContests.map((contest) => <ContestCard key={contest.id} contest={contest} />)}</div>
    </div>
  );
}

export default ExplorePage;
