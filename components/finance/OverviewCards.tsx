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
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="floating-card">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Total Pemasukan
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
            INCOME
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
          {formatRupiah(summary?.totalPemasukan || 0)}
        </div>
      </div>

      <div className="floating-card">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <TrendingDown className="w-4 h-4 text-rose-400" /> Total Pengeluaran
          </span>
          <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono">
            EXPENSE
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-extrabold text-rose-400 font-mono">
          {formatRupiah(summary?.totalPengeluaran || 0)}
        </div>
      </div>

      <div className="floating-card">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <DollarSign className="w-4 h-4 text-[#22d3ee]" /> Laba Bersih (Net)
          </span>
          <span className="text-[10px] bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded font-mono">
            NET PROFIT
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-extrabold text-[#67e8f9] font-mono">
          {formatRupiah(summary?.labaBersih || 0)}
        </div>
      </div>
    </div>

    {/* Monthly Trend Chart */}
    <div className="floating-card">
      <h3 className="font-bold text-white text-sm mb-4">
        Tren Keuangan Bulanan (Pemasukan vs Pengeluaran)
      </h3>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrends || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: any) => formatRupiah(Number(val))}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </>
);