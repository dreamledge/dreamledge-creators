import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { EditProfileModal } from "@/components/ui/EditProfileModal";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import type { UserModel } from "@/types/models";

interface ProfileCardProps {
  creator: UserModel;
  isOwnProfile?: boolean;
}

export function ProfileCard({ creator, isOwnProfile = false }: ProfileCardProps) {
  const { user } = useAuth();
  const isOwn = isOwnProfile || user?.id === creator.id;
  const [showEditModal, setShowEditModal] = useState(false);
  
  const followerCount = creator.followerCount?.toLocaleString() || "0";
  const totalPoints = creator.totalPoints || 0;

  return (
    <>
      <div className="profile-card-container">
        <div className="profile-card">
          <div className="profile-image">
            <img src={creator.photoUrl} alt={creator.displayName} />
          </div>
          <div className="profile-info">
            <VerifiedLabel
              text={creator.displayName}
              verified={creator.verified}
              className="profile-name-row"
              textClassName="profile-name"
              iconClassName="h-[18px] w-[18px]"
            />
            <div className="profile-title-row">
              <VerifiedLabel text={`@${creator.username}`} verified={false} textClassName="profile-title" />
            </div>
            {creator.bio && <div className="profile-bio">{creator.bio}</div>}
          </div>
          
          <div className="social-links">
            <button
              type="button"
              className={`social-btn twitter ${creator.socialLinks?.twitter ? 'has-link' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const link = creator.socialLinks?.twitter;
                if (link) {
                  window.open(link, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path></svg>
            </button>
            <button
              type="button"
              className={`social-btn instagram ${creator.socialLinks?.instagram ? 'has-link' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const link = creator.socialLinks?.instagram;
                if (link) {
                  window.open(link, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98z"></path></svg>
            </button>
            <button
              type="button"
              className={`social-btn youtube ${creator.socialLinks?.youtube ? 'has-link' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const link = creator.socialLinks?.youtube;
                if (link) {
                  window.open(link, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
            </button>
            <button
              type="button"
              className={`social-btn tiktok ${creator.socialLinks?.tiktok ? 'has-link' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const link = creator.socialLinks?.tiktok;
                if (link) {
                  window.open(link, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>
            </button>
          </div>
          
          <button 
            className={`cta-button ${isOwn ? 'edit-profile' : 'follow-profile'}`}
            onClick={() => isOwn ? setShowEditModal(true) : null}
          >
            {isOwn ? 'Edit Profile' : 'Follow'}
          </button>
          
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{followerCount}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{creator.followingCount || 0}</div>
              <div className="stat-label">Following</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{totalPoints.toLocaleString()}</div>
              <div className="stat-label">Points</div>
            </div>
          </div>
        </div>
      </div>
      
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </>
  );
}
