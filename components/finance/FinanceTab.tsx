import React, { useState, useEffect } from 'react';
import { authedPost } from '@/lib/api';
import { Transaction } from './shared';
import { FinanceHeader } from './FinanceHeader';
import { BotChatParser } from './BotChatParser';
import { WebhookConsole } from './WebhookConsole';
import { AiAnalysisCard } from './AiAnalysisCard';
import { TransactionForm } from './TransactionForm';
import { OverviewCards } from './OverviewCards';
import { TransactionList } from './TransactionList';
import { TransactionDetailModal } from './TransactionDetailModal';
import { AlertTriangle } from 'lucide-react';

export const FinanceTab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Notification status state
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null);
  const [sendingNotify, setSendingNotify] = useState(false);

  // AI Analisa Mandiri Report State
  const [analyzingFinance, setAnalyzingFinance] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Close transaction detail modal on Escape
  useEffect(() => {
    if (!selectedTx) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTx(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTx]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/v1/keuangan?tipe=${filterType === 'All' ? '' : filterType}&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Gagal memuat data keuangan. Periksa koneksi server lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/v1/keuangan?tipe=${filterType === 'All' ? '' : filterType}&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (isMounted) setData(json);
      } catch (err) {
        if (isMounted) setError('Gagal memuat data keuangan. Periksa koneksi server lalu coba lagi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filterType, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await authedPost('/api/v1/keuangan', { action: 'delete', id });
      fetchFinancialData();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleSendNotification = async (platform: 'telegram' | 'whatsapp') => {
    try {
      setSendingNotify(true);
      setNotifyStatus(null);
      const reportMessage = `📊 *Laporan Keuangan apu.web.id*\n- Total Pemasukan: Rp ${data?.summary?.totalPemasukan?.toLocaleString('id-ID')}\n- Total Pengeluaran: Rp ${data?.summary?.totalPengeluaran?.toLocaleString('id-ID')}\n- *Laba Bersih*: Rp ${data?.summary?.labaBersih?.toLocaleString('id-ID')}\n\nDisimpan di SQLite WAL Mode (HDD Optimized).`;

      const res = await authedPost('/api/v1/notifications', {
        platform,
        message: reportMessage,
      });
      const json = await res.json();
      if (json.success) {
        setNotifyStatus(json.status);
      }
    } catch (err) {
      setNotifyStatus('Gagal mengirim notifikasi.');
    } finally {
      setSendingNotify(false);
    }
  };

  const handleAnalyzeFinance = async () => {
    try {
      setAnalyzingFinance(true);
      const res = await authedPost('/api/v1/keuangan', { action: 'ai_analyze_finance' });
      const json = await res.json();
      if (json.success) {
        setAiAnalysisResult(json);
      }
    } catch (err) {
      console.error('Failed to run AI financial analysis', err);
    } finally {
      setAnalyzingFinance(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinanceHeader
        analyzing={analyzingFinance}
        onAnalyze={handleAnalyzeFinance}
        sendingNotify={sendingNotify}
        onSendNotify={handleSendNotification}
        showForm={showForm}
        onToggleForm={() => setShowForm(!showForm)}
        notifyStatus={notifyStatus}
      />

      <BotChatParser onRecorded={fetchFinancialData} />
      <WebhookConsole onWebhookProcessed={fetchFinancialData} />

      {aiAnalysisResult && (
        <AiAnalysisCard
          result={aiAnalysisResult}
          onClose={() => setAiAnalysisResult(null)}
          onBroadcast={handleSendNotification}
        />
      )}

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSaved={fetchFinancialData} />}

      {/* Data area: skeleton while first load */}
      {loading && !data ? (
        <div className="space-y-4">
          <div className="floating-card h-24 animate-pulse bg-slate-800/50" />
          <div className="floating-card h-64 animate-pulse bg-slate-800/50" />
          <div className="floating-card h-48 animate-pulse bg-slate-800/50" />
        </div>
      ) : (
        <>
          {error && (
            <div className="floating-card border-rose-500/40 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-300">Gagal memuat data keuangan</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Server tidak merespons. Periksa koneksi lalu coba lagi.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchFinancialData}
                className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-lg shadow-[#22d3ee]/30 transition-all"
              >
                Coba lagi
              </button>
            </div>
          )}

          <OverviewCards summary={data?.summary} />
          <TransactionList
            transactions={data?.transactions || []}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterChange={setFilterType}
            onSearchChange={setSearchQuery}
            onSelect={setSelectedTx}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
          />
        </>
      )}

      {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
};