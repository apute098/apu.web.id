# TEST_INFRA.md — E2E Test Infrastructure Guide

## Architecture Overview
The E2E Test Suite for **apu.web.id** is built using **TypeScript** and the native **Bun Test Runner** (`bun:test`). It executes requirement-driven, opaque-box integration and end-to-end tests against the live Next.js application, API endpoints, 9Router AI Gateway, and Arch Linux system integrations.

```
tests/
└── e2e/
    ├── helpers.ts                  # Shared test client, config & auth helpers
    ├── tier1-features.test.ts      # Tier 1: Feature coverage (F1 - F10)
    ├── tier2-boundaries.test.ts    # Tier 2: Boundary, 403 gates, malformed payloads
    ├── tier3-combinations.test.ts  # Tier 3: Cross-feature combinations & lifecycle
    ├── tier4-scenarios.test.ts     # Tier 4: Real-world visitor & admin journeys
    ├── aihub.test.ts               # Specialized AI Hub & 9Router gateway tests
    ├── security.test.ts            # Adversarial security & SQLi/Injection defense
    └── visual.test.ts              # Awwwards visual tokens & Doppelrand styling
```

---

## Configuration & Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `TEST_BASE_URL` | `http://localhost:3100` | Target URL for the Next.js web application |
| `ROUTER_BASE_URL` | `http://localhost:20128` | Target URL for the 9Router AI Gateway |
| `WEBHOOK_TOKEN` | Read from `.env.local` | Master Bearer Token for admin API authentication |

---

## Running Tests

### 1. Run the Complete Test Suite
```bash
bun test
```

### 2. Run by Tier or Category
```bash
# Tier 1: Feature Coverage
bun test tests/e2e/tier1-features.test.ts

# Tier 2: Boundary & Corner Cases
bun test tests/e2e/tier2-boundaries.test.ts

# Tier 3: Cross-Feature Combinations
bun test tests/e2e/tier3-combinations.test.ts

# Tier 4: Real-World Scenarios
bun test tests/e2e/tier4-scenarios.test.ts

# Visual & Layout Tokens
bun test tests/e2e/visual.test.ts

# Security & Adversarial Tests
bun test tests/e2e/security.test.ts

# AI Hub & 9Router Gateway
bun test tests/e2e/aihub.test.ts
```

### 3. Run with Custom Base URL (e.g. Staging / Alternative Port)
```bash
TEST_BASE_URL=http://localhost:3100 ROUTER_BASE_URL=http://localhost:20128 bun test
```

---

## Test Hierarchy & Coverage Matrix

| Tier | File | Test Count | Focus Areas |
|---|---|---|---|
| **Tier 1** | `tier1-features.test.ts` | 11 tests | Root HTML 200, robots.txt, AI models showcase, Prompts library, 9Router health, Auth gate, Keuangan ledger, Processes & System status |
| **Tier 2** | `tier2-boundaries.test.ts` | 24 tests | 403 unauthenticated rejection, invalid Bearer/X-Token headers, empty payloads, malformed JSON, unauthorized daemon names, invalid user registration |
| **Tier 3** | `tier3-combinations.test.ts` | 2 tests | Full lifecycle (Auth -> Telemetry -> Process Query -> Finance Transaction Insert -> Filter -> AI Report -> Transaction Delete -> Ledger Verification) |
| **Tier 4** | `tier4-scenarios.test.ts` | 2 tests | Visitor Journey (model exploration, prompt copy, 9Router inspect) & Admin Journey (user registration -> approval -> user login -> financial recording) |
| **Specialized** | `aihub.test.ts` | 4 tests | Model specs (DeepSeek, Claude, GPT-4o, Gemini), prompt categories, 9Router cURL snippet |
| **Specialized** | `security.test.ts` | 19 tests | SQL injection strings, shell command injection vectors in daemon control, privilege escalation blocks |
| **Specialized** | `visual.test.ts` | 5 tests | OLED `#05050d` base, Doppelrand double-bezel cards, Floating Glass Navbar, spring easing `cubic-bezier(0.32,0.72,0,1)` |

**Total Suite**: 67 tests, 235 assertions, 0 failures.
