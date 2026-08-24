'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Search,
  RefreshCw,
  XCircle,
  PauseCircle,
  PlayCircle,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

interface ProcessesTabProps {
  isLocked: boolean;
  onOpenAuthModal: () => void;
}

export function ProcessesTab({ isLocked, onOpenAuthModal }: ProcessesTabProps) {
  const [processes, setProcesses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, running: 0, sleeping: 0, stopped: 0, zombie: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'apu' | 'root'>('all');
  const [sortBy, setSortBy] = useState<'cpu' | 'ramMB' | 'pid' | 'name'>('cpu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProcess, setSelectedProcess] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/processes');
      if (res.ok) {
        const data = await res.json();
        setProcesses(data.processes || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error('Failed to fetch processes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleProcessSignal = async (pid: number, signal: string) => {
    if (isLocked) {
      onOpenAuthModal();
      return;
    }

    if (!confirm(`Kirim signal ${signal} ke proses PID ${pid}?`)) {
      return;
    }

    const token = localStorage.getItem('apu_admin_token') || '574409';
    setActionLoading(pid);

    try {
      const res = await fetch('/api/v1/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pid, signal }),
      });

      if (res.ok) {
        await fetchProcesses();
        setSelectedProcess(null);
      } else {
        const json = await res.json();
        alert(`Gagal: ${json.error || 'Terjadi kesalahan'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (field: 'cpu' | 'ramMB' | 'pid' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    return processes
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.command.toLowerCase().includes(search.toLowerCase()) ||
          String(p.pid).includes(search);

        const matchesUser = userFilter === 'all' || p.user === userFilter;
        return matchesSearch && matchesUser;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [processes, search, userFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Process Manager & Live Top
          </h2>
          <p className="text-xs text-slate-400">
            Monitor utilisasi CPU, RAM, status proses dan kendali sinyal (SIGTERM, SIGKILL, SIGSTOP, SIGCONT)
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            Total: <strong>{summary.total}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Running: <strong>{summary.running}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Sleeping: <strong>{summary.sleeping}</strong>
          </span>
          <button
            onClick={fetchProcesses}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* User filter buttons */}
        <div className="flex items-center gap-1.5">
          {(['all', 'apu', 'root'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUserFilter(u)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                userFilter === u
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari proses, PID, argumen..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none font-mono transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Process Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-[11px] text-slate-400 select-none">
              <tr>
                <th
                  onClick={() => handleSort('pid')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-400"
                >
                  <div className="flex items-center gap-1">
                    <span>PID</span>
                    {sortBy === 'pid' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-400"
                >
                  <div className="flex items-center gap-1">
                    <span>PROCESS NAME / COMMAND</span>
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">USER</th>
                <th
                  onClick={() => handleSort('cpu')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-cyan-400 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CPU %</span>
                    {sortBy === 'cpu' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ramMB')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-cyan-400 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>RAM (MB)</span>
                    {sortBy === 'ramMB' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold text-center">STAT</th>
                <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSorted.map((p) => {
                const isHighCpu = p.cpu > 50;
                const isHighMem = p.ramMB > 500;

                return (
                  <tr
                    key={p.pid}
                    className="hover:bg-cyan-500/5 transition-colors group"
                  >
                    {/* PID */}
                    <td className="py-2.5 px-4 text-cyan-400 font-bold">
                      #{p.pid}
                    </td>

                    {/* Command / Name */}
                    <td className="py-2.5 px-4 max-w-xs md:max-w-md truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-slate-500 text-[11px] truncate">{p.command}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.user === 'root' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {p.user}
                      </span>
                    </td>

                    {/* CPU */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${isHighCpu ? 'text-rose-400' : p.cpu > 10 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {p.cpu}%
                      </span>
                    </td>

                    {/* RAM */}
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${isHighMem ? 'text-purple-400' : 'text-slate-300'}`}>
                        {p.ramMB} <span className="text-[10px] text-slate-500">MB</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        p.status === 'running' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'
                      }`}>
                        {p.stat}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedProcess(p)}
                          title="Inspect Details"
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleProcessSignal(p.pid, 'SIGTERM')}
                          disabled={actionLoading === p.pid}
                          title="SIGTERM (Graceful Terminate)"
                          className="p-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors disabled:opacity-50"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleProcessSignal(p.pid, 'SIGKILL')}
                          disabled={actionLoading === p.pid}
                          title="SIGKILL (Force Kill)"
                          className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Inspector Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Process #{selectedProcess.pid} — {selectedProcess.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">User: {selectedProcess.user} • State: {selectedProcess.stat}</p>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-500 block text-[10px]">CPU</span>
                <span className="text-cyan-400 font-bold">{selectedProcess.cpu}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-500 block text-[10px]">RAM RSS</span>
                <span className="text-purple-400 font-bold">{selectedProcess.ramMB} MB</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-500 block text-[10px]">VSZ</span>
                <span className="text-slate-300 font-bold">{selectedProcess.vszMB} MB</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-500 block text-[10px]">TIME</span>
                <span className="text-slate-300 font-bold">{selectedProcess.time}</span>
              </div>
            </div>

            {/* Full Command Line */}
            <div className="space-y-1 font-mono text-xs">
              <span className="text-slate-400">Full Command Arguments:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-white/5 text-slate-200 break-all max-h-36 overflow-y-auto leading-relaxed">
                {selectedProcess.command}
              </div>
            </div>

            {/* Signal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => handleProcessSignal(selectedProcess.pid, 'SIGSTOP')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Pause (SIGSTOP)
              </button>
              <button
                onClick={() => handleProcessSignal(selectedProcess.pid, 'SIGCONT')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Resume (SIGCONT)
              </button>
              <button
                onClick={() => handleProcessSignal(selectedProcess.pid, 'SIGTERM')}
                className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                Terminate (SIGTERM)
              </button>
              <button
                onClick={() => handleProcessSignal(selectedProcess.pid, 'SIGKILL')}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
              >
                Force Kill (SIGKILL)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
