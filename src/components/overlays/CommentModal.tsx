import { useEffect, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { Heart, Image as ImageIcon, Smile } from "lucide-react";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import { useAuth } from "@/app/providers/AuthProvider";
import { subscribeComments, addComment, toggleCommentLike } from "@/lib/firebase/comments";
import type { CommentModel } from "@/types/models";

interface CommentModalContextType {
  isOpen: boolean;
  openCommentModal: (cardId: string, creatorId: string) => void;
  closeCommentModal: () => void;
  activeCardId: string | null;
  activeCreatorId: string | null;
}

const CommentModalContext = createContext<CommentModalContextType>({
  isOpen: false,
  openCommentModal: () => {},
  closeCommentModal: () => {},
  activeCardId: null,
  activeCreatorId: null,
});

export function useCommentModal() {
  return useContext(CommentModalContext);
}

export function CommentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeCreatorId, setActiveCreatorId] = useState<string | null>(null);

  const openCommentModal = (cardId: string, creatorId: string) => {
    setActiveCardId(cardId);
    setActiveCreatorId(creatorId);
    setIsOpen(true);
  };

  const closeCommentModal = () => {
    setIsOpen(false);
  };

  return (
    <CommentModalContext.Provider value={{ isOpen, openCommentModal, closeCommentModal, activeCardId, activeCreatorId }}>
      {children}
    </CommentModalContext.Provider>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CommentModal() {
  const { isOpen, closeCommentModal, activeCardId, activeCreatorId } = useCommentModal();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!isOpen || !activeCardId) {
      unsubscribe?.();
      setComments([]);
      return;
    }

    const unsub = subscribeComments(
      activeCardId,
      (newComments) => setComments(newComments),
      (error) => console.error("Comment subscription error:", error)
    );
    setUnsubscribe(() => unsub);

    return () => unsub();
  }, [isOpen, activeCardId]);

  const handleAddComment = async () => {
    if (!user || !activeCardId || !newComment.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      await addComment({
        contentId: activeCardId,
        creatorId: activeCreatorId || "", // Will be fetched from content if needed, notification logic handled in service
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photoUrl,
        userVerified: user.verified,
        content: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!user) return;
    try {
      await toggleCommentLike(commentId, user.id);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={closeCommentModal}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <span className="comment-modal-title">Comments</span>
          <button className="comment-modal-close" onClick={closeCommentModal}>
            <CloseIcon />
          </button>
        </div>

        <div className="comment-modal-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-react">
                <button 
                  className="comment-like-btn"
                  onClick={() => handleToggleLike(comment.id)}
                >
                  <Heart width={16} height={16} />
                </button>
                <span className="comment-like-count">{comment.likeCount}</span>
              </div>
                <div className="comment-body">
                  <div className="comment-user">
                    <img 
                      src={comment.userPhoto} 
                      alt={comment.userName} 
                      className="comment-user-photo" 
                    />
                    <div className="comment-user-info">
                      <VerifiedLabel
                        text={comment.userName}
                        verified={comment.userVerified}
                        className="comment-user-name"
                        textClassName="comment-user-name"
                        iconClassName="verified-label__icon--tiny"
                      />
                      <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                <p className="comment-text">{comment.content}</p>
                <div className="comment-actions">
                  <button className="comment-reply-btn">Reply · {Math.floor(Math.random() * 8) + 1}</button>
                  <button 
                    className="comment-like-btn-small"
                    onClick={() => handleToggleLike(comment.id)}
                  >Like</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="comment-input-area">
          <textarea
            className="comment-textarea"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <div className="comment-formatting">
            <button type="button" title="Add emoji">
              <Smile width={16} height={16} />
            </button>
            <button type="button" title="Add image">
              <ImageIcon width={16} height={16} />
            </button>
            <button type="button" title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" title="Italic">
              <em>I</em>
            </button>
            <button 
              type="button" 
              className="comment-send-btn" 
              title="Send"
              onClick={handleAddComment}
              disabled={submitting}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
