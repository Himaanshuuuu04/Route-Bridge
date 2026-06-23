"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, User, Settings, LayoutDashboard, Menu } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";
import { useLogoutMutation } from "@/app/store/apiSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Sidebar Trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Toggle button for sidebar */}
        <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-white/5" />
        
        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
        
        {/* Mobile Brand / Desktop breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Mobile Only: Mini Logo icon */}
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-lg flex items-center justify-center sm:hidden shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-300">
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
          className="h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
        </Button>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-white/10" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-white/10">
              <Avatar className="h-8.5 w-8.5">
                <AvatarImage src="" alt="User profile" />
                <AvatarFallback className="bg-zinc-850 text-white font-semibold text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-white">Administrator</p>
                <p className="text-xs leading-none text-zinc-400">admin@surveyrouter.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer gap-2">
                <User className="h-4 w-4 text-zinc-400" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer gap-2">
                <Settings className="h-4 w-4 text-zinc-400" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer gap-2"
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
