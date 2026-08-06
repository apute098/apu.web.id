import { promises as fs } from 'fs';
import path from 'path';

export interface OAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  token_ttl_seconds: number;
}

export interface AuthEntry {
  client_id: string;
  redirect_uri?: string;
  expires: number;
}

const OAUTH_FILE = path.join(process.cwd(), 'data', 'oauth.json');

export async function loadConfig(): Promise<OAuthConfig> {
  try {
    return JSON.parse(await fs.readFile(OAUTH_FILE, 'utf8'));
  } catch {
    return {} as OAuthConfig;
  }
}

// Store in-memory shared antar route (globalThis singleton — aman untuk server runtime)
declare global {
  var __oauthStore: { codes: Map<string, AuthEntry>; tokens: Map<string, AuthEntry> } | undefined;
}

export function getStore() {
  if (!globalThis.__oauthStore) {
    globalThis.__oauthStore = { codes: new Map(), tokens: new Map() };
  }
  return globalThis.__oauthStore;
}
