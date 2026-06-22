"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, Link as LinkIcon, Settings } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import api from "../../../lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurveyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await api.get(`/api/admin/surveys/${resolvedParams.id}`);
        setSurvey(res.data);
      } catch (error) {
        showToast("Failed to fetch survey details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [resolvedParams.id, showToast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Link copied to clipboard", "success");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
      case 'paused': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Paused</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>Survey not found.</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/admin/surveys"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Surveys</Link>
        </Button>
      </div>
    );
  }

  // Frontend URL for redirect links
  const frontendUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link href="/admin/surveys"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              {survey.name}
              {getStatusBadge(survey.status)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Project ID: {survey.projectId} &bull; Supplier: {survey.supplierId?.name || "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Survey Details & Rules */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5 text-emerald-500" /> Eligibility Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {!survey.eligibilityRules || Object.keys(survey.eligibilityRules).length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center text-sm text-slate-500">
                  No specific eligibility rules defined.
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(survey.eligibilityRules).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{key}</span>
                      <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-mono shadow-sm border border-slate-200 dark:border-slate-700">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upstream Routing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Supplier URL</label>
                <p className="text-sm font-mono break-all bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {survey.baseSupplierUrl}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Links */}
        <div className="md:col-span-2">
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800 h-full">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <CardTitle className="text-lg flex items-center gap-2"><LinkIcon className="h-5 w-5 text-indigo-500" /> Vendor Redirect Links</CardTitle>
            </CardHeader>
            <CardContent>
              {survey.vendorLinks && survey.vendorLinks.length > 0 ? (
                <div className="space-y-4">
                  {survey.vendorLinks.map((vl: any) => {
                    // Use backend route (e.g. http://localhost:5000/r/:hash)
                    // We assume the Next API proxy or the backend URL handles /r/:hash directly.
                    // The backend index.mjs maps /r to trafficRoutes.
                    const redirectUrl = `${frontendUrl}/r/${vl.hash}?vendor_rid=[ID]`;
                    
                    return (
                      <div key={vl._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{vl.vendorId?.name || "Unknown Vendor"}</span>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                              Quota: {vl.quota || 0}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="flex-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-mono text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none">
                            {redirectUrl}
                          </code>
                          <Button variant="secondary" size="icon" className="shrink-0" onClick={() => copyToClipboard(redirectUrl)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Replace <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">[ID]</code> with vendor's respondent ID macro.
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3">
                    <LinkIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">No vendor links</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    You haven't added any vendors to this survey. Edit the survey to add vendors and generate secure routing links.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
