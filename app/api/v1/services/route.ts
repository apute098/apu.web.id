import { NextRequest, NextResponse } from 'next/server';
import { execFileSync, execSync } from 'child_process';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface ServiceItem {
  id: string;
  name: string;
  unit: string;
  scope: 'system' | 'user';
  category: 'ai' | 'web' | 'core' | 'bot' | 'network';
  status: 'active' | 'inactive' | 'failed' | 'activating' | 'unknown';
  subState: string;
  memoryMB: number;
  pid: number | null;
  uptime: string;
  description: string;
}

const KNOWN_SERVICES: Array<{
  unit: string;
  name: string;
  scope: 'system' | 'user';
  category: 'ai' | 'web' | 'core' | 'bot' | 'network';
  description: string;
}> = [
  // AI Hub & Models
  { unit: '9router.service', name: '9Router AI Gateway', scope: 'user', category: 'ai', description: 'Universal OpenAI-compatible AI gateway (Port 20128)' },
  { unit: 'cf-ai-proxy.service', name: 'CF AI Proxy', scope: 'user', category: 'ai', description: 'Cloudflare Workers AI OpenAI proxy bridge (Port 20130)' },
  { unit: 'mimo-serve.service', name: 'MiMo Code Server', scope: 'user', category: 'ai', description: 'MiMo headless coding assistant daemon (Port 20135)' },
  { unit: 'opencode-server.service', name: 'OpenCode Server', scope: 'user', category: 'ai', description: 'OpenCode headless LLM code engine (Port 4097)' },
  { unit: 'mitm-router.service', name: 'MITM Router', scope: 'user', category: 'ai', description: 'MITM AI traffic optimizer & caching proxy (Port 20129)' },
  { unit: 'grok-sse-filter.service', name: 'Grok SSE Proxy', scope: 'user', category: 'ai', description: 'Grok SSE real-time stream filter (Port 8791)' },

  // Web & Ingress
  { unit: 'caddy.service', name: 'Caddy Reverse Proxy', scope: 'system', category: 'web', description: 'Automated HTTPS & reverse proxy engine (Port 80/443)' },
  { unit: 'cloudflared.service', name: 'Cloudflare Tunnel', scope: 'system', category: 'web', description: 'Argo Tunnel gateway for apu.web.id subdomains' },
  { unit: 'apu-webid.service', name: 'apu.web.id Server Hub', scope: 'system', category: 'web', description: 'Main Next.js Server Control & Monitoring Station (Port 3100)' },
  { unit: 'teamwork-preview.service', name: 'Teamwork Preview', scope: 'user', category: 'web', description: 'Real-time multi-agent teamwork UI (Port 3001)' },

  // Bots & Messaging
  { unit: 'wa-bot-go.service', name: 'WhatsApp Bot (Go)', scope: 'user', category: 'bot', description: 'Whatsmeow WhatsApp AI Assistant & Media Service' },
  { unit: 'agy-telegram.service', name: 'Agy Telegram Bot (Go)', scope: 'user', category: 'bot', description: 'Telegram Go gateway & ecosystem manager' },
  { unit: 'hermes-gateway.service', name: 'Hermes Agent Gateway', scope: 'system', category: 'bot', description: 'Autonomous agent messaging platform (Port 8644)' },
  { unit: 'fb-bot.service', name: 'FB Messenger Bot', scope: 'user', category: 'bot', description: 'Facebook messenger webhook integration (Port 8805)' },

  // Core & Network
  { unit: 'tailscaled.service', name: 'Tailscale Mesh VPN', scope: 'system', category: 'network', description: 'Secure mesh VPN node' },
  { unit: 'docker.service', name: 'Docker Engine', scope: 'system', category: 'core', description: 'Container runtime daemon' },
  { unit: 'opensandbox-server.service', name: 'OpenSandbox Server', scope: 'system', category: 'core', description: 'Secure isolated code execution backend (Port 8080)' },
  { unit: 'mihomo.service', name: 'Mihomo Proxy Kernel', scope: 'system', category: 'network', description: 'Core routing and outbound traffic proxy daemon (Port 9090)' },
  { unit: 'sshd.service', name: 'OpenSSH Daemon', scope: 'system', category: 'core', description: 'Secure shell remote access server (Port 22)' },
  { unit: 'apu-mcp.service', name: 'APU MCP Server', scope: 'system', category: 'core', description: 'Claude Model Context Protocol connector (Port 8020)' },
];

