import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unit = searchParams.get('unit') || 'all';
    const linesParam = parseInt(searchParams.get('lines') || '100', 10);
    const lines = Math.min(Math.max(10, isNaN(linesParam) ? 100 : linesParam), 500);
    const priority = searchParams.get('priority') || 'all';
    const grep = searchParams.get('grep') || '';

    let cmd = '';

    if (unit === 'kernel' || unit === 'dmesg') {
      cmd = `sudo -n dmesg -T --color=never | tail -n ${lines}`;
    } else {
      let baseCmd = 'sudo -n journalctl --no-pager -o short-iso';
      
      if (unit && unit !== 'all') {
        const cleanUnit = unit.endsWith('.service') ? unit : `${unit}.service`;
        baseCmd += ` -u ${cleanUnit}`;
      }

      if (priority === 'err' || priority === 'error') {
        baseCmd += ' -p err..emerg';
      } else if (priority === 'warn' || priority === 'warning') {
        baseCmd += ' -p warning..emerg';
      }

      baseCmd += ` -n ${lines}`;
      cmd = baseCmd;
    }

    let logs = '';
    try {
      logs = execSync(cmd, { encoding: 'utf-8', timeout: 5000 });
    } catch (cmdErr: any) {
      logs = cmdErr.stdout || cmdErr.message || 'Log tidak tersedia atau service belum memiliki log.';
    }

    if (grep) {
      const grepLower = grep.toLowerCase();
      const filtered = logs.split('\n').filter(l => l.toLowerCase().includes(grepLower));
      logs = filtered.join('\n');
    }

    return NextResponse.json({
      success: true,
      unit,
      linesCount: logs ? logs.split('\n').length : 0,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('GET /api/v1/logs error:', err);
    return NextResponse.json(
      { success: false, error: 'Gagal membaca log sistem' },
      { status: 500 }
    );
  }
}
