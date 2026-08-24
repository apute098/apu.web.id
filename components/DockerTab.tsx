'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Play,
  Square,
  RotateCcw,
  Trash2,
  FileText,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Zap,
} from 'lucide-react';

interface DockerTabProps {
  isLocked: boolean;
  onOpenAuthModal: () => void;
}

export function DockerTab({ isLocked, onOpenAuthModal }: DockerTabProps) {
  const [dockerData, setDockerData] = useState<any>({ available: false, version: '', summary: {}, containers: [] });
  const [loading, setLoading] = useState(true);
  const [logsModal, setLogsModal] = useState<{ id: string; name: string; logs: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDocker = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/docker');
      if (res.ok) {
        const data = await res.json();
        setDockerData(data);
      }
    } catch (err) {
      console.error('Failed to fetch docker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocker();
    const interval = setInterval(fetchDocker, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleContainerAction = async (containerId: string, action: string, name?: string) => {
    if (isLocked) {
      onOpenAuthModal();
      return;
    }

    if (action === 'logs') {
      const token = localStorage.getItem('apu_admin_token') || '574409';
      try {
        const res = await fetch('/api/v1/docker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ containerId, action: 'logs' }),
        });
        if (res.ok) {
          const json = await res.json();
          setLogsModal({ id: containerId, name: name || containerId, logs: json.logs || 'No logs output.' });
        }
      } catch (err) {
        alert('Gagal membaca log container');
      }
      return;
    }

    if (action === 'remove' && !confirm(`Hapus container ${name || containerId}?`)) {
      return;
    }

    const token = localStorage.getItem('apu_admin_token') || '574409';
    setActionLoading(`${containerId}-${action}`);

    try {
      const res = await fetch('/api/v1/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ containerId, action }),
      });

      if (res.ok) {
        await fetchDocker();
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

  const containers = dockerData.containers || [];
  const summary = dockerData.summary || { total: 0, running: 0, stopped: 0 };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            Docker & Container Engine
          </h2>
          <p className="text-xs text-slate-400">
            {dockerData.version} • OpenSandbox backend runtime & isolated container clusters
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            Containers: <strong>{summary.total}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Running: <strong>{summary.running}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-800 border border-white/5 text-slate-400">
            Stopped: <strong>{summary.stopped}</strong>
          </span>
          <button
            onClick={fetchDocker}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Containers List */}
      {containers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center space-y-3 backdrop-blur-md">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Tidak Ada Container Docker Aktif</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Docker daemon berjalan normal. Container yang di-spawn oleh OpenSandbox atau tool eksekusi akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containers.map((c: any) => {
            const isRunning = c.state === 'running';
            const isActionBusy = actionLoading?.startsWith(c.id);

            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between ${
                  isRunning
                    ? 'bg-slate-900/70 border-white/10 hover:border-cyan-500/30'
                    : 'bg-slate-950/60 border-white/5 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight">{c.names || c.id}</h3>
                      <div className="text-[10px] font-mono text-cyan-400 truncate max-w-[200px]">{c.image}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isRunning
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                      {c.state}
                    </span>
                  </div>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-white/5 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">CPU / MEM</span>
                      <span className="text-slate-200 font-bold">{c.cpuPercent || '-'} / {c.memUsage || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">PORTS</span>
                      <span className="text-slate-200 font-bold truncate block">{c.ports || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 pt-2">
                  {isRunning ? (
                    <>
                      <button
                        onClick={() => handleContainerAction(c.id, 'restart', c.names)}
                        disabled={isActionBusy}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-xs font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Restart</span>
                      </button>
                      <button
                        onClick={() => handleContainerAction(c.id, 'stop', c.names)}
                        disabled={isActionBusy}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleContainerAction(c.id, 'start', c.names)}
                      disabled={isActionBusy}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-xs font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Start</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleContainerAction(c.id, 'logs', c.names)}
                    title="View Container Logs"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-purple-400 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleContainerAction(c.id, 'remove', c.names)}
                    disabled={isActionBusy}
                    title="Remove Container"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Logs Modal */}
      {logsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Container Logs: {logsModal.name} ({logsModal.id.slice(0, 12)})
              </h3>
              <button
                onClick={() => setLogsModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {logsModal.logs}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setLogsModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
