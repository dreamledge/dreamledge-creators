import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PostSignupAnimationProps {
  username: string;
}

export function PostSignupAnimation({ username }: PostSignupAnimationProps) {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => navigate("/app/me"), 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`orwellian-overlay ${fading ? "orwellian-fade-out" : ""}`}>
      <div className="orwellian-container">
        <div className="orwellian-loader orwellian-loader--scaled">
          <div className="eye eye--scaled">
            <div className="pupil pupil--scaled"></div>
            <div className="eyelid"></div>
          </div>
          <div className="spotlight spotlight--scaled"></div>
          <div className="orwellian-username">@{username}</div>
          <div className="text text--scaled">Your content deserves to be seen.</div>
          <div className="scan-lines"></div>
          <div className="tv-effect"></div>
        </div>
      </div>
    </div>
  );
}