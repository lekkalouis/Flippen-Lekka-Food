import React, { useState } from "react";
import "./styles/global.css";
import { AppLayout } from "./components/layout/AppLayout";
import { TopNav, TabItem } from "./components/layout/TopNav";
import { Admin } from "./routes/Admin";
import { Generate } from "./routes/Generate";
import { History } from "./routes/History";
import { SettingsRules } from "./routes/SettingsRules";

const tabs: TabItem[] = [
  { id: "admin", label: "Admin (Recipes)" },
  { id: "generate", label: "Generate" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings / Rules" },
];

const routeMap: Record<string, React.ReactNode> = {
  admin: <Admin />,
  generate: <Generate />,
  history: <History />,
  settings: <SettingsRules />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <AppLayout>
      <TopNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <header>
          <p className="section-title">Command Center</p>
          <h2 className="glow-text">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
        </header>
        <section className="surface" style={{ padding: "24px" }}>
          {routeMap[activeTab]}
        </section>
      </main>
    </AppLayout>
  );
}
