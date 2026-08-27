'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SystemMetrics } from '@/types/metrics';

interface UseMetricsOptions {
  pollingInterval?: number;
  autoPoll?: boolean;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { pollingInterval = 3000, autoPoll = true } = options;

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<{ time: string; cpu: number; ram: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/metrics', { cache: 'no-store' });
      const data = await res.json();
      if (data) {
        setMetrics(data);
        setError(null);

        const nowStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
        const cpuVal = data.cpu?.usage ?? data.cpuPercent ?? 0;
        const ramVal = data.memory?.percentage ?? (data.memTotal ? Math.round((data.memUsed / data.memTotal) * 100) : 0);

        setHistory((prev) => {
          const next = [...prev, { time: nowStr, cpu: cpuVal, ram: ramVal }];
          return next.slice(-20); // Keep last 20 data points
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil metrik server');
    } finally {
      setLoading(false);
    }
  }, []);

  const manualRefetch = useCallback(() => {
    setLoading(true);
    return fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    void fetchMetrics();
    if (!autoPoll || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      void fetchMetrics();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchMetrics, autoPoll, pollingInterval]);

  return {
    metrics,
    history,
    loading,
    error,
    refetch: manualRefetch,
  };
}
