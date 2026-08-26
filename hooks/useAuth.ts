'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth', { cache: 'no-store' });
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithPin = useCallback(async (pin: string) => {
    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'PIN Salah' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Gagal verifikasi' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth', { method: 'DELETE' });
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loading,
    loginWithPin,
    logout,
    checkAuth,
  };
}
