'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Trash2,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface TerminalTabProps {
  isLocked: boolean;
  onOpenAuthModal: () => void;
}

export function TerminalTab({ isLocked, onOpenAuthModal }: TerminalTabProps) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{ cmd: string; stdout: string; stderr: string; exitCode: number; durationMs: number; time: string }>>([
    {
      cmd: 'uname -a && uptime',
      stdout: 'Linux archlinux 6.18.9-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n2d 14h 22m, load average: 0.12, 0.24, 0.18',
      stderr: '',
      exitCode: 0,
      durationMs: 12,
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [cmdHistoryList, setCmdHistoryList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = async (cmdToRun?: string, presetAction?: string) => {
    if (isLocked) {
      onOpenAuthModal();
      return;
    }

    const finalCmd = cmdToRun || command.trim();
    if (!finalCmd && !presetAction) return;

    const token = localStorage.getItem('apu_admin_token') || '574409';
    setLoading(true);

    try {
      const res = await fetch('/api/v1/terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          command: finalCmd,
          action: presetAction,
        }),
      });

      const data = await res.json();

      if (finalCmd) {
        setCmdHistoryList((prev) => [finalCmd, ...prev.slice(0, 40)]);
      }

      setHistory((prev) => [
        ...prev,
        {
          cmd: data.command || finalCmd || presetAction || '',
          stdout: data.stdout || '',
          stderr: data.stderr || (data.error || ''),
          exitCode: data.exitCode ?? (data.success ? 0 : 1),
          durationMs: data.durationMs || 0,
          time: new Date().toLocaleTimeString(),
        },
      ]);

      setCommand('');
      setHistoryIndex(-1);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          cmd: finalCmd || presetAction || 'error',
          stdout: '',
          stderr: err.message || 'Eksekusi gagal',
          exitCode: 1,
          durationMs: 0,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistoryList.length > 0 && historyIndex < cmdHistoryList.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCommand(cmdHistoryList[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setCommand(cmdHistoryList[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const presets = [
    { label: 'Free RAM Memory', cmd: 'free -h' },
    { label: 'Disk Partitions', cmd: 'df -h -x tmpfs -x devtmpfs' },
    { label: 'Thermal Sensors', cmd: 'sensors 2>/dev/null || cat /sys/class/thermal/thermal_zone0/temp' },
    { label: 'Docker Containers', cmd: 'sudo -n docker ps -a' },
    { label: 'Active Sockets', cmd: 'sudo -n ss -tulpn' },
    { label: 'Tailscale Status', cmd: 'tailscale status' },
    { label: 'Recent Error Logs', cmd: 'sudo -n journalctl -p err..emerg -n 15 --no-pager' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-cyan-400" />
            Interactive Server Terminal & Safe Actions
          </h2>
          <p className="text-xs text-slate-400">
            Eksekusi perintah terminal secara langsung pada node Arch Linux dengan output real-time
          </p>
        </div>

        <button
          onClick={() => setHistory([])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Console</span>
        </button>
      </div>

      {/* Preset Quick Actions Bar */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Preset Quick Commands:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => executeCommand(p.cmd)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all active:scale-95 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Window Box */}
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 font-mono text-xs shadow-2xl space-y-4">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-bold text-slate-300">apu@archlinux: ~ (bash / node executor)</span>
          </div>
          <span className="text-[10px] text-slate-500">History: {history.length} entries</span>
        </div>

        {/* History Stream */}
        <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 select-text scrollbar-thin">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              {/* Command Prompt */}
              <div className="flex items-center justify-between text-slate-400 text-[11px] bg-slate-900/60 px-2.5 py-1 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-cyan-400 font-bold">apu@archlinux:~$</span>
                  <span className="text-white font-bold">{item.cmd}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                  <span>{item.durationMs}ms</span>
                  <span>{item.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold ${
                      item.exitCode === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    exit {item.exitCode}
                  </span>
                </div>
              </div>

              {/* Stdout */}
              {item.stdout && (
                <div className="bg-slate-900/30 p-3 rounded-lg text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {item.stdout}
                </div>
              )}

              {/* Stderr */}
              {item.stderr && (
                <div className="bg-rose-950/30 border border-rose-500/20 p-3 rounded-lg text-rose-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {item.stderr}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Input Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-cyan-400 font-bold">apu@archlinux:~$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ketik perintah bash lalu tekan Enter (misal: 'htop -b -n 1', 'ip a', 'df -h')..."
            className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-slate-600 disabled:opacity-50"
            autoFocus
          />
          <button
            onClick={() => executeCommand()}
            disabled={loading || !command.trim()}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Run</span>
          </button>
        </div>
      </div>
    </div>
  );
}
