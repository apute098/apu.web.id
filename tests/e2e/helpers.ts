/**
 * E2E Test Suite Helpers for apu.web.id
 * Provides configuration, auth utilities, and test clients.
 */

export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3100';
export const ROUTER_URL = process.env.ROUTER_BASE_URL || 'http://localhost:20128';
export const MASTER_TOKEN = process.env.WEBHOOK_TOKEN || '';

export function getAuthHeaders(token: string = MASTER_TOKEN): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function getXTokenHeaders(token: string = MASTER_TOKEN): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-webhook-token': token,
  };
}

export function getTelegramHeaders(token: string = MASTER_TOKEN): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-telegram-bot-api-secret-token': token,
  };
}

export interface ApiResponse<T = any> {
  status: number;
  headers: Headers;
  data: T;
}

export async function requestJson<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return {
    status: res.status,
    headers: res.headers,
    data,
  };
}
