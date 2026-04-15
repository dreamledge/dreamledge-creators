import { useState, type ReactNode } from "react";

const tabs: { key: string; label: string; icon: ReactNode }[] = [
  { 
    key: "posts", 
    label: "Posts", 
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    )
  },
  { 
    key: "battles", 
    label: "Battles", 
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
      </svg>
    )
  },
  { 
    key: "contests", 
    label: "Contests", 
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>
      </svg>
    )
  },
  { 
    key: "wins", 
    label: "Wins", 
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zm-5 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
      </svg>
    )
  },
  { 
    key: "about", 
    label: "About", 
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" height="1em">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
    )
  },
];

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="feed-tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`feed-tab ${activeTab === tab.key ? "feed-tab-active" : "feed-tab-inactive"}`}
        >
          <span className="feed-tab-icon">{tab.icon}</span>
          <span className="feed-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}