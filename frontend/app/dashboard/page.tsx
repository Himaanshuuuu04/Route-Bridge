"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import { 
  LogOut, LayoutDashboard, Trash2, CheckCircle2, XCircle, 
  AlertTriangle, Clock, RefreshCw, Activity, MoreHorizontal, Settings
} from "lucide-react";

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SurveyCount {
  total_entries: number;
  complete_entries: number;
  terminate_entries: number;
  quota_full_entries: number;
  security_term_entries: number;
}

interface Survey {
  _id: string;
  uid: string;
  pid: string;
  status: string;
  ipAddress: string;
  createdAt: string;
}

const COLORS = {
  Complete: '#10b981', // Emerald
  Terminate: '#ef4444', // Red
  'Quota Full': '#f59e0b', // Amber
  'Security Term': '#6366f1', // Indigo
};

type CategoryTab = "All" | "Complete" | "Terminate" | "Quota Full" | "Security Term";

export default function DashboardPage() {
  const [counts, setCounts] = useState<SurveyCount | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Pagination & Filtering State
  const [currentTab, setCurrentTab] = useState<CategoryTab>("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const router = useRouter();
  const { showToast } = useToast();

  const fetchCounts = async () => {
    try {
      const countRes = await api.get("/api/dashboard/getcount");
      setCounts(countRes.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast("Session expired, please sign in again", "error");
        router.push("/signin");
      }
    }
  };

  const fetchSurveys = useCallback(async () => {
    setDataLoading(true);
    try {
      let endpoint = "/api/dashboard/getRecentSurveys";
      if (currentTab === "Complete") endpoint = "/api/dashboard/getCompletedSurveys";
      else if (currentTab === "Terminate") endpoint = "/api/dashboard/getTerminatedSurveys";
      else if (currentTab === "Quota Full") endpoint = "/api/dashboard/getQuotaFullSurveys";
      else if (currentTab === "Security Term") endpoint = "/api/dashboard/getSecurityTermSurveys";

      const res = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
      setSurveys(res.data);
    } catch (error) {
      showToast("Failed to fetch surveys", "error");
    } finally {
      setDataLoading(false);
      setLoading(false); // Only set global loading false once both are done or failed
    }
  }, [currentTab, page, limit, showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      case 'Complete': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Complete</Badge>;
      case 'Terminate': return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Terminate</Badge>;
      case 'Quota Full': return <Badge variant="outline" className="bg-amber-500/10 text-amber-600  hover:bg-amber-500/20 border-amber-500/20">Quota Full</Badge>;
      case 'Security Term': return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600  hover:bg-indigo-500/20 border-indigo-500/20">Security Term</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate total pages
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
      <div className="flex h-screen items-center justify-center bg-background ">
        <RefreshCw className="w-8 h-8 animate-spin text-foreground " />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-background ">
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">Analytics</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Dashboard">
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => {
                      showToast("Logged out successfully", "info");
                      router.push("/signin");
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50  transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                <p className="text-muted-foreground mt-1">Metrics and recent activity for your surveys.</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => { fetchCounts(); fetchSurveys(); }} disabled={dataLoading}>
              <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Surveys" value={counts?.total_entries || 0} loading={!counts} />
            <StatCard title="Completed" value={counts?.complete_entries || 0} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} loading={!counts} />
            <StatCard title="Terminated" value={counts?.terminate_entries || 0} icon={<XCircle className="w-4 h-4 text-red-500" />} loading={!counts} />
            <StatCard title="Quota Full" value={counts?.quota_full_entries || 0} icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} loading={!counts} />
            <StatCard title="Security Term" value={counts?.security_term_entries || 0} icon={<Activity className="w-4 h-4 text-indigo-500" />} loading={!counts} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Chart */}
            <Card className="xl:col-span-1 border-muted/50 shadow-sm">
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-background)', 
                          borderColor: 'var(--color-border)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
                )}
              </CardContent>
            </Card>

            {/* Table Area */}
            <Card className="xl:col-span-2 border-muted/50 shadow-sm flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Surveys Data</CardTitle>
                  <Tabs value={currentTab} onValueChange={(val) => { setCurrentTab(val as CategoryTab); setPage(1); }} className="w-full sm:w-auto overflow-x-auto">
                    <TabsList className="grid w-full grid-cols-5 min-w-[400px]">
                      <TabsTrigger value="All">All</TabsTrigger>
                      <TabsTrigger value="Complete">Complete</TabsTrigger>
                      <TabsTrigger value="Terminate">Terminate</TabsTrigger>
                      <TabsTrigger value="Quota Full">Quota</TabsTrigger>
                      <TabsTrigger value="Security Term">Security</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="pl-6">Project ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataLoading ? (
                      Array.from({ length: limit }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell className="pl-6"><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                        </TableRow>
                      ))
                    ) : surveys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No surveys found in this category.
                        </TableCell>
                      </TableRow>
                    ) : (
                      surveys.map((survey) => (
                        <TableRow key={survey._id} className="group transition-colors">
                          <TableCell className="pl-6 font-medium">{survey.pid}</TableCell>
                          <TableCell className="text-muted-foreground">{survey.uid}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{survey.ipAddress}</TableCell>
                          <TableCell>{getStatusBadge(survey.status)}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(survey.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Update Status</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(survey._id, "Complete")}>Complete</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(survey._id, "Terminate")}>Terminate</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(survey._id, "Quota Full")}>Quota Full</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(survey._id, "Security Term")}>Security Term</DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem className="text-red-600  focus:text-red-600 " onClick={() => handleDelete(survey._id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {/* Pagination Controls */}
              <div className="border-t border-muted p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <p>Rows per page</p>
                  <Select value={limit.toString()} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={limit} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 50, 100].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
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
                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* Simple Pagination Logic for illustration, showing up to 5 pages nicely */}
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                      // Logic to center the current page
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
                              className="cursor-pointer"
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
                         <PaginationEllipsis />
                       </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <div className="text-sm text-muted-foreground sm:w-[130px] text-right">
                  Page {page} of {totalPages}
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value: number, icon?: React.ReactNode, loading?: boolean }) {
  return (
    <Card className="border-muted/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}
