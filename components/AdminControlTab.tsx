'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Users,
  RefreshCw,
  Server,
  CheckCircle2,
  XCircle,
  Power,
  Wallet,
  Terminal,
  Cpu,
  Activity,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { FinanceTab } from '@/components/finance/FinanceTab';
import { HardwareTab } from '@/components/HardwareTab';

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ServiceItem {
  name: string;
  unit: string;
  status: 'active (running)' | 'inactive (dead)' | 'restarting' | 'failed';
  memory: string;
  description: string;
}

interface ProcessItem {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  ramMB: number;
  status: string;
  command: string;
}

interface AdminControlTabProps {
  systemData?: any;
  systemError?: string | null;
  refreshing?: boolean;
  onManualRefreshSystem?: () => void;
}

const KNOWN_SERVICES = [
  { name: 'apu-webid', unit: 'apu-webid.service', label: 'Dashboard Next.js 16', port: '3100', type: 'user' },
  { name: 'apu-backend', unit: 'apu-backend.service', label: 'Bun/Hono API Engine', port: '8000', type: 'user' },
  { name: '9router', unit: '9router.service', label: '9Router AI Gateway', port: '20128', type: 'user' },
  { name: 'mitm-router', unit: 'mitm-router.service', label: 'MITM Router Proxy', port: '20129', type: 'user' },
  { name: 'caddy', unit: 'caddy.service', label: 'Caddy Reverse Proxy', port: '80/443', type: 'system' },
  { name: 'cloudflared', unit: 'cloudflared.service', label: 'Cloudflare Tunnel', port: 'Argo', type: 'system' },
];

