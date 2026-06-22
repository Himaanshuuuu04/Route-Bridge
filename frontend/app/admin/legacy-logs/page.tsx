"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, History } from "lucide-react";
import api from "../../lib/api";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function LegacyLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/getRecentSurveys?limit=100');
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to fetch legacy logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Complete</Badge>;
      case 'Terminate': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Terminate</Badge>;
      case 'Quota Full': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Quota Full</Badge>;
      case 'Security Term': return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Security Term</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
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

  const filtered = logs.filter(l => 
    l.uid?.toLowerCase().includes(search.toLowerCase()) || 
    l.pid?.toLowerCase().includes(search.toLowerCase()) ||
    l.ipAddress?.includes(search)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Legacy Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            View LegacyCallback collection for old routing traffic.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search by PID, UID or IP..." 
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
              <TableHead className="font-semibold">Project ID (PID)</TableHead>
              <TableHead className="font-semibold">User ID (UID)</TableHead>
              <TableHead className="font-semibold">IP / Location</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <History className="h-8 w-8 text-slate-300 mb-2" />
                    <p>No legacy logs found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(log => (
                <TableRow key={log._id} className="group">
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                    {log.pid}
                  </TableCell>
                  <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                    {log.uid}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                        {log.ipAddress}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <span>{getFlagEmoji(log.countryCode)}</span> {log.country || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {new Date(log.createdAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
