import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, Video, MessageCircle, User } from "lucide-react";

const navItems = [
  { to: "/app/home", label: "Home", icon: Home, route: "home" },
  { to: "/app/explore", label: "Explore", icon: Search, route: "explore" },
  { to: "/app/review-session", label: "Session", icon: Video, route: "session" },
  { to: "/app/social", label: "Social", icon: MessageCircle, route: "social" },
  { to: "/app/me", label: "Profile", icon: User, route: "profile" },
];

function CyberIcon({ icon: Icon }: { icon: any }) {
  return (
    <Icon size={22} />
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

  const activeIndex = getActiveIndex();

  const handleClick = (route: string) => {
    const isSameRoute = location.pathname === route;
    window.scrollTo(0, 0);
    if (isSameRoute) {
      navigate(route, { replace: true });
    } else {
      navigate(route);
    }
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
            onClick={() => handleClick(item.to)}
          >
            <CyberIcon icon={item.icon} />
            <span className="cyber-label-text">{item.label}</span>
            <span className="glare"></span>
          </button>
        ))}
      </div>
    </div>
  );
}
