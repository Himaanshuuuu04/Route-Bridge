"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, User, Settings, LayoutDashboard, Menu } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";
import { useLogoutMutation, useGetMeQuery } from "@/app/store/apiSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [logout] = useLogoutMutation();
  const { data: user } = useGetMeQuery();
  const { toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      showToast("Logged out successfully", "info");
      router.push("/signin");
    } catch (error) {
      showToast("Failed to log out", "error");
    }
  };

  // Generate page title/breadcrumb based on pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length <= 1) return "Overview";
    
    const page = paths[1];
    if (page === "surveys") {
      if (paths.length > 2) return "Survey Details";
      return "Manage Surveys";
    }
    
    // Categories like completed, terminated, quota, security, all
    const categoryMap: Record<string, string> = {
      all: "All Surveys",
      completed: "Completed Surveys",
      terminated: "Terminated Surveys",
      quota: "Quota Full Surveys",
      security: "Security Terminated",
    };
    
    return categoryMap[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Sidebar Trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Toggle button for sidebar */}
        <SidebarTrigger className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg" />
        
        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
        
        {/* Mobile Brand / Desktop breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Mobile Only: Mini Logo icon */}
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-lg flex items-center justify-center sm:hidden shrink-0 shadow-xs">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-800">
            {getBreadcrumbs()}
          </span>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
        </Button>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-slate-200" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-slate-200">
              <Avatar className="h-8.5 w-8.5">
                <AvatarImage src="" alt="User profile" />
                <AvatarFallback className="bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border-slate-200 text-slate-900 shadow-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900">{user?.name || "Loading..."}</p>
                <p className="text-xs leading-none text-slate-500">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="focus:bg-rose-50 focus:text-rose-600 text-rose-600 cursor-pointer gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
