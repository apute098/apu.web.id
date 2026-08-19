import { describe, test, expect } from 'bun:test';
import { BASE_URL, ROUTER_URL, MASTER_TOKEN, getAuthHeaders, requestJson } from './helpers';

describe('Tier 1: Feature Coverage (Opaque-Box E2E)', () => {
  describe('F10: Root Page & Production Invariants', () => {
    test('GET / returns 200 OK with HTML content', async () => {
      const res = await requestJson('/');
      expect(res.status).toBe(200);
      expect(typeof res.data).toBe('string');
      expect(res.data).toContain('apu.web.id');
    });

    test('GET /robots.txt returns 200 OK with proper crawl rules', async () => {
      const res = await requestJson('/robots.txt');
      expect(res.status).toBe(200);
      expect(typeof res.data).toBe('string');
      expect(res.data).toContain('User-agent: *');
      expect(res.data).toContain('Allow: /');
      expect(res.data).toContain('Disallow: /api/');
      expect(res.data).toContain('Disallow: /#admin');
      expect(res.data).toContain('Sitemap: https://apu.web.id/sitemap.xml');
    });
  });

  describe('F1 & F2: AI Hub Showcase & Prompt Catalog Elements', () => {
    test('Root page contains AI models showcase content', async () => {
      const res = await requestJson('/');
      expect(res.status).toBe(200);
      // Verify all 4 required flagship models are referenced in the UI
      expect(res.data).toContain('DeepSeek');
      expect(res.data).toContain('Claude 3.7');
      expect(res.data).toContain('GPT-4o');
      expect(res.data).toContain('Gemini');
    });

    test('Root page contains Prompt Library categories and 9Router guide references', async () => {
      const res = await requestJson('/');
      expect(res.status).toBe(200);
      expect(res.data).toContain('9Router');
      expect(res.data).toContain('Prompt');
    });
  });

  describe('F3: 9Router Gateway Integration & Health Check', () => {
    test('GET http://localhost:20128/api/health returns { ok: true }', async () => {
      const res = await requestJson(`${ROUTER_URL}/api/health`);
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.ok).toBe(true);
    });
  });

  describe('F4: Admin Authentication Gate (/api/v1/auth)', () => {
    test('POST /api/v1/auth allows master token login', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: MASTER_TOKEN,
          password: MASTER_TOKEN,
        }),
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.user).toBeDefined();
      expect(res.data.user.role).toBe('admin');
      expect(res.data.token).toBe(MASTER_TOKEN);
    });

    test('GET /api/v1/auth lists registered users when authenticated', async () => {
      const res = await requestJson('/api/v1/auth', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.users)).toBe(true);
    });
  });

  describe('F6: Keuangan Dashboard API (/api/v1/keuangan)', () => {
    test('GET /api/v1/keuangan returns financial summary and transaction list for authenticated admin', async () => {
      const res = await requestJson('/api/v1/keuangan', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.summary).toBeDefined();
      expect(typeof res.data.summary.totalPemasukan).toBe('number');
      expect(typeof res.data.summary.totalPengeluaran).toBe('number');
      expect(typeof res.data.summary.labaBersih).toBe('number');
      expect(typeof res.data.summary.totalTransaksi).toBe('number');
      expect(Array.isArray(res.data.transactions)).toBe(true);
    });

    test('POST /api/v1/keuangan allows adding a new valid transaction', async () => {
      const uniqueKet = `E2E Test Transaksi ${Date.now()}`;
      const payload = {
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'Pemasukan',
        kategori: 'Testing',
        jumlah: 75000,
        keterangan: uniqueKet,
        metode: 'Transfer',
        source: 'Bun E2E Test Suite',
      };

      const res = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.transaction).toBeDefined();
      expect(res.data.transaction.keterangan).toBe(uniqueKet);
      expect(res.data.transaction.jumlah).toBe(75000);

      // Clean up after test
      if (res.data.transaction?.id) {
        await requestJson('/api/v1/keuangan', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'delete', id: res.data.transaction.id }),
        });
      }
    });
  });

  describe('F7: Server Telemetry API (/api/v1/system-status)', () => {
    test('GET /api/v1/system-status returns real-time system metrics', async () => {
      const res = await requestJson('/api/v1/system-status');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.status).toBe('online');
      expect(res.data.os).toContain('Arch Linux');
      expect(res.data.cpu).toBeDefined();
      expect(typeof res.data.cpu.usagePercent).toBe('number');
      expect(res.data.ram).toBeDefined();
      expect(typeof res.data.ram.usagePercent).toBe('number');
      expect(res.data.hdd).toBeDefined();
      expect(typeof res.data.hdd.usagePercent).toBe('number');
      expect(res.data.temperature).toBeDefined();
      expect(res.data.network).toBeDefined();
      expect(res.data.diskIO).toBeDefined();
      expect(res.data.services).toBeDefined();
      expect(typeof res.data.services).toBe('object');
    });
  });

  describe('F8: System Processes & Daemon Quick Control (/api/v1/processes)', () => {
    test('GET /api/v1/processes returns process list and systemd service statuses', async () => {
      const res = await requestJson('/api/v1/processes', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.processes)).toBe(true);
      expect(Array.isArray(res.data.services)).toBe(true);
      expect(typeof res.data.totalProcesses).toBe('number');
      expect(typeof res.data.activeServices).toBe('number');

      // Check structure of first process item
      if (res.data.processes.length > 0) {
        const proc = res.data.processes[0];
        expect(typeof proc.pid).toBe('number');
        expect(typeof proc.name).toBe('string');
        expect(typeof proc.user).toBe('string');
      }
    });
  });
});
