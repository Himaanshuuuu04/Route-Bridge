import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <DashboardNavbar />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}


