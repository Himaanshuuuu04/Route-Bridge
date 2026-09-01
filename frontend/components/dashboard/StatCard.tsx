"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({ 
  title, 
  value, 
  icon, 
  loading, 
  href,
  delay = 0 
}: { 
  title: string; 
  value: number; 
  icon?: React.ReactNode; 
  loading?: boolean; 
  href?: string;
  delay?: number; 
}) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <Link href={href} className="block cursor-pointer h-full">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <CardWrapper>
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 truncate" title={title}>{title}</span>
            {icon && <div className="p-1.5 bg-slate-100/80 rounded-lg border border-slate-200/60 flex items-center justify-center shrink-0">{icon}</div>}
          </div>
          <div className="mt-2">
            {loading ? (
              <Skeleton className="h-6 w-16 bg-slate-200 rounded-md" />
            ) : (
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">{value.toLocaleString()}</div>
            )}
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
}
