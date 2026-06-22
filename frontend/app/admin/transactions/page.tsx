"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, Search } from "lucide-react";
import api from "../../lib/api";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  _id: string;
  transactionToken: string;
  surveyId: { _id: string; name: string; projectId: string };
  vendorId: { _id: string; name: string };
  respondentId: string;
  vendorRid: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Calling the backend route we just created
      const res = await api.get('/api/admin/surveys/transactions?limit=100');
      setTransactions(res.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</Badge>;
      case 'started': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Started</Badge>;
      case 'screened_out': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Screened Out</Badge>;
      case 'quota_full': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Quota Full</Badge>;
      case 'security_term': return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Security Term</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filtered = transactions.filter(t => 
    t.vendorRid?.toLowerCase().includes(search.toLowerCase()) || 
    t.surveyId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Real-time ledger of clicks, screen-outs, and completions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search by Vendor RID or Survey Name..." 
            className="pl-9 bg-white dark:bg-slate-950" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="font-semibold w-[250px]">Transaction ID / RID</TableHead>
              <TableHead className="font-semibold">Survey</TableHead>
              <TableHead className="font-semibold">Vendor</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Started At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Activity className="h-8 w-8 text-slate-300 mb-2" />
                    <p>No transactions found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(t => (
                <TableRow key={t._id} className="group">
                  <TableCell>
                    <div className="font-mono text-xs text-slate-500 truncate max-w-[200px]" title={t.transactionToken}>
                      {t.transactionToken.substring(0, 16)}...
                    </div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mt-1">
                      RID: {t.vendorRid || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{t.surveyId?.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{t.surveyId?.projectId || ""}</div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
                    {t.vendorId?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(t.status)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {new Date(t.startedAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
