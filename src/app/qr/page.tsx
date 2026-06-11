'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

function getServerUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/submit';
  }
  return '/submit';
}

export default function QRPage() {
  const [qrCode, setQrCode] = useState<string>('');
  const [screenUrl, setScreenUrl] = useState<string>('');
  const [screenQrCode, setScreenQrCode] = useState<string>('');

  useEffect(() => {
    const loadQR = async () => {
      const QRModule = await import('qrcode');
      const submitUrl = getServerUrl();
      const screenUrl = window.location.origin + '/screen';

      setScreenUrl(screenUrl);

      const submitDataUrl = await new Promise<string>((resolve, reject) => {
        QRModule.toDataURL(submitUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#1E3A5F', light: '#ffffff' },
        }, (err: Error | null | undefined, url: string) => {
          if (err) reject(err);
          else resolve(url);
        });
      });
      setQrCode(submitDataUrl);

      const screenDataUrl = await new Promise<string>((resolve, reject) => {
        QRModule.toDataURL(screenUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#1E3A5F', light: '#ffffff' },
        }, (err: Error | null | undefined, url: string) => {
          if (err) reject(err);
          else resolve(url);
        });
      });
      setScreenQrCode(screenDataUrl);
    };

    loadQR();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      

      {/* Back navigation */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="glass-btn px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </Link>
      </div>

      <div
        ref={(el) => {
          if (el && !el.dataset.gsapQr) {
            el.dataset.gsapQr = 'true';
            const title = el.querySelector('h1');
            const subtitle = el.querySelector('p');
            const cards = el.querySelectorAll('.grid > div');
            const tl = gsap.timeline();
            if (title) tl.from(title, { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
            if (subtitle) tl.from(subtitle, { opacity: 0, y: -10, duration: 0.5, ease: 'power2.out' }, '-=0.3');
            tl.from(cards, {
              opacity: 0,
              y: 40,
              scale: 0.9,
              stagger: 0.15,
              duration: 0.7,
              ease: 'back.out(1.4)',
            }, '-=0.2');
          }
        }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            二维码
          </h1>
          <p className="text-white/60 text-base">
            扫描二维码，即可写下或查看祝福
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400/30 to-yellow-500/30 border border-amber-400/20 flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-5">
              填写祝福
            </h2>
            {qrCode && (
              <div className="bg-white/90 p-4 rounded-2xl inline-block shadow-lg">
                <img src={qrCode} alt="填写祝福二维码" className="w-56 h-56" />
              </div>
            )}
            <p className="text-white/40 mt-5 text-sm">
              扫码后进入祝福填写页面
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-green-500/30 border border-emerald-400/20 flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-5">
              大屏幕
            </h2>
            {screenQrCode && (
              <div className="bg-white/90 p-4 rounded-2xl inline-block shadow-lg">
                <img src={screenQrCode} alt="大屏幕二维码" className="w-56 h-56" />
              </div>
            )}
            <p className="text-white/40 mt-5 text-sm break-all">
              {screenUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
