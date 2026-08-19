import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, unauthorized } from '@/lib/auth';
import {
  clearTransactions,
  deleteTransaction,
  insertTransaction,
  listTransactions,
  storageModeLabel,
  type NewTransaction,
  type TransactionRow,
} from '@/lib/db';
import {
  buildBotConfirmation,
  computeSummary,
  computeTrend,
  generateFinanceReport,
  parseChatAndInsert,
} from '@/lib/keuangan';

export const dynamic = 'force-dynamic';

export interface Transaction {
  id: string;
  tanggal: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  jumlah: number;
  keterangan: string;
  metode: string;
  source?: string; // e.g. "WhatsApp Auto-Bot", "Telegram Bot", "Manual Input"
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get('tipe');
    const query = searchParams.get('q');

    const all = listTransactions();
    let filtered = all;

    if (tipe && (tipe === 'Pemasukan' || tipe === 'Pengeluaran')) {
      filtered = filtered.filter((t) => t.tipe === tipe);
    }

    if (query) {
      const qLower = query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.keterangan.toLowerCase().includes(qLower) ||
          t.kategori.toLowerCase().includes(qLower) ||
          t.metode.toLowerCase().includes(qLower) ||
          (t.source && t.source.toLowerCase().includes(qLower))
      );
    }

    const summary = computeSummary(all);
    const trend = computeTrend(all);

    return NextResponse.json({
      success: true,
      summary: {
        ...summary,
        storageMode: storageModeLabel(),
      },
      monthlyTrends: trend,
      trend,
      transactions: filtered,
    });
  } catch (err: unknown) {
    console.error('GET /api/v1/keuangan gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data keuangan — coba lagi nanti.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON tidak valid' }, { status: 400 });
  }
  try {

    if (body.action === 'delete') {
      const { id } = body;
      const deleted = deleteTransaction(id as string);
      if (!deleted) {
        return NextResponse.json({ success: false, error: `Transaksi ${id} tidak ditemukan` }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Transaksi ${id} dihapus.` });
    }

    if (body.action === 'clear') {
      clearTransactions();
      return NextResponse.json({ success: true, message: 'Semua transaksi dibersihkan.' });
    }

    // AI AUTO-PARSE CHAT FROM WHATSAPP / TELEGRAM BOT
    if (body.action === 'ai_parse_chat') {
      const { chatMessage, source } = body;
      if (!chatMessage || typeof chatMessage !== 'string') {
        return NextResponse.json({ success: false, error: 'Pesan chat wajib diisi' }, { status: 400 });
      }

      const result = await parseChatAndInsert(chatMessage, (source as string) || 'WhatsApp Auto-Bot');

      return NextResponse.json({
        success: !result.duplicate,
        message: result.duplicate
          ? `Transaksi duplikat — sudah tercatat sebelumnya (ID ${result.matchedId}), tidak diinput ulang.`
          : 'Chat berhasil dideteksi dan dicatat otomatis oleh AI Hermes Agent!',
        duplicate: result.duplicate,
        transaction: result.transaction,
        botConfirmation: buildBotConfirmation(result.transaction),
      });
    }

    // AI MANDIRI FINANCIAL REPORT & ANALYZER
    if (body.action === 'ai_analyze_finance') {
      const { summary, analysisReport } = await generateFinanceReport();
      return NextResponse.json({
        success: true,
        summary,
        analysisReport,
        generatedAt: new Date().toISOString(),
      });
    }

    // Add new transaction manually
    const { tanggal, tipe, kategori, jumlah, keterangan, metode, source } = body;

    if (!tanggal || !tipe || !jumlah || !keterangan) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap (tanggal, tipe, jumlah, keterangan wajib)' }, { status: 400 });
    }

    const newTx: NewTransaction = {
      tanggal: String(tanggal),
      tipe: tipe === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      kategori: String(kategori || 'Umum'),
      jumlah: Number(jumlah),
      keterangan: String(keterangan),
      metode: String(metode || 'Transfer'),
      source: String(source || 'Manual Input'),
    };
    const saved = insertTransaction(newTx);

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil ditambahkan ke SQLite WAL Database.',
      transaction: saved as TransactionRow & Transaction,
    });
  } catch (err: unknown) {
    console.error('POST /api/v1/keuangan gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal saat memproses permintaan — coba lagi nanti.' },
      { status: 500 }
    );
  }
}
