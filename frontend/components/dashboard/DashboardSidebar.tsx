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
  SidebarFooter 
} from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";
import { useLogoutMutation } from "@/app/store/apiSlice";
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
  ArrowRightLeft
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [logout] = useLogoutMutation();

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
    { name: "All Surveys", href: "/dashboard/all", icon: <BarChart3 className="mr-2 h-4 w-4 text-zinc-400" /> },
    { name: "Completed", href: "/dashboard/completed", icon: <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> },
    { name: "Terminated", href: "/dashboard/terminated", icon: <XCircle className="mr-2 h-4 w-4 text-red-400" /> },
    { name: "Quota Full", href: "/dashboard/quota", icon: <AlertTriangle className="mr-2 h-4 w-4 text-amber-400" /> },
    { name: "Security Term", href: "/dashboard/security", icon: <Activity className="mr-2 h-4 w-4 text-indigo-400" /> },
  ];

  const adminItems = [
    { name: "Manage Surveys", href: "/dashboard/surveys", icon: <ClipboardList className="mr-2 h-4 w-4 text-purple-400" /> },
    { name: "Transactions", href: "/dashboard/transactions", icon: <ArrowRightLeft className="mr-2 h-4 w-4 text-sky-400" /> },
  ];

  return (
    <Sidebar variant="inset" className="bg-black/50 border-r border-white/5 backdrop-blur-xl">
      <SidebarHeader>
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Analytics</h1>
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
                    "font-medium transition-all duration-200",
                    pathname === item.href 
                      ? "bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
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

        <SidebarGroup>
          <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 mt-2">
            Administration
          </div>
          <SidebarMenu className="gap-1">
            {adminItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)} 
                  tooltip={item.name} 
                  className={cn(
                    "font-medium transition-all duration-200",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
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
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
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
