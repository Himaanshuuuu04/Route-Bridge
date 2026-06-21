"use client";

import * as React from "react";
import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import { 
  LogOut, LayoutDashboard, Trash2, CheckCircle2, XCircle, 
  AlertTriangle, Activity, MoreHorizontal, Settings, RefreshCw, BarChart3, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = {
  Complete: '#10b981', // Emerald
  Terminate: '#ef4444', // Red
  'Quota Full': '#f59e0b', // Amber
  'Security Term': '#6366f1', // Indigo
};

function getFlagEmoji(countryCode?: string) {
  if (!countryCode || countryCode === 'UN' || countryCode === 'LCL') return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🏳️';
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  
  const { 
    counts, setCounts, surveys, setSurveys, loading, setLoading, dataLoading, setDataLoading,
    currentTab, setCurrentTab, page, setPage, limit, setLimit,
    startDate, setStartDate, endDate, setEndDate
  } = useAppStore();

  const fetchCounts = useCallback(async () => {
    try {
      let queryParams = "";
      if (startDate) queryParams += `?startDate=${startDate}`;
      if (endDate) queryParams += `${queryParams ? '&' : '?'}endDate=${endDate}`;
      const countRes = await api.get(`/api/dashboard/getcount${queryParams}`);
      setCounts(countRes.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast("Session expired, please sign in again", "error");
        router.push("/signin");
      }
    }
  }, [setCounts, showToast, router, startDate, endDate]);

  const fetchSurveys = useCallback(async () => {
    setDataLoading(true);
    try {
      let endpoint = "/api/dashboard/getRecentSurveys";
      if (currentTab === "Complete") endpoint = "/api/dashboard/getCompletedSurveys";
      else if (currentTab === "Terminate") endpoint = "/api/dashboard/getTerminatedSurveys";
      else if (currentTab === "Quota Full") endpoint = "/api/dashboard/getQuotaFullSurveys";
      else if (currentTab === "Security Term") endpoint = "/api/dashboard/getSecurityTermSurveys";

      let queryParams = `page=${page}&limit=${limit}`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;

      const res = await api.get(`${endpoint}?${queryParams}`);
      setSurveys(res.data);
    } catch (error) {
      showToast("Failed to fetch surveys", "error");
    } finally {
      setDataLoading(false);
      setLoading(false); 
    }
  }, [currentTab, page, limit, showToast, setDataLoading, setLoading, setSurveys, startDate, endDate]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/dashboard/remove/${id}`);
      showToast("Survey deleted", "success");
      fetchCounts();
      fetchSurveys();
    } catch (error) {
      showToast("Failed to delete survey", "error");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/dashboard/update/${id}`, { status: newStatus });
      showToast("Survey status updated", "success");
      fetchCounts();
      fetchSurveys();
    } catch (error) {
      showToast("Failed to update survey status", "error");
    }
  };

  const chartData = counts ? [
    { name: 'Complete', value: counts.complete_entries, color: COLORS.Complete },
    { name: 'Terminate', value: counts.terminate_entries, color: COLORS.Terminate },
    { name: 'Quota Full', value: counts.quota_full_entries, color: COLORS['Quota Full'] },
    { name: 'Security Term', value: counts.security_term_entries, color: COLORS['Security Term'] },
  ].filter(item => item.value > 0) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete': return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Complete</Badge>;
      case 'Terminate': return <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">Terminate</Badge>;
      case 'Quota Full': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Quota Full</Badge>;
      case 'Security Term': return <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20">Security</Badge>;
      default: return <Badge variant="secondary" className="bg-white/10 text-white">{status}</Badge>;
    }
  };

  const getTotalItemsForTab = () => {
    if (!counts) return 0;
    if (currentTab === "All") return counts.total_entries;
    if (currentTab === "Complete") return counts.complete_entries;
    if (currentTab === "Terminate") return counts.terminate_entries;
    if (currentTab === "Quota Full") return counts.quota_full_entries;
    if (currentTab === "Security Term") return counts.security_term_entries;
    return 0;
  };
  
  const totalItems = getTotalItemsForTab();
  const totalPages = Math.ceil(totalItems / limit) || 1;

  if (loading && !counts) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
          />
          <p className="text-zinc-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-[#09090b] text-zinc-50 font-sans selection:bg-emerald-500/30">
        
        {/* Abstract Background for Dashboard */}
        <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-50%] left-[20%] w-[50%] h-full rounded-full bg-emerald-500 blur-[150px]" />
          <div className="absolute top-[-50%] right-[10%] w-[30%] h-full rounded-full bg-indigo-500 blur-[150px]" />
        </div>

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
                {[
                  { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
                  { name: "All Surveys", href: "/dashboard/all", icon: <BarChart3 className="mr-2 h-4 w-4 text-zinc-400" /> },
                  { name: "Completed", href: "/dashboard/completed", icon: <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> },
                  { name: "Terminated", href: "/dashboard/terminated", icon: <XCircle className="mr-2 h-4 w-4 text-red-400" /> },
                  { name: "Quota Full", href: "/dashboard/quota", icon: <AlertTriangle className="mr-2 h-4 w-4 text-amber-400" /> },
                  { name: "Security Term", href: "/dashboard/security", icon: <Activity className="mr-2 h-4 w-4 text-indigo-400" /> },
                ].map((item) => (
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
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={async () => {
                      try {
                        await api.post("/api/user/logout");
                        showToast("Logged out successfully", "info");
                        router.push("/signin");
                      } catch (error) {
                        showToast("Failed to log out", "error");
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden text-white" />
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Dashboard Overview</h2>
                <p className="text-zinc-400 mt-2 font-medium">Real-time metrics and survey insights.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
              onClick={() => { fetchCounts(); fetchSurveys(); }} 
              disabled={dataLoading}
            >
              <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
            </Button>
          </motion.div>

          {/* Date Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl relative z-20"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Filter by Date:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">From</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">To</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              
              {(startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                >
                  Clear Filter
                </Button>
              )}
            </div>
            
            {/* Quick Presets */}
            <div className="md:ml-auto flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(today);
                  setEndDate(today);
                  setPage(1);
                }}
                className="bg-white/5 border-white/10 text-xs hover:bg-white/10 text-white rounded-xl"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 7);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                  setPage(1);
                }}
                className="bg-white/5 border-white/10 text-xs hover:bg-white/10 text-white rounded-xl"
              >
                Last 7 Days
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 30);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                  setPage(1);
                }}
                className="bg-white/5 border-white/10 text-xs hover:bg-white/10 text-white rounded-xl"
              >
                Last 30 Days
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10"
          >
            <StatCard 
              title="Total Surveys" 
              value={counts?.total_entries || 0} 
              icon={<BarChart3 className="w-5 h-5 text-zinc-400" />} 
              loading={!counts} 
              href="/dashboard/all"
              delay={0.1} 
            />
            <StatCard 
              title="Completed" 
              value={counts?.complete_entries || 0} 
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
              loading={!counts} 
              href="/dashboard/completed"
              delay={0.2} 
            />
            <StatCard 
              title="Terminated" 
              value={counts?.terminate_entries || 0} 
              icon={<XCircle className="w-5 h-5 text-red-400" />} 
              loading={!counts} 
              href="/dashboard/terminated"
              delay={0.3} 
            />
            <StatCard 
              title="Quota Full" 
              value={counts?.quota_full_entries || 0} 
              icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} 
              loading={!counts} 
              href="/dashboard/quota"
              delay={0.4} 
            />
            <StatCard 
              title="Security Term" 
              value={counts?.security_term_entries || 0} 
              icon={<Activity className="w-5 h-5 text-indigo-400" />} 
              loading={!counts} 
              href="/dashboard/security"
              delay={0.5} 
            />
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-1"
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#09090b', 
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                          }} 
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 font-medium">No data available</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Table Area */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-2"
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl flex flex-col h-full">
                <CardHeader className="pb-6 border-b border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <CardTitle className="text-xl font-bold text-white">Surveys Data</CardTitle>
                    <Tabs value={currentTab} onValueChange={(val) => { setCurrentTab(val as any); setPage(1); }} className="w-full sm:w-auto overflow-hidden">
                      <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full text-zinc-400 flex overflow-x-auto w-full sm:w-auto flex-nowrap max-w-full scrollbar-none">
                        <TabsTrigger value="All" className="rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all shrink-0">All</TabsTrigger>
                        <TabsTrigger value="Complete" className="rounded-full data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 transition-all shrink-0">Complete</TabsTrigger>
                        <TabsTrigger value="Terminate" className="rounded-full data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 transition-all shrink-0">Terminate</TabsTrigger>
                        <TabsTrigger value="Quota Full" className="rounded-full data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all shrink-0">Quota</TabsTrigger>
                        <TabsTrigger value="Security Term" className="rounded-full data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 transition-all shrink-0">Security</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="pl-6 text-zinc-400 font-semibold py-4">Project ID</TableHead>
                        <TableHead className="text-zinc-400 font-semibold">User ID</TableHead>
                        <TableHead className="hidden sm:table-cell text-zinc-400 font-semibold">IP Address</TableHead>
                        <TableHead className="hidden md:table-cell text-zinc-400 font-semibold">Country</TableHead>
                        <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
                        <TableHead className="hidden md:table-cell text-zinc-400 font-semibold">Date</TableHead>
                        <TableHead className="text-right pr-6 text-zinc-400 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {dataLoading ? (
                          Array.from({ length: limit }).map((_, i) => (
                            <TableRow key={`skeleton-${i}`} className="border-white/5">
                              <TableCell className="pl-6"><Skeleton className="h-5 w-24 bg-white/5 rounded-md" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-28 bg-white/5 rounded-md" /></TableCell>
                              <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24 bg-white/5 rounded-md" /></TableCell>
                              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20 bg-white/5 rounded-md" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-24 rounded-full bg-white/5" /></TableCell>
                              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 bg-white/5 rounded-md" /></TableCell>
                              <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-md bg-white/5" /></TableCell>
                            </TableRow>
                          ))
                        ) : surveys.length === 0 ? (
                          <TableRow className="border-none">
                            <TableCell colSpan={7} className="h-48 text-center text-zinc-500 font-medium">
                              No surveys found in this category.
                            </TableCell>
                          </TableRow>
                        ) : (
                          surveys.map((survey, index) => (
                            <motion.tr 
                              key={survey._id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group transition-colors border-white/5 hover:bg-white/[0.02]"
                            >
                              <TableCell className="pl-6 font-bold text-white">{survey.pid}</TableCell>
                              <TableCell className="text-zinc-400 font-medium">{survey.uid}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className="font-mono text-xs text-zinc-500 bg-black/50 px-2 py-1 rounded inline-block">
                                  {survey.ipAddress}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                                  <span className="text-lg">{getFlagEmoji(survey.countryCode)}</span>
                                  <span>{survey.country || 'Unknown'}</span>
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(survey.status)}</TableCell>
                              <TableCell className="hidden md:table-cell text-zinc-400 font-medium">{new Date(survey.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                              <TableCell className="text-right pr-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[180px] bg-[#09090b] border-white/10 text-white shadow-xl">
                                    <DropdownMenuLabel className="text-zinc-400">Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="focus:bg-white/10 focus:text-white">
                                        <Settings className="mr-2 h-4 w-4 text-zinc-400" />
                                        <span>Update Status</span>
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="bg-[#09090b] border-white/10 text-white shadow-xl">
                                          <DropdownMenuItem className="focus:bg-emerald-500/20 focus:text-emerald-400" onClick={() => handleUpdateStatus(survey._id, "Complete")}>Complete</DropdownMenuItem>
                                          <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400" onClick={() => handleUpdateStatus(survey._id, "Terminate")}>Terminate</DropdownMenuItem>
                                          <DropdownMenuItem className="focus:bg-amber-500/20 focus:text-amber-400" onClick={() => handleUpdateStatus(survey._id, "Quota Full")}>Quota Full</DropdownMenuItem>
                                          <DropdownMenuItem className="focus:bg-indigo-500/20 focus:text-indigo-400" onClick={() => handleUpdateStatus(survey._id, "Security Term")}>Security Term</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400" onClick={() => handleDelete(survey._id)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </CardContent>
                
                {/* Pagination Controls */}
                <div className="border-t border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 rounded-b-xl">
                  <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                    <p>Rows per page</p>
                    <Select value={limit.toString()} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
                      <SelectTrigger className="h-8 w-[70px] bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder={limit} />
                      </SelectTrigger>
                      <SelectContent side="top" className="bg-[#09090b] border-white/10 text-white">
                        {[10, 20, 50, 100].map((pageSize) => (
                          <SelectItem key={pageSize} value={pageSize.toString()} className="focus:bg-white/10 focus:text-white">
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Pagination className="w-auto mx-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(Math.max(1, page - 1))} 
                          className={`text-zinc-400 hover:text-white hover:bg-white/10 ${page === 1 ? "pointer-events-none opacity-30" : "cursor-pointer"}`}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        let pageNum = idx + 1;
                        if (totalPages > 5 && page > 3) {
                          pageNum = page - 3 + idx + (page + 2 > totalPages ? totalPages - page - 2 : 0);
                        }
                        
                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink 
                                isActive={page === pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`cursor-pointer ${page === pageNum ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-400 hover:bg-white/10 hover:text-white border-transparent"}`}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      {totalPages > 5 && page < totalPages - 2 && (
                         <PaginationItem>
                           <PaginationEllipsis className="text-zinc-400" />
                         </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          className={`text-zinc-400 hover:text-white hover:bg-white/10 ${page === totalPages ? "pointer-events-none opacity-30" : "cursor-pointer"}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <div className="text-sm text-zinc-500 font-medium sm:w-[130px] text-right">
                    Page <span className="text-white">{page}</span> of {totalPages}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  loading, 
  href,
  delay = 0 
}: { 
  title: string; 
  value: number; 
  icon?: React.ReactNode; 
  loading?: boolean; 
  href?: string;
  delay?: number; 
}) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <Link href={href} className="block cursor-pointer h-full">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <CardWrapper>
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-400">{title}</CardTitle>
            {icon && <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center shrink-0">{icon}</div>}
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <Skeleton className="h-8 w-20 bg-white/10 rounded-md" />
            ) : (
              <div className="text-4xl font-black tracking-tight text-white mt-1">{value.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  );
}
