import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/app/providers/AuthProvider";
import { subscribePublicUsers } from "@/lib/firebase/publicData";
import { setUserVerified } from "@/lib/firebase/adminUsers";
import { isAlwaysVerifiedAccount } from "@/lib/utils/accountIdentity";
import type { UserModel } from "@/types/models";

export function BackOfficePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [query, setQuery] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePublicUsers(setUsers, () => {
      setErrorMessage("Unable to load users right now.");
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = [...users].sort((a, b) => a.displayName.localeCompare(b.displayName));

    if (!normalized) return sorted;

    return sorted.filter((entry) => {
      const username = entry.username.toLowerCase();
      const displayName = entry.displayName.toLowerCase();
      const email = entry.email.toLowerCase();
      return username.includes(normalized) || displayName.includes(normalized) || email.includes(normalized);
    });
  }, [query, users]);

  const handleToggleVerified = async (target: UserModel) => {
    setErrorMessage(null);

    const isDreamledge = isAlwaysVerifiedAccount({ email: target.email });
    if (isDreamledge && target.verified) {
      return;
    }

    setPendingUserId(target.id);
    try {
      await setUserVerified(target.id, !target.verified);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update verification status.");
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" className="cta-button edit-profile" onClick={() => navigate("/realadmin")}>Back</button>
      </div>
      <SectionHeader eyebrow="Real Admin" title="Account Verification" description="Verify or unverify creator accounts. Dreamledge remains permanently verified." />

      <div className="bubble-card rounded-[32px] p-5 space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3"
          placeholder="Search by name, username, or email"
        />

        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

        <div className="space-y-3">
          {filteredUsers.map((entry) => {
            const isCurrentUser = entry.id === user?.id;
            const isDreamledge = isAlwaysVerifiedAccount({ email: entry.email });
            const isLocked = isDreamledge && entry.verified;
            const isPending = pendingUserId === entry.id;

            return (
              <div key={entry.id} className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate">
                    {entry.displayName} {isCurrentUser ? "(You)" : ""}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">@{entry.username} · {entry.email || "no-email"}</p>
                </div>

                <button
                  type="button"
                  className="cta-button edit-profile min-w-[128px]"
                  onClick={() => void handleToggleVerified(entry)}
                  disabled={isPending || isLocked}
                >
                  {isPending ? "Saving..." : entry.verified ? "Unverify" : "Verify"}
                </button>
              </div>
            );
          })}

          {!filteredUsers.length ? <p className="text-sm text-zinc-400">No users found.</p> : null}
        </div>
      </div>
    </div>
  );
}
