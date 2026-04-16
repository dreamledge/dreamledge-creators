import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SocialLoginButtons } from "@/components/forms/SocialLoginButtons";

export function AuthForm({
  title,
  buttonLabel,
  onSubmit,
  includeName = false,
  animatedSubmit = false,
  signupCard = false,
}: {
  title: string;
  buttonLabel: string;
  onSubmit: (values: { email: string; password: string; displayName: string; username: string }) => void;
  includeName?: boolean;
  animatedSubmit?: boolean;
  signupCard?: boolean;
}) {
  const [email, setEmail] = useState("sosa@dreamledge.app");
  const [password, setPassword] = useState("password123");
  const [displayName, setDisplayName] = useState("Sosa Noir");
  const [username, setUsername] = useState("sosanoir");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ email, password, displayName, username });
      }}
      className={signupCard ? "dreamledge-signup-form" : "space-y-4"}
    >
      {signupCard ? (
        <div className="dreamledge-signup-head">
          <span>Sign up</span>
          <p>Create a free account with your email.</p>
        </div>
      ) : (
        <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
      )}
      <div className={signupCard ? "dreamledge-signup-inputs" : "space-y-4"}>
        {includeName ? (
          <label className={signupCard ? "dreamledge-signup-field" : "block space-y-2"}>
            {!signupCard ? <span className="text-sm font-medium text-white">Display name</span> : null}
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={signupCard ? "Full Name" : "How your name appears in the app"} className={signupCard ? "dreamledge-signup-input" : "w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary"} />
          </label>
        ) : null}
        {includeName ? (
          <label className={signupCard ? "dreamledge-signup-field" : "block space-y-2"}>
            {!signupCard ? <span className="text-sm font-medium text-white">Username</span> : null}
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={signupCard ? "Username" : "Choose a username"} className={signupCard ? "dreamledge-signup-input" : "w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary"} />
          </label>
        ) : null}
        <label className={signupCard ? "dreamledge-signup-field" : "block space-y-2"}>
          {!signupCard ? <span className="text-sm font-medium text-white">Email</span> : null}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={signupCard ? "Email" : "you@example.com"} className={signupCard ? "dreamledge-signup-input" : "w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary"} />
        </label>
        <label className={signupCard ? "dreamledge-signup-field" : "block space-y-2"}>
          {!signupCard ? <span className="text-sm font-medium text-white">Password</span> : null}
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={signupCard ? "Password" : "Create a secure password"} className={signupCard ? "dreamledge-signup-input dreamledge-signup-input--last" : "w-full rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-text-primary"} />
        </label>
      </div>
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
      {signupCard ? <SocialLoginButtons label="Sign up with Gmail" className="dreamledge-signup-google" /> : null}
      {signupCard ? (
        <div className="dreamledge-signup-footer">
          <p>
            Have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      ) : null}
    </form>
  );
}
