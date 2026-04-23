import { useState, createContext, useContext, useRef, useEffect, type ReactNode } from "react";
import { ContentCard } from "@/components/cards/ContentCard";
import type { ContentModel, UserModel } from "@/types/models";

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

export function FeedList({ items, creatorsById }: { items: ContentModel[]; creatorsById?: Map<string, UserModel> }) {
  const { setCurrentPlaying } = useFeedContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPlayedRef = useRef<string | null>(null);
  const itemIdsKey = items.map((item) => item.id).join("|");

  useEffect(() => {
    let frameId = 0;
    const container = containerRef.current;

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
      let highestVisibleRatio = 0;
      let highestVisibleId: string | null = null;

      for (const card of cards) {
        const ratio = getCardVisibility(card);

        if (ratio > highestVisibleRatio) {
          highestVisibleRatio = ratio;
          highestVisibleId = card.dataset.contentId ?? null;
        }

        if (ratio >= 0.3 && ratio > bestRatio) {
          bestRatio = ratio;
          nextId = card.dataset.contentId ?? null;
        }
      }

      if (!nextId && highestVisibleRatio > 0.08) {
        nextId = highestVisibleId;
      }

      if (!nextId && cards.length > 0) {
        nextId = cards[0]?.dataset.contentId ?? null;
      }

      if (nextId !== lastPlayedRef.current) {
        lastPlayedRef.current = nextId;
        if (import.meta.env.DEV) {
          console.debug("[FeedList] currentPlayingId", nextId);
        }
        setCurrentPlaying(nextId);
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateCurrentPlaying);
    };

    const cards = Array.from(container?.querySelectorAll<HTMLElement>("[data-content-id]") ?? []);
    const observer = new IntersectionObserver(
      () => {
        scheduleUpdate();
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const card of cards) {
      observer.observe(card);
    }

    const initialTimer = setTimeout(scheduleUpdate, 0);
    const delayedTimer = setTimeout(scheduleUpdate, 200);
    const safetyTimer = setTimeout(scheduleUpdate, 450);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    container?.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(initialTimer);
      clearTimeout(delayedTimer);
      clearTimeout(safetyTimer);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      container?.removeEventListener("scroll", scheduleUpdate);
    };
  }, [setCurrentPlaying, itemIdsKey]);

  return (
    <div ref={containerRef} className="feed-list-container">
      {items.map((item) => (
        <ContentCard key={item.id} content={item} creatorOverride={creatorsById?.get(item.creatorId) ?? null} />
      ))}
    </div>
  );
}

export function useFeedContext() {
  return useContext(FeedContext);
}
