'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HardwareTab } from '@/components/HardwareTab';
import { FinanceTab } from '@/components/finance/FinanceTab';
import { Server, Wallet, Terminal, ArrowUpRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const container = useRef(null);
  const [systemData, setSystemData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'hardware' | 'keuangan' | 'router'>('hardware');

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/v1/system-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (isMounted) setSystemData(json);
      } catch (err) {}
    };
    loadInitialData();
    const interval = setInterval(loadInitialData, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  useGSAP(() => {
    // Hero Entrance
    gsap.fromTo('.hero-text', { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power4.out' });
    gsap.fromTo('.hero-image', { scale: 0.8, opacity: 0, rotation: 5 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: 'expo.out', delay: 0.4 });
    
    // Bento Grid Hover Physics & Stagger
    gsap.fromTo('.bento-card', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.bento-grid', start: 'top 80%' } }
    );

    // Pinning Section
    ScrollTrigger.create({
      trigger: '.pin-section',
      start: 'top top',
      end: '+=1000',
      pin: '.pin-left',
      scrub: 1
    });

  }, { scope: container });

  return (
    <main ref={container} className="overflow-x-hidden w-full max-w-full bg-[#030303] text-white font-sans selection:bg-white selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full w-full max-w-5xl">
        <div className="font-bold tracking-tighter text-lg">APU.WEB.ID</div>
        <div className="flex gap-6 text-sm font-medium text-white/60">
          <button onClick={() => { document.getElementById('bento')?.scrollIntoView({behavior:'smooth'}); setActiveTab('hardware') }} className="hover:text-white transition">Telemetry</button>
          <button onClick={() => { document.getElementById('bento')?.scrollIntoView({behavior:'smooth'}); setActiveTab('keuangan') }} className="hover:text-white transition">Finance</button>
          <button onClick={() => { document.getElementById('pin')?.scrollIntoView({behavior:'smooth'}); setActiveTab('router') }} className="hover:text-white transition">Router</button>
        </div>
        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      </nav>

      {/* Attention: Hero */}
      <section className="relative min-h-screen flex items-center pt-32 pb-48 px-6 md:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030303] to-[#030303] -z-10" />
        
        <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-16 relative">
          <div className="w-full md:w-2/3 z-10">
            <h1 className="hero-text text-[clamp(3rem,6vw,6rem)] leading-[0.95] font-black tracking-tighter mb-8">
              Intelligence <span className="inline-block w-24 h-12 md:w-32 md:h-16 rounded-full align-middle mx-3 bg-cover bg-center border border-white/20" style={{backgroundImage: 'url(https://picsum.photos/seed/server/800/400?grayscale)'}}></span>
              <br />& Operations.
            </h1>
            <p className="hero-text text-xl md:text-2xl text-white/50 font-light max-w-xl mb-12">
              Master control portal merging deep financial AI analytics with zero-latency hardware telemetry.
            </p>
            <div className="hero-text flex gap-4">
              <button className="bg-white text-black px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:scale-105 transition-transform duration-500 ease-out">
                Enter System <ArrowUpRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 text-white px-8 py-4 rounded-full font-semibold border border-white/10 hover:bg-white/20 transition-colors duration-500 ease-out">
                View Architecture
              </button>
            </div>
          </div>
          
          <div className="hero-image absolute md:relative right-0 -bottom-24 md:bottom-auto w-full md:w-1/3 aspect-[3/4] opacity-30 md:opacity-100 mix-blend-luminosity -z-10 md:z-10">
            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 relative">
              <img src="https://picsum.photos/seed/abstract/800/1200?grayscale" className="object-cover w-full h-full scale-110" alt="Abstract" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee */}
      <section className="py-8 bg-white text-black overflow-hidden flex items-center whitespace-nowrap">
        <div className="flex animate-[marquee_20s_linear_infinite] font-bold text-4xl tracking-tighter uppercase items-center gap-12">
          <span>Arch Linux x86_64</span> <Server />
          <span>Cloudflare Tunnel</span> <Terminal />
          <span>Hermes Orchestrator</span> <Wallet />
          <span>Arch Linux x86_64</span> <Server />
          <span>Cloudflare Tunnel</span> <Terminal />
          <span>Hermes Orchestrator</span> <Wallet />
        </div>
      </section>

      {/* Interest: Bento Grid */}
      <section id="bento" className="bento-grid py-32 md:py-48 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16">System <br/>Modules.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 grid-flow-dense gap-6 auto-rows-[300px]">
            {/* Main Interactive Tab Container (Spans 2 cols, 2 rows) */}
            <div className="bento-card group col-span-1 md:col-span-2 row-span-2 rounded-[2rem] bg-[#0A0A0A] border border-white/5 overflow-hidden relative">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="p-8 h-full flex flex-col relative z-10 overflow-y-auto custom-scrollbar">
                {activeTab === 'hardware' && <HardwareTab systemData={systemData} refreshing={false} onManualRefresh={()=>{}} error={null} onRetry={()=>{}} />}
                {activeTab === 'keuangan' && <FinanceTab />}
                {activeTab === 'router' && (
                  <div className="w-full h-full">
                    <iframe src="https://router.apu.web.id" className="w-full h-full min-h-[400px] rounded-xl border border-white/5" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bento-card group col-span-1 row-span-1 rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden relative p-8 flex flex-col justify-end">
              <div className="w-full h-full absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700 ease-out" style={{backgroundImage: 'url(https://picsum.photos/seed/cpu/600/600?grayscale)'}} />
              <div className="relative z-10">
                <div className="text-sm font-medium text-white/50 mb-2">Core Usage</div>
                <div className="text-5xl font-black">{systemData?.cpu?.usagePercent ?? '...'}%</div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bento-card group col-span-1 row-span-1 rounded-[2rem] bg-white text-black overflow-hidden relative p-8 flex flex-col justify-between cursor-pointer hover:scale-[0.98] transition-transform duration-500">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Full <br/>Report</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Desire: GSAP Pinned Section */}
      <section id="pin" className="pin-section relative min-h-screen py-32 px-6 md:px-12 lg:px-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 relative h-full">
          <div className="pin-left w-full md:w-1/3 h-screen flex flex-col justify-center pb-32">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">Deep<br/>Analysis.</h2>
            <p className="text-white/40 mt-8 text-lg max-w-sm">
              The Hermes agent continuously parses natural language inputs into structured SQLite ledgers, computing absolute financial reality.
            </p>
          </div>
          <div className="w-full md:w-2/3 flex flex-col gap-12 md:pl-24 pt-[50vh] pb-[50vh]">
            {[1,2,3,4].map((i) => (
              <div key={i} className="aspect-[16/9] w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group">
                <img src={`https://picsum.photos/seed/finance${i}/1000/600?grayscale`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 mix-blend-screen" alt="" />
                <div className="absolute bottom-8 left-8">
                  <div className="text-4xl font-bold">Node {i}</div>
                  <div className="text-white/50">Processing sequence</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action: Footer */}
      <footer className="py-32 md:py-48 px-6 md:px-12 lg:px-24 bg-white text-black flex flex-col items-center justify-center text-center">
        <h2 className="text-[clamp(4rem,8vw,10rem)] font-black tracking-tighter leading-none mb-8">INITIATE.</h2>
        <button className="bg-black text-white px-12 py-6 rounded-full font-bold text-xl hover:scale-105 transition-transform duration-500 ease-out flex items-center gap-4">
          Connect to Server <ArrowUpRight className="w-6 h-6" />
        </button>
        <div className="mt-24 text-black/40 font-medium">© {new Date().getFullYear()} apu.web.id. Orchestrated by Hermes.</div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </main>
  );
}
