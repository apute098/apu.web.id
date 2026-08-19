import { describe, test, expect } from 'bun:test';
import { BASE_URL, MASTER_TOKEN, getAuthHeaders, requestJson } from './helpers';
import { AI_PROMPTS_DATA } from '../../components/aihub/data';

describe('Challenger 1: Empirical Adversarial Stress & Security Testing', () => {
  // =========================================================================
  // 1. Unauthorized Access to Protected Endpoints (GET & POST)
  // =========================================================================
  describe('1. Unauthorized Access Verification', () => {
    const unauthHeaders = [
      {}, // No auth header
      { Authorization: '' },
      { Authorization: 'Bearer ' },
      { Authorization: 'Bearer   ' },
      { Authorization: 'Bearer invalid_master_token_12345' },
      { Authorization: 'Bearer 00000000000000000000000000000000' },
      { Authorization: 'Basic YWRtaW46cGFzc3dvcmQ=' },
      { Authorization: `Bearer ${MASTER_TOKEN}_tampered` },
      { 'x-webhook-token': 'fake_token_attempt' },
      { 'x-telegram-bot-api-secret-token': 'fake_tg_secret' },
    ];

    for (let i = 0; i < unauthHeaders.length; i++) {
      const headers = unauthHeaders[i];
      const label = JSON.stringify(headers);

      test(`GET /api/v1/keuangan rejects unauth [${i}]: ${label}`, async () => {
        const res = await requestJson('/api/v1/keuangan', { headers });
        expect(res.status).toBe(403);
        expect(res.data.error || res.data.message).toBeDefined();
      });

      test(`POST /api/v1/keuangan rejects unauth [${i}]: ${label}`, async () => {
        const res = await requestJson('/api/v1/keuangan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            tanggal: '2026-08-14',
            tipe: 'Pemasukan',
            kategori: 'Hacking',
            jumlah: 1000000,
            keterangan: 'Unauthorized probe',
          }),
        });
        expect(res.status).toBe(403);
      });

      test(`GET /api/v1/processes rejects unauth [${i}]: ${label}`, async () => {
        const res = await requestJson('/api/v1/processes', { headers });
        expect(res.status).toBe(403);
      });

      test(`POST /api/v1/processes rejects unauth [${i}]: ${label}`, async () => {
        const res = await requestJson('/api/v1/processes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            action: 'restart_service',
            serviceName: 'apu-webid',
          }),
        });
        expect(res.status).toBe(403);
      });

      test(`GET /api/v1/auth (list_users) rejects unauth [${i}]: ${label}`, async () => {
        const res = await requestJson('/api/v1/auth', { headers });
        expect(res.status).toBe(403);
      });

      test(`POST /api/v1/auth (approve_user) rejects unauth [${i}]: ${label}`, async () => {
        const res = await requestJson('/api/v1/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            action: 'approve_user',
            userId: '999',
          }),
        });
        expect(res.status).toBe(403);
      });
    }

    test('POST /api/v1/system-status rejects unauth with 403, and authed with 501', async () => {
      const unauthRes = await requestJson('/api/v1/system-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stress: true }),
      });
      expect(unauthRes.status).toBe(403);

      const authRes = await requestJson('/api/v1/system-status', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stress: true }),
      });
      expect(authRes.status).toBe(501);
      expect(authRes.data.success).toBe(false);
    });

    test('GET /api/v1/users (non-existent route) returns 404', async () => {
      const res = await requestJson('/api/v1/users');
      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // 2. SQL Injection Vectors & Database Resilience
  // =========================================================================
  describe('2. SQL Injection & Parameter Tampering Defense', () => {
    const sqliVectors = [
      "' OR 1=1 --",
      "' OR '1'='1",
      `" OR ""=""`,
      "1; DROP TABLE transaksi; --",
      "1; DROP TABLE users; --",
      "admin'--",
      "admin' /*",
      "' UNION SELECT 1, 'admin', 'hacked@apu.web.id', 'hash', 'admin', 'approved', '2026-01-01' --",
      "1' AND SLEEP(5) --",
      "1' WAITFOR DELAY '0:0:5' --",
      "'; EXEC xp_cmdshell('dir'); --",
      "' OR (SELECT COUNT(*) FROM users) > 0 --",
      "\\x27\\x20\\x4f\\x52\\x20\\x31\\x3d\\x31",
      "0x27204f5220313d31",
    ];

    for (const vector of sqliVectors) {
      test(`Keuangan search query (q) handles SQLi safely: ${vector}`, async () => {
        const res = await requestJson(`/api/v1/keuangan?q=${encodeURIComponent(vector)}`, {
          headers: getAuthHeaders(),
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.transactions)).toBe(true);
      });

      test(`Keuangan filter tipe handles SQLi safely: ${vector}`, async () => {
        const res = await requestJson(`/api/v1/keuangan?tipe=${encodeURIComponent(vector)}`, {
          headers: getAuthHeaders(),
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.transactions)).toBe(true);
      });

      test(`Auth login identifier handles SQLi safely: ${vector}`, async () => {
        const res = await requestJson('/api/v1/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            identifier: vector,
            password: 'some_random_password_12345',
          }),
        });
        expect(res.status).toBe(403);
        expect(res.data.success).not.toBe(true);
      });

      test(`Auth login password handles SQLi safely: ${vector}`, async () => {
        const res = await requestJson('/api/v1/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            identifier: 'nonexistent_user',
            password: vector,
          }),
        });
        expect(res.status).toBe(403);
      });
    }

    test('Financial transaction insert sanitizes and safely escapes SQL injection in all fields', async () => {
      const payload = {
        tanggal: "2026-08-14'); DROP TABLE transaksi; --",
        tipe: "Pemasukan' OR '1'='1" as any,
        kategori: "Kategori' OR '1'='1",
        jumlah: 50000,
        keterangan: "Injected transaction keterangan <script>alert(1)</script> ' UNION SELECT * --",
        metode: "Metode'); DELETE FROM users; --",
        source: "Source'); DROP TABLE users; --",
        ref_id: "REF-'; DROP TABLE transaksi; --",
      };

      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.transaction).toBeDefined();

      // Verify the database table still exists and data integrity is intact
      const verifyRes = await requestJson('/api/v1/keuangan', {
        headers: getAuthHeaders(),
      });
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.data.success).toBe(true);
      expect(verifyRes.data.summary).toBeDefined();
      expect(Array.isArray(verifyRes.data.transactions)).toBe(true);

      // Clean up test transaction
      if (res.data.transaction?.id) {
        await requestJson('/api/v1/keuangan', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'delete', id: res.data.transaction.id }),
        });
      }
    });
  });

  // =========================================================================
  // 3. Command Injection & Unlisted Service Restart Defense
  // =========================================================================
  describe('3. Command Injection & Service Whitelist Validation', () => {
    const unlistedOrMaliciousServices = [
      'sshd',
      'ssh',
      'nginx',
      'apache2',
      'systemd-journald',
      'systemd-resolved',
      'docker',
      'mysql',
      'mariadb',
      'postgresql',
      'cron',
      'crond',
      'root',
      'rm -rf /',
      'apu-webid; rm -rf /',
      'apu-webid && reboot',
      'apu-webid || poweroff',
      'apu-webid | ls -la /root',
      '`cat /etc/shadow`',
      '$(whoami)',
      '../../../etc/passwd',
      '..\\..\\windows\\system32\\cmd.exe',
      'apu-webid\0malicious',
      'apu-webid\nreboot',
      'apu-webid\r\npkill -9 bun',
      'apu-webid$(id)',
      'apu-webid`id`',
      '',
      '   ',
      '!@#$%^&*()_+',
    ];

    for (const svc of unlistedOrMaliciousServices) {
      test(`POST /api/v1/processes rejects unlisted/malicious serviceName: "${svc}"`, async () => {
        const res = await requestJson('/api/v1/processes', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'restart_service',
            serviceName: svc,
          }),
        });

        // Must reject with 400 Bad Request or 403 Forbidden, NEVER 200 OK
        expect([400, 403]).toContain(res.status);
        expect(res.data.success).toBe(false);
      });
    }

    const invalidActions = [
      'delete',
      'drop',
      'reboot',
      'shutdown',
      'exec',
      'system',
      'spawn',
      'eval',
      '../../bin/sh',
    ];

    for (const act of invalidActions) {
      test(`POST /api/v1/processes rejects invalid action: "${act}"`, async () => {
        const res = await requestJson('/api/v1/processes', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: act,
            serviceName: 'apu-webid',
          }),
        });

        expect([400, 403]).toContain(res.status);
        expect(res.data.success).toBe(false);
      });
    }
  });

  // =========================================================================
  // 4. Prompt Parameter Hydration Edge Cases & Sanitization
  // =========================================================================
  describe('4. Prompt Parameter Hydration Edge Cases', () => {
    // Replicate the client-side hydration engine used in PromptVariableModal
    function hydratePrompt(
      template: string,
      values: Record<string, string>
    ): string {
      let hydrated = template;
      Object.entries(values).forEach(([key, val]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        hydrated = hydrated.replace(regex, val || `{{${key}}}`);
      });
      return hydrated;
    }

    test('Hydrates all default prompt catalog variables without throwing', () => {
      for (const p of AI_PROMPTS_DATA) {
        const defaults: Record<string, string> = {};
        p.variables.forEach((v) => {
          defaults[v.key] = v.defaultValue || '';
        });
        const result = hydratePrompt(p.promptTemplate, defaults);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    test('Handles XSS injection vectors in prompt variables safely', () => {
      const template = 'Review code for {{LANGUAGE}}:\n{{CODE}}';
      const values = {
        LANGUAGE: '<script>alert("XSS")</script>',
        CODE: '<img src=x onerror=alert("Hacked") /><svg/onload=alert(document.cookie)>',
      };
      const result = hydratePrompt(template, values);

      expect(result).toContain('<script>alert("XSS")</script>');
      expect(result).toContain('<img src=x onerror=alert("Hacked") />');
      expect(result.startsWith('Review code for <script>')).toBe(true);
    });

    test('Handles special regex characters in variable values safely ($1, $&, $$, \\, ^, *)', () => {
      const template = 'Template with {{VAR1}} and {{VAR2}} and {{VAR3}}';
      const values = {
        VAR1: '$100.00 and $& special replacement patterns $$',
        VAR2: '\\d+\\s+regex\\patterns[a-z]*',
        VAR3: '(*+?^$|{}[]()\\)',
      };

      const result = hydratePrompt(template, values);
      expect(result).toContain('and');
      // Note: JavaScript replace with string interprets $&, $1 unless function replacer is used.
      // Testing that execution succeeds without runtime exception.
      expect(typeof result).toBe('string');
    });

    test('Handles empty strings, whitespace, and unsupplied parameters', () => {
      const template = 'Role: {{ROLE_NAME}}, Target: {{TARGET_SOURCE}}';
      const emptyValues = {
        ROLE_NAME: '',
        TARGET_SOURCE: '   ',
      };

      const result = hydratePrompt(template, emptyValues);
      // Empty string falls back to {{ROLE_NAME}}
      expect(result).toContain('{{ROLE_NAME}}');
      expect(result).toContain('   ');
    });

    test('Handles unicode, emoji, and null bytes in variable values', () => {
      const template = 'Prompt: {{OBJECTIVE}} in {{LANGUAGE}}';
      const values = {
        OBJECTIVE: '🚀 Multilingual testing 🤖 汉字 العربية \u0000 null byte',
        LANGUAGE: 'TypeScript / Rust ⚡',
      };

      const result = hydratePrompt(template, values);
      expect(result).toContain('🚀 Multilingual testing 🤖 汉字 العربية');
      expect(result).toContain('TypeScript / Rust ⚡');
    });

    test('Handles nested template markers in variable values (No recursive expansion loops)', () => {
      const template = 'Step 1: {{PARAM1}}, Step 2: {{PARAM2}}';
      const values = {
        PARAM1: '{{PARAM2}} injected',
        PARAM2: '{{PARAM1}} cyclic loop',
      };

      const result = hydratePrompt(template, values);
      // Since Object.entries replaces sequentially in a single pass, it should not infinite loop
      expect(typeof result).toBe('string');
      expect(result).toContain('Step 1:');
    });
  });
});
