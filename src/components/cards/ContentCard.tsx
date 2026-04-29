import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Share2, Bookmark, Trash2, X } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import { mockUsers, LIVE_CONTENT_MAX_AGE_MS } from "@/lib/constants/mockData";
import type { ContentModel, SocialPlatform, UserModel } from "@/types/models";
import { useFeedContext } from "../feed/FeedList";
import { useAuth } from "@/app/providers/AuthProvider";
import { deleteContent, toggleContentLike } from "@/lib/firebase/content";
import { useCommentModal } from "../overlays/CommentModal";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import { DEFAULT_AVATAR_URL, DEFAULT_CONTENT_THUMBNAIL } from "@/lib/constants/defaults";
import { OrwellianEye } from "@/components/ui/OrwellianEye";

declare global {
  interface Window {
    tiktokEmbedLoad?: () => void;
  }
}

const TIKTOK_EMBED_SCRIPT_SRC = "https://www.tiktok.com/embed.js";

function extractTikTokVideoId(url: string) {
  return url.match(/embed\/v2\/(\d+)/i)?.[1] ?? url.match(/video\/(\d+)/i)?.[1] ?? null;
}

async function ensureTikTokEmbedScript() {
  if (typeof window === "undefined") return;

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${TIKTOK_EMBED_SCRIPT_SRC}"]`);
  if (existingScript) {
    if (window.tiktokEmbedLoad) return;
    await new Promise<void>((resolve) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      window.setTimeout(() => resolve(), 1200);
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TIKTOK_EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load TikTok embed script"));
    document.body.appendChild(script);
  });
}

interface ContentCardProps {
  content: ContentModel;
  hideActions?: boolean;
  creatorOverride?: UserModel | null;
  userLiked?: boolean;
  onOpenLikedBy?: (contentId: string, likedBy: string[]) => void;
}

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M4 3 2 8v11h4v3h3l3-3h4l6-6V3H4zm16 9-3 3h-4l-3 3v-3H6V5h14v7zm-8-5h-2v5h2V7zm5 0h-2v5h2V7z" />
  </svg>
);

