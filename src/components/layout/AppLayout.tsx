import React from "react";
import "../../styles/layout.css";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {children}
      <footer className="app-footer">
        <span>Neon kitchen ops • v0.1</span>
        <span className="app-footer__status">System stable</span>
      </footer>
    </div>
  );
}
