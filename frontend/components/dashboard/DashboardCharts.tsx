"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  Complete: '#10b981', // Emerald
  Terminate: '#ef4444', // Red
  'Quota Full': '#f59e0b', // Amber
  'Security Term': '#6366f1', // Indigo
};

interface DashboardChartsProps {
  counts: any;
}

export function DashboardCharts({ counts }: DashboardChartsProps) {
  const chartData = counts ? [
    { name: 'Complete', value: counts.complete_entries, color: COLORS.Complete },
    { name: 'Terminate', value: counts.terminate_entries, color: COLORS.Terminate },
    { name: 'Quota Full', value: counts.quota_full_entries, color: COLORS['Quota Full'] },
    { name: 'Security Term', value: counts.security_term_entries, color: COLORS['Security Term'] },
  ].filter(item => item.value > 0) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="xl:col-span-1"
    >
      <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#09090b', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 font-medium">No data available</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
