import { useEffect, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { Image as ImageIcon, Smile } from "lucide-react";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";
import { OrwellianEye } from "@/components/ui/OrwellianEye";
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
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
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
      // If replying to a reply, prefix the content with the user's name
      let finalContent = newComment.trim();
      const parentComment = comments.find(c => c.id === replyingToId);
      if (replyingToId && replyingToName && parentComment && parentComment.userName !== replyingToName) {
        // Only prefix if we are replying to a nested reply inside the thread
        // Actually, Instagram style just puts "@username " at the start of the text.
        // We can just trust the user typed it or automatically prepend it if it's a nested reply.
        if (!finalContent.startsWith(`@${replyingToName}`)) {
          finalContent = `@${replyingToName} ${finalContent}`;
        }
      }

      await addComment({
        contentId: activeCardId,
        creatorId: activeCreatorId || "",
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photoUrl,
        userVerified: user.verified,
        content: finalContent,
        replyToId: replyingToId || undefined,
      });
      setNewComment("");
      if (replyingToId) {
        setExpandedReplies(prev => ({ ...prev, [replyingToId]: true }));
      }
      setReplyingToId(null);
      setReplyingToName(null);
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

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  const parentComments = comments.filter(c => !c.replyToId);
  const repliesByParentId = comments.reduce((acc, c) => {
    if (c.replyToId) {
      if (!acc[c.replyToId]) acc[c.replyToId] = [];
      acc[c.replyToId].push(c);
    }
    return acc;
  }, {} as Record<string, CommentModel[]>);

  const renderComment = (comment: CommentModel, isReply = false) => (
    <div key={comment.id} className={`comment-item ${isReply ? 'comment-reply-item' : ''}`}>
      <div className="comment-react">
        <OrwellianEye 
          filled={comment.likedBy?.includes(user?.id || "") ?? false}
          size={16}
          onClick={() => handleToggleLike(comment.id)}
        />
        <span className="comment-like-count">{comment.likeCount > 0 ? comment.likeCount : ""}</span>
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
          <button 
            className="comment-reply-btn"
            onClick={() => {
              const targetParentId = comment.replyToId || comment.id;
              setReplyingToId(targetParentId);
              setReplyingToName(comment.userName);
              if (targetParentId !== comment.id) {
                // Expanding the parent if we reply to a reply
                setExpandedReplies(prev => ({ ...prev, [targetParentId]: true }));
              }
            }}
          >
            Reply {!isReply && comment.replyCount > 0 ? `· ${comment.replyCount}` : ""}
          </button>
          <button 
            className="comment-like-btn-small"
            onClick={() => handleToggleLike(comment.id)}
            style={{ color: comment.likedBy?.includes(user?.id || "") ? "#e63946" : undefined }}
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );

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
          {parentComments.map((comment) => (
            <div key={`thread-${comment.id}`} className="comment-thread" style={{ display: 'flex', flexDirection: 'column' }}>
              {renderComment(comment, false)}

              {/* Inline input directly beneath the parent comment */}
              {replyingToId === comment.id && (
                <div className="comment-inline-input-area">
                  <div className="comment-replying-to" style={{ fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between', paddingLeft: '4px' }}>
                    <span>Replying to @{replyingToName}</span>
                    <button onClick={() => { setReplyingToId(null); setReplyingToName(null); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Cancel</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <textarea
                      className="comment-textarea"
                      placeholder={`Add a reply...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      autoFocus
                    />
                    <button 
                      className="comment-send-btn" 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e63946', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                      onClick={handleAddComment}
                      disabled={submitting}
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle Replies Button */}
              {comment.replyCount > 0 && (
                <button className="comment-toggle-replies" onClick={() => toggleReplies(comment.id)}>
                  <span className="comment-toggle-replies-line"></span>
                  {expandedReplies[comment.id] ? "Hide replies" : `View replies (${comment.replyCount})`}
                </button>
              )}

              {/* Nested Replies List */}
              {expandedReplies[comment.id] && repliesByParentId[comment.id] && (
                <div className="comment-replies">
                  {repliesByParentId[comment.id].map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          ))}
        </div>

        {!replyingToId && (
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
        )}
      </div>
    </div>
  );
}
