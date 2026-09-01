"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Copy, Link as LinkIcon, Settings } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { useGetAdminSurveyByIdQuery } from "@/app/store/apiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function SurveyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { showToast } = useToast();
  
  const { data: survey, isLoading } = useGetAdminSurveyByIdQuery(resolvedParams.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Link copied to clipboard", "success");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Active</Badge>;
      case 'paused': return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Paused</Badge>;
      default: return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-medium">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-slate-100" />
          <Skeleton className="h-32 w-full bg-slate-100" />
          <Skeleton className="h-64 w-full bg-slate-100" />
        </div>
      </main>
    );
  }

  if (!survey) {
    return (
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center py-20 text-slate-500">
        <p>Survey not found.</p>
        <Button variant="link" asChild className="mt-4 text-emerald-600 hover:text-emerald-700">
          <Link href="/dashboard/surveys"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Surveys</Link>
        </Button>
      </main>
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs">
                <Link href="/dashboard/surveys"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                {survey.name}
                {getStatusBadge(survey.status)}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Project ID: <span className="text-slate-900 font-medium">{survey.projectId}</span> &bull; Supplier: <span className="text-slate-900 font-medium">{survey.supplierId?.name || "None"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-white shadow-xs border-slate-200/80 rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900"><Settings className="h-5 w-5 text-emerald-600" /> Eligibility Rules</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {!survey.eligibilityRules || survey.eligibilityRules.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-500 border border-slate-200/60">
                    No specific eligibility rules defined.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {survey.eligibilityRules.map((rule, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                        <h4 className="font-semibold text-slate-800 text-sm leading-snug">
                          {rule.question}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {rule.options.map((opt, optIdx) => {
                            const isAccepted = rule.acceptedAnswers.includes(opt);
                            return (
                              <Badge
                                key={optIdx}
                                variant="outline"
                                className={`text-xs px-2.5 py-1 flex items-center gap-1.5 transition-all ${
                                  isAccepted
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                                    : "bg-white text-slate-500 border-slate-200"
                                }`}
                              >
                                {isAccepted && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
                                <span>{opt}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border-slate-200/80 rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">Upstream Routing</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Supplier URL</label>
                  <p className="text-sm font-mono break-all bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                    {survey.baseSupplierUrl}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-white shadow-xs border-slate-200/80 rounded-2xl h-full">
              <CardHeader className="pb-3 border-b border-slate-100 mb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900"><LinkIcon className="h-5 w-5 text-indigo-600" /> Vendor Redirect Links</CardTitle>
              </CardHeader>
              <CardContent>
                {survey.vendorLinks && survey.vendorLinks.length > 0 ? (
                  <div className="space-y-4">
                    {survey.vendorLinks.map((vl: any) => {
                      const redirectUrl = `${backendUrl}/r/${vl.hash}?vendor_rid=[ID]`;
                      return (
                        <div key={vl._id || vl.hash} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{vl.vendorId?.name || "Unknown Vendor"}</span>
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-medium">
                                Quota: {vl.quota || 0}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="flex-1 bg-white p-2.5 rounded-lg border border-slate-200 text-sm font-mono text-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
                              {redirectUrl}
                            </code>
                            <Button variant="secondary" size="icon" className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200" onClick={() => copyToClipboard(redirectUrl)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Replace <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 border border-slate-200">[ID]</code> with vendor's respondent ID macro.
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
                      <LinkIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">No vendor links</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      You haven't added any vendors to this survey. Edit the survey to add vendors and generate secure routing links.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
