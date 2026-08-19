import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';

export interface TransactionRow {
  id: string;
  tanggal: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  jumlah: number;
  keterangan: string;
  metode: string;
  source: string;
  ref_id?: string; // serial/invoice number dari struk (untuk dedup)
}

export type NewTransaction = Omit<TransactionRow, 'id'>;

interface StatementLike {
  get(...params: (string | number)[]): Record<string, any> | undefined;
  all(...params: (string | number)[]): Record<string, any>[];
  run(...params: (string | number)[]): { changes: number; lastInsertRowid: number };
}
interface DbLike {
  exec(sql: string): void;
  prepare(sql: string): StatementLike;
  close(): void;
}

// Node 22.5+ built-in (also supported by Bun >= 1.2.9). Resolved at runtime so
// bundlers (webpack/turbopack) never try to resolve it at build time.
const getBuiltinModule = (process as any).getBuiltinModule as ((id: string) => any) | undefined;
let DatabaseSyncCtor: (new (p: string) => DbLike) | null = null;
if (typeof getBuiltinModule === 'function') {
  try {
    const m = getBuiltinModule('node:sqlite');
    if (m?.DatabaseSync) DatabaseSyncCtor = m.DatabaseSync;
  } catch {
    DatabaseSyncCtor = null;
  }
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'keuangan.db');
const JSON_PATH = path.join(DATA_DIR, 'keuangan.json');

let db: DbLike | null = null;

function initDb(): DbLike {
  if (db) return db;
  mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSyncCtor!(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transaksi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      tipe TEXT NOT NULL CHECK (tipe IN ('Pemasukan', 'Pengeluaran')),
      kategori TEXT NOT NULL DEFAULT 'Umum',
      jumlah REAL NOT NULL,
      keterangan TEXT NOT NULL,
      metode TEXT NOT NULL DEFAULT 'Transfer',
      source TEXT NOT NULL DEFAULT 'Manual Input'
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);
  // migrasi: kolom ref_id & status — idempotent
  try {
    db.exec(`ALTER TABLE transaksi ADD COLUMN ref_id TEXT DEFAULT ''`);
  } catch {
    /* kolom sudah ada — abaikan */
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'`);
  } catch {
    /* kolom sudah ada — abaikan */
  }
  return db;
}

// ---- JSON atomic fallback (runtime without node:sqlite) ----

function readJsonStore(): TransactionRow[] {
  if (!existsSync(JSON_PATH)) return [];
  try {
    const parsed = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // file corrupt / tidak terbaca → anggap kosong, jangan crash
  }
}

function writeJsonStore(rows: TransactionRow[]): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${JSON_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(rows, null, 2), 'utf8');
  renameSync(tmp, JSON_PATH); // atomic replace
}

// ---- public storage API ----

export function isJsonMode(): boolean {
  return DatabaseSyncCtor === null;
}

export function storageModeLabel(): string {
  return isJsonMode()
    ? 'JSON Atomic Storage (node:sqlite unavailable)'
    : 'SQLite WAL Mode (HDD Storage Optimized)';
}

function mapRow(row: Record<string, any>): TransactionRow {
  return {
    id: String(row.id),
    tanggal: row.tanggal as string,
    tipe: row.tipe as TransactionRow['tipe'],
    kategori: row.kategori as string,
    jumlah: Number(row.jumlah),
    keterangan: row.keterangan as string,
    metode: row.metode as string,
    source: row.source as string,
    ref_id: row.ref_id ? String(row.ref_id) : undefined,
  };
}

export function listTransactions(): TransactionRow[] {
  try {
    if (isJsonMode()) {
      return readJsonStore().slice().reverse(); // newest first
    }
    const rows = initDb().prepare('SELECT * FROM transaksi ORDER BY id DESC').all();
    return rows.map(mapRow);
  } catch (e) {
    throw new Error(`Gagal memuat transaksi: ${(e as Error).message}`);
  }
}

export function getTransactionById(id: string): TransactionRow | null {
  try {
    if (isJsonMode()) {
      return readJsonStore().find((t) => t.id === id) ?? null;
    }
    const row = initDb().prepare('SELECT * FROM transaksi WHERE id = ?').get(Number(id));
    return row ? mapRow(row) : null;
  } catch (e) {
    throw new Error(`Gagal mengambil transaksi: ${(e as Error).message}`);
  }
}

