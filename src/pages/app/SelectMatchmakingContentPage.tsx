import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { subscribeCreatorContent } from "@/lib/firebase/publicData";
import { setMatchmakingContent } from "@/lib/firebase/content";
import type { ContentModel } from "@/types/models";

export function SelectMatchmakingContentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(user?.matchmakingContentId ?? null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeCreatorContent(user.id, setItems);
    return () => unsubscribe();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id || !selectedId) return;
    setIsSaving(true);
    try {
      await setMatchmakingContent(user.id, selectedId);
      navigate("/app/review-session");
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const userContent = items.filter((item) => item.status !== "live");

  return (
    <div className="page-grid">
      <div className="public-page-topbar flex items-center justify-between px-4 py-3">
        <Link to="/app/review-session" className="text-zinc-400 hover:text-white">
          ← Back
        </Link>
        <h1 className="text-lg font-bold text-white">Select Matchmaking Video</h1>
        <div className="w-12" />
      </div>

      <div className="p-4">
        <p className="text-zinc-400 text-sm mb-4">
          Choose the video you want to show opponents during matchmaking. This saves permanently until you change it.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {userContent.map((content) => (
            <button
              key={content.id}
              type="button"
              className={`p-2 rounded-xl border transition-all ${
                selectedId === content.id
                  ? "border-primary bg-primary/10"
                  : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
              }`}
              onClick={() => setSelectedId(content.id)}
            >
              {content.thumbnailUrl ? (
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full aspect-9/16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-9/16 bg-zinc-700 rounded-lg" />
              )}
              <p className="text-white text-sm mt-2 truncate">{content.title}</p>
            </button>
          ))}
        </div>

        {userContent.length === 0 && (
          <p className="text-zinc-500 text-center py-8">
            You haven't posted any videos yet.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedId || isSaving}
          className="w-full mt-6 py-3 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Selection"}
        </button>

        <Link to="/app/review-session" className="block text-center text-zinc-400 mt-4">
          Cancel
        </Link>
      </div>
    </div>
  );
}