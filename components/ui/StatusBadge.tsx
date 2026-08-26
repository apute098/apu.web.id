'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeStatus = 'active' | 'inactive' | 'failed' | 'activating' | 'warning' | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, label, className, pulse = true }: StatusBadgeProps) {
  const styles = {
    active: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      text: label || 'ONLINE',
    },
    inactive: {
      bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
      dot: 'bg-slate-400',
      text: label || 'OFFLINE',
    },
    failed: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
      text: label || 'FAILED',
    },
    activating: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      text: label || 'RELOAD',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      text: label || 'WARN',
    },
    info: {
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      dot: 'bg-cyan-400',
      text: label || 'INFO',
    },
  };

  const current = styles[status] || styles.inactive;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border backdrop-blur-md uppercase tracking-wider',
          current.bg,
          className
        )
      )}
    >
      <span
        className={clsx(
          'led-dot',
          current.dot,
          pulse && (status === 'active' || status === 'activating') && 'animate-pulse'
        )}
      />
      {current.text}
    </span>
  );
}
