'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  Globe,
  Radio,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Server,
  Layers,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Network, Ports & Ingress Controller
          </h2>
          <p className="text-xs text-slate-400">
            Audit port terbuka, Tailscale Mesh VPN Node, serta Caddy & Cloudflare Ingress Routing
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            Open Ports: <strong>{listeningPorts.length}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            Tailscale: <strong>{tailscale.isOnline ? 'ONLINE' : 'STANDBY'}</strong>
          </span>
          <button
            onClick={fetchNetwork}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Cloudflare Ingress & Tailscale Mesh */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Ingress & Cloudflare Tunnel Routes */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Cloudflare Ingress & Domain Routes
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Argo Tunnel Active
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {ingressRoutes.map((route: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5 hover:border-cyan-500/20 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{route.domain}</span>
                    <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-800">
                      {route.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Target: {route.target}</div>
                </div>

                <a
                  href={`https://${route.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Tailscale Mesh Network */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Tailscale Mesh VPN Topology
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              IP: {tailscale.selfIp || '100.122.52.32'}
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {tailscale.peers.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">Tailscale mesh topology loaded.</p>
            ) : (
              tailscale.peers.map((peer: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    peer.isSelf
                      ? 'bg-cyan-950/20 border-cyan-500/30'
                      : peer.online
                      ? 'bg-slate-950/70 border-white/5'
                      : 'bg-slate-950/40 border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{peer.name}</span>
                      {peer.isSelf && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold">
                          THIS HOST
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 capitalize">({peer.os})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{peer.ip}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        peer.online || peer.isSelf ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <span className={`text-[10px] font-bold ${peer.online || peer.isSelf ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {peer.online || peer.isSelf ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Listening Ports Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Active Listening Ports & Sockets
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(['all', 'tcp', 'udp'] as const).map((proto) => (
                <button
                  key={proto}
                  onClick={() => setProtocolFilter(proto)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    protocolFilter === proto
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
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
                placeholder="Cari port / proses..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/10 focus:border-cyan-400 rounded-lg text-xs text-white font-mono outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-[11px] text-slate-400 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">PORT</th>
                  <th className="py-3 px-4 font-semibold">PROTO</th>
                  <th className="py-3 px-4 font-semibold">BIND ADDRESS</th>
                  <th className="py-3 px-4 font-semibold">PROCESS NAME</th>
                  <th className="py-3 px-4 font-semibold">PID</th>
                  <th className="py-3 px-4 font-semibold text-right">STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPorts.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-cyan-400">
                      :{p.port}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.protocol === 'tcp' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {p.protocol}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{p.localAddress}</td>
                    <td className="py-2.5 px-4 font-bold text-white">{p.process}</td>
                    <td className="py-2.5 px-4 text-slate-400">{p.pid ? `#${p.pid}` : '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-emerald-400 font-semibold">{p.state || 'LISTEN'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
