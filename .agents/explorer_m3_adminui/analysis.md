# Analysis & Implementation Plan: Admin Master Control UI & Sub-panels (M3)

**Target**: `apu.web.id` (Next.js 16 + React 19 + Tailwind CSS v4 + Arch Linux)  
**Agent**: Explorer M3 (Admin Control UI & Sub-panels)  
**Timestamp**: 2026-08-14T04:45:00Z  
**Integrity Mode**: Read-only Investigation & Planning  

---

## 1. Executive Summary

Milestone M3 establishes the **Restricted Admin Master Control Area (`#admin`)** containing 4 fully-featured, authenticated sub-panels:
1. **User Approvals Sub-panel** (`#admin -> users`): Review, search, approve, and reject user registration whitelist requests with live status badges and toast feedback.
2. **Keuangan Dashboard Sub-panel** (`#admin -> keuangan`): Cashflow overview, monthly trend charts, filtered transaction ledger, manual transaction entry, and AI financial analysis.
3. **Server Telemetry Sub-panel** (`#admin -> telemetri`): Real-time Arch Linux kernel metrics (CPU, RAM, HDD WAL mode, lm_sensors temperature, network rate, disk I/O, 15-tick live AreaChart).
4. **Systemd Daemon Quick Control Sub-panel** (`#admin -> services`): Live daemon service monitoring (`apu-webid`, `9router`, `mitm-router`, `apu-backend`, `caddy`, `cloudflared`) with service memory, port info, restart/start/stop controls, and top process monitor.

This document details the architectural findings, security requirements (Bearer auth header on all client requests), bug fixes (payload schema for `handleRestartService`), and concrete file change specifications adhering to the **Doppelrand (Double-Bezel) OLED design system**.

---

## 2. Comprehensive Sub-Panel Architecture

### Sub-Panel 1: User Approval Management (`#admin -> users`)
- **Backend API**: `GET /api/v1/auth` (or `POST /api/v1/auth` `{ action: 'list_users' }`) and `POST /api/v1/auth` `{ action: 'approve_user' | 'reject_user', userId: string }`.
- **Authentication**: `Authorization: Bearer ${adminToken}` header required on all calls.
- **Key Features**:
  - 3 Quick KPI Cards: Pending Approval (amber pulse), User Disetujui (emerald), User Ditolak (rose).
  - Search & filter: Real-time filter by username, email, or role.
  - Action buttons: "Setujui" (green) and "Tolak" (red) with Button-in-Button design and instant table refresh.
  - Toast notification banner: Success and error messages with slide-in animation.
  - Empty and loading states with skeleton loaders.

### Sub-Panel 2: Keuangan & Cashflow Dashboard (`#admin -> keuangan`)
- **Backend API**: `GET /api/v1/keuangan?tipe=...&q=...` and `POST /api/v1/keuangan` `{ action: 'delete' | 'clear' | 'ai_analyze_finance' }` or transaction insertion.
- **Authentication**: `Authorization: Bearer ${adminToken}` header required on all GET/POST calls.
- **Key Features**:
  - `OverviewCards.tsx`: Total Pemasukan, Total Pengeluaran, Laba Bersih, and Monthly BarChart with Doppelrand double-bezel styling.
  - `TransactionList.tsx`: Filterable table (All / Pemasukan / Pengeluaran), live search input, modal transaction detail view, and delete action.
  - `TransactionForm.tsx`: Double-bezel modal/card for adding new transactions (date, type, category, amount, payment method, description).
  - `TransactionDetailModal.tsx`: Accessible dialog popup with full transaction metadata.

### Sub-Panel 3: Server Telemetry (`#admin -> telemetri`)
- **Backend API**: `GET /api/v1/system-status` (polled every 4 seconds via `app/page.tsx`).
- **Component**: `components/HardwareTab.tsx`.
- **Key Features**:
  - Server status banner: OS version (`Arch Linux 7.1.6-zen`), uptime, and `SQLite WAL Mode Active` badge.
  - Metric cards: CPU % (with core count and model), RAM % (with used/total GB), HDD Storage % (with TB free and WAL badge), CPU Temperature (with lm_sensors reading and color thresholding).
  - Bandwidth & Disk I/O cards: Download/Upload MB/s and Disk Read/Write MB/s.
  - Recharts AreaChart: 15-tick live buffer with cyan/emerald/sky gradient fills.
  - Manual refresh button with spinning icon animation.

