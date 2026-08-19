# DISPATCH — Explorer M3 Admin UI
Target: Detailed implementation plan for M3 (Admin master control sub-panels: User Approvals, Keuangan, Telemetry, Daemon Quick Control with proper auth headers and error handling).

## 2026-08-14T04:42:51Z
User Request:
You are Explorer M3 (Admin Control UI & Sub-panels).
Working directory: /home/apu/projects/apu.web.id/.agents/explorer_m3_adminui
Project Workspace: /home/apu/projects/apu.web.id
User Request: Read /home/apu/projects/apu.web.id/.agents/ORIGINAL_REQUEST.md
Project Specification: Read /home/apu/projects/apu.web.id/PROJECT.md

Your Task:
1. Examine `/home/apu/projects/apu.web.id/components/AdminControlTab.tsx`, `FinanceTab.tsx`, `ProcessManagerTab.tsx`, `SystemStatusTab.tsx`, and `app/page.tsx`.
2. Formulate the concrete implementation plan for:
   - 4 sub-panels: User Approvals, Keuangan Dashboard, Server Telemetry, Systemd Daemon Quick Control.
   - Ensuring all client fetch requests include `Authorization: Bearer ${adminToken}` header.
   - Fixing `handleRestartService` payload to match `{ action: 'restart_service', serviceName }`.
   - Polishing the UI with Doppelrand double-bezel cards, OLED dark styling, and fluid transitions.
3. Detail the exact file changes needed.
4. Output your plan to `/home/apu/projects/apu.web.id/.agents/explorer_m3_adminui/analysis.md` and `handoff.md`.
5. Send a message to the orchestrator when complete.

Do NOT modify source files directly.