export function ContentCard({ content, hideActions = false, creatorOverride = null, userLiked = false, onOpenLikedBy }: ContentCardProps) {
  const { currentPlayingId, setCurrentPlaying, mediaUnlockToken } = useFeedContext();
  const { openCommentModal } = useCommentModal();
  const { user } = useAuth();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const youtubeSyncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const youtubeSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tiktokFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tiktokScriptHostRef = useRef<HTMLDivElement | null>(null);
  const isPlaying = currentPlayingId === content.id;
  const [liveCountdown, setLiveCountdown] = useState<string>("");
  const isTikTok = content.platform.toLowerCase() === "tiktok" || /tiktok\.com/i.test(content.sourceUrl || content.embedUrl || "");
  const [tiktokVariant, setTiktokVariant] = useState<"player" | "v2">("player");
  const [tiktokMode, setTiktokMode] = useState<"iframe" | "script">("iframe");
  const showVideoLoader = isPlaying && !!videoSrc && !iframeLoaded;
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(userLiked ?? false);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  
  const isOwnContent = user?.id === content.creatorId;

  useEffect(() => {
    setIsLiked(userLiked ?? false);
  }, [userLiked]);

  useEffect(() => {
    setLikeCount(content.likeCount);
  }, [content.likeCount]);

  const handleToggleLike = async () => {
    if (!user) return;
    
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    try {
      await toggleContentLike(content.id, user.id, content.creatorId, user.displayName || user.username);
    } catch {
      setIsLiked(wasLiked);
      setLikeCount(content.likeCount);
    }
  };

  const handleOpenLikedBy = () => {
    if (onOpenLikedBy && content.likedBy?.length > 0) {
      onOpenLikedBy(content.id, content.likedBy);
    }
  };

  const handleDelete = async () => {
    if (!isOwnContent || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      await deleteContent(content.id, content.creatorId);
      setShowDeleteConfirm(false);
    } catch {
      setIsDeleting(false);
    }
  };

  const creator = creatorOverride ?? mockUsers.find((user) => user.id === content.creatorId) ?? null;

  useEffect(() => {
    if (content.status !== "live" || !content.createdAt) return;
    
    const updateCountdown = () => {
      const createdAt = new Date(content.createdAt).getTime();
      const now = Date.now();
      const elapsed = now - createdAt;
      const remaining = LIVE_CONTENT_MAX_AGE_MS - elapsed;
      
      if (remaining <= 0) {
        setLiveCountdown("Expired");
        return false;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setLiveCountdown(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      return true;
    };
    
    const isVisible = updateCountdown();
    if (!isVisible) return;
    
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [content.status, content.createdAt]);

  const getPlatformIcon = () => {
    const platform = content.platform.toLowerCase();
    switch (platform) {
      case "instagram": return <InstagramIcon />;
      case "tiktok": return <TikTokIcon />;
      case "youtube": return <YouTubeIcon />;
      case "twitch": return <TwitchIcon />;
      case "twitter":
      case "x": return <TwitterIcon />;
      default: return null;
    }
  };

  const getEmbedSrc = (embedUrl: string, muted: boolean): string => {
    if (!embedUrl) return "";
    let src = embedUrl;
    const useMute = muted ? 1 : 0;
    const origin = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
    if (embedUrl.includes("youtube.com/shorts/")) {
      const videoId = embedUrl.split("shorts/")[1]?.split("?")[0];
      if (videoId) {
        src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${useMute}&loop=1&playlist=${videoId}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1${origin ? `&origin=${origin}` : ""}`;
      }
    } else if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
      const videoId = embedUrl.split("v=")[1]?.split("&")[0] || embedUrl.split("/").pop();
      src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${useMute}&loop=1&playlist=${videoId}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1${origin ? `&origin=${origin}` : ""}`;
    } else if (embedUrl.includes("tiktok.com")) {
      const videoId = extractTikTokVideoId(embedUrl) ?? extractTikTokVideoId(content.sourceUrl || "");
      if (videoId) {
        const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
        src = `https://www.tiktok.com/embed/v2/${videoId}?lang=en&parent=${parent}`;
      }
    } else if (embedUrl.includes("instagram.com")) {
      const shortcode = embedUrl.match(/\/p\/([A-Za-z0-9_-]+)/)?.[1] || embedUrl.match(/\/reel\/([A-Za-z0-9_-]+)/)?.[1];
      if (shortcode) {
        src = `https://www.instagram.com/p/${shortcode}/embed/?__a=1&__d=1`;
      }
    } else if (embedUrl.includes("twitch.tv")) {
      const channel = embedUrl.split("twitch.tv/")[1]?.split(/[/?#]/)[0];
      const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
      if (channel) {
        src = `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=${useMute === 1 ? "true" : "false"}&autoplay=true`;
      }
    } else if (embedUrl.includes("facebook.com") || embedUrl.includes("fb.watch")) {
      const videoId = embedUrl.match(/v=(\d+)/)?.[1] || embedUrl.match(/\/watch\/\?v=(\d+)/)?.[1];
      if (videoId) {
        src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(embedUrl)}&show_text=0&mute=${useMute}&autoplay=1`;
      } else {
        src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(embedUrl)}&show_text=0&mute=${useMute}&autoplay=1`;
      }
    }
    return src;
  };

  useEffect(() => {
    if (isPlaying) {
      setIframeLoaded(false);
      setTiktokVariant("player");
      setTiktokMode("iframe");
      const nextSrc = getEmbedSrc(content.embedUrl || content.sourceUrl || "", true);
      setVideoSrc(nextSrc);

      const timer = setTimeout(() => {
        setVideoSrc(getEmbedSrc(content.embedUrl || content.sourceUrl || "", true));
      }, 80);
      return () => window.clearTimeout(timer);
    } else {
      setIframeLoaded(false);
      setVideoSrc("");
    }
  }, [content.embedUrl, content.sourceUrl, isPlaying, mediaUnlockToken]);

  useEffect(() => {
    if (tiktokFallbackTimeoutRef.current) {
      clearTimeout(tiktokFallbackTimeoutRef.current);
      tiktokFallbackTimeoutRef.current = null;
    }

    if (!isPlaying || !isTikTok || iframeLoaded || tiktokMode !== "iframe") return;

    if (tiktokVariant === "player") {
      tiktokFallbackTimeoutRef.current = setTimeout(() => {
        setTiktokVariant("v2");
        setVideoSrc(getEmbedSrc(content.embedUrl || content.sourceUrl || "", true));
      }, 2200);
    } else {
      tiktokFallbackTimeoutRef.current = setTimeout(() => {
        setTiktokMode("script");
        setIframeLoaded(false);
      }, 2200);
    }

    return () => {
      if (tiktokFallbackTimeoutRef.current) {
        clearTimeout(tiktokFallbackTimeoutRef.current);
        tiktokFallbackTimeoutRef.current = null;
      }
    };
  }, [content.embedUrl, content.sourceUrl, iframeLoaded, isPlaying, isTikTok, tiktokMode, tiktokVariant]);

  useEffect(() => {
    if (!isPlaying || !isTikTok || tiktokMode !== "script" || !tiktokScriptHostRef.current) {
      if (tiktokScriptHostRef.current) {
        tiktokScriptHostRef.current.innerHTML = "";
      }
      return;
    }

    let cancelled = false;
    const host = tiktokScriptHostRef.current;
    const source = content.sourceUrl || content.embedUrl;
    const videoId = extractTikTokVideoId(source || "");

    const mountScriptEmbed = async () => {
      try {
        await ensureTikTokEmbedScript();
        if (cancelled || !videoId) return;

        host.innerHTML = "";
        const blockquote = document.createElement("blockquote");
        blockquote.className = "tiktok-embed";
        blockquote.setAttribute("cite", source || "");
        blockquote.setAttribute("data-video-id", videoId);
        const section = document.createElement("section");
        blockquote.appendChild(section);
        host.appendChild(blockquote);

        if (typeof window.tiktokEmbedLoad === "function") {
          window.tiktokEmbedLoad();
        }

        window.setTimeout(() => {
          if (cancelled) return;
          const ready = Boolean(host.querySelector("iframe"));
          if (ready) {
            setIframeLoaded(true);
          }
        }, 1000);
      } catch {
        if (!cancelled) {
          setIframeLoaded(true);
        }
      }
    };

    void mountScriptEmbed();

    return () => {
      cancelled = true;
      host.innerHTML = "";
    };
  }, [content.embedUrl, content.sourceUrl, isPlaying, isTikTok, tiktokMode]);

  useEffect(() => {
    if (youtubeSyncIntervalRef.current) {
      clearInterval(youtubeSyncIntervalRef.current);
      youtubeSyncIntervalRef.current = null;
    }
    if (youtubeSyncTimeoutRef.current) {
      clearTimeout(youtubeSyncTimeoutRef.current);
      youtubeSyncTimeoutRef.current = null;
    }

    if (!isPlaying || !videoSrc || isTikTok) return;

    if (content.platform.toLowerCase() === "youtube") {
      if (!iframeLoaded || !iframeRef.current) return;

      const postCommand = (func: "playVideo" | "mute" | "unMute" | "setVolume", args: string | number[] = "") => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      };

      const syncAudio = () => {
        postCommand("playVideo");
        postCommand("mute");
      };

      syncAudio();
      youtubeSyncIntervalRef.current = setInterval(syncAudio, 100);
      youtubeSyncTimeoutRef.current = setTimeout(() => {
        if (youtubeSyncIntervalRef.current) {
          clearInterval(youtubeSyncIntervalRef.current);
          youtubeSyncIntervalRef.current = null;
        }
      }, 2000);
      return;
    }

    setVideoSrc(getEmbedSrc(content.embedUrl || content.sourceUrl || "", true));
  }, [content.embedUrl, content.platform, content.sourceUrl, iframeLoaded, isPlaying, isTikTok, tiktokVariant, videoSrc]);

  useEffect(() => {
    return () => {
      if (youtubeSyncIntervalRef.current) {
        clearInterval(youtubeSyncIntervalRef.current);
        youtubeSyncIntervalRef.current = null;
      }
      if (youtubeSyncTimeoutRef.current) {
        clearTimeout(youtubeSyncTimeoutRef.current);
        youtubeSyncTimeoutRef.current = null;
      }
      if (tiktokFallbackTimeoutRef.current) {
        clearTimeout(tiktokFallbackTimeoutRef.current);
        tiktokFallbackTimeoutRef.current = null;
      }
    };
  }, []);

  const handleVideoTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) {
      setCurrentPlaying(content.id);
    }
  };

  const socialLinks = creator?.socialLinks as Partial<Record<SocialPlatform, string>> | undefined;
  const hasInstagram = !!socialLinks?.instagram;
  const hasTikTok = !!socialLinks?.tiktok;
  const hasYouTube = !!socialLinks?.youtube;
  const hasTwitch = !!socialLinks?.twitch;
  const hasTwitter = !!socialLinks?.twitter;
  const isLiveContent = content.status === "live";

  return (
    <div className={`phone-card-outer ${isLiveContent ? "phone-card-outer-live" : ""}`} data-content-id={content.id}>
      {/* Creator Overlay - Above the card */}
      <div className={`creator-overlay ${isLiveContent ? "creator-overlay-live" : ""}`}>
        <div className="creator-left">
          <Link to={`/app/profile/${creator?.id}`} className="creator-link">
            <img 
              src={creator?.photoUrl || DEFAULT_AVATAR_URL}
              alt={creator?.displayName}
              className={`creator-photo ${isLiveContent ? "creator-photo-live" : ""}`}
            />
          </Link>
          <div className={`creator-info ${isLiveContent ? "creator-info-live" : ""}`}>
            {content.status === "live" ? (
              <span className="live-pill" aria-label="Live now">
                <span className="live-pill__bg">
                  <span className="live-pill__bg-layers">
                    <span className="live-pill__bg-layer live-pill__bg-layer-1"></span>
                    <span className="live-pill__bg-layer live-pill__bg-layer-2"></span>
                    <span className="live-pill__bg-layer live-pill__bg-layer-3"></span>
                  </span>
                </span>
                <span className="live-pill__inner">
                  <span className="live-pill__label">LIVE</span>
                  {liveCountdown && <span className="live-countdown">{liveCountdown}</span>}
                </span>
              </span>
            ) : null}
            <Link to={`/app/profile/${creator?.id}`} className="creator-name">
              <VerifiedLabel text={creator?.displayName || "Creator"} verified={creator?.verified} textClassName="creator-name" iconClassName="verified-label__icon--tiny" />
            </Link>
            <span className="platform-badge">
              {getPlatformIcon()}
              {content.platform}
            </span>
          </div>
        </div>
        <div className={`creator-socials ${isLiveContent ? "creator-socials-live" : ""}`}>
          {hasInstagram && (
            <a href={socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="creator-social-link" title="Instagram">
              <InstagramIcon />
            </a>
          )}
          {hasTikTok && (
            <a href={(socialLinks?.tiktok as string)?.startsWith("http") ? socialLinks?.tiktok : `https://tiktok.com/${(socialLinks?.tiktok as string)?.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="creator-social-link" title="TikTok">
              <TikTokIcon />
            </a>
          )}
          {hasYouTube && (
            <a href={(socialLinks?.youtube as string)?.startsWith("http") ? socialLinks?.youtube : `https://youtube.com/${(socialLinks?.youtube as string)?.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="creator-social-link" title="YouTube">
              <YouTubeIcon />
            </a>
          )}
          {hasTwitch && (
            <a href={socialLinks?.twitch} target="_blank" rel="noopener noreferrer" className="creator-social-link" title="Twitch">
              <TwitchIcon />
            </a>
          )}
          {hasTwitter && (
            <a href={socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="creator-social-link" title="Twitter/X">
              <TwitterIcon />
            </a>
          )}
        </div>
        
        {isOwnContent && (
          <button
            className="delete-post-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        )}
        
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <button className="delete-confirm-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
              <h3>Delete post?</h3>
              <p>Are you sure you want to delete this post? This cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button className="delete-confirm-cancel" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                  Cancel
                </button>
                <button className="delete-confirm-delete" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="card">
        {/* Left Side Buttons - btn1, btn2, btn3 */}
        <div className="btn1"></div>
        <div className="btn2"></div>
        <div className="btn3"></div>
        
        {/* Card Inner - Screen */}
        <div className="card-int" onClick={handleVideoTap}>
          {/* Notch - top */}
          <div className="top">
            <div className="camera">
              <div className="int"></div>
            </div>
            <div className="speaker"></div>
          </div>
          
          {/* Video Embed or Thumbnail or Loading */}
          {showVideoLoader ? (
            <div className={`video-loader ${iframeLoaded ? "fade-out" : ""}`}>
              <div className="loader-wrapper">
                <span className="loader-letter">d</span>
                <span className="loader-letter">r</span>
                <span className="loader-letter">e</span>
                <span className="loader-letter">a</span>
                <span className="loader-letter">m</span>
                <span className="loader-letter">i</span>
                <span className="loader-letter">n</span>
                <span className="loader-letter">g</span>
                <div className="loader-bg-1"></div>
                <div className="loader-bg-2"></div>
                <div className="loader"></div>
              </div>
            </div>
          ) : null}
          {isPlaying && tiktokMode === "script" ? (
              <div ref={tiktokScriptHostRef} className="video-embed" />
            ) : isPlaying && videoSrc ? (
              <iframe
                ref={iframeRef}
                src={videoSrc}
                className="video-embed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                onLoad={() => setIframeLoaded(true)}
                onError={() => {
                  if (isTikTok && tiktokMode === "iframe") {
                    if (tiktokVariant === "player") {
                      setTiktokVariant("v2");
                      setVideoSrc(getEmbedSrc(content.embedUrl || content.sourceUrl || "", true));
                    } else {
                      setTiktokMode("script");
                      setIframeLoaded(false);
                    }
                    return;
                  }

                  setIframeLoaded(true);
                }}
              />
            ) : (
              <img
                src={content.thumbnailUrl || DEFAULT_CONTENT_THUMBNAIL}
                alt={content.title} 
                className="video-thumbnail"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_CONTENT_THUMBNAIL;
                }}
              />
            )}

        </div>
</div>
       
      {/* Likes and Comments - Above the caption */}
      {!hideActions && (
      <div className="card-stats">
        <div className="like-section stat-btn">
          <OrwellianEye 
            filled={isLiked} 
            size={28}
            onClick={handleToggleLike}
            className="stat-icon"
          />
          <button 
            className="stat-count like-count-btn" 
            onClick={handleOpenLikedBy}
            disabled={!content.likedBy?.length}
          >
            {formatCompactNumber(likeCount)}
          </button>
        </div>
        <button className="stat-btn" onClick={() => openCommentModal(content.id, content.creatorId)}>
          <MessageCircle size={20} className="stat-icon" />
          <span className="stat-count">{formatCompactNumber(content.commentCount)}</span>
        </button>
        <button className="stat-btn">
          <Share2 size={20} className="stat-icon" />
        </button>
        <button className="stat-btn">
          <Bookmark size={20} className="stat-icon" />
        </button>
      </div>
      )}
      
      {/* Caption - Below the card */}
      <div className="caption-section">
        <p className="caption-text">
          <span className="caption-title">{content.title}</span>
          {content.caption && ` ${content.caption}`}
        </p>
      </div>
    </div>
  );
}
