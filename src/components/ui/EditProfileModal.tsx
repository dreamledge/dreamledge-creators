import { useState, type ReactNode, useRef } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { DEFAULT_AVATAR_URL } from "@/lib/constants/defaults";
import type { SocialPlatform } from "@/types/models";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOCIAL_PLATFORMS: { key: SocialPlatform; label: string; icon: ReactNode; baseUrl: string }[] = [
  {
    key: "twitter",
    label: "Twitter",
    baseUrl: "https://twitter.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path></svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    baseUrl: "https://instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98z"></path></svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    baseUrl: "https://youtube.com/@",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    baseUrl: "https://tiktok.com/@",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>
    ),
  },
];

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    username: user?.username || "",
    bio: user?.bio || "",
    photoUrl: user?.photoUrl || DEFAULT_AVATAR_URL,
    socialLinks: user?.socialLinks || {},
  });
  const [editingLink, setEditingLink] = useState<SocialPlatform | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read selected image."));
      reader.readAsDataURL(file);
    });

  const optimizeImage = async (file: File) => {
    const source = await readFileAsDataUrl(file);

    return new Promise<string>((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 512;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const targetWidth = Math.max(1, Math.round(image.width * scale));
        const targetHeight = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is unavailable."));
          return;
        }

        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = () => reject(new Error("Could not process selected image."));
      image.src = source;
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setSaveError(null);

    try {
      const previewUrl = await optimizeImage(file);
      setFormData((prev) => ({ ...prev, photoUrl: previewUrl }));
    } catch {
      setSaveError("Could not read this image. Please try a different file.");
    } finally {
      e.target.value = "";
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      await updateProfile({
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        photoUrl: formData.photoUrl,
        socialLinks: formData.socialLinks,
      });
      onClose();
    } catch (error) {
      const maybeCode = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: string }).code) : "";
      if (maybeCode.includes("permission-denied")) {
        setSaveError("Save blocked by Firebase rules. Allow authenticated users to update users/{uid}.");
      } else {
        setSaveError(maybeCode ? `Could not save your profile (${maybeCode}).` : "Could not save your profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLink = (platformKey: SocialPlatform) => {
    if (linkInput.trim()) {
      const platform = SOCIAL_PLATFORMS.find(p => p.key === platformKey);
      const fullUrl = platform ? platform.baseUrl + linkInput.trim() : linkInput.trim();
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [platformKey]: fullUrl },
      }));
    }
    setEditingLink(null);
    setLinkInput("");
  };

  const handleRemoveLink = (platform: SocialPlatform) => {
    setFormData((prev) => {
      const newLinks = { ...prev.socialLinks };
      delete newLinks[platform];
      return { ...prev, socialLinks: newLinks };
    });
  };

  return (
    <div className="edit-profile-modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <div className="edit-profile-modal-body">
          <div className="profile-photo-section">
            <div className="profile-photo-preview" onClick={handlePhotoClick}>
              <img src={formData.photoUrl || DEFAULT_AVATAR_URL} alt="Profile" />
              <div className="profile-photo-overlay">
                <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {formData.photoUrl ? <p className="mt-2 text-xs text-zinc-400">Photo ready. Save changes to apply.</p> : null}
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
              placeholder="Your display name"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <div className="username-input-wrapper">
              <span className="username-prefix">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                placeholder="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell others about yourself..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Social Links</label>
            <div className="social-links-grid">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key} className="social-link-item">
                  {editingLink === platform.key ? (
                    <div className="social-link-edit">
                      <div className="social-link-input-wrapper">
                        <span className="social-link-prefix">{platform.baseUrl}</span>
                        <input
                          type="text"
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          placeholder="username"
                          autoFocus
                        />
                      </div>
                      <div className="social-link-edit-buttons">
                        <button onClick={() => handleAddLink(platform.key)} className="save-link-btn">Save</button>
                        <button onClick={() => { setEditingLink(null); setLinkInput(""); }} className="cancel-link-btn">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="social-link-display">
                      <span className="social-icon">{platform.icon}</span>
                      {formData.socialLinks[platform.key] ? (
                        <>
                          <span className="social-link-value">{formData.socialLinks[platform.key]?.replace(platform.baseUrl, "")}</span>
                          <button onClick={() => handleRemoveLink(platform.key)} className="remove-link-btn">Remove</button>
                        </>
                      ) : (
                        <button onClick={() => { 
                          const currentLink = formData.socialLinks[platform.key];
                          const usernamePart = currentLink ? currentLink.replace(platform.baseUrl, "") : "";
                          setEditingLink(platform.key); 
                          setLinkInput(usernamePart); 
                        }} className="add-link-btn">Add</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {saveError ? <p className="px-6 pb-2 text-sm text-red-400">{saveError}</p> : null}

        <div className="edit-profile-modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="save-button" onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
