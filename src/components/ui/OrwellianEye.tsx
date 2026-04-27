import { useState } from "react";

interface OrwellianEyeProps {
  filled: boolean;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export function OrwellianEye({ filled, size = 24, onClick, className = "" }: OrwellianEyeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (onClick) {
      setIsAnimating(true);
      onClick();
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const strokeColor = filled ? "#FF4444" : "#FFFFFF";
  const fillColor = filled ? "rgba(255, 68, 68, 0.15)" : "transparent";

  return (
    <button
      onClick={handleClick}
      className={`orwellian-eye-btn ${isAnimating ? "animate" : ""} ${className}`}
      style={{
        background: "none",
        border: "none",
        cursor: onClick ? "pointer" : "default",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.15s ease-out",
        transform: isAnimating ? "scale(1.3)" : "scale(1)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 12C3.8 7.5 7.6 5 12 5C16.4 5 20.2 7.5 22 12C20.2 16.5 16.4 19 12 19C7.6 19 3.8 16.5 2 12Z"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={fillColor}
        />
        <circle
          cx="12"
          cy="12"
          r="3.2"
          stroke={strokeColor}
          strokeWidth="1.8"
          fill={filled ? strokeColor : "rgba(255,255,255,0.12)"}
        />
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke={strokeColor}
          strokeWidth="0.8"
          opacity="0.35"
          fill="none"
        />
        <path
          d="M5 12H19"
          stroke={strokeColor}
          strokeWidth="0.8"
          opacity="0.25"
        />
      </svg>
    </button>
  );
}