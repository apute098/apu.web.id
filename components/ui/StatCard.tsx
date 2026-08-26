'use client';

import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <GlassCard className="p-5 flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
          {icon}
        </div>
      )}
    </GlassCard>
  );
}
