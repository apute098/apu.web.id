// Client helper: POST ber-auth. Token admin disimpan di localStorage, diminta via prompt
// kalau belum ada / 401. Token = WEBHOOK_TOKEN dari .env.local server.
const KEY = 'apu_admin_token';

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(KEY) || '';
}

export function setToken(t: string): void {
  window.localStorage.setItem(KEY, t);
}

function askToken(): string {
  const t = window.prompt('Masukkan admin token (WEBHOOK_TOKEN di .env.local server):', getToken());
  if (t) setToken(t.trim());
  return (t || '').trim();
}

async function post(url: string, body: unknown, token: string): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

export async function authedPost(url: string, body: unknown): Promise<Response> {
  let token = getToken();
  if (!token) token = askToken();
  if (!token) return post(url, body, '');
  let res = await post(url, body, token);
  if (res.status === 401) {
    const again = askToken();
    if (again && again !== token) res = await post(url, body, again);
  }
  return res;
}