### Sub-Panel 4: Systemd Daemon Quick Control (`#admin -> services`)
- **Backend API**: `GET /api/v1/processes` (fetches active services & top 20 processes) and `POST /api/v1/processes` `{ action: 'restart_service' | 'start_service' | 'stop_service', serviceName: string }`.
- **Authentication**: `Authorization: Bearer ${adminToken}` header required on all calls.
- **Key Features**:
  - Services Grid:
    - User Units: `apu-webid.service` (Next.js 16, Port 3100), `9router.service` (AI Gateway, Port 20128), `mitm-router.service` (MITM Proxy, Port 20129), `apu-backend.service` (Bun API, Port 8000), `apu-ecosystem.service`.
    - System Units: `caddy.service` (Reverse Proxy, Port 80/443), `cloudflared.service` (Cloudflare Tunnel).
  - Live status indicator: Pulsing green dot for `active (running)`, red for `inactive (dead)` / `failed`.
  - Memory consumption badge and description for each service.
  - Quick action restart button: Calls `handleRestartService(serviceName)` with spinning indicator.
  - Top 20 System Process Inspector: Table displaying PID, User, CPU %, RAM MB, State, Command, with search and terminate action.

---

## 3. Security & Bearer Header Enforcement

All client fetch requests to protected API endpoints MUST include the `Authorization` header retrieved from `localStorage.getItem('apu_admin_token')`:

```typescript
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') || '' : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
```

### Endpoints Requiring Bearer Token:
1. `GET /api/v1/auth` & `POST /api/v1/auth` (User lists, status mutations)
2. `GET /api/v1/keuangan` & `POST /api/v1/keuangan` (Financial ledger, transaction mutations)
3. `GET /api/v1/processes` & `POST /api/v1/processes` (Daemon statuses, restart/kill actions)
4. `POST /api/v1/notifications` (Telegram bot alerts)

---

## 4. Daemon Quick Control & `handleRestartService` Fix

### Current Bug in `components/AdminControlTab.tsx`:
```typescript
// Line 116 in AdminControlTab.tsx (BROKEN):
body: JSON.stringify({ command: 'restart_service', service: serviceName })
```

### Root Cause:
Backend route `app/api/v1/processes/route.ts` line 221-264 expects:
1. Key `action` instead of `command`.
2. Key `serviceName` instead of `service`.
3. Whitelisted service names without the `.service` suffix (e.g. `'apu-webid'`, `'9router'`).

### Fixed Implementation:
```typescript
const handleRestartService = async (serviceName: string) => {
  try {
    setRestartingService(serviceName);
    const token = typeof window !== 'undefined' ? localStorage.getItem('apu_admin_token') || '' : '';
    const cleanServiceName = serviceName.replace(/\.service$/, '');
    
    const res = await fetch('/api/v1/processes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'restart_service', serviceName: cleanServiceName }),
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      showNotification('success', data.message || `Service ${cleanServiceName} berhasil di-restart!`);
      setTimeout(() => fetchServices(), 1500);
    } else {
      showNotification('error', data.error || `Gagal restart ${cleanServiceName}`);
    }
  } catch (err: any) {
    showNotification('error', err.message || `Error restarting ${serviceName}`);
  } finally {
    setRestartingService(null);
  }
};
```

---

## 5. Visual System & Doppelrand Double-Bezel Card Specifications

### 1. Doppelrand Double-Bezel Outer-Inner Architecture:
- **Outer Shell**: `p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 via-white/5 to-white/0 border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden group`
- **Inner Core**: `rounded-[calc(2.5rem-0.25rem)] bg-[#05050d] p-6 md:p-8 relative z-10`
- **Sub-Cards / Metric Containers**: `p-1 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]` with inner `rounded-[calc(1rem-0.25rem)] bg-[#05050d] p-4`

