"use client";

import { useState } from "react";
import { Activity, RefreshCw, Search, Trash2 } from "lucide-react";
import { useGetTransactionsQuery, useDeleteTransactionMutation } from "@/app/store/apiSlice";
import { useToast } from "@/app/context/ToastContext";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const { data: transactions = [], isLoading, isFetching, refetch } = useGetTransactionsQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction record?")) {
      try {
        await deleteTransaction(id).unwrap();
        showToast("Transaction deleted successfully", "success");
      } catch {
        showToast("Failed to delete transaction", "error");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Completed</Badge>;
      case 'started': return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Started</Badge>;
      case 'screened_out': return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Screened Out</Badge>;
      case 'quota_full': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Quota Full</Badge>;
      case 'security_term': return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Security Term</Badge>;
      default: return <Badge variant="secondary" className="bg-white/10 text-zinc-400 border-white/20">{status}</Badge>;
    }
  };

  const filtered = transactions.filter(t => 
    t.vendorRid?.toLowerCase().includes(search.toLowerCase()) || 
    t.surveyId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="text-zinc-400 mt-2 font-medium">Real-time ledger of clicks, screen-outs, and completions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching} className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6"
      >
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search by Vendor RID or Survey Name..." 
            className="pl-9 bg-black/40 border-white/10 text-white backdrop-blur-xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl flex flex-col h-full w-full overflow-hidden">
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-xl font-bold text-white">Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-semibold text-zinc-400 pl-6 py-4 w-[250px]">Transaction ID / RID</TableHead>
                  <TableHead className="font-semibold text-zinc-400">Survey</TableHead>
                  <TableHead className="font-semibold text-zinc-400">Vendor</TableHead>
                  <TableHead className="font-semibold text-zinc-400">Status</TableHead>
                  <TableHead className="font-semibold text-zinc-400 text-right">Started At</TableHead>
                  <TableHead className="w-[60px] pr-6 text-right font-semibold text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`} className="border-white/5">
                        <TableCell className="pl-6"><Skeleton className="h-10 w-48 bg-white/5 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-32 bg-white/5 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 bg-white/5 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 bg-white/5 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-32 ml-auto bg-white/5 rounded-md" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto bg-white/5 rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow className="border-none">
                      <TableCell colSpan={6} className="h-32 text-center text-zinc-500 font-medium">
                        <div className="flex flex-col items-center justify-center">
                          <Activity className="h-8 w-8 text-zinc-600 mb-2" />
                          <p>No transactions found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t, index) => (
                      <motion.tr 
                        key={t._id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="group transition-colors border-white/5 hover:bg-white/[0.02]"
                      >
                        <TableCell className="pl-6">
                          <div className="font-mono text-xs text-zinc-500 truncate max-w-[200px]" title={t.transactionToken}>
                            {t.transactionToken.substring(0, 16)}...
                          </div>
                          <div className="font-medium text-white text-sm mt-1">
                            RID: {t.vendorRid || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white">{t.surveyId?.name || "Unknown"}</div>
                          <div className="text-xs text-zinc-500">{t.surveyId?.projectId || ""}</div>
                        </TableCell>
                        <TableCell className="text-zinc-300 font-medium">
                          {t.vendorId?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(t.status)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-zinc-500">
                          {new Date(t.startedAt).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(t._id)}
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
