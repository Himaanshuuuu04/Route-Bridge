"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface DashboardChartsProps {
  counts: any;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b]/95 border border-white/10 backdrop-blur-md rounded-xl p-3.5 shadow-2xl text-xs">
        <p className="font-bold text-white mb-2">
          {new Date(label).toLocaleDateString(undefined, { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}
              </span>
              <span className="font-semibold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ counts }: DashboardChartsProps) {
  const chartData = counts?.timeline || [];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Traffic Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tickFormatter={(value) => {
                    try {
                      return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '20px',
                    color: '#a1a1aa'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="started"
                  name="Started"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="screened_out"
                  name="Screened Out"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="quota_full"
                  name="Quota Full"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="fraud"
                  name="Fraud"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="terminate"
                  name="Terminate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="security_term"
                  name="Security Term"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#09090b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 font-medium">No data available</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
