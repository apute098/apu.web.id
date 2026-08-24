import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface WatchdogTarget {
  id: string;
  name: string;
  url: string;
  port: number;
  category: 'ai' | 'gateway' | 'system';
  status: 'online' | 'offline' | 'degraded';
  latencyMs: number;
  statusCode: number | null;
  error?: string;
}

const TARGETS = [
  { id: '9router', name: '9Router AI Gateway', url: 'http://127.0.0.1:20128', port: 20128, category: 'ai' as const },
  { id: 'cf-ai-proxy', name: 'Cloudflare AI Proxy', url: 'http://127.0.0.1:20130', port: 20130, category: 'ai' as const },
  { id: 'hermes-gateway', name: 'Hermes Agent Gateway', url: 'http://127.0.0.1:8644', port: 8644, category: 'ai' as const },
  { id: 'mimo-serve', name: 'MiMo Code Server', url: 'http://127.0.0.1:20135', port: 20135, category: 'ai' as const },
  { id: 'opencode', name: 'OpenCode Engine', url: 'http://127.0.0.1:4097', port: 4097, category: 'ai' as const },
  { id: 'apu-mcp', name: 'APU MCP Connector', url: 'http://127.0.0.1:8020', port: 8020, category: 'gateway' as const },
  { id: 'fb-bot', name: 'Facebook Bot Webhook', url: 'http://127.0.0.1:8805', port: 8805, category: 'gateway' as const },
  { id: 'caddy', name: 'Caddy HTTP Server', url: 'http://127.0.0.1:80', port: 80, category: 'system' as const },
  { id: 'opensandbox', name: 'OpenSandbox Server', url: 'http://127.0.0.1:8080', port: 8080, category: 'system' as const },
  { id: 'mihomo', name: 'Mihomo Clash Core', url: 'http://127.0.0.1:9090', port: 9090, category: 'system' as const },
];

async function checkTarget(target: typeof TARGETS[0]): Promise<WatchdogTarget> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(target.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'Apu-Server-Watchdog/1.0' },
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;

    return {
      id: target.id,
      name: target.name,
      url: target.url,
      port: target.port,
      category: target.category,
      status: res.status < 500 ? 'online' : 'degraded',
      latencyMs,
      statusCode: res.status,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    const isTimeout = err.name === 'AbortError';

    return {
      id: target.id,
      name: target.name,
      url: target.url,
      port: target.port,
      category: target.category,
      status: 'offline',
      latencyMs: isTimeout ? 2000 : latencyMs,
      statusCode: null,
      error: isTimeout ? 'Request Timeout (2000ms)' : (err.message || 'Connection refused'),
    };
  }
}

export async function GET() {
  try {
    const results = await Promise.all(TARGETS.map(checkTarget));
    const onlineCount = results.filter(r => r.status === 'online').length;
    const avgLatency = Math.round(
      results.filter(r => r.status === 'online').reduce((acc, curr) => acc + curr.latencyMs, 0) /
        Math.max(1, onlineCount)
    );

    return NextResponse.json(
      {
        success: true,
        summary: {
          total: results.length,
          online: onlineCount,
          offline: results.length - onlineCount,
          avgLatencyMs: avgLatency,
        },
        services: results,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Gagal menjalankan watchdog' },
      { status: 500 }
    );
  }
}
