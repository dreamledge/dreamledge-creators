import { useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { Heart, Image as ImageIcon, Smile } from "lucide-react";
import { mockUsers } from "@/lib/constants/mockData";
import { VerifiedLabel } from "@/components/ui/VerifiedLabel";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

interface CommentModalContextType {
  isOpen: boolean;
  openCommentModal: (cardId: string) => void;
  closeCommentModal: () => void;
  activeCardId: string | null;
}

const CommentModalContext = createContext<CommentModalContextType>({
  isOpen: false,
  openCommentModal: () => {},
  closeCommentModal: () => {},
  activeCardId: null,
});

export function useCommentModal() {
  return useContext(CommentModalContext);
}

export function CommentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const openCommentModal = (cardId: string) => {
    setActiveCardId(cardId);
    setIsOpen(true);
  };

  const closeCommentModal = () => {
    setIsOpen(false);
  };

  return (
    <CommentModalContext.Provider value={{ isOpen, openCommentModal, closeCommentModal, activeCardId }}>
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

const mockComments: Comment[] = [
  {
    id: "c1",
    userId: "u1",
    userName: "Sarah Johnson",
    userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    content: "This is amazing! Love your content keep it up! 🔥",
    likeCount: 24,
    createdAt: "2h ago",
  },
  {
    id: "c2",
    userId: "u2",
    userName: "Mike Chen",
    userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    content: "Totally agree with this! Needed to see this perspective.",
    likeCount: 12,
    createdAt: "4h ago",
  },
  {
    id: "c3",
    userId: "u3",
    userName: "Emma Wilson",
    userPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    content: "This is exactly what I needed to see today. Thank you!",
    likeCount: 8,
    createdAt: "6h ago",
  },
  {
    id: "c4",
    userId: "u4",
    userName: "David Brown",
    userPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc9945e4?auto=format&fit=crop&w=100&q=80",
    content: "Great content as always! Can't wait for more.",
    likeCount: 15,
    createdAt: "1d ago",
  },
  {
    id: "c5",
    userId: "u1",
    userName: "Sosa Noir",
    userPhoto: "/sosadata.jpg",
    content: "This is so inspiring! You've motivated me to create more content.",
    likeCount: 31,
    createdAt: "2d ago",
  },
];

export function CommentModal() {
  const { isOpen, closeCommentModal } = useCommentModal();
  const [newComment, setNewComment] = useState("");

  if (!isOpen) return null;

  const comments = mockComments;

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
                <button className="comment-like-btn">
                  <Heart width={16} height={16} />
                </button>
                <span className="comment-like-count">{comment.likeCount}</span>
              </div>
                <div className="comment-body">
                  <div className="comment-user">
                    <img src={mockUsers.find((user) => user.id === comment.userId)?.photoUrl ?? comment.userPhoto} alt={mockUsers.find((user) => user.id === comment.userId)?.displayName ?? comment.userName} className="comment-user-photo" />
                    <div className="comment-user-info">
                      <VerifiedLabel
                        text={mockUsers.find((user) => user.id === comment.userId)?.displayName ?? comment.userName}
                        verified={mockUsers.find((user) => user.id === comment.userId)?.verified}
                        className="comment-user-name"
                        textClassName="comment-user-name"
                        iconClassName="verified-label__icon--tiny"
                      />
                      <span className="comment-time">{comment.createdAt}</span>
                    </div>
                  </div>
                <p className="comment-text">{comment.content}</p>
                <div className="comment-actions">
                  <button className="comment-reply-btn">Reply · {Math.floor(Math.random() * 8) + 1}</button>
                  <button className="comment-like-btn-small">Like</button>
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
            <button type="button" className="comment-send-btn" title="Send">
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
