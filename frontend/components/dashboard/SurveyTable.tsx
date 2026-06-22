"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Survey } from "@/app/store/apiSlice";

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Complete': return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Complete</Badge>;
    case 'Terminate': return <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">Terminate</Badge>;
    case 'Quota Full': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Quota Full</Badge>;
    case 'Security Term': return <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20">Security</Badge>;
    default: return <Badge variant="secondary" className="bg-white/10 text-white">{status}</Badge>;
  }
};

interface SurveyTableProps {
  surveys: Survey[];
  isLoading: boolean;
  page: number;
  limit: number;
  totalItems: number;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export function SurveyTable({
  surveys,
  isLoading,
  page,
  limit,
  totalItems,
  currentTab,
  onTabChange,
  onPageChange,
  onLimitChange,
  onDelete,
  onUpdateStatus
}: SurveyTableProps) {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl flex flex-col h-full w-full overflow-hidden">
      <CardHeader className="pb-6 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <CardTitle className="text-xl font-bold text-white">Surveys Data</CardTitle>
          {currentTab && onTabChange && (
            <Tabs value={currentTab} onValueChange={onTabChange} className="w-full sm:w-auto overflow-hidden">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full text-zinc-400 flex overflow-x-auto w-full sm:w-auto flex-nowrap max-w-full scrollbar-none">
                <TabsTrigger value="All" className="rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all shrink-0">All</TabsTrigger>
                <TabsTrigger value="Complete" className="rounded-full data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 transition-all shrink-0">Complete</TabsTrigger>
                <TabsTrigger value="Terminate" className="rounded-full data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 transition-all shrink-0">Terminate</TabsTrigger>
                <TabsTrigger value="Quota Full" className="rounded-full data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all shrink-0">Quota</TabsTrigger>
                <TabsTrigger value="Security Term" className="rounded-full data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 transition-all shrink-0">Security</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
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
              {isLoading ? (
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
                    <TableCell className="hidden md:table-cell text-zinc-400 font-medium">
                      {new Date(survey.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
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
                                <DropdownMenuItem className="focus:bg-emerald-500/20 focus:text-emerald-400" onClick={() => onUpdateStatus(survey._id, "Complete")}>Complete</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400" onClick={() => onUpdateStatus(survey._id, "Terminate")}>Terminate</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-amber-500/20 focus:text-amber-400" onClick={() => onUpdateStatus(survey._id, "Quota Full")}>Quota Full</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-indigo-500/20 focus:text-indigo-400" onClick={() => onUpdateStatus(survey._id, "Security Term")}>Security Term</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400" onClick={() => onDelete(survey._id)}>
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
          <Select value={limit.toString()} onValueChange={(val) => onLimitChange(Number(val))}>
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
                onClick={() => onPageChange(Math.max(1, page - 1))} 
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
                      onClick={() => onPageChange(pageNum)}
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
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
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
  );
}