export const AdminControlTab: React.FC<AdminControlTabProps> = ({
  systemData,
  systemError,
  refreshing = false,
  onManualRefreshSystem,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'users' | 'keuangan' | 'telemetri' | 'services'>('users');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Processes & Services state
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [procSearch, setProcSearch] = useState('');
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [restartingService, setRestartingService] = useState<string | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => {
      setMsg(null);
    }, 4000);
  };

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('apu_admin_token') || '';
    }
    return '';
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = getAuthToken();
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list_users' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProcessesAndServices = async () => {
    try {
      setLoadingProcesses(true);
      const token = getAuthToken();
      const res = await fetch('/api/v1/processes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.services && Array.isArray(json.services)) {
          setServices(json.services);
        }
        if (json.processes && Array.isArray(json.processes)) {
          setProcesses(json.processes);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingProcesses(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newAction: 'approve_user' | 'reject_user') => {
    try {
      setMsg(null);
      const token = getAuthToken();
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: newAction, userId }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || 'Status berhasil diperbarui');
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Gagal mengubah status user');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error updating user status');
    }
  };

  const handleRestartService = async (rawServiceName: string) => {
    const cleanServiceName = rawServiceName.replace(/\.service$/, '');
    try {
      setRestartingService(cleanServiceName);
      const token = getAuthToken();
      const res = await fetch('/api/v1/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'restart_service',
          serviceName: cleanServiceName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('success', data.message || `Service ${cleanServiceName} berhasil di-restart!`);
        setTimeout(() => fetchProcessesAndServices(), 1500);
      } else {
        showNotification('error', data.error || `Gagal restart ${cleanServiceName}`);
      }
    } catch (err: any) {
      showNotification('error', err.message || `Error restarting ${cleanServiceName}`);
    } finally {
      setRestartingService(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProcessesAndServices();
  }, []);

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;
  const rejectedCount = users.filter((u) => u.status === 'rejected').length;

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProcesses = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(procSearch.toLowerCase()) ||
      p.command.toLowerCase().includes(procSearch.toLowerCase()) ||
      String(p.pid).includes(procSearch)
  );

  return (
    <div className="space-y-8 font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* ===== Double-Bezel Header Shell ===== */}
      <div className="p-1.5 rounded-2xl liquid-glass border border-white/10 border border-white/10 shadow-2xl  relative overflow-hidden group">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />

        <div className="rounded-full bg-slate-950 p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    Master Privileges Active
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Admin Master Control</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Pusat kendali rahasia: User Approvals, Keuangan, Telemetri Server Arch, & Daemon Control.
                </p>
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div className="flex items-center bg-slate-950 p-1.5 rounded-full border border-white/10 self-start md:self-auto font-sans flex-wrap gap-1">
              <button
                onClick={() => setActiveAdminSubTab('users')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  activeAdminSubTab === 'users'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Approval ({pendingCount})</span>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('keuangan')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  activeAdminSubTab === 'keuangan'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Keuangan</span>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('telemetri')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  activeAdminSubTab === 'telemetri'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Telemetri Server</span>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('services')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  activeAdminSubTab === 'services'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Daemon Control</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {msg && (
        <div
          className={`p-4 rounded-full text-xs font-semibold flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            msg.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${msg.type === 'success' ? 'bg-green-500 animate-ping' : 'bg-rose-400'}`} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* ===== Admin Sub-Tab 1: User Approval Management ===== */}
      {activeAdminSubTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Pending Approval', value: `${pendingCount} User`, icon: <Clock className="w-5 h-5" />, color: 'amber' },
              { label: 'User Disetujui', value: `${approvedCount} User`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald' },
              { label: 'User Ditolak', value: `${rejectedCount} User`, icon: <XCircle className="w-5 h-5" />, color: 'rose' },
            ].map((m) => (
              <div key={m.label} className="p-1 rounded-full liquid-glass border border-slate-700 border border-white/10 shadow-lg">
                <div className="rounded-full bg-slate-950 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      m.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      m.color === 'emerald' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {m.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{m.label}</p>
                      <p className="text-lg font-bold text-white font-mono">{m.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Table Card */}
          <div className="p-1 rounded-full liquid-glass border border-slate-700 border border-white/10 shadow-2xl">
            <div className="rounded-full bg-slate-950 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Manajemen User & Approval Request</h2>
                    <p className="text-xs text-slate-400">Persetujuan pendaftaran akun pengguna apu.web.id</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Cari user..."
                      className="pl-8 pr-3 py-1.5 rounded-full liquid-glass border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 w-44"
                    />
                  </div>

                  <button
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-semibold">
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Username</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Tanggal Registrasi</th>
                      <th className="py-3.5 px-4">Status Hak Akses</th>
                      <th className="py-3.5 px-4 text-right">Kontrol Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          {users.length === 0 ? 'Belum ada registrasi user baru.' : 'Tidak ada user yang cocok dengan pencarian.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900 border border-slate-700 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-500">#{u.id}</td>
                          <td className="py-3.5 px-4 font-bold text-white font-mono">@{u.username}</td>
                          <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold liquid-glass text-slate-300 border border-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(u.created_at).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.status === 'approved'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : u.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateStatus(u.id, 'approve_user')}
                                  className="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 active:scale-[0.98] transition-all text-xs font-semibold"
                                >
                                  <span>Setujui</span>
                                  <span className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <UserCheck className="w-2.5 h-2.5" />
                                  </span>
                                </button>
                              )}
                              {u.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(u.id, 'reject_user')}
                                  className="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all text-xs font-semibold"
                                >
                                  <span>Tolak</span>
                                  <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center">
                                    <UserX className="w-2.5 h-2.5" />
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Admin Sub-Tab 2: Keuangan Dashboard ===== */}
      {activeAdminSubTab === 'keuangan' && (
        <div className="p-1 rounded-full liquid-glass border border-slate-700 border border-white/10 shadow-2xl">
          <div className="rounded-full bg-slate-950 p-6">
            <FinanceTab />
          </div>
        </div>
      )}

      {/* ===== Admin Sub-Tab 3: Telemetri Server Arch ===== */}
      {activeAdminSubTab === 'telemetri' && (
        <div className="p-1 rounded-full liquid-glass border border-slate-700 border border-white/10 shadow-2xl">
          <div className="rounded-full bg-slate-950 p-6">
            <HardwareTab
              systemData={systemData}
              refreshing={refreshing}
              onManualRefresh={onManualRefreshSystem || (() => {})}
              error={systemError}
            />
          </div>
        </div>
      )}

      {/* ===== Admin Sub-Tab 4: Daemon & Services Control ===== */}
      {activeAdminSubTab === 'services' && (
        <div className="space-y-6">
          {/* Services Grid */}
          <div className="p-1 rounded-full liquid-glass border border-slate-700 border border-white/10 shadow-2xl">
            <div className="rounded-full bg-slate-950 p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Systemd Services Quick Control</h2>
                    <p className="text-xs text-slate-400">Pengendali daemon proses server apu.web.id (User & System units)</p>
                  </div>
                </div>

                <button
                  onClick={fetchProcessesAndServices}
                  disabled={loadingProcesses}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingProcesses ? 'animate-spin' : ''}`} />
                  Refresh Daemon Status
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {KNOWN_SERVICES.map((svc) => {
                  const liveInfo = services.find(
                    (s) => s.name === svc.name || s.unit === svc.unit
                  );
                  const isRunning = liveInfo?.status === 'active (running)';
                  const isFailed = liveInfo?.status === 'failed';

                  return (
                    <div
                      key={svc.name}
                      className="p-4 rounded-full bg-slate-900 border border-slate-700 border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">
                            {svc.unit}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                              isRunning
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : isFailed
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {liveInfo?.status || (svc.type === 'system' ? 'system unit' : 'user unit')}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          {svc.label} (Port :{svc.port})
                        </p>

                        {liveInfo?.memory && (
                          <p className="text-[10px] font-mono text-cyan-400">
                            RAM: {liveInfo.memory}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                          {svc.type === 'system' ? 'systemctl' : 'systemctl --user'}
                        </span>

                        <button
                          onClick={() => handleRestartService(svc.name)}
                          disabled={restartingService === svc.name}
                          className="group relative inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all active:scale-[0.98] shadow-md shadow-cyan-500/20"
                        >
                          <span>{restartingService === svc.name ? 'Restarting...' : 'Restart'}</span>
                          <span className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center">
                            <Power
                              className={`w-3 h-3 text-slate-950 ${
                                restartingService === svc.name ? 'animate-spin' : ''
                              }`}
                            />
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top 20 System Processes Inspector */}
          <div className="p-1 rounded-full liquid-glass border border-slate-700 border border-white/10 shadow-2xl">
            <div className="rounded-full bg-slate-950 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">Top 20 System Process Inspector</h2>
                    <p className="text-xs text-slate-400">Proses aktif terurut berdasarkan utilisasi CPU tertinggi</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={procSearch}
                    onChange={(e) => setProcSearch(e.target.value)}
                    placeholder="Cari PID atau proses..."
                    className="pl-8 pr-3 py-1.5 rounded-full liquid-glass border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 w-48"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">PID</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">CPU %</th>
                      <th className="py-2.5 px-3">RAM</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {filteredProcesses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          {processes.length === 0 ? 'Memuat data proses...' : 'Tidak ada proses yang cocok.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProcesses.map((p) => (
                        <tr key={p.pid} className="hover:bg-slate-900 border border-slate-700 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-bold">#{p.pid}</td>
                          <td className="py-2.5 px-3 text-slate-400">{p.user}</td>
                          <td className="py-2.5 px-3 text-white font-bold">{p.name}</td>
                          <td className="py-2.5 px-3 text-amber-400 font-semibold">{p.cpu}%</td>
                          <td className="py-2.5 px-3 text-purple-400 font-semibold">{p.ramMB} MB</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full liquid-glass border border-slate-700 border border-white/10 text-slate-300 text-[10px]">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs font-sans text-xs">
                            {p.command}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