export function insertTransaction(tx: NewTransaction): TransactionRow {
  try {
    if (isJsonMode()) {
      const store = readJsonStore();
      const nextId = store.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1;
      const row: TransactionRow = { ...tx, id: String(nextId) };
      store.push(row);
      writeJsonStore(store);
      return row;
    }
    const res = initDb()
      .prepare(
        `INSERT INTO transaksi (tanggal, tipe, kategori, jumlah, keterangan, metode, source, ref_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(tx.tanggal, tx.tipe, tx.kategori, tx.jumlah, tx.keterangan, tx.metode, tx.source, tx.ref_id || '');
    const row = getTransactionById(String(res.lastInsertRowid));
    if (!row) throw new Error('Inserted transaction not found');
    return row;
  } catch (e) {
    throw new Error(`Gagal menyimpan transaksi: ${(e as Error).message}`);
  }
}

// Cari duplikat: ref_id (serial/invoice) sama ATAU (tanggal + jumlah + keterangan) sama persis.
export function findDuplicateTransaction(tx: NewTransaction): TransactionRow | null {
  try {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const candidates = (isJsonMode() ? readJsonStore() : initDb().prepare('SELECT * FROM transaksi').all().map(mapRow));
    for (const t of candidates) {
      if (tx.ref_id && t.ref_id === tx.ref_id) return t;
      if (t.tanggal === tx.tanggal && Number(t.jumlah) === Number(tx.jumlah) && norm(t.keterangan) === norm(tx.keterangan)) {
        return t;
      }
    }
    return null;
  } catch (e) {
    throw new Error(`Gagal memeriksa duplikat transaksi: ${(e as Error).message}`);
  }
}

export function deleteTransaction(id: string): boolean {
  try {
    if (isJsonMode()) {
      const store = readJsonStore();
      const next = store.filter((t) => t.id !== id);
      if (next.length === store.length) return false;
      writeJsonStore(next);
      return true;
    }
    const res = initDb().prepare('DELETE FROM transaksi WHERE id = ?').run(Number(id));
    return Number(res.changes) > 0;
  } catch (e) {
    throw new Error(`Gagal menghapus transaksi: ${(e as Error).message}`);
  }
}

export function clearTransactions(): void {
  try {
    if (isJsonMode()) {
      writeJsonStore([]);
      return;
    }
    initDb().exec('DELETE FROM transaksi');
  } catch (e) {
    throw new Error(`Gagal mengosongkan transaksi: ${(e as Error).message}`);
  }
}

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function findUserByUsernameOrEmail(identifier: string): UserRow | null {
  try {
    if (isJsonMode()) return null;
    const row = initDb()
      .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)')
      .get(identifier, identifier);
    if (!row) return null;
    return {
      id: String(row.id),
      username: String(row.username),
      email: String(row.email),
      password_hash: String(row.password_hash),
      role: String(row.role || 'user'),
      status: (row.status as any) || 'pending',
      created_at: String(row.created_at),
    };
  } catch {
    return null;
  }
}

export function createUser(username: string, email: string, passwordHash: string, role = 'user', status = 'pending'): UserRow {
  try {
    const createdAt = new Date().toISOString();
    const res = initDb()
      .prepare('INSERT INTO users (username, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(username.trim(), email.trim().toLowerCase(), passwordHash, role, status, createdAt);
    return {
      id: String(res.lastInsertRowid),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password_hash: passwordHash,
      role,
      status: status as any,
      created_at: createdAt,
    };
  } catch (e) {
    throw new Error(`Gagal membuat akun: ${(e as Error).message}`);
  }
}

export function listAllUsers(): UserRow[] {
  try {
    if (isJsonMode()) return [];
    const rows = initDb().prepare('SELECT id, username, email, role, status, created_at FROM users ORDER BY id DESC').all();
    return rows.map((r) => ({
      id: String(r.id),
      username: String(r.username),
      email: String(r.email),
      password_hash: '',
      role: String(r.role || 'user'),
      status: (r.status as any) || 'pending',
      created_at: String(r.created_at),
    }));
  } catch {
    return [];
  }
}

export function updateUserStatus(id: string, status: 'approved' | 'rejected'): boolean {
  try {
    if (isJsonMode()) return false;
    const res = initDb().prepare('UPDATE users SET status = ? WHERE id = ?').run(status, Number(id));
    return Number(res.changes) > 0;
  } catch {
    return false;
  }
}