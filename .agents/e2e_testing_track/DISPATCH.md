# DISPATCH — E2E Testing Track
Target: Build comprehensive 4-tier requirement-driven opaque-box test suite and publish TEST_READY.md.

## 2026-08-14T04:42:50Z
You are the E2E Test Suite Creator.
Working directory: /home/apu/projects/apu.web.id/.agents/e2e_testing_track
Project Workspace: /home/apu/projects/apu.web.id
User Request: Read /home/apu/projects/apu.web.id/.agents/ORIGINAL_REQUEST.md
Project Specification: Read /home/apu/projects/apu.web.id/PROJECT.md

Your Task:
1. Design and write a comprehensive, requirement-driven, opaque-box E2E test suite in TypeScript/Bun (e.g. `tests/e2e/api.test.ts`, `tests/e2e/security.test.ts`, `tests/e2e/aihub.test.ts`, `tests/e2e/visual.test.ts` or standalone test scripts with Bun test runner).
2. Cover 4 tiers of tests:
   - Tier 1: Feature Coverage (Public AI Hub models, Prompts catalog, 9Router guide & health endpoint, Admin auth gate, Keuangan endpoints, Processes endpoints, System telemetry, Robots.txt, Root page).
   - Tier 2: Boundary & Corner Cases (Unauthenticated requests getting 403, invalid tokens, invalid POST payloads, unauthorized service names, empty/malformed inputs).
   - Tier 3: Cross-Feature Combinations (Auth session flow, admin login -> fetch telemetry -> restart service -> fetch finance summary).
   - Tier 4: Real-World Scenarios (Full visitor journey exploring AI hub, copy prompt, inspect 9Router guide; Admin journey approving users, adding transaction, checking system status).
3. Create `TEST_INFRA.md` and publish `TEST_READY.md` at `/home/apu/projects/apu.web.id/TEST_READY.md` with instructions on how to run tests (e.g. `bun test`).
4. Write `analysis.md` and `handoff.md` in your working directory and notify the parent orchestrator when complete.