### 2. Button-in-Button Component Pattern:
- **Style**: Pill button with embedded circular badge / icon container.
- **Example**:
```tsx
<button
  onClick={() => handleUpdateStatus(u.id, 'approve_user')}
  className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-[0.98] transition-all duration-300 text-xs font-semibold"
>
  <span>Setujui</span>
  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
    <UserCheck className="w-3 h-3 text-emerald-300" />
  </span>
</button>
```

### 3. Motion & Transitions:
- Easing: `transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`
- Active Click: `active:scale-[0.98]`
- Ambient Glow: Radial cyan/emerald blur orbs positioned absolutely behind inner cards (`pointer-events-none`).

---

## 6. Exact File-by-File Implementation Changes

### File 1: `components/AdminControlTab.tsx`
- **Changes**:
  1. Add full state for services list, process list, search query for users, and search query for processes.
  2. Implement sub-tab navigation with 4 tabs: User Approvals, Keuangan, Telemetri Server, Daemon Quick Control.
  3. Fix `handleRestartService` payload to `{ action: 'restart_service', serviceName: cleanServiceName }` with `Authorization: Bearer ${token}`.
  4. Implement live daemon status cards connected to `fetchServices()` data.
  5. Include Top 20 Process Manager table in Daemon sub-tab.
  6. Apply Doppelrand double-bezel card markup and Button-in-Button CTA elements.

### File 2: `components/finance/FinanceTab.tsx` & Subcomponents
- **`FinanceTab.tsx`**:
  - Ensure all `fetch('/api/v1/keuangan')` calls include `Authorization: Bearer ${token}` header.
  - Pass token to `TransactionForm`, `OverviewCards`, `TransactionList`.
- **`OverviewCards.tsx`**:
  - Upgrade KPI cards and Monthly Trend BarChart to Doppelrand double-bezel styling with `#05050d` background and crisp typography.
- **`TransactionList.tsx`**:
  - Upgrade table header, rows, search bar, and filter buttons to Doppelrand design with Button-in-Button delete and add actions.
- **`TransactionForm.tsx`**:
  - Upgrade form container to Doppelrand double-bezel modal with `#05050d` backdrop and smooth input focus rings.
- **`TransactionDetailModal.tsx`**:
  - Upgrade modal dialog to double-bezel card with backdrop blur and fluid exit animations.

### File 3: `components/HardwareTab.tsx`
- **Changes**:
  - Upgrade metric cards (CPU, RAM, HDD, Temp, Net, Disk I/O) to Doppelrand double-bezel architecture.
  - Ensure responsive layout (grid 1-col on mobile, 4-col on desktop).
  - Polish Recharts AreaChart styling with cyan `#22d3ee` and emerald `#10b981` gradients.
  - Modernize server header banner with Arch Linux and SQLite WAL badges.

### File 4: `app/page.tsx`
- **Changes**:
  - Ensure Master Login Gate features Doppelrand styling with `#05050d` background.
  - Verify token persistence in `localStorage.setItem('apu_admin_token', ...)`.
  - Pass `systemData`, `systemError`, `refreshing`, `onManualRefreshSystem` props to `AdminControlTab`.

---

## 7. Verification & Acceptance Checklist

| # | Test Case | Target | Expected Result |
|---|-----------|--------|-----------------|
| 1 | Sub-panel navigation | `#admin` | Seamless switching across 4 tabs with active pill indicator |
| 2 | User Approval action | `#admin -> users` | Approve/Reject sends POST with Bearer token; updates status in SQLite |
| 3 | Keuangan load & mutate | `#admin -> keuangan` | GET and POST `/api/v1/keuangan` succeed with Bearer header |
| 4 | Daemon service restart | `#admin -> services` | Restart button sends `{ action: 'restart_service', serviceName: '...' }`; returns 200 OK |
| 5 | Live Telemetry charts | `#admin -> telemetri` | Sensor updates every 4s; 15-tick AreaChart renders smoothly |
| 6 | TypeScript & Build | `bun run build` | 0 errors, 0 warnings |
