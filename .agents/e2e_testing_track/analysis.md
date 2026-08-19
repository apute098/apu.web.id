# E2E Test Suite Analysis & Requirement Mapping

## Mission Objective
Design and implement a complete, requirement-driven, opaque-box E2E test suite in TypeScript for **apu.web.id** using Bun test runner (`bun:test`), validating all 4 tiers of testing across public and protected features.

---

## Requirements to Test Mapping

| Requirement / Feature ID | Source Contract | Test Suite File | Coverage Scope |
|---|---|---|---|
| **F1: AI Models Showcase** | ORIGINAL_REQUEST §R1, PROJECT.md | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/aihub.test.ts` | DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o & o3-mini, Gemini 1.5 Pro / Flash specs and cards |
| **F2: 1-Click Prompt Library** | ORIGINAL_REQUEST §R1, PROJECT.md | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/aihub.test.ts` | Categorized prompts (coding, agent, system, writing), parameter substitution |
| **F3: 9Router AI Gateway Guide** | ORIGINAL_REQUEST §R1, PROJECT.md §4 | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/aihub.test.ts` | Guide, cURL snippets, `GET http://localhost:20128/api/health` -> `{"ok":true}` |
| **F4: Admin Authentication Gate** | ORIGINAL_REQUEST §R2, PROJECT.md §1 | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/tier2-boundaries.test.ts` | Master Bearer Token, X-Webhook-Token, Telegram token, login / logout session |
| **F5: User Approvals Sub-panel** | ORIGINAL_REQUEST §R2, PROJECT.md | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/tier4-scenarios.test.ts` | User registration, pending status gate, admin approval action, approved login |
| **F6: Keuangan Dashboard** | ORIGINAL_REQUEST §R2, PROJECT.md §2 | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/tier3-combinations.test.ts` | Protected GET/POST, SQLite WAL persistence, transaction insertion, query search, deletion |
| **F7: Server Telemetry** | ORIGINAL_REQUEST §R2, PROJECT.md | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/tier3-combinations.test.ts` | Arch Linux kernel metrics (CPU, RAM, HDD, DiskIO, Temp, Network, Services) |
| **F8: Systemd Daemon Control** | ORIGINAL_REQUEST §R2, PROJECT.md §3 | `tests/e2e/tier1-features.test.ts`<br>`tests/e2e/tier2-boundaries.test.ts` | Service status query, safe execution, unauthorized service protection |
| **F9: Awwwards Visual System** | ORIGINAL_REQUEST §R3, PROJECT.md | `tests/e2e/visual.test.ts` | OLED base `#05050d`, Doppelrand double-bezel, Floating Island Navbar, Spring curves |
| **F10: Build & Invariants** | ORIGINAL_REQUEST §Acceptance Criteria | `tests/e2e/tier1-features.test.ts` | Root HTML 200, `robots.txt` rules (`Disallow: /api/`, `Disallow: /#admin`) |

---

## 4-Tier Test Architecture

1. **Tier 1 (Feature Coverage)**: 11 tests verifying happy paths and basic operational responses for every feature in scope.
2. **Tier 2 (Boundary & Corner Cases)**: 24 tests validating zero-trust authentication enforcement (403), token tampering resistance, invalid payloads, malformed JSON, shell injection defense, and input limits.
3. **Tier 3 (Cross-Feature Combinations)**: 2 comprehensive state lifecycle tests connecting Auth -> Telemetry -> Process Query -> Finance CRUD -> AI Analysis -> Cleanup.
4. **Tier 4 (Real-World Scenarios)**: 2 end-to-end user journeys (Visitor exploring AI Hub & Admin onboarding new user with approvals).
5. **Specialized Suites**: Visual system validation (5 tests), Adversarial security (19 tests), AI Hub specifics (4 tests).

---

## Verification Result
All 67 tests across 7 files pass cleanly with 0 errors via `bun test`.
