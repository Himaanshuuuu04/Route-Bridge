"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, BarChart3, CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";

import { useGetCountsQuery, useGetSurveysQuery, useDeleteSurveyMutation, useUpdateSurveyStatusMutation } from "@/app/store/apiSlice";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { SurveyTable } from "@/components/dashboard/SurveyTable";

interface PageProps {
  params: Promise<{ category: string }>;
}

const categoryMap: Record<string, { tabName: string; title: string; icon: React.ReactNode }> = {
  all: { tabName: "All", title: "All Surveys", icon: <BarChart3 className="w-8 h-8 text-zinc-400" /> },
  completed: { tabName: "Complete", title: "Completed Surveys", icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" /> },
  terminated: { tabName: "Terminate", title: "Terminated Surveys", icon: <XCircle className="w-8 h-8 text-red-400" /> },
  quota: { tabName: "Quota Full", title: "Quota Full Surveys", icon: <AlertTriangle className="w-8 h-8 text-amber-400" /> },
  security: { tabName: "Security Term", title: "Security Terminated", icon: <Activity className="w-8 h-8 text-indigo-400" /> }
};

export default function CategoryPage({ params }: PageProps) {
  const unwrappedParams = React.use(params);
  const rawCategory = unwrappedParams.category;
  const { showToast } = useToast();

  const config = categoryMap[rawCategory] || categoryMap.all;
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: counts, isLoading: isCountsLoading, refetch: refetchCounts } = useGetCountsQuery({ startDate, endDate });
  const { data: surveys = [], isLoading: isSurveysLoading, isFetching: isSurveysFetching, refetch: refetchSurveys } = useGetSurveysQuery({ 
    category: config.tabName, 
    page, 
    limit, 
    startDate, 
    endDate 
  });

  const [deleteSurvey] = useDeleteSurveyMutation();
  const [updateSurveyStatus] = useUpdateSurveyStatusMutation();

  const isDataLoading = isSurveysLoading || isSurveysFetching;

  const handleRefresh = () => {
    refetchCounts();
    refetchSurveys();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSurvey(id).unwrap();
      showToast("Survey deleted", "success");
    } catch (error) {
      showToast("Failed to delete survey", "error");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateSurveyStatus({ id, status }).unwrap();
      showToast("Survey status updated", "success");
    } catch (error) {
      showToast("Failed to update survey status", "error");
    }
  };

  const getTotalItems = () => {
    if (!counts) return 0;
    if (config.tabName === "All") return counts.total_entries;
    if (config.tabName === "Complete") return counts.complete_entries;
    if (config.tabName === "Terminate") return counts.terminate_entries;
    if (config.tabName === "Quota Full") return counts.quota_full_entries;
    if (config.tabName === "Security Term") return counts.security_term_entries;
    return 0;
  };

  if (isCountsLoading && !counts) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
          />
          <p className="text-zinc-400 font-medium">Loading Surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-white hover:bg-white/10 hover:text-white" />
          <Link 
            href="/dashboard" 
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Overview
          </Link>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0">
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">{config.title}</h2>
              <p className="text-zinc-400 mt-2 font-medium">
                Showing <span className="text-white font-semibold">{getTotalItems()}</span> total entries
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={handleRefresh} 
            disabled={isDataLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isDataLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      <DateFilter 
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onResetPage={() => setPage(1)}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <SurveyTable 
          surveys={surveys}
          isLoading={isDataLoading}
          page={page}
          limit={limit}
          totalItems={getTotalItems()}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />
      </motion.div>
    </main>
  );
}
