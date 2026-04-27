import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { sendAdminBroadcast } from "@/lib/firebase/notifications";

export function RealAdminHomePage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Please fill in both title and message");
      return;
    }

    setSending(true);
    setError("");

    try {
      await sendAdminBroadcast(title.trim(), message.trim());
      setShowModal(false);
      setTitle("");
      setMessage("");
      alert("Broadcast sent successfully!");
    } catch (err) {
      setError("Failed to send broadcast. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" className="cta-button edit-profile" onClick={() => navigate("/app/me")}>Back</button>
      </div>
      <SectionHeader eyebrow="Real Admin" title="Back Office" description="Choose a workspace to manage platform operations." />

      <div className="bubble-card rounded-[32px] p-5 space-y-4">
        <button
          type="button"
          className="cta-button edit-profile w-full"
          onClick={() => navigate("/realadmin/accounts")}
        >
          Account Verification
        </button>
        <button
          type="button"
          className="cta-button edit-profile w-full"
          onClick={() => setShowModal(true)}
        >
          Push Notifications
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Send Broadcast Notification</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message"
                  rows={4}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setTitle("");
                  setMessage("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}