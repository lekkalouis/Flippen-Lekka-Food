import React from "react";
import "../../styles/layout.css";

export type TabItem = {
  id: string;
  label: string;
};

type TopNavProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function TopNav({ tabs, activeTab, onTabChange }: TopNavProps) {
  return (
    <nav className="top-nav">
      <div className="top-nav__brand">
        <span className="top-nav__pulse" />
        <div>
          <h1>Flippen Lekka Food</h1>
          <p>Recipe Intelligence Console</p>
        </div>
      </div>
      <div className="top-nav__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`top-nav__tab ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
