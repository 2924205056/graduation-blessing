'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';

let _confettiFn: ((opts?: any) => any) | null = null;
let _confettiLoadingPromise: Promise<any> | null = null;

function getConfettiFn(): Promise<(opts?: any) => any> {
  if (_confettiFn) return Promise.resolve(_confettiFn);
  if (_confettiLoadingPromise) return _confettiLoadingPromise;

  // 尝试从打包模块获取
  try {
    const mod = confetti as unknown as { default?: any };
    if (typeof mod === 'function') {
      _confettiFn = mod as any;
      return Promise.resolve(_confettiFn);
    }
    if (typeof (mod as any)?.default === 'function') {
      _confettiFn = (mod as any).default as any;
      return Promise.resolve(_confettiFn);
    }
  } catch (_e) { /* ignore */ }

  // 回退到动态加载 CDN
  _confettiLoadingPromise = new Promise((resolve, reject) => {
    if (typeof (window as any).confetti === 'function') {
      _confettiFn = (window as any).confetti as any;
      return resolve(_confettiFn);
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-confetti-loader]'
    );
    if (existing) {
      existing.addEventListener('load', () => {
        _confettiFn = (window as any).confetti as any;
        resolve(_confettiFn);
      });
      existing.addEventListener('error', () => reject(new Error('CDN load failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js';
    s.async = true;
    s.dataset.confettiLoader = 'true';
    s.onload = () => {
      _confettiFn = (window as any).confetti as any;
      resolve(_confettiFn);
    };
    s.onerror = () => reject(new Error('Failed to load canvas-confetti from CDN'));
    document.head.appendChild(s);
  });

  return _confettiLoadingPromise;
}

const fireConfettiBurst = async () => {
  const confettiFn = await getConfettiFn();
  if (!confettiFn) return;
  const defaults = { origin: { y: 0.65 }, zIndex: 9999, startVelocity: 45, gravity: 1.0, ticks: 200 };

  // 6 种主题随机选：金箔 / 星星 / 大号彩纸 / 左右双炮 / 粉紫 / 三层爆发
  const theme = Math.floor(Math.random() * 6);

  if (theme === 0) {
    confettiFn({
      ...defaults,
      particleCount: 120,
      spread: 70,
      shapes: ['square', 'circle'],
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFFFFF', '#7CFC00'],
      scalar: 0.9,
    });
  } else if (theme === 1) {
    confettiFn({
      ...defaults,
      particleCount: 150,
      spread: 90,
      shapes: ['star', 'circle'],
      colors: ['#FFD700', '#FFF8DC', '#FFA500', '#FF6B9D'],
      scalar: 1.3,
    });
  } else if (theme === 2) {
    confettiFn({
      ...defaults,
      particleCount: 100,
      spread: 80,
      shapes: ['square', 'circle'],
      colors: ['#FF6B9D', '#FFD700', '#3498DB', '#2ECC71', '#FFFFFF'],
      scalar: 1.4,
    });
  } else if (theme === 3) {
    confettiFn({
      ...defaults,
      particleCount: 90,
      spread: 55,
      angle: 60,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF6B9D', '#FFD700', '#FFFFFF', '#9B59B6'],
      scalar: 1.0,
    });
    confettiFn({
      ...defaults,
      particleCount: 90,
      spread: 55,
      angle: 120,
      origin: { x: 1, y: 0.7 },
      colors: ['#FF6B9D', '#FFD700', '#FFFFFF', '#3498DB'],
      scalar: 1.0,
    });
  } else if (theme === 4) {
    confettiFn({
      ...defaults,
      particleCount: 140,
      spread: 65,
      shapes: ['square', 'circle'],
      colors: ['#FFC0CB', '#FF69B4', '#DDA0DD', '#FFFFFF', '#9370DB'],
      scalar: 1.1,
    });
  } else {
    confettiFn({
      ...defaults,
      origin: { y: 0.7 },
      particleCount: 70,
      spread: 85,
      shapes: ['circle', 'square', 'star'],
      colors: ['#FFD700', '#FF6B9D', '#3498DB', '#2ECC71', '#F39C12', '#FFFFFF'],
      scalar: 1.1,
    });
    setTimeout(() => {
      confettiFn({
        ...defaults,
        origin: { y: 0.5 },
        particleCount: 70,
        spread: 85,
        shapes: ['circle', 'square', 'star'],
        colors: ['#FFD700', '#FF6B9D', '#3498DB', '#2ECC71', '#F39C12', '#FFFFFF'],
        scalar: 1.1,
      });
    }, 150);
    setTimeout(() => {
      confettiFn({
        ...defaults,
        origin: { y: 0.35 },
        particleCount: 70,
        spread: 85,
        shapes: ['circle', 'square', 'star'],
        colors: ['#FFD700', '#FF6B9D', '#3498DB', '#2ECC71', '#F39C12', '#FFFFFF'],
        scalar: 1.1,
      });
    }, 300);
  }
};

function SmallBear() {
  return (
    <svg viewBox="0 0 120 140" className="w-24 h-28" fill="none">
      <ellipse cx="60" cy="95" rx="35" ry="38" fill="#D4A04A" />
      <ellipse cx="60" cy="100" rx="22" ry="25" fill="#E8C06A" />
      <ellipse cx="40" cy="128" rx="18" ry="10" fill="#D4A04A" />
      <ellipse cx="80" cy="128" rx="18" ry="10" fill="#D4A04A" />
      <circle cx="60" cy="50" r="28" fill="#D4A04A" />
      <circle cx="38" cy="28" r="10" fill="#D4A04A" />
      <circle cx="38" cy="28" r="6" fill="#E8C06A" />
      <circle cx="82" cy="28" r="10" fill="#D4A04A" />
      <circle cx="82" cy="28" r="6" fill="#E8C06A" />
      <ellipse cx="60" cy="55" rx="13" ry="10" fill="#E8C06A" />
      <path d="M50 44 Q53 41 56 44" stroke="#3D2B1F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M64 44 Q67 41 70 44" stroke="#3D2B1F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M55 52 Q60 57 65 52" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="50" rx="3.5" ry="2.5" fill="#3D2B1F" />
      <circle cx="48" cy="53" r="5" fill="#E8A87C" opacity="0.4" />
      <circle cx="72" cy="53" r="5" fill="#E8A87C" opacity="0.4" />
      <polygon points="35,32 60,20 85,32 60,42" fill="#2D2D2D" />
      <rect x="32" y="30" width="56" height="4" rx="2" fill="#2D2D2D" />
      <line x1="60" y1="32" x2="80" y2="25" stroke="#2D2D2D" strokeWidth="1.5" />
      <line x1="80" y1="25" x2="83" y2="35" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 72 L22 120 L98 120 L90 72 Z" fill="#2D2D2D" />
      <path d="M48 72 L44 120 L56 120 L60 72 Z" fill="#C0392B" />
      <path d="M60 72 L64 120 L76 120 L72 72 Z" fill="#C0392B" />
      <path d="M45 70 L60 80 L75 70" stroke="#FFB6C1" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function SubmitPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [gownColor, setGownColor] = useState<'red' | 'blue'>('red');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sticker, setSticker] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setMessage('');
    setGownColor('red');
    setImage(null);
    setImagePreview(null);
    setSticker('');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('请输入祝福语');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      let imageUrl: string | undefined;

      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('图片上传失败');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const res = await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || '匿名',
          message: message.trim(),
          imageUrl,
          gownColor,
          sticker: sticker || undefined,
        }),
      });

      if (!res.ok) throw new Error('发送失败');

      setIsSuccess(true);
      fireConfettiBurst();
      resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '提交失败，请重试';
      setErrorMsg(msg);
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium bg-white/25 hover:bg-white/35 border border-white/30 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
        </div>
        {/* Decorative photos */}
        <img src="/assets/photo-1.jpg" alt="" className="absolute -bottom-8 -left-20 w-48 md:w-64 h-48 md:h-64 object-cover rounded-3xl opacity-20 rotate-6 pointer-events-none z-0 shadow-2xl" />
        <img src="/assets/photo-2.jpg" alt="" className="absolute -top-8 -right-20 w-48 md:w-64 h-48 md:h-64 object-cover rounded-3xl opacity-20 -rotate-6 pointer-events-none z-0 shadow-2xl" />
        

        

        <div
          ref={(el) => {
            if (el) {
              gsap.fromTo(el,
                { opacity: 0, scale: 0.7, y: 40 },
                { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }
              );
              // Floating sparkles from the checkmark
              const sparkles = Array.from({ length: 12 }, (_, i) => {
                const sparkle = document.createElement('div');
                sparkle.className = 'absolute text-xl pointer-events-none';
                sparkle.textContent = '✨';
                sparkle.style.left = '50%';
                sparkle.style.top = '50%';
                el.appendChild(sparkle);
                gsap.fromTo(sparkle,
                  { x: 0, y: 0, opacity: 1, scale: 0 },
                  {
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200 - 50,
                    opacity: 0,
                    scale: 1.5,
                    duration: 1 + Math.random(),
                    delay: 0.5 + Math.random() * 0.3,
                    ease: 'power2.out',
                    onComplete: () => sparkle.remove(),
                  }
                );
              });
            }
          }}
          className="text-center relative"
        >
          <div className="mb-6 animate-wiggle">
            <SmallBear />
          </div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-btn-accent flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">祝福已发送</h2>
          <p className="text-white/60 text-base mb-10">你的祝福已经出现在大屏幕上啦</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsSuccess(false)}
              className="px-8 py-4 glass-btn rounded-2xl font-bold transition-all"
            >
              再写一条
            </button>
            <Link
              href="/screen"
              className="px-8 py-4 glass-btn-accent rounded-2xl font-bold transition-all"
            >
              查看大屏幕
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-2 py-8 md:py-12 relative overflow-y-auto">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium bg-white/25 hover:bg-white/35 border border-white/30 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
        </div>
        {/* Decorative photos */}
        <img src="/assets/photo-1.jpg" alt="" className="absolute -bottom-8 -left-20 w-48 md:w-64 h-48 md:h-64 object-cover rounded-3xl opacity-25 rotate-6 pointer-events-none z-0 shadow-2xl" />
        <img src="/assets/photo-2.jpg" alt="" className="absolute -top-8 -right-20 w-48 md:w-64 h-48 md:h-64 object-cover rounded-3xl opacity-25 -rotate-6 pointer-events-none z-0 shadow-2xl" />
        

      

      <div className="w-full max-w-lg mx-auto relative z-10 px-4"
      >
        <div className="text-center mb-5 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            写下你的祝福
          </h1>
          <p className="text-white/60 text-base">
            为毕业的TA送上最真挚的祝福
          </p>
        </div>

        <form
          ref={(el) => {
            if (el && !el.dataset.gsapForm) {
              el.dataset.gsapForm = 'true';
              const children = Array.from(el.querySelector('.form-fields')?.children || []) as HTMLElement[];
              gsap.from(children, {
                opacity: 0,
                y: 30,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out',
                delay: 0.3,
              });
            }
          }}
          onSubmit={handleSubmit}
          className="flex flex-col max-h-[calc(100dvh-120px)]">

          {/* Scrollable form fields */}
          <div className="form-fields overflow-y-auto flex-shrink-0 space-y-4 md:space-y-5 pb-4">
          <div className="glass-card p-5 md:p-7 space-y-4 md:space-y-5" style={{background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)"}}>
            <div>
              <label htmlFor="name" className="block text-xs md:text-sm font-bold text-white/80 mb-1.5">
                你的名字
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="选填，留空则为匿名"
                className="w-full px-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm md:text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs md:text-sm font-bold text-white/80 mb-1.5">
                祝福语
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="写下你想对毕业同学说的话..."
                rows={5}
                className="w-full px-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm md:text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all resize-none"
                required
              />
            </div>

            {/* Gown color selector */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-white/80 mb-1.5">
                选一件毕业袍
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGownColor('red')}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    gownColor === 'red'
                      ? 'border-amber-400 bg-amber-400/10 shadow-md scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <svg viewBox="0 0 60 70" className="w-10 h-12 shrink-0" fill="none">
                    <ellipse cx="30" cy="48" rx="18" ry="20" fill="#D4A04A" />
                    <circle cx="30" cy="25" r="14" fill="#D4A04A" />
                    <circle cx="19" cy="14" r="5" fill="#D4A04A" />
                    <circle cx="41" cy="14" r="5" fill="#D4A04A" />
                    <path d="M25 22 Q26.5 20 28 22" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M32 22 Q33.5 20 35 22" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <polygon points="17,16 30,10 43,16 30,21" fill="#2D2D2D" />
                    <rect x="16" y="15" width="28" height="2" rx="1" fill="#2D2D2D" />
                    <path d="M15 36 L11 60 L49 60 L45 36 Z" fill="#2D2D2D" />
                    <path d="M24 36 L22 60 L28 60 L30 36 Z" fill="#C0392B" />
                    <path d="M30 36 L32 60 L38 60 L36 36 Z" fill="#C0392B" />
                    <path d="M22.5 35 L30 40 L37.5 35" stroke="#FFB6C1" strokeWidth="1" fill="none" strokeLinecap="round" />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">红色</div>
                    <div className="text-xs text-white/50">经典毕业红</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGownColor('blue')}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    gownColor === 'blue'
                      ? 'border-sky-400/60 bg-sky-500/20 shadow-md scale-[1.02]'
                      : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
                  }`}
                >
                  <svg viewBox="0 0 60 70" className="w-10 h-12 shrink-0" fill="none">
                    <ellipse cx="30" cy="48" rx="18" ry="20" fill="#D4A04A" />
                    <circle cx="30" cy="25" r="14" fill="#D4A04A" />
                    <circle cx="19" cy="14" r="5" fill="#D4A04A" />
                    <circle cx="41" cy="14" r="5" fill="#D4A04A" />
                    <path d="M25 22 Q26.5 20 28 22" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M32 22 Q33.5 20 35 22" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <polygon points="17,16 30,10 43,16 30,21" fill="#2D2D2D" />
                    <rect x="16" y="15" width="28" height="2" rx="1" fill="#2D2D2D" />
                    <path d="M15 36 L11 60 L49 60 L45 36 Z" fill="#2D2D2D" />
                    <path d="M24 36 L22 60 L28 60 L30 36 Z" fill="#3B6B8C" />
                    <path d="M30 36 L32 60 L38 60 L36 36 Z" fill="#3B6B8C" />
                    <path d="M22.5 35 L30 40 L37.5 35" stroke="#FFB6C1" strokeWidth="1" fill="none" strokeLinecap="round" />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">蓝色</div>
                    <div className="text-xs text-white/50">清新毕业蓝</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Sticker Picker */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-white/80 mb-1.5">
                选个表情包
              </label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {[
                  { id: 'congrats', label: '🎓', bg: 'from-amber-400 to-orange-500' },
                  { id: 'clap', label: '👏', bg: 'from-rose-400 to-pink-500' },
                  { id: 'love', label: '🥰', bg: 'from-red-400 to-rose-500' },
                  { id: 'fire', label: '🔥', bg: 'from-orange-400 to-red-500' },
                  { id: 'party', label: '🎉', bg: 'from-violet-400 to-purple-500' },
                  { id: 'sparkle', label: '✨', bg: 'from-yellow-400 to-amber-500' },
                  { id: 'cry', label: '😭', bg: 'from-sky-400 to-blue-500' },
                  { id: 'heart', label: '💖', bg: 'from-pink-400 to-rose-500' },
                  { id: 'rocket', label: '🚀', bg: 'from-indigo-400 to-purple-500' },
                  { id: 'cake', label: '🎂', bg: 'from-fuchsia-400 to-pink-500' },
                  { id: 'bubble', label: '🫧', bg: 'from-cyan-400 to-sky-500' },
                  { id: 'flower', label: '🌸', bg: 'from-pink-300 to-rose-400' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSticker(sticker === s.id ? '' : s.id)}
                    className={`aspect-square rounded-2xl text-2xl md:text-3xl flex items-center justify-center transition-all border-2 ${
                      sticker === s.id
                        ? 'bg-gradient-to-br ' + s.bg + ' border-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30'
                    }`}
                  >
                    <span className="drop-shadow">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold text-white/80 mb-1.5">
                上传图片（可选）
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-5 py-6 bg-white/10 border border-dashed border-white/20 rounded-2xl text-white/50 hover:text-white/70 hover:border-white/40 hover:bg-white/15 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">点击选择图片</span>
                </button>
              ) : (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-sky-100">
                  <Image src={imagePreview} alt="预览" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>


          </div>
          </div>

          {/* Fixed bottom submit bar */}
          <div className="flex-shrink-0 px-2 pb-4 pt-2">
            {errorMsg && (
              <div className="mb-3 px-4 py-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-100 text-sm text-center">
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-3 md:py-4 glass-btn-accent rounded-2xl font-bold text-base md:text-lg transition-all disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? '发送中...' : '发送祝福'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
