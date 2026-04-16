import { ExternalLink } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import type { UserModel } from "@/types/models";
import { useAuth } from "@/app/providers/AuthProvider";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";

function normalizeSocialUrl(platform: string, value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("@")) {
    if (platform === "tiktok") return `https://www.tiktok.com/${value}`;
    if (platform === "twitter") return `https://x.com/${value.slice(1)}`;
  }
  if (platform === "youtube") return `https://${value}`;
  if (platform === "facebook") return `https://${value}`;
  if (platform === "twitter") return `https://${value}`;
  return value;
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.95 1.43a1.17 1.17 0 1 1 0 2.34 1.17 1.17 0 0 1 0-2.34ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9A3.1 3.1 0 1 0 12 15.1 3.1 3.1 0 0 0 12 8.9Z" />
      </svg>
    );
  }

  if (platform === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M14.64 3c.2 1.67 1.16 3.27 2.56 4.18.96.63 2.05.96 3.2.99v2.98a8.43 8.43 0 0 1-4.82-1.52v5.62c0 3.06-2.45 5.64-5.63 5.75A5.74 5.74 0 0 1 4 15.3a5.76 5.76 0 0 1 7.08-5.6v3.08a2.78 2.78 0 0 0-1.14-.08 2.76 2.76 0 0 0-2.3 2.75A2.76 2.76 0 0 0 10.4 18.2a2.78 2.78 0 0 0 2.7-2.77V3h1.54Z" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21.58 7.19a2.97 2.97 0 0 0-2.09-2.1C17.65 4.6 12 4.6 12 4.6s-5.65 0-7.49.49A2.97 2.97 0 0 0 2.42 7.2C1.94 9.05 1.94 12 1.94 12s0 2.95.48 4.8a2.97 2.97 0 0 0 2.09 2.1c1.84.49 7.49.49 7.49.49s5.65 0 7.49-.49a2.97 2.97 0 0 0 2.09-2.1c.48-1.85.48-4.8.48-4.8s0-2.95-.48-4.81ZM10.2 15.1V8.9L15.65 12l-5.45 3.1Z" />
      </svg>
    );
  }

  if (platform === "twitter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.9 2H22l-6.77 7.74L23.2 22h-6.27l-4.91-7.43L5.5 22H2.38l7.24-8.28L1.97 2H8.4l4.43 6.84L18.9 2Zm-1.1 18h1.74L7.45 3.9H5.59L17.8 20Z" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.56c0-.93.25-1.56 1.58-1.56h1.69V4.14A22.65 22.65 0 0 0 14.3 4c-2.44 0-4.11 1.49-4.11 4.22v2.38H7.42v3.2h2.77V22h3.3Z" />
      </svg>
    );
  }

  if (platform === "twitch") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M4.2 2 2 7.4v12.2h4.1V22h2.6l2.58-2.4h3.09L20.8 14V2H4.2Zm14.5 11.03-3.66 3.57h-3.68l-2.57 2.39v-2.4H5.13V4.1H18.7v8.93ZM10.98 7.02h1.93v5.33h-1.93V7.02Zm5.28 0h-1.92v5.33h1.92V7.02Z" />
      </svg>
    );
  }

  return <ExternalLink size={18} aria-hidden="true" />;
}

export function CreatorCard({ creator, showSocialLinks = false }: { creator: UserModel; showSocialLinks?: boolean }) {
  const { user, toggleFollow } = useAuth();
  const socialEntries = Object.entries(creator.socialLinks ?? {}).filter(([, value]) => Boolean(value));
  const isOwn = user?.id === creator.id;
  const isFollowing = !!user && user.id !== creator.id && (user.followingIds ?? []).includes(creator.id);

  return (
    <div className="profile-card-container">
      <article className="profile-card explore-creator-card">
        <div className="profile-image">
          <img src={creator.photoUrl} alt={creator.displayName} />
        </div>

        <div className="profile-info">
          <VerifiedLabel
            text={creator.displayName}
            verified={creator.verified}
            balanceIcon
            className="profile-name-row"
            textClassName="profile-name"
            iconClassName="h-[18px] w-[18px]"
          />
          <div className="profile-title-row">
            <VerifiedLabel text={`@${creator.username}`} verified={false} textClassName="profile-title" />
          </div>
          {creator.bio ? <div className="profile-bio">{creator.bio}</div> : null}
        </div>

        {showSocialLinks && socialEntries.length ? (
          <div className="social-links explore-social-links">
            {socialEntries.map(([platform, value]) => {
              return (
                <a
                  key={platform}
                  href={normalizeSocialUrl(platform, value ?? "")}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn explore-social-btn"
                  aria-label={`Open ${creator.displayName} on ${platform}`}
                >
                  <SocialIcon platform={platform} />
                </a>
              );
            })}
          </div>
        ) : null}

        <div className="explore-card-actions">
          <button
            type="button"
            className="cta-button edit-profile explore-card-button"
            onClick={() => {
              if (!isOwn) toggleFollow(creator.id);
            }}
          >
            {isOwn ? "You" : isFollowing ? "Following" : "Follow"}
          </button>
          <button type="button" className="cta-button edit-profile explore-card-button">
            Message
          </button>
        </div>

        <div className="stats explore-card-stats">
          <div className="stat-item">
            <div className="stat-value">{formatCompactNumber(creator.totalPoints)}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{creator.battleWins}</div>
            <div className="stat-label">Wins</div>
          </div>
        </div>
      </article>
    </div>
  );
}
