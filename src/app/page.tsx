'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

function CardIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/30 to-yellow-500/30 border border-amber-400/20 flex items-center justify-center text-amber-300">
      {icon}
    </div>
  );
}

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          delay: 0.3,
        });
      }

      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.6,
        });
      }

      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.from(cards, {
          opacity: 0,
          y: 50,
          scale: 0.92,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.9,
        });
      }

      if (footerRef.current) {
        gsap.from(footerRef.current, {
          opacity: 0,
          duration: 1,
          delay: 1.5,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-3xl">
        {/* Elegant eyebrow */}
        <div className="mb-6">
          <span className="tag animate-pulse-soft">
            🎓 Class of 2026
          </span>
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-tight"
        >
          毕业
          <span className="text-gradient-gold">祝福墙</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mx-auto"
        >
          同窗数载，情谊长存。为即将远行的TA，留下最真挚的祝福
        </p>
      </div>

      {/* Action Cards */}
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full"
      >
        {/* Screen Card */}
        <Link
          href="/screen"
          ref={(el) => {
            if (el && !el.dataset.gsapCard) {
              el.dataset.gsapCard = 'true';
              el.addEventListener('mouseenter', () => {
                gsap.to(el, { scale: 1.03, y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', duration: 0.35, ease: 'power2.out' });
              });
              el.addEventListener('mouseleave', () => {
                gsap.to(el, { scale: 1, y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', duration: 0.35, ease: 'power2.out' });
              });
              el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                gsap.to(el, { rotationX: ((y - rect.height/2) / (rect.height/2)) * -5, rotationY: ((x - rect.width/2) / (rect.width/2)) * 5, duration: 0.3, ease: 'power2.out' });
              });
              el.addEventListener('mouseleave', () => {
                gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.3, ease: 'power2.out' });
              });
            }
          }}
          className="glass-card p-7 text-center group transition-colors shadow-lg"
        >
          <CardIcon icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          } />
          <h3 className="text-lg font-bold text-white mt-4 mb-2">大屏幕</h3>
          <p className="text-white/50 text-sm">实时滚动展示所有祝福</p>
        </Link>

        {/* Submit Card */}
        <Link
          href="/submit"
          ref={(el) => {
            if (el && !el.dataset.gsapCard) {
              el.dataset.gsapCard = 'true';
              el.addEventListener('mouseenter', () => {
                gsap.to(el, { scale: 1.03, y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', duration: 0.35, ease: 'power2.out' });
              });
              el.addEventListener('mouseleave', () => {
                gsap.to(el, { scale: 1, y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', duration: 0.35, ease: 'power2.out' });
              });
              el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                gsap.to(el, { rotationX: ((y - rect.height/2) / (rect.height/2)) * -5, rotationY: ((x - rect.width/2) / (rect.width/2)) * 5, duration: 0.3, ease: 'power2.out' });
              });
              el.addEventListener('mouseleave', () => {
                gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.3, ease: 'power2.out' });
              });
            }
          }}
          className="glass-card p-7 text-center group transition-colors shadow-lg"
        >
          <CardIcon icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          } />
          <h3 className="text-lg font-bold text-white mt-4 mb-2">写祝福</h3>
          <p className="text-white/50 text-sm">写下祝福，配上照片和鲜花</p>
        </Link>

        {/* QR Card */}
        <Link
          href="/qr"
          ref={(el) => {
            if (el && !el.dataset.gsapCard) {
              el.dataset.gsapCard = 'true';
              el.addEventListener('mouseenter', () => {
                gsap.to(el, { scale: 1.03, y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', duration: 0.35, ease: 'power2.out' });
              });
              el.addEventListener('mouseleave', () => {
                gsap.to(el, { scale: 1, y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', duration: 0.35, ease: 'power2.out' });
              });
              el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                gsap.to(el, { rotationX: ((y - rect.height/2) / (rect.height/2)) * -5, rotationY: ((x - rect.width/2) / (rect.width/2)) * 5, duration: 0.3, ease: 'power2.out' });
              });
              el.addEventListener('mouseleave', () => {
                gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.3, ease: 'power2.out' });
              });
            }
          }}
          className="glass-card p-7 text-center group transition-colors shadow-lg"
        >
          <CardIcon icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          } />
          <h3 className="text-lg font-bold text-white mt-4 mb-2">二维码</h3>
          <p className="text-white/50 text-sm">扫码即可参与</p>
        </Link>
      </div>

      {/* Footer */}
      <div ref={footerRef} className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 glass-btn px-5 py-2.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
          <span className="text-white/50 text-sm">毕业快乐，前程似锦</span>
        </div>
      </div>
    </div>
  );
}
