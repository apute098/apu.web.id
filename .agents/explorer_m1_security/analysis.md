# Security & API Protection Analysis (Milestone M1)

**Working Directory**: `/home/apu/projects/apu.web.id/.agents/explorer_m1_security`  
**Target Files**:
- `/home/apu/projects/apu.web.id/lib/auth.ts`
- `/home/apu/projects/apu.web.id/app/api/v1/keuangan/route.ts`
- `/home/apu/projects/apu.web.id/app/api/v1/processes/route.ts`
- `/home/apu/projects/apu.web.id/app/api/v1/hermes/route.ts`
- `/home/apu/projects/apu.web.id/components/AdminControlTab.tsx`

---

## 1. Executive Summary

This investigation analyzed the security, authorization guards, daemon service whitelist, and payload handling contracts across the API routes of `apu.web.id`. 

### Key Findings:
1. **Authorization Guard (`isAuthorized`)**:
   - `lib/auth.ts` reads `process.env.WEBHOOK_TOKEN`. If undefined in the runtime environment, `isAuthorized()` returns `false`, while `app/api/v1/auth/route.ts` falls back to the default master token `'76c7cb42f88363744ac20d23377a29dd'`. To ensure consistent authorization without breakage, `lib/auth.ts` must use the same fallback token or unified secret resolution.
   - `GET /api/v1/keuangan` and `GET /api/v1/processes` already call `if (!isAuthorized(req)) return unauthorized();`, returning HTTP 403.
   - `app/api/v1/hermes/route.ts` performs an unauthenticated internal `fetch` to `http://localhost:3100/api/v1/keuangan`. When `GET /api/v1/keuangan` is protected, this fetch fails unless updated to call direct database/service helper functions (`listTransactions()`, `computeSummary()`).

2. **Daemon Whitelist Discrepancy (`ALLOWED_SERVICE_NAMES`)**:
   - `app/api/v1/processes/route.ts` currently whitelists only `['caddy', 'cloudflared', 'apu-webid-next', 'apu-ecosystem']`.
   - `PROJECT.md` and system architecture require: `['apu-webid', '9router', 'mitm-router', 'apu-backend', 'caddy', 'cloudflared']`.
   - The route does not strip `.service` suffixes (e.g. `'apu-webid.service'`), which causes rejection when UI components send unit names with extensions.

3. **Payload Key Mismatch (`action` vs `command`, `serviceName` vs `service`)**:
   - `AdminControlTab.tsx` sends `{ command: 'restart_service', service: serviceName }`.
   - `app/api/v1/processes/route.ts` checks `const { action, pid, serviceName } = body`.
   - The route must normalize both `action || command` and `serviceName || service` to support all calling conventions.

---

## 2. Deep Dive & Proposed Fix Specifications

### A. Master Token & Auth Guard (`lib/auth.ts`)

#### Issue:
`lib/auth.ts` line 6:
```ts
const token = process.env.WEBHOOK_TOKEN;
if (!token) return false;
```
If `process.env.WEBHOOK_TOKEN` is not loaded in runtime env, all authorized calls fail, while `app/api/v1/auth/route.ts` line 102 uses:
```ts
const masterToken = process.env.WEBHOOK_TOKEN || '76c7cb42f88363744ac20d23377a29dd';
```

#### Proposed Fix for `lib/auth.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';

export const MASTER_TOKEN_DEFAULT = '76c7cb42f88363744ac20d23377a29dd';

export function getMasterToken(): string {
  return process.env.WEBHOOK_TOKEN || process.env.MASTER_TOKEN || MASTER_TOKEN_DEFAULT;
}

export function isAuthorized(req: NextRequest): boolean {
  const masterToken = getMasterToken();
  const auth = req.headers.get('authorization') || '';
  const xToken = req.headers.get('x-webhook-token') || '';
  const tgToken = req.headers.get('x-telegram-bot-api-secret-token') || '';

  // Check Bearer <token>, raw header token, or bot secret tokens
  return (
    auth === `Bearer ${masterToken}` ||
    auth === masterToken ||
    xToken === masterToken ||
    tgToken === masterToken
  );
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    {
      message: 'Access denied. Fuck you!',
      error: 'Forbidden',
      statusCode: 403,
    },
    { status: 403 }
  );
}
```

---

### B. Keuangan API Protection (`app/api/v1/keuangan/route.ts`)

#### Verification of Authorization Guards:
- **`GET /api/v1/keuangan`** (Line 33):
  ```ts
  export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) return unauthorized();
    ...
  }
  ```
  Confirmed: Unauthenticated requests receive HTTP 403 Forbidden.

- **`POST /api/v1/keuangan`** (Line 80):
  ```ts
  export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) return unauthorized();
    ...
  }
  ```
  Confirmed: Mutation requests receive HTTP 403 Forbidden.

#### Internal Dependency Fix in `app/api/v1/hermes/route.ts`:
In `app/api/v1/hermes/route.ts` line 9, replace:
```ts
fetch(`http://localhost:3100/api/v1/keuangan`, ...)
```
with direct in-memory invocation:
```ts
import { listTransactions } from '@/lib/db';
import { computeSummary } from '@/lib/keuangan';

