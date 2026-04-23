import type { ContentPlatform } from "@/types/models";

function extractTikTokVideoId(url: string) {
  return url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i)?.[1] ?? url.match(/\/video\/(\d+)/i)?.[1] ?? null;
}

export function detectPlatform(url: string): ContentPlatform {
  const value = url.toLowerCase();
  if (value.includes("tiktok.com")) return "tiktok";
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  if (value.includes("twitter.com") || value.includes("x.com")) return "twitter";
  if (value.includes("facebook.com") || value.includes("fb.watch")) return "facebook";
  return "unknown";
}

export function buildEmbedUrl(url: string, platform: ContentPlatform): string {
  if (platform === "youtube") {
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    const longMatch = url.match(/[?&]v=([^?&]+)/);
    const id = shortMatch?.[1] ?? longMatch?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (platform === "tiktok") {
    const id = extractTikTokVideoId(url);
    return id ? `https://www.tiktok.com/player/v1/${id}` : url;
  }

  return url;
}

export function validateCreatorUrl(url: string) {
  try {
    const parsed = new URL(url);
    const platform = detectPlatform(url);
    return {
      valid: ["https:", "http:"].includes(parsed.protocol) && platform !== "unknown",
      platform,
    };
  } catch {
    return { valid: false, platform: "unknown" as const };
  }
}
