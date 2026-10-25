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
import { Survey, Transaction } from "@/app/store/apiSlice";

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
    case 'started': return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 font-medium">Started</Badge>;
    case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-medium">Completed</Badge>;
    case 'screened_out': return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 font-medium">Screened Out</Badge>;
    case 'quota_full': return <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 font-medium">Quota Full</Badge>;
    case 'fraud': return <Badge className="bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200 font-medium">Fraud</Badge>;
    case 'terminate': return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 font-medium">Terminate</Badge>;
    case 'security_term': return <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 font-medium">Security</Badge>;
    default: return <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 font-medium">{status}</Badge>;
  }
};

interface SurveyTableProps {
  surveys: any[];
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
    <Card className="bg-white border-slate-200/80 backdrop-blur-xl shadow-sm flex flex-col h-full w-full overflow-hidden">
      <CardHeader className="pb-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <CardTitle className="text-xl font-bold text-slate-900">Surveys Data</CardTitle>
          {currentTab && onTabChange && (
            <Tabs value={currentTab} onValueChange={onTabChange} className="w-full sm:w-auto overflow-hidden">
              <TabsList className="bg-slate-100/80 border border-slate-200/80 p-1 rounded-full text-slate-600 flex overflow-x-auto w-full sm:w-auto flex-nowrap max-w-full scrollbar-none">
                <TabsTrigger value="All" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all shrink-0 font-medium">All</TabsTrigger>
                <TabsTrigger value="started" className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Started</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Complete</TabsTrigger>
                <TabsTrigger value="screened_out" className="rounded-full data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Screen Out</TabsTrigger>
                <TabsTrigger value="quota_full" className="rounded-full data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Quota</TabsTrigger>
                <TabsTrigger value="fraud" className="rounded-full data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Fraud</TabsTrigger>
                <TabsTrigger value="terminate" className="rounded-full data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Terminate</TabsTrigger>
                <TabsTrigger value="security_term" className="rounded-full data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all shrink-0 font-medium">Security</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="pl-6 text-slate-600 font-semibold py-4">Project ID</TableHead>
                <TableHead className="text-slate-600 font-semibold">S.No</TableHead>
                <TableHead className="text-slate-600 font-semibold">User ID</TableHead>
                <TableHead className="hidden lg:table-cell text-slate-600 font-semibold">Supplier</TableHead>
                <TableHead className="hidden lg:table-cell text-slate-600 font-semibold">Vendor</TableHead>
                <TableHead className="hidden sm:table-cell text-slate-600 font-semibold">IP Address</TableHead>
                <TableHead className="hidden md:table-cell text-slate-600 font-semibold">Country</TableHead>
                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                <TableHead className="hidden md:table-cell text-slate-600 font-semibold">Date</TableHead>
                <TableHead className="text-right pr-6 text-slate-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-slate-100">
                      <TableCell className="pl-6"><Skeleton className="h-5 w-24 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full bg-slate-200" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 bg-slate-200 rounded-md" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-md bg-slate-200" /></TableCell>
                    </TableRow>
                  ))
                ) : surveys.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={10} className="h-48 text-center text-slate-400 font-medium">
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
                      className="group transition-colors border-slate-100 hover:bg-slate-50/80"
                    >
                      <TableCell className="pl-6 font-bold text-slate-900">{survey.projectId || survey.surveyId?.projectId || survey.pid}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{survey.serial !== undefined ? survey.serial : '-'}</TableCell>
                      <TableCell className="text-slate-600 font-medium max-w-[160px] truncate">{survey.transactionToken || survey.uid}</TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-700">{survey.surveyId?.supplierId?.name || "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-700">{survey.vendorId?.name || "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded inline-block">
                          {survey.ipAddress}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-slate-700 font-medium flex items-center gap-1.5">
                          <span className="text-lg">{getFlagEmoji(survey.countryCode)}</span>
                          <span>{survey.country || 'Unknown'}</span>
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(survey.status)}</TableCell>
                      <TableCell className="hidden md:table-cell text-slate-500 font-medium">
                        {new Date(survey.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px] bg-white border-slate-200 text-slate-900 shadow-xl">
                            <DropdownMenuLabel className="text-slate-400">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="focus:bg-slate-100 focus:text-slate-900">
                                <Settings className="mr-2 h-4 w-4 text-slate-500" />
                                <span>Update Status</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                                  <DropdownMenuItem className="focus:bg-blue-50 focus:text-blue-600" onClick={() => onUpdateStatus(survey._id, "started")}>Started</DropdownMenuItem>
                                  <DropdownMenuItem className="focus:bg-emerald-50 focus:text-emerald-600" onClick={() => onUpdateStatus(survey._id, "completed")}>Complete</DropdownMenuItem>
                                  <DropdownMenuItem className="focus:bg-amber-50 focus:text-amber-600" onClick={() => onUpdateStatus(survey._id, "screened_out")}>Screen Out</DropdownMenuItem>
                                  <DropdownMenuItem className="focus:bg-orange-50 focus:text-orange-600" onClick={() => onUpdateStatus(survey._id, "quota_full")}>Quota Full</DropdownMenuItem>
                                  <DropdownMenuItem className="focus:bg-pink-50 focus:text-pink-600" onClick={() => onUpdateStatus(survey._id, "fraud")}>Fraud</DropdownMenuItem>
                                  <DropdownMenuItem className="focus:bg-rose-50 focus:text-rose-600" onClick={() => onUpdateStatus(survey._id, "terminate")}>Terminate</DropdownMenuItem>
                                  <DropdownMenuItem className="focus:bg-indigo-50 focus:text-indigo-600" onClick={() => onUpdateStatus(survey._id, "security_term")}>Security Term</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 focus:text-rose-600" onClick={() => onDelete(survey._id)}>
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
        </div>

        {/* Mobile Cards List View */}
        <div className="md:hidden divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-card-${i}`} className="p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24 bg-slate-200" />
                    <Skeleton className="h-6 w-16 bg-slate-200 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-4 w-20 bg-slate-200" />
                    <Skeleton className="h-4 w-20 bg-slate-200" />
                  </div>
                </div>
              ))
            ) : surveys.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                No surveys found in this category.
              </div>
            ) : (
              surveys.map((survey, index) => (
                <motion.div
                  key={survey._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 space-y-3 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Card Title Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {survey.projectId || survey.surveyId?.projectId || survey.pid}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(survey.status)}
                      
                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white border-slate-200 text-slate-900 shadow-xl">
                          <DropdownMenuLabel className="text-slate-400">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="focus:bg-slate-100 focus:text-slate-900">
                              <Settings className="mr-2 h-4 w-4 text-slate-500" />
                              <span>Update Status</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                                <DropdownMenuItem className="focus:bg-blue-50 focus:text-blue-600" onClick={() => onUpdateStatus(survey._id, "started")}>Started</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-emerald-50 focus:text-emerald-600" onClick={() => onUpdateStatus(survey._id, "completed")}>Complete</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-amber-50 focus:text-amber-600" onClick={() => onUpdateStatus(survey._id, "screened_out")}>Screen Out</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-orange-50 focus:text-orange-600" onClick={() => onUpdateStatus(survey._id, "quota_full")}>Quota Full</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-pink-50 focus:text-pink-600" onClick={() => onUpdateStatus(survey._id, "fraud")}>Fraud</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-rose-50 focus:text-rose-600" onClick={() => onUpdateStatus(survey._id, "terminate")}>Terminate</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-indigo-50 focus:text-indigo-600" onClick={() => onUpdateStatus(survey._id, "security_term")}>Security Term</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 focus:text-rose-600" onClick={() => onDelete(survey._id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card Details Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">S.No</span>
                      <span className="text-slate-700 font-medium block">
                        {survey.serial !== undefined ? survey.serial : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">User ID</span>
                      <span className="text-slate-700 font-medium truncate block max-w-[130px]" title={survey.transactionToken || survey.uid}>
                        {survey.transactionToken || survey.uid}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">IP Address</span>
                      <span className="font-mono text-slate-600">{survey.ipAddress || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Supplier</span>
                      <span className="text-slate-700 truncate block max-w-[130px]">{survey.surveyId?.supplierId?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Vendor</span>
                      <span className="text-slate-700 truncate block max-w-[130px]">{survey.vendorId?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Country</span>
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <span className="text-base leading-none">{getFlagEmoji(survey.countryCode)}</span>
                        <span className="truncate">{survey.country || "Unknown"}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Date</span>
                      <span className="text-slate-600">
                        {new Date(survey.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      
      {/* Pagination Controls */}
      <div className="border-t border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 rounded-b-xl">
        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
          <p>Rows per page</p>
          <Select value={limit.toString()} onValueChange={(val) => onLimitChange(Number(val))}>
            <SelectTrigger className="h-8 w-[70px] bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-white border border-slate-200 text-slate-900 shadow-xl">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()} className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer">
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
                className={`text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${page === 1 ? "pointer-events-none opacity-40 text-slate-400" : "cursor-pointer"}`}
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
                      className={`cursor-pointer rounded-lg border h-8 w-8 text-xs font-semibold transition-all ${
                        page === pageNum 
                          ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-2xs" 
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                      }`}
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
                 <PaginationEllipsis className="text-slate-400" />
               </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                className={`text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${page === totalPages ? "pointer-events-none opacity-40 text-slate-400" : "cursor-pointer"}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        
        <div className="text-sm text-slate-500 font-medium sm:w-[130px] text-right">
          Page <span className="text-slate-900 font-bold">{page}</span> of {totalPages}
        </div>
      </div>
    </Card>
  );
}
