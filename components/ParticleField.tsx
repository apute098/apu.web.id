'use client';

import React, { useEffect, useRef } from 'react';

/**
 * ParticleField — 3D particle field di canvas 2D dengan proyeksi perspektif manual.
 * - z-depth: partikel jauh lebih kecil & redup (depth cue)
 * - parallax mouse: field bergeser mengikuti kursor
 * - interaksi: partikel di dekat kursor tertarik + garis koneksi menyala
 * - adaptif: count partikel berdasarkan luas area, pause saat tab hidden,
 *   hormati prefers-reduced-motion (render statis, tanpa animasi loop)
 */
interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  hue: number; // 0 = cyan, 1 = violet
  r: number;
}

const FOV = 320;
const MAX_Z = 500;

const ParticleField: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, px: 0, py: 0 };
    const targetParallax = { x: 0, y: 0 };
    const currentParallax = { x: 0, y: 0 };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      h = Math.max(1, Math.floor(rect?.height ?? 320));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Adaptive particle count: densitas ~1 partikel per 4200px², cap 140
      const count = Math.max(28, Math.min(140, Math.floor((w * h) / 4200)));
      particles = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * w * 1.4,
        y: (Math.random() - 0.5) * h * 1.4,
        z: Math.random() * MAX_Z,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        vz: (Math.random() - 0.5) * 0.4,
        hue: Math.random() > 0.5 ? 1 : 0,
        r: 0.8 + Math.random() * 1.6,
      }));
    };

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running && !reducedMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      targetParallax.x = (e.clientX / window.innerWidth - 0.5) * 26;
      targetParallax.y = (e.clientY / window.innerHeight - 0.5) * 18;
    };

    const project = (p: Particle, parallax: { x: number; y: number }) => {
      const scale = FOV / (FOV + p.z);
      const sx = w / 2 + (p.x + parallax.x) * scale;
      const sy = h / 2 + (p.y + parallax.y) * scale;
      return { sx, sy, scale };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Koneksi antar partikel (jarak 2D terproyeksi < 110px)
      const projected = particles.map((p) => ({ p, ...project(p, currentParallax) }));
      const LINK_DIST = 110;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(dist2) / LINK_DIST) * 0.32;
            ctx.strokeStyle =
              a.p.hue === b.p.hue
                ? `rgba(34, 211, 238, ${alpha})`
                : `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }
      }

      // Partikel
      for (const { p, sx, sy, scale } of projected) {
        const depthAlpha = 1 - p.z / MAX_Z;
        const size = Math.max(0.6, p.r * scale * 1.6);
        const color =
          p.hue === 0
            ? `rgba(34, 211, 238, ${0.35 + depthAlpha * 0.55})`
            : `rgba(167, 139, 250, ${0.35 + depthAlpha * 0.55})`;
        // Glow: dua lingkaran (outer soft, inner core)
        ctx.beginPath();
        ctx.arc(sx, sy, size * 3.2, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === 0
            ? `rgba(34, 211, 238, ${0.05 + depthAlpha * 0.07})`
            : `rgba(167, 139, 250, ${0.05 + depthAlpha * 0.07})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Ring interaksi di sekitar kursor
      if (mouse.x > -1000 && mouse.y > -1000) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 34, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };

    const loop = () => {
      if (!running) return;
      raf = requestAnimationFrame(loop);

      // Parallax easing
      currentParallax.x += (targetParallax.x - currentParallax.x) * 0.06;
      currentParallax.y += (targetParallax.y - currentParallax.y) * 0.06;

      for (const p of particles) {
        // Gerak drift
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.z <= 0) { p.z = 0; p.vz = Math.abs(p.vz); }
        if (p.z >= MAX_Z) { p.z = MAX_Z; p.vz = -Math.abs(p.vz); }

        // Interaksi kursor: tarik partikel di radius 120px
        const { sx, sy } = project(p, { x: 0, y: 0 });
        const dx = mouse.x - sx;
        const dy = mouse.y - sy;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0.001) {
          const force = ((120 - dist) / 120) * 0.55;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Wrap
        if (p.x > w * 0.8) p.x = -w * 0.8;
        if (p.x < -w * 0.8) p.x = w * 0.8;
        if (p.y > h * 0.8) p.y = -h * 0.8;
        if (p.y < -h * 0.8) p.y = h * 0.8;
      }

      draw();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    if (reducedMotion) {
      // Render satu frame statis (depth field terlihat, tanpa animasi)
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