// Inside realServerContext():
const txs = listTransactions();
const finSummary = computeSummary(txs);
```
This avoids making an unauthenticated internal loopback HTTP request that fails against the protected route.

---

### C. System Processes & Daemon Quick Control (`app/api/v1/processes/route.ts`)

#### 1. Whitelist Definition
Map all allowed services to their execution scope (`user` for systemd `--user`, `system` for `sudo -n systemctl`):

| Service Name | Scope | Systemd Command Executed |
|--------------|-------|--------------------------|
| `apu-webid` | `user` | `systemctl --user <action> apu-webid.service` |
| `9router` | `user` | `systemctl --user <action> 9router.service` |
| `mitm-router` | `user` | `systemctl --user <action> mitm-router.service` |
| `apu-backend` | `user` | `systemctl --user <action> apu-backend.service` |
| `caddy` | `system` | `sudo -n systemctl <action> caddy.service` |
| `cloudflared` | `system` | `sudo -n systemctl <action> cloudflared.service` |
| `apu-webid-next` (alias) | `user` | `systemctl --user <action> apu-webid-next.service` |
| `apu-ecosystem` (alias) | `user` | `systemctl --user <action> apu-ecosystem.service` |

#### Map Definition in Code:
```ts
const ALLOWED_SERVICE_NAMES = new Map<string, 'user' | 'system'>([
  ['apu-webid', 'user'],
  ['9router', 'user'],
  ['mitm-router', 'user'],
  ['apu-backend', 'user'],
  ['caddy', 'system'],
  ['cloudflared', 'system'],
  ['apu-webid-next', 'user'],
  ['apu-ecosystem', 'user'],
]);
```

#### 2. Service Name & Action Normalization:
Support both `.service` and bare service names, as well as verb variants:

```ts
const SERVICE_ACTION_MAP: Record<string, string> = {
  restart_service: 'restart',
  stop_service: 'stop',
  start_service: 'start',
  restart: 'restart',
  stop: 'stop',
  start: 'start',
};
```

#### 3. Dual Payload Handling in POST `/api/v1/processes`:
```ts
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON tidak valid' }, { status: 400 });
  }

  try {
    // Normalization: support action || command, serviceName || service
    const rawAction = String(body.action || body.command || '').trim();
    const rawService = String(body.serviceName || body.service || '').trim();
    const rawPid = body.pid !== undefined ? Number(body.pid) : undefined;

    // --- CASE 1: Service Actions ---
    if (rawService && rawAction) {
      const systemctlAction = SERVICE_ACTION_MAP[rawAction];
      if (!systemctlAction) {
        return NextResponse.json(
          { success: false, error: `Aksi service tidak valid: ${rawAction}. Didukung: restart, stop, start, restart_service, stop_service, start_service` },
          { status: 400 }
        );
      }

      // Strip .service suffix for whitelist lookup
      const serviceName = rawService.replace(/\.service$/, '');

      if (!SERVICE_NAME_REGEX.test(serviceName)) {
        return NextResponse.json({ success: false, error: `Nama service tidak valid: ${rawService}` }, { status: 400 });
      }

      const serviceMode = ALLOWED_SERVICE_NAMES.get(serviceName);
      if (!serviceMode) {
        return NextResponse.json(
          { success: false, error: `Service '${rawService}' tidak terdaftar dalam whitelist yang diizinkan.` },
          { status: 403 }
        );
      }

      try {
        if (serviceMode === 'system') {
          execFileSync('sudo', ['-n', 'systemctl', systemctlAction, `${serviceName}.service`], { encoding: 'utf-8' });
        } else {
          execFileSync('systemctl', ['--user', systemctlAction, `${serviceName}.service`], { encoding: 'utf-8' });
        }

        return NextResponse.json({
          success: true,
          message: `Executed: systemctl ${serviceMode === 'system' ? '' : '--user '}${systemctlAction} ${serviceName}.service — Done.`,
          service: serviceName,
          action: systemctlAction,
        });
      } catch (err: unknown) {
        console.error(`systemctl ${systemctlAction} ${serviceName}.service gagal:`, err instanceof Error ? err.message : err);
        return NextResponse.json(
          {
            success: false,
            error: `systemctl ${systemctlAction} ${serviceName}.service gagal — cek log sistem / izin sudo.`,
          },
          { status: 500 }
        );
      }
    }

    // --- CASE 2: Process PID Actions ---
    if (rawPid !== undefined && !isNaN(rawPid) && rawAction) {
      if (!ALLOWED_PROCESS_ACTIONS.has(rawAction)) {
        return NextResponse.json({ success: false, error: `Aksi proses tidak dikenal: ${rawAction}` }, { status: 400 });
      }

      // Verify process belongs to user 'apu'
      let procUser = '';
      try {
        procUser = execFileSync('ps', ['-o', 'user=', '-p', String(rawPid)], { encoding: 'utf-8' }).trim();
      } catch {
        return NextResponse.json({ success: false, error: `Proses PID ${rawPid} tidak ditemukan` }, { status: 404 });
      }
      if (procUser !== 'apu') {
        return NextResponse.json(
          { success: false, error: `Proses PID ${rawPid} milik user '${procUser}', bukan 'apu'. Aksi ditolak.` },
          { status: 403 }
        );
      }

      const signalMap: Record<string, NodeJS.Signals> = {
        kill: 'SIGKILL',
        terminate: 'SIGTERM',
        pause: 'SIGSTOP',
        resume: 'SIGCONT',
      };
      const signal = signalMap[rawAction];
      try {
        process.kill(rawPid, signal);
        return NextResponse.json({
          success: true,
          message: `Proses PID ${rawPid} menerima ${signal}.`,
          pid: rawPid,
          action: rawAction,
        });
      } catch (err: unknown) {
        console.error(`Gagal ${rawAction} PID ${rawPid}:`, err instanceof Error ? err.message : err);
        return NextResponse.json(
          { success: false, error: `Gagal mengirim ${signal} ke PID ${rawPid} — coba lagi nanti.` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Instruksi tidak dikenal. Wajib menyertakan (action/command + serviceName/service) atau (action + pid).',
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error('POST /api/v1/processes gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal saat memproses permintaan — coba lagi nanti.' },
      { status: 500 }
    );
  }
}
```

---

## 3. UI Component Alignment (`components/AdminControlTab.tsx`)

In `components/AdminControlTab.tsx`:
Update `handleRestartService` payload to align with standardized fields while remaining backward compatible:
```ts
const handleRestartService = async (serviceName: string) => {
  try {
    setRestartingService(serviceName);
    const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') || '' : '';
    const res = await fetch('/api/v1/processes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'restart_service', serviceName }),
    });
    const data = await res.json();
    if (data.success) {
      showNotification('success', `Service ${serviceName} berhasil di-restart!`);
      setTimeout(() => fetchServices(), 2000);
    } else {
      showNotification('error', data.error || `Gagal restart ${serviceName}`);
    }
  } catch (err: any) {
    showNotification('error', err.message || `Error restarting ${serviceName}`);
  } finally {
    setRestartingService(null);
  }
};
```

And update the quick control buttons list to accurately reflect all 6 managed services:
```tsx
{[
  { name: 'apu-webid.service', label: 'Next.js 16 Hub', port: '3100' },
  { name: '9router.service', label: '9Router AI Gateway', port: '20128' },
  { name: 'mitm-router.service', label: 'MITM Router Proxy', port: '20129' },
  { name: 'apu-backend.service', label: 'Bun/Hono API Engine', port: '8000' },
  { name: 'caddy.service', label: 'Caddy Web Server', port: '80/443' },
  { name: 'cloudflared.service', label: 'Cloudflare Tunnel', port: 'N/A' },
].map((svc) => ( ... ))}
```

---

## 4. Verification & Testing Matrix

| Test Scenario | Method | Headers / Body | Expected HTTP Status & Output |
|---|---|---|---|
| Unauthenticated GET `/api/v1/keuangan` | `GET` | No auth header | `403 Forbidden` (`{ "message": "Access denied. Fuck you!" }`) |
| Authenticated GET `/api/v1/keuangan` | `GET` | `Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd` | `200 OK` (`{ "success": true, "summary": {...} }`) |
| Unauthenticated GET `/api/v1/processes` | `GET` | No auth header | `403 Forbidden` |
| Authenticated GET `/api/v1/processes` | `GET` | `Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd` | `200 OK` (`{ "success": true, "services": [...], "processes": [...] }`) |
| POST `/api/v1/processes` restart allowed service | `POST` | `{"action":"restart_service","serviceName":"9router"}` + Bearer | `200 OK` (`{ "success": true, ... }`) |
| POST `/api/v1/processes` restart with `command` & `service` | `POST` | `{"command":"restart","service":"apu-webid.service"}` + Bearer | `200 OK` (`{ "success": true, ... }`) |
| POST `/api/v1/processes` illegal service name | `POST` | `{"action":"restart_service","serviceName":"unauthorized-service"}` + Bearer | `403 Forbidden` (`{ "success": false, "error": "...tidak terdaftar..." }`) |
| POST `/api/v1/processes` unauthenticated | `POST` | `{"action":"restart_service","serviceName":"apu-webid"}` (No auth) | `403 Forbidden` |
