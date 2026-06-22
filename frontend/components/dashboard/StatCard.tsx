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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <CardWrapper>
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-400">{title}</CardTitle>
            {icon && <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center shrink-0">{icon}</div>}
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <Skeleton className="h-8 w-20 bg-white/10 rounded-md" />
            ) : (
              <div className="text-4xl font-black tracking-tight text-white mt-1">{value.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  );
}
