"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, BarChart3, CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";

import { useGetCountsQuery, useGetSurveysQuery, useDeleteSurveyMutation, useUpdateSurveyStatusMutation } from "@/app/store/apiSlice";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { SurveyTable } from "@/components/dashboard/SurveyTable";

interface PageProps {
  params: Promise<{ category: string }>;
}

const categoryMap: Record<string, { tabName: string; title: string; icon: React.ReactNode }> = {
  all: { tabName: "All", title: "All Surveys", icon: <BarChart3 className="w-8 h-8 text-zinc-400" /> },
  completed: { tabName: "completed", title: "Completed Surveys", icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" /> },
  terminated: { tabName: "terminate", title: "Terminated Surveys", icon: <XCircle className="w-8 h-8 text-red-400" /> },
  quota: { tabName: "quota_full", title: "Quota Full Surveys", icon: <AlertTriangle className="w-8 h-8 text-amber-400" /> },
  security: { tabName: "security_term", title: "Security Terminated", icon: <Activity className="w-8 h-8 text-indigo-400" /> }
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
  const [uid, setUid] = useState("");
  const [pid, setPid] = useState("");
  const [debouncedUid, setDebouncedUid] = useState("");
  const [debouncedPid, setDebouncedPid] = useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUid(uid);
    }, 500);
    return () => clearTimeout(handler);
  }, [uid]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPid(pid);
    }, 500);
    return () => clearTimeout(handler);
  }, [pid]);

  const { data: counts, isLoading: isCountsLoading, refetch: refetchCounts } = useGetCountsQuery({ 
    startDate, 
    endDate,
    uid: debouncedUid,
    pid: debouncedPid
  });
  const { data: surveys = [], isLoading: isSurveysLoading, isFetching: isSurveysFetching, refetch: refetchSurveys } = useGetSurveysQuery({ 
    category: config.tabName, 
    page, 
    limit, 
    startDate, 
    endDate,
    uid: debouncedUid,
    pid: debouncedPid
  });

  const [deleteSurvey] = useDeleteSurveyMutation();
  const [updateSurveyStatus] = useUpdateSurveyStatusMutation();

  const isDataLoading = isSurveysLoading || isSurveysFetching;

  const handleRefresh = () => {
    refetchCounts();
    refetchSurveys();
  };

  React.useEffect(() => {
    const onRefresh = () => {
      handleRefresh();
    };
    window.addEventListener("dashboard:refresh", onRefresh);
    return () => window.removeEventListener("dashboard:refresh", onRefresh);
  }, [refetchCounts, refetchSurveys]);

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
    if (config.tabName === "completed") return counts.complete_entries;
    if (config.tabName === "terminate") return counts.terminate_entries;
    if (config.tabName === "quota_full") return counts.quota_full_entries;
    if (config.tabName === "security_term") return counts.security_term_entries;
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
      <DashboardFilters 
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        uid={uid}
        pid={pid}
        onUidChange={setUid}
        onPidChange={setPid}
        onResetPage={() => setPage(1)}
        onRefresh={handleRefresh}
        isRefreshing={isDataLoading}
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
