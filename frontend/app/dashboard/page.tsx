"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, BarChart3, CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/app/context/ToastContext";

import { useGetCountsQuery, useGetSurveysQuery, useDeleteSurveyMutation, useUpdateSurveyStatusMutation } from "@/app/store/apiSlice";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { SurveyTable } from "@/components/dashboard/SurveyTable";

export default function DashboardPage() {
  const { showToast } = useToast();
  
  const [currentTab, setCurrentTab] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: counts, isLoading: isCountsLoading, refetch: refetchCounts } = useGetCountsQuery({ startDate, endDate });
  const { data: surveys = [], isLoading: isSurveysLoading, isFetching: isSurveysFetching, refetch: refetchSurveys } = useGetSurveysQuery({ 
    category: currentTab, 
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



  const getTotalItemsForTab = () => {
    if (!counts) return 0;
    if (currentTab === "All") return counts.total_entries;
    if (currentTab === "started") return counts.started_entries;
    if (currentTab === "completed") return counts.complete_entries;
    if (currentTab === "screened_out") return counts.screened_out_entries;
    if (currentTab === "quota_full") return counts.quota_full_entries;
    if (currentTab === "fraud") return counts.fraud_entries;
    if (currentTab === "terminate") return counts.terminate_entries;
    if (currentTab === "security_term") return counts.security_term_entries;
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
          <p className="text-zinc-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative z-10">
      <DateFilter 
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onResetPage={() => setPage(1)}
        onRefresh={handleRefresh}
        isRefreshing={isDataLoading}
      />

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-8 gap-3 sm:gap-4 mb-6"
      >
        <StatCard title="Total Clicks" value={counts?.total_entries || 0} icon={<BarChart3 className="w-4 h-4 text-slate-500" />} loading={!counts} delay={0.05} />
        <StatCard title="Started" value={counts?.started_entries || 0} icon={<Activity className="w-4 h-4 text-blue-600" />} loading={!counts} delay={0.1} />
        <StatCard title="Completed" value={counts?.complete_entries || 0} icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} loading={!counts} delay={0.15} />
        <StatCard title="Screened Out" value={counts?.screened_out_entries || 0} icon={<XCircle className="w-4 h-4 text-amber-600" />} loading={!counts} delay={0.2} />
        <StatCard title="Quota Full" value={counts?.quota_full_entries || 0} icon={<AlertTriangle className="w-4 h-4 text-orange-600" />} loading={!counts} delay={0.25} />
        <StatCard title="Terminated" value={counts?.terminate_entries || 0} icon={<XCircle className="w-4 h-4 text-rose-600" />} loading={!counts} delay={0.3} />
        <StatCard title="Security Term" value={counts?.security_term_entries || 0} icon={<Activity className="w-4 h-4 text-indigo-600" />} loading={!counts} delay={0.35} />
        <StatCard title="Fraud" value={counts?.fraud_entries || 0} icon={<XCircle className="w-4 h-4 text-pink-600" />} loading={!counts} delay={0.4} />
      </motion.div>

      <div className="flex flex-col gap-8">
        <DashboardCharts counts={counts} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <SurveyTable 
            surveys={surveys}
            isLoading={isDataLoading}
            page={page}
            limit={limit}
            totalItems={getTotalItemsForTab()}
            currentTab={currentTab}
            onTabChange={(tab) => { setCurrentTab(tab); setPage(1); }}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />
        </motion.div>
      </div>
    </main>
  );
}
