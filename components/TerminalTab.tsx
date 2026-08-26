'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Sparkles,
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
      stdout: 'Linux archlinux 7.1.8-zen1-3-zen #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n5d 22h 10m, load average: 0.12, 0.24, 0.18',
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

    const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') : null;
    if (!token) {
      onOpenAuthModal();
      return;
    }
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
    { label: 'Docker PS', cmd: 'sudo -n docker ps -a' },
    { label: 'Active Sockets', cmd: 'sudo -n ss -tulpn' },
    { label: 'Tailscale Status', cmd: 'tailscale status' },
    { label: 'Recent Errors', cmd: 'sudo -n journalctl -p err..emerg -n 15 --no-pager' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <TerminalIcon className="w-6 h-6 text-[#00f2fe]" />
            Interactive Server Terminal
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Execute direct bash commands with ANSI output stream on Arch Linux node
          </p>
        </div>

        <button
          onClick={() => setHistory([])}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Screen</span>
        </button>
      </div>

      {/* Preset Quick Actions */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
          <span>Preset Command Triggers:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => executeCommand(p.cmd)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-[#00f2fe]/20 border border-white/[0.08] hover:border-[#00f2fe]/30 text-xs font-mono text-slate-300 hover:text-[#00f2fe] transition-all active:scale-95 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Window Box with Doppelrand */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-4 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="ml-2 font-bold text-slate-300">apu@archlinux: ~ (bash executor)</span>
            </div>
            <span className="text-[10px] text-slate-500">{history.length} entries</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 select-text scrollbar-thin scroll-fade-y">
            {history.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px] bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.06]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[#00f2fe] font-bold">apu@archlinux:~$</span>
                    <span className="text-white font-bold">{item.cmd}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[10px]">
                    <span>{item.durationMs}ms</span>
                    <span>{item.time}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full font-bold ${
                        item.exitCode === 0 ? 'text-[#10b981] bg-[#10b981]/15' : 'text-[#f43f5e] bg-[#f43f5e]/15'
                      }`}
                    >
                      exit {item.exitCode}
                    </span>
                  </div>
                </div>

                {item.stdout && (
                  <div className="bg-black/60 p-3.5 rounded-xl border border-white/[0.04] text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {item.stdout}
                  </div>
                )}

                {item.stderr && (
                  <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 p-3.5 rounded-xl text-[#f43f5e] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {item.stderr}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Command Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
            <span className="text-[#00f2fe] font-bold">apu@archlinux:~$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Type bash command (e.g., 'free -h', 'lsblk', 'sensors')..."
              className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-slate-600 disabled:opacity-50"
              autoFocus
            />
            <button
              onClick={() => executeCommand()}
              disabled={loading || !command.trim()}
              className="btn-nested group"
            >
              <span>Execute</span>
              <div className="btn-nested-icon">
                <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'text-[#00f2fe]'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
