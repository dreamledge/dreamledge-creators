import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import { mockUsers } from "@/lib/constants/mockData";
import type { ContentModel, SocialPlatform } from "@/types/models";
import { useFeedContext } from "../feed/FeedList";
import { useCommentModal } from "../overlays/CommentModal";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";

interface ContentCardProps {
  content: ContentModel;
  hideActions?: boolean;
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

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const VolumeMuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);

const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
  </svg>
);

export function ContentCard({ content, hideActions = false }: ContentCardProps) {
  const { isMuted, setIsMuted, currentPlayingId, setCurrentPlaying, userHasUnmuted } = useFeedContext();
  const { openCommentModal } = useCommentModal();
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isPlaying = currentPlayingId === content.id;

  const creator = mockUsers.find((user) => user.id === content.creatorId);

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
    const useMute = userHasUnmuted ? 0 : (muted ? 1 : 0);
    if (embedUrl.includes("youtube.com/shorts/")) {
      const videoId = embedUrl.split("shorts/")[1]?.split("?")[0];
      if (videoId) {
        src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${useMute}&loop=1&playlist=${videoId}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0`;
      }
    } else if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
      const videoId = embedUrl.split("v=")[1]?.split("&")[0] || embedUrl.split("/").pop();
      src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${useMute}&loop=1&playlist=${videoId}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0`;
    } else if (embedUrl.includes("tiktok.com")) {
      const videoId = embedUrl.match(/video\/(\d+)/)?.[1];
      if (videoId) {
        src = `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&mute=${useMute}&playsinline=1`;
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
    if (!isPlaying) {
      setProgress(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      setIframeLoaded(false);
      setVideoSrc("");
      const timer = setTimeout(() => {
        setVideoSrc(getEmbedSrc(content.embedUrl, isMuted));
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIframeLoaded(false);
      setVideoSrc("");
    }
  }, [isPlaying, content.embedUrl, isMuted]);

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPlaying(isPlaying ? null : content.id);
    showControlsTemporarily();
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    showControlsTemporarily();
  };

  const handleFullscreen = () => {
    if (cardRef.current) {
      if (!isFullscreen) {
        cardRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
    showControlsTemporarily();
  };

  const socialLinks = creator?.socialLinks as Partial<Record<SocialPlatform, string>> | undefined;
  const hasInstagram = !!socialLinks?.instagram;
  const hasTikTok = !!socialLinks?.tiktok;
  const hasYouTube = !!socialLinks?.youtube;
  const hasTwitch = !!socialLinks?.twitch;
  const hasTwitter = !!socialLinks?.twitter;
  const isLiveContent = content.status === "live";

  return (
    <div ref={cardRef} className={`phone-card-outer ${isLiveContent ? "phone-card-outer-live" : ""}`} data-content-id={content.id}>
      {/* Creator Overlay - Above the card */}
      <div className={`creator-overlay ${isLiveContent ? "creator-overlay-live" : ""}`}>
        <div className="creator-left">
          <Link to={`/app/profile/${creator?.id}`} className="creator-link">
            <img 
              src={creator?.photoUrl || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80"} 
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
      </div>
      
      <div className={`card ${isFullscreen ? "card-fullscreen" : ""}`}>
        {/* Left Side Buttons - btn1, btn2, btn3 */}
        <div className="btn1"></div>
        <div className="btn2"></div>
        <div className="btn3"></div>
        
        {/* Card Inner - Screen */}
        <div className="card-int" onClick={() => {
          if (!isPlaying) {
            setCurrentPlaying(content.id);
          }
          showControlsTemporarily();
        }}>
          {/* Notch - top */}
          <div className="top">
            <div className="camera">
              <div className="int"></div>
            </div>
            <div className="speaker"></div>
          </div>
          
          {/* Video Embed or Thumbnail or Loading */}
          {isPlaying && content.embedUrl && (
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
          )}
          {isPlaying && content.embedUrl && videoSrc ? (
            <iframe
              src={videoSrc}
              className="video-embed"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />
          ) : (
            <img 
              src={content.thumbnailUrl} 
              alt={content.title} 
              className="video-thumbnail"
            />
          )}
          
          {/* Custom Controls - only show on tap */}
          <div className={`video-controls ${showControls ? "video-controls-visible" : ""}`}>
            <button className="control-btn play-btn" onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            
            <div className="bottom-controls">
              <button className="control-btn mute-btn" onClick={handleMuteToggle}>
                {isMuted ? <VolumeMuteIcon /> : <VolumeIcon />}
              </button>
              <button className="control-btn fullscreen-btn" onClick={handleFullscreen}>
                <FullscreenIcon />
              </button>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-time">
                <span>0:00</span>
                <span>0:30</span>
              </div>
</div>
          </div>
        </div>
</div>
       
      {/* Likes and Comments - Above the caption */}
      {!hideActions && (
      <div className="card-stats">
        <button className="stat-btn">
          <Heart size={20} className="stat-icon" />
          <span className="stat-count">{formatCompactNumber(content.likeCount)}</span>
        </button>
        <button className="stat-btn" onClick={() => openCommentModal(content.id)}>
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
