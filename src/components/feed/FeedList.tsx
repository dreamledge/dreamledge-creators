import { useState, createContext, useContext, useRef, useEffect, type ReactNode } from "react";
import { ContentCard } from "@/components/cards/ContentCard";
import type { ContentModel } from "@/types/models";

interface FeedContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currentPlayingId: string | null;
  setCurrentPlaying: (id: string | null) => void;
  pauseVideo: () => void;
  userHasUnmuted: boolean;
  setUserHasUnmuted: (unmuted: boolean) => void;
}

export const FeedContext = createContext<FeedContextType>({
  isMuted: true,
  setIsMuted: () => {},
  currentPlayingId: null,
  setCurrentPlaying: () => {},
  pauseVideo: () => {},
  userHasUnmuted: false,
  setUserHasUnmuted: () => {},
});

export function FeedProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);
  const [userHasUnmuted, setUserHasUnmuted] = useState(false);
  const [currentPlayingId, setCurrentPlaying] = useState<string | null>(null);

  const handleSetIsMuted = (muted: boolean) => {
    setIsMuted(muted);
    if (!muted) {
      setUserHasUnmuted(true);
    }
  };

  const pauseVideo = () => {
    setCurrentPlaying(null);
  };

  return (
    <FeedContext.Provider value={{ isMuted, setIsMuted: handleSetIsMuted, currentPlayingId, setCurrentPlaying, pauseVideo, userHasUnmuted, setUserHasUnmuted }}>
      {children}
    </FeedContext.Provider>
  );
}

export function FeedList({ items }: { items: ContentModel[] }) {
  const { setCurrentPlaying } = useFeedContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPlayedRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    let frameId = 0;

    const getCardVisibility = (card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      return visibleHeight / Math.max(rect.height, 1);
    };

    const updateCurrentPlaying = () => {
      if (!containerRef.current) return;

      const cards = Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-content-id]"));
      let nextId: string | null = null;
      let bestRatio = 0;

      for (const card of cards) {
        const ratio = getCardVisibility(card);

        if (ratio > bestRatio && ratio >= 0.5) {
          bestRatio = ratio;
          nextId = card.dataset.contentId ?? null;
        }
      }

      if (nextId && nextId !== lastPlayedRef.current) {
        lastPlayedRef.current = nextId;
        setCurrentPlaying(nextId);
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateCurrentPlaying);
    };

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      setTimeout(() => {
        updateCurrentPlaying();
      }, 100);
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [setCurrentPlaying]);

  return (
    <div ref={containerRef} className="feed-list-container">
      {items.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}

export function useFeedContext() {
  return useContext(FeedContext);
}
