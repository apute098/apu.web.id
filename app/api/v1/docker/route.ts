import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface DockerContainer {
  id: string;
  names: string;
  image: string;
  status: string;
  state: 'running' | 'exited' | 'paused' | 'restarting' | 'dead';
  ports: string;
  created: string;
  size: string;
  cpuPercent?: string;
  memUsage?: string;
}

function getDockerInfo() {
  try {
    const rawVersion = execSync('sudo -n docker version --format "{{json .Server.Version}}" 2>/dev/null', { encoding: 'utf-8', timeout: 3000 }).trim().replace(/^"|"$/g, '');
    const rawContainers = execSync('sudo -n docker ps -a --format "{{json .}}" 2>/dev/null', { encoding: 'utf-8', timeout: 4000 }).trim();
    
    const containers: DockerContainer[] = [];
    if (rawContainers) {
      const lines = rawContainers.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const stateStr = (parsed.State || parsed.Status || '').toLowerCase();
          let state: DockerContainer['state'] = 'exited';
          if (stateStr.includes('running') || stateStr.includes('up')) state = 'running';
          else if (stateStr.includes('paused')) state = 'paused';
          else if (stateStr.includes('restart')) state = 'restarting';

          containers.push({
            id: parsed.ID || '',
            names: (parsed.Names || '').replace(/^\//, ''),
            image: parsed.Image || '',
            status: parsed.Status || '',
            state,
            ports: parsed.Ports || '-',
            created: parsed.CreatedAt || parsed.RunningFor || '',
            size: parsed.Size || '-',
          });
        } catch {
          // ignore json parse error
        }
      }
    }

    // Try to get stats for running containers
    if (containers.some(c => c.state === 'running')) {
      try {
        const rawStats = execSync('sudo -n docker stats --no-stream --format "{{json .}}" 2>/dev/null', { encoding: 'utf-8', timeout: 4000 }).trim();
        if (rawStats) {
          const statLines = rawStats.split('\n');
          for (const sLine of statLines) {
            if (!sLine.trim()) continue;
            try {
              const statObj = JSON.parse(sLine);
              const target = containers.find(c => c.id === statObj.ID || c.names === statObj.Name);
              if (target) {
                target.cpuPercent = statObj.CPUPerc;
                target.memUsage = statObj.MemUsage;
              }
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore stats failure
      }
    }

    const running = containers.filter(c => c.state === 'running').length;

    return {
      available: true,
      version: rawVersion || 'Docker Engine',
      summary: {
        total: containers.length,
        running,
        stopped: containers.length - running,
      },
      containers,
    };
  } catch (err) {
    return {
      available: false,
      version: 'Docker Not Active',
      summary: { total: 0, running: 0, stopped: 0 },
      containers: [],
    };
  }
}

export async function GET() {
  try {
    const docker = getDockerInfo();
    return NextResponse.json(
      {
        success: true,
        ...docker,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data docker' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const body = await req.json();
    const { containerId, action } = body;

    if (!containerId || !action) {
      return NextResponse.json({ success: false, error: 'containerId dan action wajib diisi' }, { status: 400 });
    }

    const validActions = ['start', 'stop', 'restart', 'kill', 'remove', 'logs'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: `Action ${action} tidak valid` }, { status: 400 });
    }

    // Sanitize containerId
    const cleanId = String(containerId).replace(/[^a-zA-Z0-9_\-\.]/g, '');
    if (!cleanId) {
      return NextResponse.json({ success: false, error: 'Container ID tidak valid' }, { status: 400 });
    }

    if (action === 'logs') {
      const logs = execSync(`sudo -n docker logs --tail 100 ${cleanId} 2>&1`, { encoding: 'utf-8', timeout: 5000 });
      return NextResponse.json({ success: true, logs });
    }

    const cmd = action === 'remove' ? `sudo -n docker rm -f ${cleanId}` : `sudo -n docker ${action} ${cleanId}`;
    const out = execSync(cmd, { encoding: 'utf-8', timeout: 10000 });

    return NextResponse.json({
      success: true,
      message: `Container ${cleanId} ${action} berhasil.`,
      output: out.trim(),
    });
  } catch (err: unknown) {
    console.error('Docker action error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal mengeksekusi aksi docker',
      },
      { status: 500 }
    );
  }
}
