'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ServiceItem, ServicesSummary, ServiceCategory, ServiceAction } from '@/types/services';

interface UseServicesOptions {
  pollingInterval?: number;
  autoPoll?: boolean;
}

export function useServices(options: UseServicesOptions = {}) {
  const { pollingInterval = 5000, autoPoll = true } = options;

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [summary, setSummary] = useState<ServicesSummary>({ total: 0, active: 0, failed: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/services', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
        setSummary(data.summary || { total: 0, active: 0, failed: 0, inactive: 0 });
        setError(null);
      } else {
        setError(data.error || 'Gagal memuat daftar services');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Koneksi ke server terputus');
    } finally {
      setLoading(false);
    }
  }, []);

  const manualRefetch = useCallback(() => {
    setLoading(true);
    return fetchServices();
  }, [fetchServices]);

  const executeAction = useCallback(async (unit: string, action: ServiceAction, scope: 'system' | 'user' = 'user') => {
    const actionKey = `${unit}-${action}`;
    setActionInProgress(actionKey);
    try {
      const res = await fetch('/api/v1/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit, action, scope }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchServices();
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal mengeksekusi perintah' };
    } finally {
      setActionInProgress(null);
    }
  }, [fetchServices]);

  useEffect(() => {
    void fetchServices();
    if (!autoPoll || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      void fetchServices();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchServices, autoPoll, pollingInterval]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.unit.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [services, selectedCategory, search]);

  return {
    services: filteredServices,
    allServices: services,
    summary,
    loading,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    actionInProgress,
    executeAction,
    refetch: manualRefetch,
  };
}
