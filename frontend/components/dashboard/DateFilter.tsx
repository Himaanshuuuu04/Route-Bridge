"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onResetPage: () => void;
}

export function DateFilter({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  onResetPage
}: DateFilterProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl relative z-20"
    >
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Calendar className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-white">Filter by Date:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">From</span>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => { onStartDateChange(e.target.value); onResetPage(); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">To</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => { onEndDateChange(e.target.value); onResetPage(); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        
        {(startDate || endDate) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { onStartDateChange(""); onEndDateChange(""); onResetPage(); }}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          >
            Clear Filter
          </Button>
        )}
      </div>
      
      {/* Quick Presets */}
      <div className="md:ml-auto flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            onStartDateChange(today);
            onEndDateChange(today);
            onResetPage();
          }}
          className="bg-white/5 border-white/10 text-xs hover:bg-white/10 text-white rounded-xl"
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 7);
            onStartDateChange(start.toISOString().split('T')[0]);
            onEndDateChange(end.toISOString().split('T')[0]);
            onResetPage();
          }}
          className="bg-white/5 border-white/10 text-xs hover:bg-white/10 text-white rounded-xl"
        >
          Last 7 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 30);
            onStartDateChange(start.toISOString().split('T')[0]);
            onEndDateChange(end.toISOString().split('T')[0]);
            onResetPage();
          }}
          className="bg-white/5 border-white/10 text-xs hover:bg-white/10 text-white rounded-xl"
        >
          Last 30 Days
        </Button>
      </div>
    </motion.div>
  );
}
