import { describe, test, expect } from 'bun:test';
import { requestJson } from './helpers';

describe('Awwwards-Tier Visual System & Layout Invariants (E2E)', () => {
  test('Root page applies OLED Dark Mode base (#05050d)', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    expect(res.data).toContain('#05050d');
  });

  test('Page contains Doppelrand (Double-Bezel) nested card architecture', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    // Double bezel pattern: outer wrapper with p-1/p-1.5, inner card with rounded-none
    expect(res.data).toContain('rounded-none');
    expect(res.data).toContain('backdrop-blur');
  });

  test('Floating Island Glass Navbar & Glassmorphic tokens are present', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    expect(res.data).toContain('sticky');
    expect(res.data).toContain('apu.web.id');
    expect(res.data).toContain('rounded-none');
  });

  test('Fluid spring easing cubic-bezier tokens are declared', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    expect(res.data).toContain('cubic-bezier(0.32');
  });

  test('Button-in-Button and active tactile click states exist', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    expect(res.data).toContain('active:scale-[0.98]');
  });
});
