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

    const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') : null;
    if (!token) {
      onOpenAuthModal();
      return;
    }

    if (action === 'logs') {
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-[#00f2fe]" />
            Docker & Container Engine
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {dockerData.version} • OpenSandbox backend runtime & isolated sandbox clusters
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
            Containers: <strong className="text-white">{summary.total}</strong>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]">
            Running: <strong>{summary.running}</strong>
          </span>
          <button
            onClick={fetchDocker}
            className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-[#00f2fe] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00f2fe]' : ''}`} />
          </button>
        </div>
      </div>

      {containers.length === 0 ? (
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-12 text-center space-y-3">
            <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-extrabold text-white">Tidak Ada Container Docker Aktif</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Docker daemon berjalan normal. Container yang di-spawn oleh OpenSandbox atau tool agent akan muncul di sini.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {containers.map((c: any) => {
            const isRunning = c.state === 'running';
            const isActionBusy = actionLoading?.startsWith(c.id);

            return (
              <div key={c.id} className="doppelrand-shell flex flex-col justify-between">
                <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-extrabold text-white text-sm tracking-tight">{c.names || c.id}</h3>
                        <div className="text-[10px] font-mono text-[#00f2fe] truncate max-w-[200px]">{c.image}</div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isRunning
                            ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#10b981]' : 'bg-slate-400'}`} />
                        {c.state}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-white/[0.06] font-mono text-[11px]">
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

                  <div className="flex items-center gap-2 pt-2">
                    {isRunning ? (
                      <>
                        <button
                          onClick={() => handleContainerAction(c.id, 'restart', c.names)}
                          disabled={isActionBusy}
                          className="flex-1 btn-nested group"
                        >
                          <span>Restart</span>
                          <div className="btn-nested-icon">
                            <RotateCcw className="w-3.5 h-3.5 text-[#00f2fe]" />
                          </div>
                        </button>
                        <button
                          onClick={() => handleContainerAction(c.id, 'stop', c.names)}
                          disabled={isActionBusy}
                          className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#f43f5e]/20 text-slate-400 hover:text-[#f43f5e] transition-colors"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleContainerAction(c.id, 'start', c.names)}
                        disabled={isActionBusy}
                        className="flex-1 btn-nested group"
                      >
                        <span>Start</span>
                        <div className="btn-nested-icon">
                          <Play className="w-3.5 h-3.5 text-[#10b981]" />
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => handleContainerAction(c.id, 'logs', c.names)}
                      className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#8b5cf6]/20 text-slate-400 hover:text-[#8b5cf6] transition-colors"
                      title="Logs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleContainerAction(c.id, 'remove', c.names)}
                      disabled={isActionBusy}
                      className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#f43f5e]/20 text-slate-400 hover:text-[#f43f5e] transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {logsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="doppelrand-shell max-w-3xl w-full">
            <div className="doppelrand-core space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8b5cf6]" />
                  Logs: {logsModal.name}
                </h3>
                <button onClick={() => setLogsModal(null)} className="text-slate-400 hover:text-white p-1">
                  ✕
                </button>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-white/[0.06] font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {logsModal.logs}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
