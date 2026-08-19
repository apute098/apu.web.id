# Handoff Report: Security & API Protection (Milestone M1)

**Working Directory**: `/home/apu/projects/apu.web.id/.agents/explorer_m1_security`  
**Milestone**: M1 (Security & API Protection)  
**Author**: Explorer M1 (Security & API Protection Investigator)  
**Recipient**: Orchestrator / Implementer

---

## 1. Observation

1. **`lib/auth.ts` lines 5–12**:
   ```ts
   export function isAuthorized(req: NextRequest): boolean {
     const token = process.env.WEBHOOK_TOKEN;
     if (!token) return false;
     const auth = req.headers.get('authorization') || '';
     const xToken = req.headers.get('x-webhook-token') || '';
     const tgToken = req.headers.get('x-telegram-bot-api-secret-token') || '';
     return auth === `Bearer ${token}` || xToken === token || tgToken === token;
   }
   ```
   Directly observed: `token` relies solely on `process.env.WEBHOOK_TOKEN` with no fallback secret. In contrast, `app/api/v1/auth/route.ts` line 102 specifies:
   ```ts
   const masterToken = process.env.WEBHOOK_TOKEN || '76c7cb42f88363744ac20d23377a29dd';
   ```
   When `WEBHOOK_TOKEN` is unset in the runtime environment, `isAuthorized()` returns `false` for every request even when the caller passes the valid default master token.

2. **`app/api/v1/keuangan/route.ts` lines 33–35 & 80–81**:
   ```ts
   export async function GET(req: NextRequest) {
     if (!isAuthorized(req)) return unauthorized();
   ```
   ```ts
   export async function POST(req: NextRequest) {
     if (!isAuthorized(req)) return unauthorized();
   ```
   Both GET and POST handlers enforce `isAuthorized(req)` and return `unauthorized()` (HTTP 403) on failure.

3. **`app/api/v1/hermes/route.ts` lines 7–11**:
   ```ts
   const [svc, fin] = await Promise.all([
     fetch(`http://localhost:3100/api/v1/system-status`, { cache: 'no-store', signal: AbortSignal.timeout(15000) }).then((r) => r.json()).catch(() => null),
     fetch(`http://localhost:3100/api/v1/keuangan`, { cache: 'no-store', signal: AbortSignal.timeout(15000) }).then((r) => r.json()).catch(() => null),
   ]);
   ```
   `hermes/route.ts` executes an unauthenticated HTTP GET to `http://localhost:3100/api/v1/keuangan`, which is rejected with HTTP 403 once `isAuthorized` is active.

4. **`app/api/v1/processes/route.ts` lines 164–169**:
   ```ts
   const ALLOWED_SERVICE_NAMES = new Map<string, 'user' | 'system'>([
     ['caddy', 'system'],
     ['cloudflared', 'system'],
     ['apu-webid-next', 'user'],
     ['apu-ecosystem', 'user'],
   ]);
   ```
   The whitelist is missing `apu-webid`, `9router`, `mitm-router`, and `apu-backend` as required by `PROJECT.md` and `ORIGINAL_REQUEST.md`.

5. **`app/api/v1/processes/route.ts` line 221 vs `components/AdminControlTab.tsx` line 116**:
   - `route.ts`: `const { action, pid, serviceName } = body as { action?: string; pid?: number; serviceName?: string };`
   - `AdminControlTab.tsx`: `body: JSON.stringify({ command: 'restart_service', service: serviceName }),`
   - Additionally, `AdminControlTab.tsx` lines 403–406 passes unit names with the `.service` extension (e.g. `'apu-webid.service'`), whereas `route.ts` does not strip `.service` before whitelist lookup.

---

## 2. Logic Chain

1. **Premise**: From Observation 1, `lib/auth.ts` fails to validate the master token if `process.env.WEBHOOK_TOKEN` is unset in process environment.
   - **Inference**: Unifying the token fallback (`process.env.WEBHOOK_TOKEN || process.env.MASTER_TOKEN || '76c7cb42f88363744ac20d23377a29dd'`) in `lib/auth.ts` ensures consistent authorization behavior across all environments.
   - **Header support**: Supporting `auth === 'Bearer ' + token` and `auth === token` prevents header format mismatches.

