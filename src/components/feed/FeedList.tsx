import { useState, createContext, useContext, useRef } from "react";
import { ContentCard } from "@/components/cards/ContentCard";
import type { ContentModel } from "@/types/models";

interface FeedContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currentPlayingId: string | null;
  setCurrentPlaying: (id: string | null) => void;
}

export const FeedContext = createContext<FeedContextType>({
  isMuted: true,
  setIsMuted: () => {},
  currentPlayingId: null,
  setCurrentPlaying: () => {},
});

export function FeedList({ items }: { items: ContentModel[] }) {
  const [isMuted, setIsMuted] = useState(true);
  const [currentPlayingId, setCurrentPlaying] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <FeedContext.Provider value={{ isMuted, setIsMuted, currentPlayingId, setCurrentPlaying }}>
      <div ref={containerRef} className="feed-list-container">
        {items.map((item) => (
          <ContentCard key={item.id} content={item} />
        ))}
      </div>
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  return useContext(FeedContext);
}