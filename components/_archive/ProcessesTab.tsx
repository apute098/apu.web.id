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
  ChevronDown,
  ChevronUp,
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

    const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') : null;
    if (!token) {
      onOpenAuthModal();
      return;
    }
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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f2fe]" />
            Process Manager & Live Top
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Direct CPU/RAM metrics, task states and POSIX signal dispatcher
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
            Total: <strong className="text-white">{summary.total}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]">
            Run: <strong>{summary.running}</strong>
          </span>
          <button
            onClick={fetchProcesses}
            className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-[#00f2fe] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00f2fe]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'apu', 'root'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUserFilter(u)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-300 ${
                userFilter === u
                  ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 shadow-sm shadow-[#00f2fe]/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PID, name, cmd..."
            className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/[0.08] focus:border-[#00f2fe] rounded-full text-xs text-white placeholder:text-slate-500 outline-none font-mono transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Mobile Card View (< sm screens) */}
      <div className="block sm:hidden space-y-3">
        {filteredAndSorted.map((p) => {
          const isHighCpu = p.cpu > 50;
          const isHighMem = p.ramMB > 500;

          return (
            <div key={p.pid} className="doppelrand-shell">
              <div className="doppelrand-core p-3 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00f2fe] font-bold font-mono text-xs">#{p.pid}</span>
                      <span className="font-bold text-white text-xs">{p.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[220px] mt-0.5">{p.command}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                    p.user === 'root' ? 'bg-[#f43f5e]/15 text-[#f43f5e]' : 'bg-white/[0.04] text-slate-300'
                  }`}>
                    {p.user}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-white/[0.06] font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">CPU</span>
                    <span className={`font-bold ${isHighCpu ? 'text-[#f43f5e]' : 'text-slate-200'}`}>{p.cpu}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">RAM</span>
                    <span className={`font-bold ${isHighMem ? 'text-[#8b5cf6]' : 'text-slate-200'}`}>{p.ramMB} MB</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">STATE</span>
                    <span className="text-[#10b981] font-bold uppercase text-[10px]">{p.stat}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setSelectedProcess(p)}
                    className="text-[11px] font-mono text-[#00f2fe] flex items-center gap-1 hover:underline"
                  >
                    <Info className="w-3.5 h-3.5" /> Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleProcessSignal(p.pid, 'SIGTERM')}
                      disabled={actionLoading === p.pid}
                      className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold"
                    >
                      Term
                    </button>
                    <button
                      onClick={() => handleProcessSignal(p.pid, 'SIGKILL')}
                      disabled={actionLoading === p.pid}
                      className="px-2.5 py-1 rounded-full bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30 text-[10px] font-mono font-bold"
                    >
                      Kill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / Tablet Table (>= sm screens) */}
      <div className="hidden sm:block doppelrand-shell">
        <div className="doppelrand-core p-0 overflow-hidden">
          <div className="overflow-x-auto scroll-fade-x">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/60 border-b border-white/[0.08] text-[11px] text-slate-400 select-none">
                <tr>
                  <th onClick={() => handleSort('pid')} className="py-3 px-4 font-semibold cursor-pointer hover:text-[#00f2fe]">
                    <div className="flex items-center gap-1">
                      <span>PID</span>
                      {sortBy === 'pid' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('name')} className="py-3 px-4 font-semibold cursor-pointer hover:text-[#00f2fe]">
                    <div className="flex items-center gap-1">
                      <span>PROCESS NAME / CMD</span>
                      {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 font-semibold">USER</th>
                  <th onClick={() => handleSort('cpu')} className="py-3 px-3 font-semibold cursor-pointer hover:text-[#00f2fe] text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>CPU %</span>
                      {sortBy === 'cpu' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('ramMB')} className="py-3 px-3 font-semibold cursor-pointer hover:text-[#00f2fe] text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>RAM (MB)</span>
                      {sortBy === 'ramMB' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 font-semibold text-center">STAT</th>
                  <th className="py-3 px-4 font-semibold text-right">DISPATCH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredAndSorted.map((p) => {
                  const isHighCpu = p.cpu > 50;
                  const isHighMem = p.ramMB > 500;

                  return (
                    <tr key={p.pid} className="hover:bg-[#00f2fe]/[0.04] transition-colors group">
                      <td className="py-2.5 px-4 text-[#00f2fe] font-bold">#{p.pid}</td>
                      <td className="py-2.5 px-4 max-w-xs md:max-w-md truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">{p.name}</span>
                          <span className="text-slate-500 text-[11px] truncate">{p.command}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.user === 'root' ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30' : 'bg-white/[0.04] text-slate-300'
                        }`}>
                          {p.user}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold ${isHighCpu ? 'text-[#f43f5e]' : p.cpu > 10 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {p.cpu}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold ${isHighMem ? 'text-[#8b5cf6]' : 'text-slate-300'}`}>
                          {p.ramMB} <span className="text-[10px] text-slate-500">MB</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          p.status === 'running' ? 'text-[#10b981] bg-[#10b981]/15' : 'text-slate-400 bg-white/[0.04]'
                        }`}>
                          {p.stat}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedProcess(p)}
                            title="Inspect Details"
                            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-[#00f2fe] transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleProcessSignal(p.pid, 'SIGTERM')}
                            disabled={actionLoading === p.pid}
                            title="SIGTERM"
                            className="p-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleProcessSignal(p.pid, 'SIGKILL')}
                            disabled={actionLoading === p.pid}
                            title="SIGKILL"
                            className="p-1.5 rounded-full bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/20 transition-colors"
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
      </div>

      {/* Inspector Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="doppelrand-shell max-w-xl w-full">
            <div className="doppelrand-core space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#00f2fe]" />
                    Process #{selectedProcess.pid} — {selectedProcess.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">User: {selectedProcess.user} • State: {selectedProcess.stat}</p>
                </div>
                <button onClick={() => setSelectedProcess(null)} className="text-slate-400 hover:text-white p-1">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                <div className="bg-black/50 p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-500 block text-[10px]">CPU</span>
                  <span className="text-[#00f2fe] font-bold">{selectedProcess.cpu}%</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-500 block text-[10px]">RAM</span>
                  <span className="text-[#8b5cf6] font-bold">{selectedProcess.ramMB} MB</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-500 block text-[10px]">VSZ</span>
                  <span className="text-slate-300 font-bold">{selectedProcess.vszMB} MB</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-500 block text-[10px]">TIME</span>
                  <span className="text-slate-300 font-bold">{selectedProcess.time}</span>
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <span className="text-slate-400">Command Arguments:</span>
                <div className="bg-black/60 p-3 rounded-xl border border-white/[0.06] text-slate-200 break-all max-h-36 overflow-y-auto leading-relaxed">
                  {selectedProcess.command}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => handleProcessSignal(selectedProcess.pid, 'SIGTERM')}
                  className="btn-nested"
                >
                  <span>Terminate</span>
                </button>
                <button
                  onClick={() => handleProcessSignal(selectedProcess.pid, 'SIGKILL')}
                  className="px-4 py-2 rounded-full bg-[#f43f5e] text-white text-xs font-bold hover:bg-[#f43f5e]/80 transition-colors shadow-lg shadow-[#f43f5e]/20"
                >
                  Force Kill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
