import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Video, Swords, User } from "lucide-react";

const navItems = [
  { to: "/app/home", label: "Home", icon: Home, route: "home" },
  { to: "/app/explore", label: "Explore", icon: Search, route: "explore" },
  { to: "/app/review-session", label: "Session", icon: Video, route: "session" },
  { to: "/app/battles", label: "Battles", icon: Swords, route: "battles" },
  { to: "/app/me", label: "Profile", icon: User, route: "profile" },
];

function CyberIcon({ icon: Icon }: { icon: any }) {
  return (
    <Icon size={20} />
  );
}

export function CyberBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveIndex = () => {
    const path = location.pathname;
    const found = navItems.find(item => path.startsWith(item.to));
    return found ? navItems.indexOf(found) : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());

  const handleClick = (index: number, route: string) => {
    setActiveIndex(index);
    navigate(route);
  };

  return (
    <div className="cyber-signboard">
      <div className="cyber-switch">
        <div 
          className="cyber-highlight"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          <div className="highlight-inner"></div>
        </div>
        
        {navItems.map((item, index) => (
          <button
            key={item.to}
            className={`cyber-label ${activeIndex === index ? "active" : ""}`}
            onClick={() => handleClick(index, item.to)}
          >
            <CyberIcon icon={item.icon} />
            <span className="glare"></span>
          </button>
        ))}
      </div>
    </div>
  );
}