import { describe, test, expect } from 'bun:test';
import { MASTER_TOKEN, getAuthHeaders, requestJson } from './helpers';

describe('Tier 3: Cross-Feature Combinations & State Lifecycle (E2E)', () => {
  let createdTxId: string | null = null;
  const testMarker = `E2E_COMBINATION_${Date.now()}`;

  test(
    'Cross-Feature Admin Workflow: Auth -> Telemetry -> Process Query -> Finance Lifecycle',
    async () => {
    // Step 1: Admin Authentication
    const authRes = await requestJson('/api/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        token: MASTER_TOKEN,
      }),
    });

    expect(authRes.status).toBe(200);
    expect(authRes.data.success).toBe(true);
    expect(authRes.data.user.role).toBe('admin');
    const sessionToken = authRes.data.token || MASTER_TOKEN;
    const authHeaders = getAuthHeaders(sessionToken);

    // Step 2: Telemetry Check
    const telemetryRes = await requestJson('/api/v1/system-status');
    expect(telemetryRes.status).toBe(200);
    expect(telemetryRes.data.status).toBe('online');
    expect(telemetryRes.data.serverName).toBeDefined();

    // Step 3: Processes & Services Query
    const procRes = await requestJson('/api/v1/processes', {
      method: 'GET',
      headers: authHeaders,
    });
    expect(procRes.status).toBe(200);
    expect(procRes.data.success).toBe(true);
    expect(procRes.data.services.length).toBeGreaterThan(0);

    // Step 4: Baseline Finance Summary
    const initialFinRes = await requestJson('/api/v1/keuangan', {
      method: 'GET',
      headers: authHeaders,
    });
    expect(initialFinRes.status).toBe(200);
    const initialTxCount = initialFinRes.data.summary.totalTransaksi;
    const initialPemasukan = initialFinRes.data.summary.totalPemasukan;

    // Step 5: Insert Transaction with unique marker
    const insertRes = await requestJson('/api/v1/keuangan', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'Pemasukan',
        kategori: 'Client Development',
        jumlah: 250000,
        keterangan: `Income Test Marker ${testMarker}`,
        metode: 'BCA',
        source: 'Automated Tier 3 Test',
      }),
    });

    expect(insertRes.status).toBe(200);
    expect(insertRes.data.success).toBe(true);
    expect(insertRes.data.transaction).toBeDefined();
    createdTxId = insertRes.data.transaction.id;
    expect(createdTxId).toBeDefined();

    // Step 6: Verify Ledger Updated
    const updatedFinRes = await requestJson('/api/v1/keuangan', {
      method: 'GET',
      headers: authHeaders,
    });
    expect(updatedFinRes.status).toBe(200);
    expect(updatedFinRes.data.summary.totalTransaksi).toBe(initialTxCount + 1);
    expect(updatedFinRes.data.summary.totalPemasukan).toBe(initialPemasukan + 250000);

    // Step 7: Search Filtering by Marker
    const searchRes = await requestJson(`/api/v1/keuangan?q=${encodeURIComponent(testMarker)}`, {
      headers: authHeaders,
    });
    expect(searchRes.status).toBe(200);
    expect(searchRes.data.transactions.length).toBe(1);
    expect(searchRes.data.transactions[0].keterangan).toContain(testMarker);

    // Step 8: AI Financial Report Generation
    const aiReportRes = await requestJson('/api/v1/keuangan', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ action: 'ai_analyze_finance' }),
    });
    expect(aiReportRes.status).toBe(200);
    expect(aiReportRes.data.success).toBe(true);
    expect(aiReportRes.data.analysisReport).toBeDefined();

    // Step 9: Cleanup Created Transaction
    if (createdTxId) {
      const deleteRes = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ action: 'delete', id: createdTxId }),
      });
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.data.success).toBe(true);

      // Verify Ledger Returned to Baseline
      const finalFinRes = await requestJson('/api/v1/keuangan', {
        headers: authHeaders,
      });
      expect(finalFinRes.data.summary.totalTransaksi).toBe(initialTxCount);
      expect(finalFinRes.data.summary.totalPemasukan).toBe(initialPemasukan);
    }
  }, 25000);

  test('Cross-Feature Alternative Auth Channels (x-webhook-token & Telegram token)', async () => {
    // Test that x-webhook-token header unlocks protected routes
    const webhookRes = await requestJson('/api/v1/keuangan', {
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-token': MASTER_TOKEN,
      },
    });
    expect(webhookRes.status).toBe(200);
    expect(webhookRes.data.success).toBe(true);

    // Test that x-telegram-bot-api-secret-token unlocks protected routes
    const tgRes = await requestJson('/api/v1/processes', {
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-bot-api-secret-token': MASTER_TOKEN,
      },
    });
    expect(tgRes.status).toBe(200);
    expect(tgRes.data.success).toBe(true);
  });
});
