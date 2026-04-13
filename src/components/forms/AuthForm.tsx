import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AuthForm({
  title,
  buttonLabel,
  onSubmit,
  includeName = false,
  animatedSubmit = false,
}: {
  title: string;
  buttonLabel: string;
  onSubmit: (values: { email: string; password: string; displayName: string }) => void;
  includeName?: boolean;
  animatedSubmit?: boolean;
}) {
  const [email, setEmail] = useState("milan@dreamledge.app");
  const [password, setPassword] = useState("password123");
  const [displayName, setDisplayName] = useState("Milan Moves");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ email, password, displayName });
      }}
      className="space-y-4"
    >
      <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
      {includeName ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white">Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How your name appears in the app" className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary" />
        </label>
      ) : null}
      <label className="block space-y-2">
        <span className="text-sm font-medium text-white">Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-white">Password</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Create a secure password" className="w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary" />
      </label>
      {animatedSubmit ? (
        <button type="submit" className="dreamledge-signin-btn-wrapper w-full">
          <span className="dreamledge-signin-btn">
            <span className="dreamledge-signin-letter">S</span>
            <span className="dreamledge-signin-letter">I</span>
            <span className="dreamledge-signin-letter">G</span>
            <span className="dreamledge-signin-letter">N</span>
            <span className="dreamledge-signin-letter">-</span>
            <span className="dreamledge-signin-letter">I</span>
            <span className="dreamledge-signin-letter">N</span>
            <span className="dreamledge-signin-shutter-wrapper">
              <span className="dreamledge-signin-shutter s-1" />
              <span className="dreamledge-signin-shutter s-2" />
              <span className="dreamledge-signin-shutter s-3" />
              <span className="dreamledge-signin-shutter s-4" />
              <span className="dreamledge-signin-shutter s-5" />
              <span className="dreamledge-signin-shutter s-6" />
            </span>
          </span>
          <span className="dreamledge-signin-flash" />
        </button>
      ) : (
        <Button type="submit" className="w-full bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)] text-white hover:bg-[linear-gradient(135deg,#ff2d3d,#ff4d4d)]">{buttonLabel}</Button>
      )}
    </form>
  );
}
