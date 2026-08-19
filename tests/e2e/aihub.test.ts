import { describe, test, expect } from 'bun:test';
import { ROUTER_URL, requestJson } from './helpers';

describe('AI Knowledge Hub & 9Router Integration Specs (E2E)', () => {
  test('9Router AI Gateway health check responds with 200 and ok=true', async () => {
    const res = await requestJson(`${ROUTER_URL}/api/health`);
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
    expect(res.data.ok).toBe(true);
  });

  test('Public AI Hub Tab presents all 4 flagship AI models', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    const html = res.data as string;

    // 1. DeepSeek R1 / V3
    expect(html).toContain('DeepSeek R1');
    expect(html).toContain('DeepSeek AI');

    // 2. Claude 3.7 Sonnet
    expect(html).toContain('Claude 3.7 Sonnet');
    expect(html).toContain('Anthropic');

    // 3. GPT-4o & o3-mini
    expect(html).toContain('GPT-4o');
    expect(html).toContain('OpenAI');

    // 4. Gemini 1.5 Pro / Flash
    expect(html).toContain('Gemini 1.5');
    expect(html).toContain('Google DeepMind');
  });

  test('AI Prompt Library contains categorized prompt templates', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    const html = res.data as string;

    // Verify categories in HTML
    expect(html).toContain('Prompt Library');
    expect(html).toContain('coding');
    expect(html).toContain('agent');
    expect(html).toContain('system');
    expect(html).toContain('writing');

    // Verify sample prompt titles
    expect(html).toContain('Senior Architect Code Reviewer');
    expect(html).toContain('Agentic Workflow Task Planner');
    expect(html).toContain('System Prompt Anti-Halusinasi');
    expect(html).toContain('High-End UI/UX Frontend Prompt');
  });

  test('9Router Integration Guide includes curl snippet and endpoint specification', async () => {
    const res = await requestJson('/');
    expect(res.status).toBe(200);
    const html = res.data as string;

    expect(html).toContain('9Router AI Gateway');
    expect(html).toContain('http://localhost:20128/v1');
    expect(html).toContain('chat/completions');
  });
});
