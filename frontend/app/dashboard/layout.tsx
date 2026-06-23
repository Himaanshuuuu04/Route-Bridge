import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-[#09090b] text-zinc-50 font-sans selection:bg-emerald-500/30">
        {/* Abstract Background for Dashboard */}
        <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-50%] left-[20%] w-[50%] h-full rounded-full bg-emerald-500 blur-[150px]" />
          <div className="absolute top-[-50%] right-[10%] w-[30%] h-full rounded-full bg-indigo-500 blur-[150px]" />
        </div>

        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <DashboardNavbar />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
