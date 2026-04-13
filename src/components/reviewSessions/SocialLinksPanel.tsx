import { AtSign, ExternalLink, Globe, Music2, Play, Quote, Tv } from "lucide-react";
import type { UserModel } from "@/types/models";

const socialIcons = {
  instagram: AtSign,
  tiktok: Music2,
  youtube: Play,
  twitter: Quote,
  twitch: Tv,
  website: Globe,
};

function normalizeUrl(platform: string, value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("@")) {
    if (platform === "instagram") return `https://instagram.com/${value.slice(1)}`;
    if (platform === "tiktok") return `https://www.tiktok.com/${value}`;
    if (platform === "twitter") return `https://x.com/${value.slice(1)}`;
  }
  return `https://${value}`;
}

export function SocialLinksPanel({ creator }: { creator: UserModel }) {
  const entries = Object.entries(creator.socialLinks).filter(([platform]) => ["instagram", "tiktok", "youtube", "twitter", "twitch", "website"].includes(platform));

  return (
    <div className="bubble-card rounded-[34px] p-4">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Social links</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(([platform, value]) => {
          const Icon = socialIcons[platform as keyof typeof socialIcons] ?? ExternalLink;
          return (
            <a
              key={platform}
              href={normalizeUrl(platform, value ?? "")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[999px] border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
            >
              <Icon size={14} />
              <span className="capitalize">{platform === "twitter" ? "Twitter/X" : platform}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
