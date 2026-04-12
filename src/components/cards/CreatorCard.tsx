import { CheckCircle2, ExternalLink, Globe, Music2, Play, Quote } from "lucide-react";
import { GradientCard } from "@/components/ui/GradientCard";
import { formatCompactNumber } from "@/lib/formatters";
import type { UserModel } from "@/types/models";

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

const socialIcons = {
  tiktok: Music2,
  youtube: Play,
  twitter: Quote,
  facebook: Globe,
};

export function CreatorCard({ creator, showSocialLinks = false }: { creator: UserModel; showSocialLinks?: boolean }) {
  const socialEntries = Object.entries(creator.socialLinks).filter(([, value]) => Boolean(value));

  return (
    <GradientCard className="space-y-4">
      <img src={creator.photoUrl} alt={creator.displayName} className="h-16 w-16 rounded-[28px] object-cover" />
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-text-primary">{creator.displayName}</h3>
          {creator.verified ? <CheckCircle2 size={16} className="text-accent" /> : null}
        </div>
        <p className="text-sm text-text-secondary">@{creator.username}</p>
      </div>
      <p className="text-sm text-text-secondary">{creator.bio}</p>
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>{formatCompactNumber(creator.totalPoints)} pts</span>
        <span>{creator.battleWins} wins</span>
      </div>
      {showSocialLinks && socialEntries.length ? (
        <div className="space-y-2 border-t border-white/8 pt-3">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Visit socials</p>
          <div className="flex flex-wrap gap-2">
            {socialEntries.map(([platform, value]) => {
              const Icon = socialIcons[platform as keyof typeof socialIcons] ?? ExternalLink;
              return (
                <a
                  key={platform}
                  href={normalizeSocialUrl(platform, value ?? "")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[999px] border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                >
                  <Icon size={14} />
                  <span className="capitalize">{platform}</span>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </GradientCard>
  );
}
