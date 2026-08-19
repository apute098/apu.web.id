import { describe, test, expect } from 'bun:test';
import { BASE_URL, ROUTER_URL, MASTER_TOKEN, getAuthHeaders, requestJson } from './helpers';

describe('Tier 4: Real-World Scenarios & User Journeys (E2E)', () => {
  describe('Scenario A: Complete Visitor Journey on Public AI Hub', () => {
    test('Visitor arrives at apu.web.id, explores models, verifies prompts, checks 9Router, and respects security gates', async () => {
      // 1. Visitor loads root landing page
      const landingRes = await requestJson('/');
      expect(landingRes.status).toBe(200);
      expect(typeof landingRes.data).toBe('string');
      expect(landingRes.data).toContain('apu.web.id');
      expect(landingRes.data).toContain('bg-slate-950');

      // 2. Visitor explores AI Models Showcase (Flagship LLMs)
      expect(landingRes.data).toContain('DeepSeek R1');
      expect(landingRes.data).toContain('Claude 3.7 Sonnet');
      expect(landingRes.data).toContain('GPT-4o');
      expect(landingRes.data).toContain('Gemini 1.5');

      // 3. Visitor verifies Prompt Library exists with categories
      expect(landingRes.data).toContain('Prompt Library');
      expect(landingRes.data).toContain('Senior Architect Code Reviewer');

      // 4. Visitor checks 9Router Gateway health
      const routerHealth = await requestJson(`${ROUTER_URL}/api/health`);
      expect(routerHealth.status).toBe(200);
      expect(routerHealth.data.ok).toBe(true);

      // 5. Visitor checks robots.txt policy
      const robotsRes = await requestJson('/robots.txt');
      expect(robotsRes.status).toBe(200);
      expect(robotsRes.data).toContain('Disallow: /#admin');
      expect(robotsRes.data).toContain('Disallow: /api/');

      // 6. Visitor attempts unauthorized API access -> rejected
      const unauthKeuangan = await requestJson('/api/v1/keuangan');
      expect(unauthKeuangan.status).toBe(403);

      const unauthProcesses = await requestJson('/api/v1/processes');
      expect(unauthProcesses.status).toBe(403);
    });
  });

  describe('Scenario B: Complete Admin & User Onboarding Journey', () => {
    const timestamp = Date.now();
    const testUsername = `e2e_user_${timestamp}`;
    const testEmail = `e2e_user_${timestamp}@apu.web.id`;
    const testPassword = `SecretPass_${timestamp}!`;
    let newUserId: string | null = null;
    let createdTxId: string | null = null;

    test('Full Lifecycle: User Registration -> Pending Block -> Admin Approval -> User Login -> Admin Operations -> Cleanup', async () => {
      // Step 1: New User Registration
      const regRes = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          username: testUsername,
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(regRes.status).toBe(200);
      expect(regRes.data.success).toBe(true);
      expect(regRes.data.pending).toBe(true);
      expect(regRes.data.user.status).toBe('pending');
      newUserId = regRes.data.user.id;
      expect(newUserId).toBeDefined();

      // Step 2: Unapproved User attempts to login -> 403 Forbidden
      const unapprovedLogin = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: testUsername,
          password: testPassword,
        }),
      });
      expect(unapprovedLogin.status).toBe(403);

      // Step 3: Admin logs in with Master Token
      const adminLogin = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          token: MASTER_TOKEN,
        }),
      });
      expect(adminLogin.status).toBe(200);
      expect(adminLogin.data.success).toBe(true);
      expect(adminLogin.data.user.role).toBe('admin');
      const adminHeaders = getAuthHeaders(adminLogin.data.token || MASTER_TOKEN);

      // Step 4: Admin fetches user list and sees the pending user
      const usersListRes = await requestJson('/api/v1/auth', {
        method: 'GET',
        headers: adminHeaders,
      });
      expect(usersListRes.status).toBe(200);
      expect(usersListRes.data.success).toBe(true);
      const pendingUserFound = usersListRes.data.users.find(
        (u: any) => u.username === testUsername
      );
      expect(pendingUserFound).toBeDefined();
      expect(pendingUserFound.status).toBe('pending');

      // Step 5: Admin approves the user
      const approveRes = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          action: 'approve_user',
          userId: newUserId,
        }),
      });
      expect(approveRes.status).toBe(200);
      expect(approveRes.data.success).toBe(true);

      // Step 6: Newly approved user can now successfully login!
      const approvedLogin = await requestJson('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: testUsername,
          password: testPassword,
        }),
      });
      expect(approvedLogin.status).toBe(200);
      expect(approvedLogin.data.success).toBe(true);
      expect(approvedLogin.data.user.status).toBe('approved');
      expect(approvedLogin.data.token).toBeDefined();

      // Step 7: Admin adds an operational finance transaction
      const txRes = await requestJson('/api/v1/keuangan', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          tanggal: new Date().toISOString().split('T')[0],
          tipe: 'Pengeluaran',
          kategori: 'Hardware & Listrik',
          jumlah: 120000,
          keterangan: `E2E Journey Server Electricity ${timestamp}`,
          metode: 'QRIS',
          source: 'Admin Master Control Panel',
        }),
      });
      expect(txRes.status).toBe(200);
      expect(txRes.data.success).toBe(true);
      createdTxId = txRes.data.transaction?.id;

      // Step 8: Admin checks Server Telemetry & Health
      const telemetryRes = await requestJson('/api/v1/system-status');
      expect(telemetryRes.status).toBe(200);
      expect(telemetryRes.data.status).toBe('online');
      expect(telemetryRes.data.cpu).toBeDefined();
      expect(telemetryRes.data.ram).toBeDefined();
      expect(telemetryRes.data.hdd.walMode).toBeDefined();

      // Step 9: Cleanup created transaction
      if (createdTxId) {
        await requestJson('/api/v1/keuangan', {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({ action: 'delete', id: createdTxId }),
        });
      }
    });
  });
});
