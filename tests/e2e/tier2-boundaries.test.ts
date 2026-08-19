import { describe, test, expect } from 'bun:test';
import { getAuthHeaders, requestJson } from './helpers';

describe('Tier 2: Boundary, Security Gates & Corner Cases (E2E)', () => {
  describe('Zero-Trust Authentication Gate (403 Rejections)', () => {
    test('GET /api/v1/keuangan without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/keuangan');
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('POST /api/v1/keuangan without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jumlah: 1000 }),
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('GET /api/v1/processes without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/processes');
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('POST /api/v1/processes without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart_service', serviceName: 'caddy' }),
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('GET /api/v1/auth without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/auth');
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('POST /api/v1/auth (list_users) without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_users' }),
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('POST /api/v1/auth (approve_user) without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_user', userId: '9999' }),
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });

    test('POST /api/v1/system-status without Authorization header returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/system-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'stress' }),
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('Forbidden');
    });
  });

  describe('Invalid Token Rejection & Tamper Defense', () => {
    test('Bearer header with invalid token string is rejected with 403', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid_random_token_string_123',
        },
      });
      expect(res.status).toBe(403);
    });

    test('x-webhook-token with invalid secret is rejected with 403', async () => {
      const res = await requestJson('/api/v1/processes', {
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-token': 'wrong_secret_payload',
        },
      });
      expect(res.status).toBe(403);
    });

    test('x-telegram-bot-api-secret-token with invalid secret is rejected with 403', async () => {
      const res = await requestJson('/api/v1/auth', {
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-bot-api-secret-token': 'attacker_secret_token',
        },
      });
      expect(res.status).toBe(403);
    });

    test('Empty Bearer prefix is rejected with 403', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ',
        },
      });
      expect(res.status).toBe(403);
    });
  });

  describe('Invalid Payload & Malformed Input Handling', () => {
    test('POST /api/v1/keuangan with missing required fields returns 400 Bad Request', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jumlah: 5000 }), // missing tanggal, tipe, keterangan
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBeDefined();
    });

    test('POST /api/v1/keuangan deleting non-existent ID returns 404 Not Found', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'delete', id: '99999999' }),
      });

      expect(res.status).toBe(404);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/keuangan with empty ai_parse_chat message returns 400', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'ai_parse_chat', chatMessage: '' }),
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/processes with empty body returns 400 Bad Request', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/processes with unrecognized action returns 400', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'format_disk_destroy', serviceName: 'caddy' }),
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/processes with unauthorized service name returns 403 Forbidden', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'restart_service', serviceName: 'unauthorized_daemon' }),
      });

      expect(res.status).toBe(403);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/processes with shell injection in service name returns 400', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'restart_service', serviceName: 'caddy; cat /etc/passwd' }),
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/processes with non-existent process PID returns 404', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'pause', pid: 9999999 }),
      });

      expect(res.status).toBe(404);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/auth with registration missing password returns 400', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username: 'tester', email: 'test@example.com' }),
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
    });

    test('POST /api/v1/auth with short password (< 4 chars) returns 400', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username: `user_${Date.now()}`,
          email: `user_${Date.now()}@test.com`,
          password: '12',
        }),
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toContain('minimal 4 karakter');
    });

    test('POST /api/v1/auth login with invalid credentials returns 403', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: 'non_existent_random_user_9999',
          password: 'wrong_password_123',
        }),
      });

      expect(res.status).toBe(403);
    });

    test('POST /api/v1/system-status with auth returns 501 Not Implemented (Read-Only invariant)', async () => {
      const res = await requestJson('/api/v1/system-status', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stress: true }),
      });

      expect(res.status).toBe(501);
      expect(res.data.success).toBe(false);
    });
  });
});
