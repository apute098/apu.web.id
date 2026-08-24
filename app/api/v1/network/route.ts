import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export const dynamic = 'force-dynamic';

export interface ListeningPort {
  protocol: 'tcp' | 'udp';
  localAddress: string;
  port: number;
  process: string;
  pid: number | null;
  state: string;
}

export interface TailscalePeer {
  ip: string;
  name: string;
  os: string;
  online: boolean;
  lastSeen?: string;
  isSelf: boolean;
}

export interface IngressRoute {
  domain: string;
  target: string;
  type: 'caddy' | 'cloudflared';
  status: 'active' | 'unknown';
}

function getListeningPorts(): ListeningPort[] {
  const ports: ListeningPort[] = [];
  try {
    const raw = execSync('sudo -n ss -tulpn', { encoding: 'utf-8', timeout: 4000 });
    const lines = raw.trim().split('\n');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 5) continue;

      const protocol = parts[0].toLowerCase().startsWith('tcp') ? 'tcp' : 'udp';
      const state = parts[1];
      const localAddrFull = parts[4]; // e.g. 0.0.0.0:22 or [::]:80 or 127.0.0.1:8080 or *:3100

      // Extract port
      const lastColon = localAddrFull.lastIndexOf(':');
      if (lastColon === -1) continue;

      const port = parseInt(localAddrFull.slice(lastColon + 1), 10);
      const localAddress = localAddrFull.slice(0, lastColon);

      if (isNaN(port) || port <= 0) continue;

      // Extract process and pid from users:(("name",pid=123,fd=4))
      let processName = '-';
      let pid: number | null = null;

      const usersPart = parts.slice(6).join(' ');
      const userMatch = usersPart.match(/users:\(\("([^"]+)",pid=(\d+)/);
      if (userMatch) {
        processName = userMatch[1];
        pid = parseInt(userMatch[2], 10);
      }

      // Avoid duplicates with same proto & port
      if (!ports.some(p => p.protocol === protocol && p.port === port && p.localAddress === localAddress)) {
        ports.push({
          protocol,
          localAddress,
          port,
          process: processName,
          pid,
          state,
        });
      }
    }
  } catch (err) {
    console.error('Failed to read listening ports:', err);
  }

  return ports.sort((a, b) => a.port - b.port);
}

function getTailscaleStatus() {
  const peers: TailscalePeer[] = [];
  let selfIp = '100.122.52.32';
  let isOnline = false;

  try {
    const raw = execSync('tailscale status 2>/dev/null', { encoding: 'utf-8', timeout: 3000 });
    const lines = raw.trim().split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const parts = trimmed.split(/\s+/);
      if (parts.length >= 4) {
        const ip = parts[0];
        const name = parts[1];
        const os = parts[3];
        const isSelf = trimmed.includes(' - ') || parts[4] === '-';
        const isPeerOnline = !trimmed.includes('offline');

        if (isSelf) {
          selfIp = ip;
          isOnline = true;
        }

        peers.push({
          ip,
          name,
          os,
          online: isPeerOnline,
          isSelf,
        });
      }
    }
  } catch {
    // Tailscale offline or uninstalled
  }

  return {
    isOnline,
    selfIp,
    peers,
  };
}

function getIngressRoutes(): IngressRoute[] {
  return [
    { domain: 'apu.web.id', target: 'localhost:3100', type: 'cloudflared', status: 'active' },
    { domain: 'router.apu.web.id', target: 'localhost:20128 (9Router)', type: 'cloudflared', status: 'active' },
    { domain: 'keuangan.apu.web.id', target: 'localhost:3100', type: 'cloudflared', status: 'active' },
    { domain: 'mcp.apu.web.id', target: 'localhost:8020 (APU MCP)', type: 'cloudflared', status: 'active' },
    { domain: 'api.apu.web.id', target: 'localhost:8000', type: 'cloudflared', status: 'active' },
    { domain: 'next.apu.web.id', target: 'localhost:3100', type: 'cloudflared', status: 'active' },
    { domain: 'fb-bot.apu.web.id', target: 'localhost:8805', type: 'cloudflared', status: 'active' },
    { domain: 'regsi.my.id', target: 'Local static server', type: 'caddy', status: 'active' },
  ];
}

export async function GET() {
  try {
    const listeningPorts = getListeningPorts();
    const tailscale = getTailscaleStatus();
    const ingressRoutes = getIngressRoutes();

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalListeningPorts: listeningPorts.length,
          tailscaleConnected: tailscale.isOnline,
          activeIngressRoutes: ingressRoutes.length,
        },
        listeningPorts,
        tailscale,
        ingressRoutes,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data jaringan' },
      { status: 500 }
    );
  }
}
