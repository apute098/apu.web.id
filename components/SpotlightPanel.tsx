'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from 'motion/react';

interface SpotlightPanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Liquid-glass panel with a soft spotlight that follows the cursor.
 * Uses only `motion` primitives (useMotionValue + useMotionTemplate) and
 * disables tracking entirely under prefers-reduced-motion.
 */
export function SpotlightPanel({ children, className = '' }: SpotlightPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const spotlight = useMotionTemplate`
    radial-gradient(
      420px circle at ${mouseX}px ${mouseY}px,
      rgba(6, 182, 212, 0.16),
      rgba(16, 185, 129, 0.06) 40%,
      transparent 70%
    )
  `;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: spotlight }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
