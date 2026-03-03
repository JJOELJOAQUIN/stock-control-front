import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
<div className="flex h-screen bg-background text-foreground">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 bg-background">

          <Outlet />
        </main>
      </div>
    </div>
  );
}
