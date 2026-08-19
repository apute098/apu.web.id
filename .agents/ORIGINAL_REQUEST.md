# Original User Request

## 2026-08-14T04:38:00Z

Refactor apu.web.id into a high-end AI Knowledge Hub & Showcase with deep visual design polish (Awwwards-tier), Double-Bezel nested architecture, 9Router AI Gateway integration, verified AI prompt library, and restricted Admin Control panel (User Approvals, Keuangan, Telemetri, & Daemon Control).

Working directory: /home/apu/projects/apu.web.id
Integrity mode: development

## Requirements

### R1. Public AI Hub Portal & Knowledge Directory
Interactive AI models showcase (DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o, Gemini 1.5), 1-click copy AI prompt library, and 9Router local AI gateway integration guide (http://localhost:20128/v1).

### R2. Restricted Admin Master Control Area (#admin)
Restricted to authenticated master admin session. Houses 4 sub-panels: User Approvals, Keuangan Dashboard, Server Telemetry (Arch Linux metrics), and Systemd Daemon Quick Control.

### R3. Awwwards-Tier High-End Visual Design & Fluid Motion
Floating Island Glass Navbar, Doppelrand (Double-Bezel) nested card architecture, Button-in-Button CTA buttons with trailing circular icons, OLED Dark Mode (#05050d), and spring cubic-bezier transitions (cubic-bezier(0.32,0.72,0,1)).

## Acceptance Criteria

### Verification & Build
- [ ] NODE_OPTIONS="--max-old-space-size=4096" bun run build compiles with 0 errors and 0 TypeScript warnings.
- [ ] systemctl --user status apu-webid.service is active (running).
- [ ] curl -i http://localhost:3100/ returns HTTP 200 OK.
- [ ] curl -i http://localhost:3100/robots.txt returns HTTP 200 OK.
- [ ] Non-authenticated users cannot access Keuangan or Router control panels without admin authentication.
