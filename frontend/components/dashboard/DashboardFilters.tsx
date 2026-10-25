"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, RefreshCw, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  uid?: string;
  pid?: string;
  onUidChange?: (uid: string) => void;
  onPidChange?: (pid: string) => void;
  onResetPage: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  hideSearch?: boolean;
}

export function DashboardFilters({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  uid,
  pid,
  onUidChange,
  onPidChange,
  onResetPage,
  onRefresh,
  isRefreshing,
  hideSearch
}: DashboardFiltersProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const getNDaysAgoStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const isTodayActive = startDate === todayStr && endDate === todayStr;
  const is7DaysActive = startDate === getNDaysAgoStr(7) && endDate === todayStr;
  const is30DaysActive = startDate === getNDaysAgoStr(30) && endDate === todayStr;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 p-4 bg-white border border-slate-200/80 backdrop-blur-xl rounded-2xl relative z-20 shadow-sm"
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Top Row: Date Pickers & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Date Pickers Section */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
              <Calendar className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Filter by Date:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm shadow-2xs">
                <span className="text-xs text-slate-500 font-medium select-none">From</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => { onStartDateChange(e.target.value); onResetPage(); }}
                  className="bg-transparent text-sm text-slate-800 focus:outline-none transition-colors [color-scheme:light] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm shadow-2xs">
                <span className="text-xs text-slate-500 font-medium select-none">To</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => { onEndDateChange(e.target.value); onResetPage(); }}
                  className="bg-transparent text-sm text-slate-800 focus:outline-none transition-colors [color-scheme:light] cursor-pointer"
                />
              </div>
              
              {(startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { onStartDateChange(""); onEndDateChange(""); onResetPage(); }}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs h-9 px-3 flex items-center gap-1.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Date</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Presets & Actions Section */}
      <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onStartDateChange(todayStr);
              onEndDateChange(todayStr);
              onResetPage();
            }}
            className={`text-xs rounded-xl h-8 px-3.5 transition-all border ${
              isTodayActive 
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 font-semibold shadow-xs" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            }`}
          >
            Today
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onStartDateChange(getNDaysAgoStr(7));
              onEndDateChange(todayStr);
              onResetPage();
            }}
            className={`text-xs rounded-xl h-8 px-3.5 transition-all border ${
              is7DaysActive 
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 font-semibold shadow-xs" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            }`}
          >
            Last 7 Days
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onStartDateChange(getNDaysAgoStr(30));
              onEndDateChange(todayStr);
              onResetPage();
            }}
            className={`text-xs rounded-xl h-8 px-3.5 transition-all border ${
              is30DaysActive 
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 font-semibold shadow-xs" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            }`}
          >
            Last 30 Days
          </Button>
        </div>

        {onRefresh && (
          <div className="flex items-center gap-2 pl-1">
            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl h-8 w-8 shrink-0 transition-all shadow-2xs"
              title="Refresh data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
          </div>
        )}
      </div>
      </div>
      
      {/* Bottom Row: Search Inputs */}
      {!hideSearch && (
        <div className="flex flex-col lg:flex-row gap-4 border-t border-slate-100 pt-4">
          <div className="flex flex-1 items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm shadow-2xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UID / Token / Vendor RID"
              value={uid || ""}
              onChange={(e) => { onUidChange?.(e.target.value); onResetPage(); }}
              className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none transition-colors"
            />
            {uid && (
              <button onClick={() => { onUidChange?.(""); onResetPage(); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex flex-1 items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm shadow-2xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Project ID (PID)"
              value={pid || ""}
              onChange={(e) => { onPidChange?.(e.target.value); onResetPage(); }}
              className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none transition-colors"
            />
            {pid && (
              <button onClick={() => { onPidChange?.(""); onResetPage(); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </motion.div>
  );
}

