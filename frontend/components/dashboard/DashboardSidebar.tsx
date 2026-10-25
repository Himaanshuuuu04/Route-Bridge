"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";
import { useLogoutMutation, useGetMeQuery } from "@/app/store/apiSlice";
import { 
  LogOut, 
  LayoutDashboard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  BarChart3,
  Settings,
  ClipboardList,
  ArrowRightLeft,
  Download
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [logout] = useLogoutMutation();
  const { data: user, isLoading: isUserLoading } = useGetMeQuery();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      showToast("Logged out successfully", "info");
      router.push("/signin");
    } catch (error) {
      showToast("Failed to log out", "error");
    }
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
   
    { name: "All Surveys", href: "/dashboard/all", icon: <BarChart3 className="mr-2 h-4 w-4 text-slate-500" /> },
    { name: "Completed", href: "/dashboard/completed", icon: <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> },
    { name: "Terminated", href: "/dashboard/terminated", icon: <XCircle className="mr-2 h-4 w-4 text-rose-500" /> },
    { name: "Quota Full", href: "/dashboard/quota", icon: <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> },
    { name: "Security Term", href: "/dashboard/security", icon: <Activity className="mr-2 h-4 w-4 text-indigo-500" /> },
    { name: "Download Data", href: "/dashboard/download", icon: <Download className="mr-2 h-4 w-4 text-blue-600" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="mr-2 h-4 w-4 text-emerald-500" /> },
  ];

  const adminItems = [
    { name: "Manage Surveys", href: "/dashboard/surveys", icon: <ClipboardList className="mr-2 h-4 w-4 text-purple-600" /> },
    { name: "Manage Users", href: "/dashboard/users", icon: <Settings className="mr-2 h-4 w-4 text-teal-600" /> },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset" className="bg-white/80 border-r border-slate-200/80 backdrop-blur-xl text-slate-800">
      <SidebarHeader>
        <div className="flex items-center gap-3 p-4 justify-center">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img src="/logo.webp" alt="logo" className="w-8 h-8" />
          </div>
          {!isCollapsed && (
            <h1 className="text-md font-bold tracking-tight text-slate-900 animate-in fade-in duration-200">Evo Global Insight</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href} 
                  tooltip={item.name} 
                  className={cn(
                    "font-medium transition-all duration-200 rounded-xl",
                    pathname === item.href 
                      ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white font-semibold shadow-xs" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {!isUserLoading && user?.surveyAdmin && (
          <SidebarGroup>
            {!isCollapsed && (
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-2 animate-in fade-in duration-200">
                Administration
              </div>
            )}
            <SidebarMenu className="gap-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)} 
                    tooltip={item.name} 
                    className={cn(
                      "font-medium transition-all duration-200 rounded-xl",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white font-semibold shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                tooltip="Sign out"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-medium rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
