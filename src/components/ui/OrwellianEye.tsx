import { useState, useRef } from "react";

interface OrwellianEyeProps {
  filled?: boolean;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export function OrwellianEye({ filled = false, size = 24, onClick, className = "" }: OrwellianEyeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = () => {
    if (onClick) {
      setIsAnimating(true);
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      
      onClick();
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  const containerSize = size || 28;
  
  const heartColor = filled ? "#ff2d3d" : "#ffffff";
  const pupilColor = filled ? "#ff4444" : "#0a0a0a";
  const scleraColor = filled ? "#ffe0e0" : "#f5f5f7";

  return (
    <button
      onClick={handleClick}
      className={`orwellian-eye-btn orwellian-like-btn ${isAnimating ? "animate" : ""} ${className}`}
      style={{
        background: "none",
        border: "none",
        cursor: onClick ? "pointer" : "default",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: containerSize,
        height: containerSize,
        minWidth: containerSize,
        minHeight: containerSize,
      }}
    >
      <audio ref={audioRef} src="/smooth.mp3" preload="auto" />
      
      <svg
        width={containerSize}
        height={containerSize}
        viewBox="0 0 32 32"
        style={{ position: "relative" }}
      >
        <path
          d="M16 28.5 C16 28.5 3 20 3 11 C3 6 7 2 12 2 C14.5 2 16 4 16 4 C16 4 17.5 2 20 2 C25 2 29 6 29 11 C29 20 16 28.5 16 28.5Z"
          fill="none"
          stroke={heartColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <g transform="translate(16, 13)">
          <ellipse
            cx="0"
            cy="0"
            rx="5"
            ry="3"
            fill={scleraColor}
          />
          <ellipse
            cx="0"
            cy="0"
            rx="2.5"
            ry="2.5"
            fill={pupilColor}
          />
          {isAnimating && (
            <ellipse
              cx="0"
              cy="-3"
              rx="2"
              ry="1.5"
              fill="rgba(255, 45, 61, 0.7)"
            />
          )}
        </g>
        
        <g transform="translate(16, 13)">
          <ellipse
            cx="-2.5"
            cy="-1.5"
            rx="1"
            ry="0.8"
            fill="rgba(255, 255, 255, 0.8)"
          />
        </g>
      </svg>
      
      {isAnimating && (
        <div 
          className="orwellian-like-spotlight" 
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "6px",
            height: "40px",
            background: "linear-gradient(to bottom, rgba(255, 45, 61, 0.8), transparent)",
            filter: "blur(3px)",
            zIndex: 10,
            pointerEvents: "none",
            animation: "orwellian-like-spotlight-sweep 0.4s ease-out",
          }}
        />
      )}
    </button>
  );
}