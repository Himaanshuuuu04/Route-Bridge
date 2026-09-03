"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/context/ToastContext";
import { DateFilter } from "@/components/dashboard/DateFilter";
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "started", label: "Started" },
  { value: "completed", label: "Completed" },
  { value: "screened_out", label: "Screened Out" },
  { value: "quota_full", label: "Quota Full" },
  { value: "fraud", label: "Fraud" },
  { value: "terminate", label: "Terminated" },
  { value: "security_term", label: "Security Term" }
];

export default function DownloadDataPage() {
  const { showToast } = useToast();
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("All");
  const [isDownloading, setIsDownloading] = useState(false);
  const [uid, setUid] = useState("");
  const [pid, setPid] = useState("");

  const handleDownloadCSV = async () => {
    try {
      setIsDownloading(true);
      let queryParams = `?status=${status}`;
      if (startDate) {
        const localStart = new Date(startDate + "T00:00:00");
        if (!isNaN(localStart.getTime())) {
          queryParams += `&startDate=${localStart.toISOString()}`;
        }
      }
      if (endDate) {
        const localEnd = new Date(endDate + "T23:59:59.999");
        if (!isNaN(localEnd.getTime())) {
          queryParams += `&endDate=${localEnd.toISOString()}`;
        }
      }
      if (uid) {
        queryParams += `&uid=${encodeURIComponent(uid)}`;
      }
      if (pid) {
        queryParams += `&pid=${encodeURIComponent(pid)}`;
      }


      const response = await axios({
        url: `${API_URL}/api/dashboard/download${queryParams}`,
        method: 'GET',
        responseType: 'blob',
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `surveys_data_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download successful", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to download CSV", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 text-slate-900">
      <div className=" mx-auto">
        

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm"
        >
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">1. Select Date Range</h2>
              <DateFilter 
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onResetPage={() => {}}
                onRefresh={() => {}}
                isRefreshing={false}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">2. Select Status</h2>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full md:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-medium"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
              <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">3. Filter by UID (Optional)</h2>
              <input
                type="text"
                placeholder="Enter Transaction Token or Vendor RID..."
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full md:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">4. Filter by PID (Optional)</h2>
              <input
                type="text"
                placeholder="Enter Project ID..."
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                className="w-full md:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Button 
                onClick={handleDownloadCSV} 
                disabled={isDownloading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] h-12 text-md font-medium shadow-xs rounded-xl"
              >
                {isDownloading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 mr-3 border-2 border-white/20 border-t-white rounded-full"
                  />
                ) : (
                  <Download className="w-5 h-5 mr-3" />
                )}
                {isDownloading ? 'Downloading...' : 'Download CSV File'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
