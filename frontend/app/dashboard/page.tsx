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
    if (currentTab === "Complete") return counts.complete_entries;
    if (currentTab === "Terminate") return counts.terminate_entries;
    if (currentTab === "Quota Full") return counts.quota_full_entries;
    if (currentTab === "Security Term") return counts.security_term_entries;
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden text-white" />
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Dashboard Overview</h2>
            <p className="text-zinc-400 mt-2 font-medium">Real-time metrics and survey insights.</p>
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
      </motion.div>

      <DateFilter 
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onResetPage={() => setPage(1)}
      />

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10"
      >
        <StatCard title="Total Surveys" value={counts?.total_entries || 0} icon={<BarChart3 className="w-5 h-5 text-zinc-400" />} loading={!counts} href="/dashboard/all" delay={0.1} />
        <StatCard title="Completed" value={counts?.complete_entries || 0} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} loading={!counts} href="/dashboard/completed" delay={0.2} />
        <StatCard title="Terminated" value={counts?.terminate_entries || 0} icon={<XCircle className="w-5 h-5 text-red-400" />} loading={!counts} href="/dashboard/terminated" delay={0.3} />
        <StatCard title="Quota Full" value={counts?.quota_full_entries || 0} icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} loading={!counts} href="/dashboard/quota" delay={0.4} />
        <StatCard title="Security Term" value={counts?.security_term_entries || 0} icon={<Activity className="w-5 h-5 text-indigo-400" />} loading={!counts} href="/dashboard/security" delay={0.5} />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <DashboardCharts counts={counts} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
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
