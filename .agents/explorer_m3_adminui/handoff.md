# Handoff Report: Explorer M3 (Admin Control UI & Sub-panels)

**Date**: 2026-08-14T04:46:00Z  
**Author**: Explorer M3  
**Working Directory**: `/home/apu/projects/apu.web.id/.agents/explorer_m3_adminui`  
**Target Milestone**: M3 (Admin Master Control Area & Sub-panels)  

---

## 1. Observation

Direct code observations from inspection:

1. **`components/AdminControlTab.tsx` (Lines 106–130)**:
   ```typescript
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
         body: JSON.stringify({ command: 'restart_service', service: serviceName }),
       });
       const data = await res.json();
       // ...
   ```
   **Defect**: The payload key is `{ command: 'restart_service', service: serviceName }`, whereas backend `app/api/v1/processes/route.ts` line 221 expects `{ action: 'restart_service', serviceName }`. Furthermore, `serviceName` passed from UI is e.g. `'apu-webid.service'`, whereas the whitelist checks `cleanServiceName` without `.service`.

2. **`components/AdminControlTab.tsx` (Lines 60–73 & 390–426)**:
   `fetchServices()` retrieves `json.services` from `/api/v1/processes`, but lines 402–407 iterate over a hardcoded array without utilizing the fetched `services` array to show live running status, memory, or PID.

3. **`components/finance/FinanceTab.tsx` (Lines 33–44 & 58–67)**:
   `fetchFinancialData` properly attaches `Authorization: Bearer ${token}` from `localStorage.getItem('apu_admin_token')`. However, subcomponents `OverviewCards.tsx`, `TransactionList.tsx`, `TransactionForm.tsx`, and `TransactionDetailModal.tsx` currently use legacy `.floating-card` styles instead of the Doppelrand double-bezel `#05050d` OLED theme.

4. **`components/HardwareTab.tsx` (Lines 167–292)**:
   Currently renders CPU, RAM, HDD, and Temperature metrics using `.gradient-border` and `.floating-card`. Telemetry charts render a 15-tick live buffer via `ResponsiveContainer` and `AreaChart`. Needs Doppelrand double-bezel structure.

5. **`app/page.tsx` (Lines 26–39 & 155–219)**:
   Handles login state, saving token to `localStorage.getItem('apu_admin_token')` and switching between `#admin` and public `#` tabs.

---

## 2. Logic Chain

1. From **Observation 1**, when an admin triggers a daemon restart, the backend rejects the request because `command` and `service` fields do not match `action` and `serviceName` required in `app/api/v1/processes/route.ts`. Normalizing `serviceName = serviceName.replace(/\.service$/, '')` and passing `{ action: 'restart_service', serviceName }` solves this defect completely.
2. From **Observation 2**, integrating the live `services` state from `/api/v1/processes` into Sub-panel 4 enables dynamic status indicators (active/inactive/failed), memory usage, and real-time responsiveness when a service is restarted.
3. From **Observation 3 & 4**, transforming all cards across the 4 sub-panels into Doppelrand double-bezel cards (outer `p-1 rounded-[2rem] bg-white/5 border border-white/10` + inner `rounded-[calc(2rem-0.25rem)] bg-[#05050d]`) ensures consistent Awwwards-tier visual fidelity with OLED dark styling.
4. From **Observation 5**, keeping authentication token flow standardized on `localStorage.getItem('apu_admin_token')` with `Authorization: Bearer ${token}` ensures seamless API access without unintended 403 errors across all 4 sub-panels.

---

## 3. Caveats

- **Network Whitelist**: `ALLOWED_SERVICE_NAMES` in `app/api/v1/processes/route.ts` is maintained on the backend (handled under M1). Frontend normalizes service names by stripping `.service` to match either `apu-webid`, `9router`, `mitm-router`, `apu-backend`, `caddy`, or `cloudflared`.
- **System vs User Services**: User units (`apu-webid`, `9router`, `mitm-router`, `apu-backend`) run under `systemctl --user`, whereas system units (`caddy`, `cloudflared`) run under `sudo -n systemctl`. UI provides identical responsive controls for both.
- No other caveats.

---

## 4. Conclusion

The plan for Milestone M3 (Admin Master Control UI & Sub-panels) is fully defined and ready for implementation by Implementer M3. Key deliverables:
1. **`AdminControlTab.tsx`**: 4 sub-panels (User Approvals, Keuangan, Telemetry, Daemon Quick Control) with active tab switching and live data bindings.
2. **Bearer Auth Header Injection**: Standardized `Authorization: Bearer ${adminToken}` across all client calls to `/api/v1/auth`, `/api/v1/keuangan`, `/api/v1/processes`.
3. **Payload Fix for `handleRestartService`**: Correct schema `{ action: 'restart_service', serviceName: cleanServiceName }`.
4. **Visual Polish**: Doppelrand double-bezel nested architecture, Button-in-Button CTA elements, and fluid spring transitions across `AdminControlTab.tsx`, `HardwareTab.tsx`, `FinanceTab.tsx`, `OverviewCards.tsx`, `TransactionList.tsx`, and `TransactionForm.tsx`.

---

## 5. Verification Method

To verify the implementation:
1. **Build & Type Check**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" bun run build
   ```
   Must complete with 0 TypeScript errors and 0 build warnings.
2. **Sub-panel Switching**:
   - Access `http://localhost:3100/#admin` with valid master token.
   - Click each sub-tab (User Approval, Keuangan, Telemetri Server, Daemon Control).
3. **Service Restart Action**:
   - Open browser network tab on `#admin -> services`.
   - Click restart button for `9router.service`.
   - Verify request payload is `{"action":"restart_service","serviceName":"9router"}` with header `Authorization: Bearer <token>`.
   - Verify response is `HTTP 200 OK` with success message.
4. **User Approval Mutation**:
   - On `#admin -> users`, click "Setujui" or "Tolak" on a pending user.
   - Verify POST to `/api/v1/auth` succeeds and status updates in table.
