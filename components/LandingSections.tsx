'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote, Check, Zap, Rocket, Crown } from 'lucide-react';

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

// ===================== 2. PRICING TABLE =====================
/* ISI KONTEN DI SINI — ganti nama paket, harga, dan fitur di bawah
   dengan penawaran asli. Struktur: 3 kartu, kartu tengah = populer
   (highlight neon + badge). Semua angka placeholder netral. */
const PLANS: {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  popular: boolean;
}[] = [
  {
    name: 'Paket Dasar',
    price: 'Rp —',
    period: '/bulan',
    desc: 'Deskripsi paket dasar — placeholder netral.',
    features: [
      'Fitur #1 (isi di sini)',
      'Fitur #2 (isi di sini)',
      'Fitur #3 (isi di sini)',
    ],
    popular: false,
  },
  {
    name: 'Paket Pro',
    price: 'Rp —',
    period: '/bulan',
    desc: 'Deskripsi paket pro — placeholder netral.',
    features: [
      'Fitur #1 (isi di sini)',
      'Fitur #2 (isi di sini)',
      'Fitur #3 (isi di sini)',
      'Fitur #4 (isi di sini)',
    ],
    popular: true,
  },
  {
    name: 'Paket Enterprise',
    price: 'Rp —',
    period: '/bulan',
    desc: 'Deskripsi paket enterprise — placeholder netral.',
    features: [
      'Fitur #1 (isi di sini)',
      'Fitur #2 (isi di sini)',
      'Fitur #3 (isi di sini)',
      'Fitur #4 (isi di sini)',
      'Fitur #5 (isi di sini)',
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="apu-pricing mb-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between gap-3 mb-5"
      >
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-violet-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
          Harga &amp; Paket
          <span className="text-xs font-mono text-slate-500 font-normal">
            {/* ISI KONTEN DI SINI — harga placeholder, user akan isi sendiri */}
            // harga placeholder
          </span>
        </h2>
      </motion.div>

      {/* Panel kaca buram — glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8),0_0_40px_-16px_rgba(34,211,238,0.15)]"
      >
        {/* Garis neon atas panel */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? 'border border-cyan-400/40 bg-gradient-to-b from-cyan-400/[0.09] to-violet-400/[0.05] shadow-[0_0_36px_-8px_rgba(34,211,238,0.35)] md:scale-[1.04] z-10'
                  : 'border border-white/10 bg-white/[0.04] hover:border-cyan-400/25'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase text-[#030309] bg-gradient-to-r from-cyan-400 to-violet-400 shadow-lg shadow-cyan-500/40 glow-pulse">
                  <Crown className="w-3 h-3" /> Paling Populer
                </span>
              )}

              <div className="flex items-center gap-2 text-white">
                {plan.popular ? (
                  <Zap className="w-4 h-4 text-cyan-300" />
                ) : (
                  <Rocket className="w-4 h-4 text-slate-400" />
                )}
                <h3 className="text-sm font-bold">{plan.name}</h3>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className={`text-3xl font-extrabold tracking-tight ${plan.popular ? 'aurora-text' : 'text-white'}`}>
                  {plan.price}
                </span>
                <span className="text-xs text-slate-500 font-mono">{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{plan.desc}</p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className={`w-3.5 h-3.5 mt-px shrink-0 ${plan.popular ? 'text-cyan-300' : 'text-slate-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  plan.popular
                    ? 'text-[#030309] bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5'
                    : 'text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30'
                }`}
              >
                {/* ISI KONTEN DI SINI — ganti dengan CTA / link pembelian asli */}
                Pilih {plan.name}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
