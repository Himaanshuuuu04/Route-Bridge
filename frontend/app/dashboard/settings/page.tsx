"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/context/ToastContext";
import { useRebuildCacheMutation, useLogoutMutation } from "@/app/store/apiSlice";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [rebuildCache, { isLoading: isRebuilding }] = useRebuildCacheMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleClearCache = async () => {
    try {
      await rebuildCache().unwrap();
      showToast("Cache rebuilt successfully", "success");
    } catch (error) {
      showToast("Failed to rebuild cache", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      showToast("Logged out successfully", "success");
      router.push("/auth/signin");
    } catch (error) {
      showToast("Failed to log out", "error");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative z-10">
      

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 mb-2">Cache Management</h2>
          <p className="text-sm text-slate-500 mb-6">
            Clear and rebuild the application cache. This includes dashboard statistics, recent surveys, and user profiles.
          </p>
          <Button 
            onClick={handleClearCache} 
            disabled={isRebuilding}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRebuilding ? 'animate-spin' : ''}`} />
            {isRebuilding ? 'Clearing Cache...' : 'Clear Cache'}
          </Button>
        </div>

       
      </motion.div>
    </main>
  );
}