2. **Premise**: From Observation 2 & 3, `GET /api/v1/keuangan` strictly requires auth. `hermes/route.ts` fails because it calls `/api/v1/keuangan` via an unauthenticated internal HTTP fetch.
   - **Inference**: Calling in-memory `listTransactions()` and `computeSummary()` inside `hermes/route.ts` instead of an HTTP fetch eliminates the self-inflicted 403 failure and improves performance.

3. **Premise**: From Observation 4, the service whitelist in `app/api/v1/processes/route.ts` lacks core production services (`apu-webid`, `9router`, `mitm-router`, `apu-backend`).
   - **Inference**: Expanding `ALLOWED_SERVICE_NAMES` to include `apu-webid` (`user`), `9router` (`user`), `mitm-router` (`user`), `apu-backend` (`user`), `caddy` (`system`), `cloudflared` (`system`) satisfies the specification. Retaining `apu-webid-next` and `apu-ecosystem` ensures backwards compatibility.

4. **Premise**: From Observation 5, payload keys differ between client (`command`, `service`) and server (`action`, `serviceName`), and service strings may include `.service`.
   - **Inference**: In `POST /api/v1/processes`, extracting `rawAction = body.action || body.command` and `rawService = body.serviceName || body.service`, mapping actions via `SERVICE_ACTION_MAP`, and stripping `.service` with `.replace(/\.service$/, '')` guarantees 100% interoperability.

---

## 3. Caveats

- **Root Privilege Boundary**: System-level services (`caddy`, `cloudflared`) execute via `sudo -n systemctl <action> <unit>.service`. If the `apu` user does not have passwordless sudo permission for systemctl, system unit actions will return a 500 error. User units (`apu-webid`, `9router`, etc.) execute via `systemctl --user` without needing sudo.
- **Alternative Interpretations**: We considered removing process PID actions (kill/terminate), but opted to retain them with strict user `'apu'` ownership verification.

---

## 4. Conclusion

All necessary specifications and code implementations are finalized in `/home/apu/projects/apu.web.id/.agents/explorer_m1_security/analysis.md`. The implementer can immediately apply the changes to:
1. `lib/auth.ts` (token fallback & header verification)
2. `app/api/v1/processes/route.ts` (whitelist expansion, dual payload extraction, service name normalization, action verb mapping)
3. `app/api/v1/hermes/route.ts` (direct in-memory context resolution)
4. `components/AdminControlTab.tsx` (standardized service list and payload dispatch)

---

## 5. Verification Method

To verify the fixes once implemented:

1. **Unauthenticated GET requests return 403 Forbidden**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/v1/keuangan
   # Expected: 403

   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/v1/processes
   # Expected: 403
   ```

2. **Authenticated GET requests return 200 OK**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd" http://localhost:3100/api/v1/keuangan
   # Expected: 200

   curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd" http://localhost:3100/api/v1/processes
   # Expected: 200
   ```

3. **Daemon Control Payload Normalization & Whitelist Verification**:
   - Restart with `action` and `serviceName`:
     ```bash
     curl -s -X POST http://localhost:3100/api/v1/processes \
       -H "Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd" \
       -H "Content-Type: application/json" \
       -d '{"action":"restart_service","serviceName":"apu-webid"}'
     ```
   - Restart with `command` and `service` + `.service` suffix:
     ```bash
     curl -s -X POST http://localhost:3100/api/v1/processes \
       -H "Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd" \
       -H "Content-Type: application/json" \
       -d '{"command":"restart","service":"9router.service"}'
     ```
   - Disallowed service returns 403:
     ```bash
     curl -s -X POST http://localhost:3100/api/v1/processes \
       -H "Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd" \
       -H "Content-Type: application/json" \
       -d '{"action":"restart_service","serviceName":"ssh"}'
     # Expected: 403 Forbidden with error message
     ```
