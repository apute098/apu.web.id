'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'subtle' | 'deck';
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  interactive = false,
  ...props
}: GlassCardProps) {
  const baseClasses = 'relative rounded-2xl transition-all duration-250';

  const variantClasses = {
    default: 'deck-card',
    deck: 'deck-card',
    glow: 'deck-card border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)]',
    subtle: 'bg-slate-950/50 backdrop-blur-md border border-white/5 shadow-md',
  };

  const interactiveClasses = interactive
    ? 'hover:border-white/20 hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={twMerge(clsx(baseClasses, variantClasses[variant], interactiveClasses, className))}
      {...props}
    >
      {children}
    </div>
  );
}