function inspectService(item: typeof KNOWN_SERVICES[0]): ServiceItem {
  let status: ServiceItem['status'] = 'unknown';
  let subState = 'unknown';
  let memoryMB = 0;
  let pid: number | null = null;
  let uptime = '-';

  try {
    const isUser = item.scope === 'user';
    const showCmd = isUser
      ? ['--user', 'show', item.unit, '-p', 'ActiveState,SubState,MainPID,MemoryCurrent,ActiveEnterTimestamp']
      : ['show', item.unit, '-p', 'ActiveState,SubState,MainPID,MemoryCurrent,ActiveEnterTimestamp'];

    const out = execFileSync('systemctl', showCmd, { encoding: 'utf-8', timeout: 3000 });
    const props = Object.fromEntries(
      out.split('\n').filter(l => l.includes('=')).map(l => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
    );

    const activeState = props['ActiveState'] || 'inactive';
    subState = props['SubState'] || 'dead';

    if (activeState === 'active') {
      status = 'active';
    } else if (activeState === 'failed') {
      status = 'failed';
    } else if (activeState === 'activating' || activeState === 'reloading') {
      status = 'activating';
    } else {
      status = 'inactive';
    }

    const rawPid = parseInt(props['MainPID'] || '0', 10);
    if (rawPid > 0) pid = rawPid;

    const rawMem = parseInt(props['MemoryCurrent'] || '0', 10);
    if (!isNaN(rawMem) && rawMem > 0) {
      memoryMB = Math.round(rawMem / (1024 * 1024));
    }

    const activeTimestamp = props['ActiveEnterTimestamp'];
    if (activeTimestamp && status === 'active') {
      const startTime = new Date(activeTimestamp).getTime();
      if (!isNaN(startTime) && startTime > 0) {
        const diffSec = Math.floor((Date.now() - startTime) / 1000);
        if (diffSec > 86400) uptime = `${Math.floor(diffSec / 86400)}d ${Math.floor((diffSec % 86400) / 3600)}h`;
        else if (diffSec > 3600) uptime = `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m`;
        else uptime = `${Math.max(1, Math.floor(diffSec / 60))}m`;
      }
    }
  } catch (err) {
    status = 'inactive';
  }

  return {
    id: item.unit.replace('.service', ''),
    name: item.name,
    unit: item.unit,
    scope: item.scope,
    category: item.category,
    status,
    subState,
    memoryMB,
    pid,
    uptime,
    description: item.description,
  };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const services = KNOWN_SERVICES.map(inspectService);
    const summary = {
      total: services.length,
      active: services.filter(s => s.status === 'active').length,
      failed: services.filter(s => s.status === 'failed').length,
      inactive: services.filter(s => s.status === 'inactive').length,
    };

    return NextResponse.json(
      {
        success: true,
        summary,
        services,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    console.error('GET /api/v1/services error:', err);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data services' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const body = await req.json();
    const { unit, action, scope } = body;

    if (!unit || !action) {
      return NextResponse.json({ success: false, error: 'Parameter unit dan action wajib diisi' }, { status: 400 });
    }

    const validActions = ['start', 'stop', 'restart', 'reload'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: `Action '${action}' tidak valid` }, { status: 400 });
    }

    const cleanUnit = String(unit).trim().endsWith('.service') ? String(unit).trim() : `${String(unit).trim()}.service`;

    // Security check: alphanumeric, dashes, dots only
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanUnit)) {
      return NextResponse.json({ success: false, error: 'Nama unit tidak valid' }, { status: 400 });
    }

    const targetService = KNOWN_SERVICES.find(s => s.unit === cleanUnit);
    const isUserScope = scope === 'user' || (targetService && targetService.scope === 'user');

    let output = '';
    if (isUserScope) {
      output = execSync(`systemctl --user ${action} ${cleanUnit}`, { encoding: 'utf-8', timeout: 10000 });
    } else {
      output = execSync(`sudo -n systemctl ${action} ${cleanUnit}`, { encoding: 'utf-8', timeout: 10000 });
    }

    // Refresh state of the affected unit
    const updated = targetService ? inspectService(targetService) : null;

    return NextResponse.json({
      success: true,
      message: `Service ${cleanUnit} ${action} berhasil dieksekusi.`,
      output: output.trim(),
      service: updated,
    });
  } catch (err: unknown) {
    console.error('POST /api/v1/services error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal mengeksekusi perintah service',
      },
      { status: 500 }
    );
  }
}
