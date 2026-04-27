import { useEffect, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { getUserById } from "@/lib/firebase/publicData";
import type { UserModel } from "@/types/models";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import { VerifiedBadge } from "@/components/ui/VerifiedLabel";

interface LikedByModalContextType {
  isOpen: boolean;
  openLikedBy: (contentId: string, likedBy: string[]) => void;
  closeLikedBy: () => void;
  contentId: string | null;
  likedByUsers: UserModel[];
  loading: boolean;
}

const LikedByModalContext = createContext<LikedByModalContextType>({
  isOpen: false,
  openLikedBy: () => {},
  closeLikedBy: () => {},
  contentId: null,
  likedByUsers: [],
  loading: false,
});

export function useLikedByModal() {
  return useContext(LikedByModalContext);
}

export function LikedByModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [likedByIds, setLikedByIds] = useState<string[]>([]);
  const [likedByUsers, setLikedByUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(false);

  const openLikedBy = (contentId: string, likedBy: string[]) => {
    setContentId(contentId);
    setLikedByIds(likedBy);
    setIsOpen(true);
  };

  const closeLikedBy = () => {
    setIsOpen(false);
    setContentId(null);
    setLikedByIds([]);
    setLikedByUsers([]);
  };

  useEffect(() => {
    if (!isOpen || likedByIds.length === 0) {
      setLikedByUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      const users: UserModel[] = [];
      
      for (const userId of likedByIds) {
        try {
          const user = await getUserById(userId);
          if (user) {
            users.push(user);
          }
        } catch {
          // Skip users that can't be fetched
        }
      }
      
      setLikedByUsers(users);
      setLoading(false);
    };

    fetchUsers();
  }, [isOpen, likedByIds]);

  return (
    <LikedByModalContext.Provider value={{ isOpen, openLikedBy, closeLikedBy, contentId, likedByUsers, loading }}>
      {children}
      {isOpen && <LikedByModalContent />}
    </LikedByModalContext.Provider>
  );
}

function LikedByModalContent() {
  const { likedByUsers, loading, closeLikedBy } = useLikedByModal();

  return (
    <div className="modal-overlay" onClick={closeLikedBy}>
      <div className="liked-by-modal" onClick={(e) => e.stopPropagation()}>
        <div className="liked-by-header">
          <h3>Liked by</h3>
          <button className="close-btn" onClick={closeLikedBy}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="liked-by-list">
          {loading ? (
            <div className="liked-by-loading">Loading...</div>
          ) : likedByUsers.length === 0 ? (
            <div className="liked-by-empty">No likes yet</div>
          ) : (
            likedByUsers.map((likedUser) => (
              <div key={likedUser.id} className="liked-by-user">
                <img 
                  src={likedUser.photoUrl || DEFAULT_AVATAR_URL} 
                  alt={likedUser.displayName || likedUser.username}
                  className="liked-by-avatar"
                />
                <div className="liked-by-info">
                  <div className="liked-by-name">
                    <span className="username">{likedUser.displayName || likedUser.username}</span>
                    {likedUser.verified && <VerifiedBadge />}
                  </div>
                  {likedUser.username && likedUser.username !== likedUser.displayName && (
                    <span className="liked-by-username">@{likedUser.username}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}