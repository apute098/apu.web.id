import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatRupiah } from './shared';

interface Props {
  summary: any;
  monthlyTrends?: any[];
}

export const OverviewCards: React.FC<Props> = ({ summary, monthlyTrends }) => (
  <>
    {/* KPI Cards — Asymmetric Bento */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-8">
      
      {/* Net Profit — Large wide block (7 cols) */}
      <div className="md:col-span-7 bento-premium p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#22d3ee]/5 rounded-full blur-3xl group-hover:bg-[#22d3ee]/10 transition-all duration-700 pointer-events-none" />
        <div className="flex items-center justify-between mb-8 z-10">
          <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-slate-400 text-sm">
            <DollarSign className="w-5 h-5 text-[#22d3ee]" /> Laba Bersih
          </span>
          <span className="text-[10px] font-mono bg-[#22d3ee]/10 text-[#22d3ee] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
            Net Profit
          </span>
        </div>
        <div className="z-10">
          <div className="text-4xl md:text-6xl font-black text-white font-mono tracking-tighter leading-none mb-2">
            {formatRupiah(summary?.labaBersih || 0)}
          </div>
          <div className="text-sm font-medium text-slate-500">Saldo berjalan bulan ini</div>
        </div>
      </div>

      {/* Income & Expense — Stacked (5 cols) */}
      <div className="md:col-span-5 grid grid-rows-2 gap-4 md:gap-6">
        {/* Income */}
        <div className="bento-premium p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-slate-400 text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Pemasukan
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
            {formatRupiah(summary?.totalPemasukan || 0)}
          </div>
        </div>
        
        {/* Expense */}
        <div className="bento-premium p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-slate-400 text-xs">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Pengeluaran
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
            {formatRupiah(summary?.totalPengeluaran || 0)}
          </div>
        </div>
      </div>
    </div>

    {/* Monthly Trend Chart */}
    <div className="bento-premium p-6 md:p-8 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black tracking-tight-super text-white text-xl md:text-2xl">
          Cash Flow Trends
        </h3>
        <span className="text-[10px] font-mono bg-white/5 text-white/50 px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-white/5">
          Year to Date
        </span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 16, 0.9)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                padding: '12px 16px'
              }}
              formatter={(val: any) => formatRupiah(Number(val))}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', paddingTop: '20px' }} iconType="circle" />
            <Bar dataKey="pemasukan" name="Pemasukan" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </>
);