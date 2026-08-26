# Security Hardening — apu.web.id

## Context
Security audit found critical data leaks:
- `/api/v1/system-status` returns 200 WITHOUT auth — exposes hostname, OS, kernel, IPs, CPU model, per-core usage, temperatures, detailed RAM/disk/network
- `/api/v1/processes` GET returns 200 WITHOUT auth — full process list with PIDs and commands
- `/api/v1/services` returns 200 WITHOUT auth — all systemd services
- `/api/v1/metrics`, `/api/v1/network`, `/api/v1/logs`, `/api/v1/docker` all public
- `lib/auth.ts` has hardcoded fallback PIN `574409` and secret `76c7cb42f88363744ac20d23377a29dd`
- Frontend components hardcode fallback IPs (192.168.1.4, 100.122.52.32) and system specs

## What to do

### 1. Create `lib/telemetry.ts`
Replace the entire file with the new clean telemetry module. This reads from `/proc/stat`, `os.totalmem()/freemem()`, `df`, `systemctl`. No hardcoded values. See the user-provided code in the conversation.

### 2. Create `app/api/admin/telemetry/route.ts`
New authenticated telemetry endpoint. GET returns sanitized telemetry JSON. Uses `getTelemetry()` from `lib/telemetry.ts`. Returns 503 on error.

### 3. Create `components/live-dashboard.tsx`
New client component that fetches from `/api/admin/telemetry` every 10 seconds. Shows CPU%, Memory%, Storage%, Uptime, Services status. Uses `MetricCard` component (check if exists, create if needed).

### 4. Create `components/metric-card.tsx`
Simple metric card component used by LiveDashboard. Accepts label, value, detail, icon, status props. Style with the existing OLED dark theme (#05050d base, slate borders).

### 5. Create `app/admin/page.tsx`
Simple page that renders `<LiveDashboard />`.

### 6. Protect existing vulnerable routes
Add `isAuthorized(req)` check to GET handler of:
- `app/api/v1/system-status/route.ts` — return `unauthorized()` if not authed
- `app/api/v1/processes/route.ts` — GET already has no auth, add it
- `app/api/v1/services/route.ts` — add auth check to GET
- `app/api/v1/metrics/route.ts` — add auth check
- `app/api/v1/network/route.ts` — add auth check
- `app/api/v1/logs/route.ts` — add auth check
- `app/api/v1/docker/route.ts` — add auth check

Keep `/api/v1/health` public (health checks are fine public).

### 7. Remove hardcoded fallback values from `components/OverviewTab.tsx`
Current code has:
```ts
const cpu = systemData?.cpu || { totalUsage: null, cores: [], model: 'Intel(R) Core(TM) CPU', freqGhz: 3.9, temperatureC: null, coreCount: 4 };
const ram = systemData?.ram || { totalGB: 16, usedGB: null, freeGB: null, usagePercent: null, cachedGB: 0 };
const net = systemData?.network || { downloadKbps: null, uploadKbps: null, activeInterface: 'wlan0', localIp: '192.168.1.4', tailscaleIp: '100.122.52.32' };
```
Replace all fallback values with null/empty defaults. Remove hardcoded IPs, model names, frequencies.

### 8. Add security headers to `next.config.ts`
Add these headers to the existing headers() config:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Robots-Tag: noindex, nofollow, noarchive
```

### 9. Create `.env.local`
```
MONITORED_SERVICES=wa-bot-go.service,agy-telegram.service
```
Do NOT put PIN, token, or API keys here.

### 10. Verify build passes
Run `bun run build` (or `npm run build`) and ensure zero errors.

## Constraints
- Project uses Next.js 16.3.0 (App Router), Bun, React 19, Tailwind CSS v4
- Working directory: `/home/apu/projects/apu.web.id`
- OLED dark theme: base `#05050d`, slate borders, cyan accents
- Use existing `lib/auth.ts` `isAuthorized()` and `unauthorized()` for auth checks
- Do NOT change `lib/auth.ts` credential values (user will rotate separately)
- Do NOT remove the existing `/api/v1/system-status` route — just add auth to it
- Do NOT touch the webhook endpoint `/api/v1/webhook/bot`
- Keep existing components working (OverviewTab, ServicesTab, etc.) — just fix the data leak

## Verification
After all changes:
1. `bun run build` passes with 0 errors
2. `curl -s https://apu.web.id/api/v1/system-status` returns 401
3. `curl -s https://apu.web.id/api/v1/processes` returns 401
4. `curl -s https://apu.web.id/api/v1/services` returns 401
5. `curl -s https://apu.web.id/api/v1/health` returns 200 (still public)
6. HTML source contains no hardcoded IPs, hostnames, or PIN values
