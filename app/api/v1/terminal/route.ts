import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { isAuthorized, unauthorized, getClientIp, checkRateLimit, isIpLocked, recordFailedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PRESET_ACTIONS: Record<string, { cmd: string; desc: string }> = {
  clean_cache: {
    cmd: 'sync && sudo -n bash -c "echo 3 > /proc/sys/vm/drop_caches" && echo "✓ System Pagecache, Dentries & Inodes successfully dropped."',
    desc: 'Bersihkan Cache RAM (Drop Caches)',
  },
  trim_ssd: {
    cmd: 'sudo -n fstrim -av',
    desc: 'Trim SSD & Storage blocks',
  },
  check_storage: {
    cmd: 'df -h -x tmpfs -x devtmpfs; echo "\n--- BLOCK DEVICES ---"; lsblk -o NAME,SIZE,TYPE,MOUNTPOINTS',
    desc: 'Cek Detail Partisi & Storage',
  },
  restart_caddy: {
    cmd: 'sudo -n systemctl restart caddy && sudo -n systemctl is-active caddy && echo "✓ Caddy Web Server restarted and active."',
    desc: 'Restart Caddy Reverse Proxy',
  },
  restart_cloudflared: {
    cmd: 'sudo -n systemctl restart cloudflared && sudo -n systemctl is-active cloudflared && echo "✓ Cloudflare Tunnel restarted and active."',
    desc: 'Restart Cloudflare Tunnel Ingress',
  },
  system_diagnostic: {
    cmd: 'echo "=== SYSTEM DIAGNOSTIC ===" && uname -a && uptime && echo "\n=== MEMORY ===" && free -h && echo "\n=== CRITICAL RECENT LOGS ===" && sudo -n journalctl -p err..emerg -n 8 --no-pager',
    desc: 'Jalankan Diagnostik Kesehatan Lengkap',
  },
  backup_snapshot: {
    cmd: 'mkdir -p /home/apu/Backups && BACKUP_FILE="/home/apu/Backups/apu-snapshot-$(date +%Y%m%d_%H%M%S).tar.gz" && tar -czf "$BACKUP_FILE" -C /home/apu/projects/apu.web.id .env.local database.sqlite 2>/dev/null || true && echo "✓ Snapshot backup created: $BACKUP_FILE ("$(du -h "$BACKUP_FILE" 2>/dev/null | cut -f1)")"',
    desc: 'Buat Snapshot Backup Database & Config',
  },
  test_telegram_alert: {
    cmd: 'curl -s -X POST "https://api.telegram.org/bot8591251718:AAGd3NznPEaSd-KZ3Rw-DDmid9YmSJZ1K0s/sendMessage" -H "Content-Type: application/json" -d \'{"chat_id":"947345525","text":"🚨 *[TEST ALERT] apu.web.id Server Monitor*\nNode: archlinux\nUptime: \'$(uptime -p)\'\nHealth: 100%\nAll microservices active.","parse_mode":"Markdown"}\' && echo "✓ Telegram Alert Sent successfully."',
    desc: 'Kirim Test Alert ke Telegram Master',
  },
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Check IP lockout
  const lockStatus = isIpLocked(ip);
  if (lockStatus.locked) {
    return NextResponse.json(
      {
        success: false,
        error: `IP Anda diblokir sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${lockStatus.remainingSec} detik.`,
      },
      { status: 429 }
    );
  }

  // 2. Check Authorization
  if (!isAuthorized(req)) {
    recordFailedAuth(ip);
    return unauthorized();
  }

  // 3. Rate limiting per IP (max 20 commands / minute)
  const rateLimit = checkRateLimit(ip, 20, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit tercapai. Maksimal 20 perintah per menit per IP.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { action, command } = body;

    let targetCmd = '';

    if (action && PRESET_ACTIONS[action]) {
      targetCmd = PRESET_ACTIONS[action].cmd;
    } else if (command && typeof command === 'string') {
      targetCmd = command.trim();
    } else {
      return NextResponse.json({ success: false, error: 'Command atau preset action diperlukan' }, { status: 400 });
    }

    // Safety checks against hazardous destructive actions
    const isDangerous =
      /rm\s+-rf\s+\/(?!\w)/.test(targetCmd) ||
      /mkfs\./.test(targetCmd) ||
      /dd\s+if=/.test(targetCmd) ||
      /:(\(\)\s*\{|\(\)\{)/.test(targetCmd) || // fork bomb
      />\s*\/dev\/(sd[a-z]|nvme|null)/.test(targetCmd) ||
      /chmod\s+-R\s+777\s+\//.test(targetCmd);

    if (isDangerous) {
      return NextResponse.json({ success: false, error: 'Perintah berbahaya diblokir oleh keamanan server.' }, { status: 403 });
    }

    const start = Date.now();

    return new Promise<NextResponse>((resolve) => {
      exec(targetCmd, { timeout: 20000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        const durationMs = Date.now() - start;

        resolve(
          NextResponse.json({
            success: !error || error.code === 0,
            command: targetCmd,
            stdout: stdout || '',
            stderr: stderr || (error ? error.message : ''),
            exitCode: error ? error.code || 1 : 0,
            durationMs,
            timestamp: new Date().toISOString(),
          })
        );
      });
    });
  } catch (err: unknown) {
    console.error('POST /api/v1/terminal error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Eksekusi perintah gagal' },
      { status: 500 }
    );
  }
}
