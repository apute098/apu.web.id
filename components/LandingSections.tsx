'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

/* =====================================================================
   LANDING SECTIONS — apu.web.id (fase 2)
   ---------------------------------------------------------------------
   ISI KONTEN DI SINI: seluruh teks marketing di bawah adalah placeholder
   NETRAL. User wajib mengganti sendiri (testimonial asli, harga asli).
   Jangan ubah struktur / animasi / styling — hanya isi field teks.
   ===================================================================== */

// ===================== 1. TESTIMONIALS / CASE STUDIES =====================
/* ISI KONTEN DI SINI — ganti 3 entri di bawah dengan testimonial/study
   case asli. Field: quote (kutipan), name (nama/inisial), role (peran),
   tag (kategori). Semua placeholder netral. */
const TESTIMONIALS: { quote: string; name: string; role: string; tag: string }[] = [
  {
    quote:
      'Slot testimonial pertama — tulis kutipan klien / study case singkat di sini (placeholder netral, user akan isi sendiri).',
    name: 'Nama Klien / Inisial',
    role: 'Peran / Perusahaan',
    tag: 'Kategori #1',
  },
  {
    quote:
      'Slot testimonial kedua — tulis kutipan klien / study case singkat di sini (placeholder netral, user akan isi sendiri).',
    name: 'Nama Klien / Inisial',
    role: 'Peran / Perusahaan',
    tag: 'Kategori #2',
  },
  {
    quote:
      'Slot testimonial ketiga — tulis kutipan klien / study case singkat di sini (placeholder netral, user akan isi sendiri).',
    name: 'Nama Klien / Inisial',
    role: 'Peran / Perusahaan',
    tag: 'Kategori #3',
  },
];

const ROTATE_MS = 5000;

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // Auto-rotate carousel — jeda saat hover/focus (aksesibilitas)
  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, reduceMotion]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section
      className="apu-testimonials mb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between gap-3 mb-5"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-violet-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
          Testimonial &amp; Case Studies
          <span className="text-xs font-mono text-slate-500 font-normal">
            {/* ISI KONTEN DI SINI — badge jumlah konten asli */}
            // {TESTIMONIALS.length} slot konten
          </span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="floating-card max-w-3xl mx-auto overflow-hidden"
      >
        <div className="relative min-h-[220px] sm:min-h-[200px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, x: reduceMotion ? 0 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full px-2 sm:px-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <Quote className="w-4 h-4" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-white/5 border border-white/10 text-violet-300">
                  {TESTIMONIALS[index].tag}
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                &ldquo;{TESTIMONIALS[index].quote}&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-bold text-cyan-300">
                  {TESTIMONIALS[index].name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{TESTIMONIALS[index].name}</div>
                  <div className="text-xs text-slate-500">{TESTIMONIALS[index].role}</div>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* Kontrol: panah + dots */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 px-2 sm:px-6">
          <button
            onClick={() => go(-1)}
            aria-label="Testimonial sebelumnya"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-400/30 transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-6 bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Testimonial berikutnya"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-400/30 transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
