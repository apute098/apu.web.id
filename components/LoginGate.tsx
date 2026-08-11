'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Power } from 'lucide-react';

/* ============================================================
   LoginGate — "Cyber style login Page"
   Diadaptasi 1:1 dari kode tutorial video:
   - scannerRing (SVG 160x160, circle r=71 dasharray 446)
   - laser (garis scan atas-bawah, GSAP repeat yoyo)
   - fgIcon (icon "+" di tengah ring)
   - statusLabel (status text di bawah ring)
   - card (3D tilt ikut mouse, GSAP rotationY/rotationX)
   - startScanning → progress 0→100 (2s) → triggerSuccess
   - Layout: GRID_PORTAL_AUTH, TERMINAL USER HASH,
     QUANTUM PASS-TOKEN, DISCONNECT, VERIFY MATRIX
   ============================================================ */

export default function LoginGate({ onAccess }: { onAccess: () => void }) {
  const cardRef = useRef<HTMLFormElement | null>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const fgIconRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [scanning, setScanning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [shake, setShake] = useState(false);
  const [terminalId, setTerminalId] = useState('');
  const [passToken, setPassToken] = useState('');

  /* ---- GSAP laser loop + 3D tilt (persis kode video, reduced motion guard) ---- */
  useEffect(() => {
    let gsap: typeof import('gsap').gsap | null = null;
    let laserTween: any = null;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    import('gsap').then((mod) => {
      gsap = mod.gsap;
      if (laserRef.current) {
        laserTween = gsap.to(laserRef.current, {
          top: '100%',
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!gsap || !cardRef.current || complete) return;
      const ax = -(window.innerWidth / 2 - e.clientX) / 45;
      const ay = (window.innerHeight / 2 - e.clientY) / 45;
      gsap.to(cardRef.current, { rotationY: ax, rotationX: ay, duration: 0.5, ease: 'power2.out' });
    };
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      laserTween?.kill();
    };
  }, [complete]);

  /* ---- setProgress: stroke-dashoffset ring ---- */
  const setProgress = useCallback((percent: number) => {
    if (circleRef.current) {
      const circumference = 2 * Math.PI * 71;
      circleRef.current.style.strokeDashoffset =
        String(circumference - (percent / 100) * circumference);
    }
  }, []);

  /* ---- triggerSuccess: panggil onAccess (masuk portal) ---- */
  const triggerSuccess = useCallback(() => {
    setComplete(true);
    setScanning(false);
    if (labelRef.current) {
      labelRef.current.innerText = 'ACCESS GRANTED';
      labelRef.current.style.color = '#00f2fe';
    }
    if (fgIconRef.current) fgIconRef.current.style.stroke = '#00f2fe';
    setTimeout(() => onAccess(), 600);
  }, [onAccess]);

  /* ---- startScanning: 0 → 100 selama 2 detik ---- */
  const startScanning = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (complete) return;

    if (formRef.current) formRef.current.classList.add('scanning');
    setScanning(true);

    if (labelRef.current) {
      labelRef.current.innerText = 'Scanning Matrix...';
      labelRef.current.style.color = '#00f2fe';
    }
    if (fgIconRef.current) fgIconRef.current.style.stroke = '#00f2fe';

    import('gsap').then((mod) => {
      const tween = mod.gsap.to(
        { value: 0 },
        {
          value: 100,
          duration: 2.0,
          ease: 'power1.in',
          onUpdate: function (this: any) {
            setProgress(this.targets()[0].value);
          },
          onComplete: triggerSuccess,
        }
      );
      scanTweenRef.current = tween;
    });
  }, [complete, setProgress, triggerSuccess]);

  const scanTweenRef = useRef<any>(null);

  /* ---- DISCONNECT: reset ---- */
  const handleDisconnect = () => {
    if (scanning) return;
    setComplete(false);
    setTerminalId('');
    setPassToken('');
    setProgress(0);
    if (labelRef.current) {
      labelRef.current.innerText = 'AWAITING INPUT';
      labelRef.current.style.color = '#94a3b8';
    }
    if (fgIconRef.current) fgIconRef.current.style.stroke = '#fff';
    if (circleRef.current) {
      const circumference = 2 * Math.PI * 71;
      circleRef.current.style.strokeDashoffset = String(circumference);
    }
    if (formRef.current) formRef.current.classList.remove('scanning');
  };

  const handleVerify = (e: React.FormEvent) => {
    if (scanning) return;
    if (!terminalId.trim() || !passToken.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (labelRef.current) {
        labelRef.current.innerText = 'INSUFFICIENT CREDENTIALS';
        labelRef.current.style.color = '#f87171';
      }
      return;
    }
    startScanning(e);
  };

  return (
    <main
      className="login-gate"
      style={{
        minHeight: '100dvh',
        background:
          'radial-gradient(circle at 50% 50%, rgba(0,242,254,0.08) 0%, rgba(0,242,254,0.02) 35%, #000 70%)',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontFamily:
          "'JetBrains Mono', ui-monospace, 'Fira Code', monospace",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ambient particle / grid layers */}
      <div className="gate-grid" />
      <div className="gate-vortex" />

      <div className="gate-wrap" style={{ perspective: 1000, textAlign: 'center', padding: '2rem 1rem' }}>
        {/* Title atas: "Cyber style login Page" */}
        <h1
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
            fontWeight: 300,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#e2e8f0',
            marginBottom: '2rem',
          }}
        >
          Cyber style login&nbsp;Page
        </h1>

        {/* Card GRID_PORTAL_AUTH */}
        <form
          id="card"
          ref={(el) => {
            formRef.current = el;
            cardRef.current = el;
          }}
          onSubmit={handleVerify}
          className={shake ? 'login-shake' : ''}
          style={{
            display: 'inline-block',
            padding: '2.5rem 2rem 2rem',
            border: '1px solid rgba(0,242,254,0.25)',
            borderRadius: 14,
            background: 'rgba(2,6,12,0.72)',
            boxShadow: '0 0 50px rgba(0,242,254,0.12), inset 0 0 40px rgba(0,242,254,0.04)',
            backdropFilter: 'blur(8px)',
            maxWidth: 420,
            width: '100%',
          }}
        >
          <h2
            style={{
              fontSize: '1.05rem',
              letterSpacing: '0.28em',
              fontWeight: 600,
              color: '#00f2fe',
              marginBottom: '1.8rem',
              textTransform: 'uppercase',
            }}
          >
            GRID_PORTAL_AUTH
          </h2>

          {/* scanner ring */}
          <div id="scannerRing" style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 1.2rem' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                ref={circleRef}
                className="progress-ring__circle"
                cx="80"
                cy="80"
                r="71"
                fill="none"
                stroke="rgba(0,242,254,0.9)"
                strokeWidth="4"
                strokeDasharray="446"
                strokeDashoffset="446"
                transform="rotate(-90 80 80)"
                strokeLinecap="round"
              />
              <path
                id="fgIcon"
                ref={fgIconRef}
                d="M80 50v60M50 80h60"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div
              ref={laserRef}
              id="laser"
              style={{
                position: 'absolute',
                top: 0,
                left: 12,
                width: 136,
                height: 2,
                background: '#00f2fe',
                boxShadow: '0 0 10px #00f2fe',
                borderRadius: 2,
              }}
            />
          </div>

          <p
            ref={labelRef}
            id="statusLabel"
            style={{
              margin: '0 0 1.6rem',
              color: '#94a3b8',
              fontSize: '0.8rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              minHeight: '1.1em',
            }}
          >
            AWAITING INPUT
          </p>

          <div style={{ display: 'grid', gap: '0.9rem', textAlign: 'left' }}>
            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.24em', color: '#7dd3fc', textTransform: 'uppercase' }}>
                TERMINAL USER HASH
              </span>
              <input
                type="text"
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                placeholder="operator@apu"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,242,254,0.18)',
                  borderRadius: 8,
                  color: '#fff',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.24em', color: '#7dd3fc', textTransform: 'uppercase' }}>
                QUANTUM PASS-TOKEN
              </span>
              <input
                type="password"
                value={passToken}
                onChange={(e) => setPassToken(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,242,254,0.18)',
                  borderRadius: 8,
                  color: '#fff',
                  padding: '0.7rem 0.9rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.8rem' }}>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={scanning}
              style={{
                flex: 1,
                padding: '0.7rem 0.5rem',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.22)',
                color: '#cbd5e1',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                opacity: scanning ? 0.4 : 1,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <Power size={13} style={{ display: 'inline' }} />
              DISCONNECT
            </button>
            <button
              type="submit"
              disabled={scanning}
              style={{
                flex: 1,
                padding: '0.7rem 0.5rem',
                borderRadius: 8,
                background: scanning ? 'rgba(0,242,254,0.25)' : '#fff',
                border: 'none',
                color: '#000',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.3s',
              }}
            >
              {scanning ? 'SCANNING...' : 'VERIFY MATRIX'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .gate-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,242,254,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,242,254,0.05) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9), transparent 75%);
          pointer-events: none;
        }
        .gate-vortex {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 520px;
          height: 520px;
          transform: translate(-50%, -50%);
          background:
            radial-gradient(circle at 30% 35%, rgba(0,242,254,0.16), transparent 42%),
            radial-gradient(circle at 70% 65%, rgba(0,242,254,0.10), transparent 40%),
            conic-gradient(from 0deg, transparent 0 12%, rgba(0,242,254,0.10) 18%, transparent 26% 52%, rgba(0,242,254,0.10) 58%, transparent 66% 82%, rgba(0,242,254,0.10) 88%, transparent 96%);
          filter: blur(2px);
          border-radius: 50%;
          animation: gateSpin 14s linear infinite;
          pointer-events: none;
        }
        @keyframes gateSpin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .login-gate .scanning #laser {
          animation: laserFast 0.5s linear infinite;
        }
        @keyframes laserFast {
          from { top: 0; }
          to { top: calc(100% - 2px); }
        }
      `}</style>
    </main>
  );
}