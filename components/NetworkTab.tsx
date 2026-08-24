'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  Globe,
  Radio,
  Search,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';

export function NetworkTab() {
  const [networkData, setNetworkData] = useState<any>({
    listeningPorts: [],
    tailscale: { isOnline: false, selfIp: '', peers: [] },
    ingressRoutes: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'tcp' | 'udp'>('all');

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/network');
      if (res.ok) {
        const data = await res.json();
        setNetworkData(data);
      }
    } catch (err) {
      console.error('Failed to fetch network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  const listeningPorts = networkData.listeningPorts || [];
  const tailscale = networkData.tailscale || { isOnline: false, selfIp: '', peers: [] };
  const ingressRoutes = networkData.ingressRoutes || [];

  const filteredPorts = listeningPorts.filter((p: any) => {
    const matchesSearch =
      String(p.port).includes(search) ||
      p.process.toLowerCase().includes(search.toLowerCase()) ||
      p.localAddress.toLowerCase().includes(search.toLowerCase());

    const matchesProto = protocolFilter === 'all' || p.protocol === protocolFilter;
    return matchesSearch && matchesProto;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Network className="w-6 h-6 text-[#00f2fe]" />
            Network & Ingress Controller
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Open listening ports audit, Tailscale Mesh VPN node, and Cloudflare Argo Ingress Routes
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
            Open Ports: <strong className="text-white">{listeningPorts.length}</strong>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#00f2fe]/15 border border-[#00f2fe]/30 text-[#00f2fe]">
            Tailscale: <strong>{tailscale.isOnline ? 'ONLINE' : 'STANDBY'}</strong>
          </span>
          <button
            onClick={fetchNetwork}
            className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-[#00f2fe] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00f2fe]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Ingress & Mesh Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Ingress Routes */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00f2fe]" />
                Cloudflare Ingress & Domain Routes
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20">
                Argo Tunnel Active
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {ingressRoutes.map((route: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/[0.06] hover:border-[#00f2fe]/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{route.domain}</span>
                      <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 rounded-full bg-white/[0.04]">
                        {route.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Target: {route.target}</div>
                  </div>

                  <a
                    href={`https://${route.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white/[0.04] hover:bg-[#00f2fe]/20 text-slate-400 hover:text-[#00f2fe] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tailscale Mesh */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#10b981]" />
                Tailscale Mesh VPN Topology
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                IP: {tailscale.selfIp || '100.122.52.32'}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {tailscale.peers.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">Tailscale mesh topology active.</p>
              ) : (
                tailscale.peers.map((peer: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      peer.isSelf
                        ? 'bg-[#00f2fe]/[0.06] border-[#00f2fe]/30'
                        : peer.online
                        ? 'bg-black/50 border-white/[0.06]'
                        : 'bg-black/20 border-white/[0.03] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{peer.name}</span>
                        {peer.isSelf && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] bg-[#00f2fe]/20 text-[#00f2fe] font-bold">
                            THIS HOST
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 capitalize">({peer.os})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{peer.ip}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          peer.online || peer.isSelf ? 'bg-[#10b981] animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <span className={`text-[10px] font-bold ${peer.online || peer.isSelf ? 'text-[#10b981]' : 'text-slate-500'}`}>
                        {peer.online || peer.isSelf ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listening Ports Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00f2fe]" />
            Active Listening Ports & Sockets
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {(['all', 'tcp', 'udp'] as const).map((proto) => (
                <button
                  key={proto}
                  onClick={() => setProtocolFilter(proto)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ${
                    protocolFilter === proto
                      ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {proto.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search port / process..."
                className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-white/[0.08] focus:border-[#00f2fe] rounded-full text-xs text-white font-mono outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black/60 border-b border-white/[0.08] text-[11px] text-slate-400 select-none">
                  <tr>
                    <th className="py-3 px-4 font-semibold">PORT</th>
                    <th className="py-3 px-4 font-semibold">PROTO</th>
                    <th className="py-3 px-4 font-semibold">BIND ADDRESS</th>
                    <th className="py-3 px-4 font-semibold">PROCESS</th>
                    <th className="py-3 px-4 font-semibold">PID</th>
                    <th className="py-3 px-4 font-semibold text-right">STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredPorts.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#00f2fe]/[0.04] transition-colors">
                      <td className="py-2.5 px-4 font-bold text-[#00f2fe]">:{p.port}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.protocol === 'tcp' ? 'bg-[#00f2fe]/10 text-[#00f2fe]' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                        }`}>
                          {p.protocol}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{p.localAddress}</td>
                      <td className="py-2.5 px-4 font-bold text-white">{p.process}</td>
                      <td className="py-2.5 px-4 text-slate-400">{p.pid ? `#${p.pid}` : '-'}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="text-[#10b981] font-semibold">{p.state || 'LISTEN'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
