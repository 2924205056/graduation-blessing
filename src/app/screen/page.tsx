'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Blessing } from '@/types/blessing';
import { playNotificationSound } from '@/lib/sound';
import { getGraduationEmoji } from '@/lib/flowers';
import Link from 'next/link';
import gsap from 'gsap';
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

  // 如果打包方式取到的是对象（非函数），回退到动态加载 CDN
  _confettiLoadingPromise = new Promise((resolve, reject) => {
    // 已存在 window.confetti，直接用
    if (typeof (window as any).confetti === 'function') {
      _confettiFn = (window as any).confetti as any;
      return resolve(_confettiFn);
    }
    // 如果页面已有相同 script 就不重复注入
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

const avatarColors = [
  { bg: 'from-sky-400 to-blue-500', border: 'border-sky-200', gown: '#3B6B8C' },
  { bg: 'from-amber-400 to-orange-500', border: 'border-amber-200', gown: '#C0392B' },
  { bg: 'from-emerald-400 to-green-500', border: 'border-emerald-200', gown: '#3B6B8C' },
  { bg: 'from-rose-400 to-pink-500', border: 'border-rose-200', gown: '#C0392B' },
  { bg: 'from-purple-400 to-indigo-500', border: 'border-purple-200', gown: '#3B6B8C' },
  { bg: 'from-teal-400 to-cyan-500', border: 'border-teal-200', gown: '#C0392B' },
];

const gownColorMap: Record<string, { bg: string; border: string; gown: string }> = {
  red: { bg: 'from-rose-400 to-red-500', border: 'border-rose-200', gown: '#C0392B' },
  blue: { bg: 'from-sky-400 to-blue-500', border: 'border-sky-200', gown: '#3B6B8C' },
};

function getGownInfo(blessing: Blessing): { bg: string; border: string; gown: string } {
  const chosen = blessing.gownColor && gownColorMap[blessing.gownColor];
  if (chosen) return chosen;
  // 以 blessing.id 做稳定哈希，保证同一个祝福每次渲染颜色一致
  let hash = 0;
  const id = String(blessing.id ?? blessing.createdAt ?? 'x');
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % avatarColors.length;
  return avatarColors[idx];
}

const stickerMap: Record<string, string> = {
  congrats: '🎓',
  clap: '👏',
  love: '🥰',
  fire: '🔥',
  party: '🎉',
  sparkle: '✨',
  cry: '😭',
  heart: '💖',
  rocket: '🚀',
  cake: '🎂',
  bubble: '🫧',
  flower: '🌸',
};

function getStickerEmoji(sticker?: string): string {
  if (!sticker) return '';
  const emoji = stickerMap[sticker];
  return emoji ?? '';
}

function BearDanmakuAvatar({ gownColor }: { gownColor: string }) {
  return (
    <svg viewBox="0 0 60 70" className="w-14 h-16" fill="none">
      <ellipse cx="30" cy="48" rx="18" ry="20" fill="#D4A04A" />
      <ellipse cx="30" cy="51" rx="11" ry="13" fill="#E8C06A" />
      <ellipse cx="20" cy="65" rx="9" ry="5" fill="#D4A04A" />
      <ellipse cx="40" cy="65" rx="9" ry="5" fill="#D4A04A" />
      <circle cx="30" cy="25" r="14" fill="#D4A04A" />
      <circle cx="19" cy="14" r="5" fill="#D4A04A" />
      <circle cx="19" cy="14" r="3" fill="#E8C06A" />
      <circle cx="41" cy="14" r="5" fill="#D4A04A" />
      <circle cx="41" cy="14" r="3" fill="#E8C06A" />
      <ellipse cx="30" cy="28" rx="6.5" ry="5" fill="#E8C06A" />
      <path d="M25 22 Q26.5 20 28 22" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 22 Q33.5 20 35 22" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M27.5 26 Q30 28.5 32.5 26" stroke="#3D2B1F" strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="25" rx="1.8" ry="1.3" fill="#3D2B1F" />
      <circle cx="24" cy="27" r="2.5" fill="#E8A87C" opacity="0.4" />
      <circle cx="36" cy="27" r="2.5" fill="#E8A87C" opacity="0.4" />
      <polygon points="17,16 30,10 43,16 30,21" fill="#2D2D2D" />
      <rect x="16" y="15" width="28" height="2" rx="1" fill="#2D2D2D" />
      <line x1="30" y1="16" x2="40" y2="12.5" stroke="#2D2D2D" strokeWidth="1" />
      <line x1="40" y1="12.5" x2="41.5" y2="17" stroke={gownColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 36 L11 60 L49 60 L45 36 Z" fill="#2D2D2D" />
      <path d="M19 36 L16 60 L30 60 L30 36 Z" fill={gownColor} />
      <path d="M30 36 L30 60 L44 60 L41 36 Z" fill={gownColor} />
      <path d="M22.5 35 L30 40 L37.5 35" stroke="#FFB6C1" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FloatingParticle({ emoji, index }: { emoji: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const startX = 5 + index * 20 + Math.random() * 10;
    const startY = 10 + Math.random() * 80;

    gsap.set(ref.current, {
      left: `${startX}%`,
      top: `${startY}%`,
      opacity: 0.4,
      scale: 0.8,
      yoyo: true,
      rotation: 0,
    });

    gsap.to(ref.current, {
      y: -20,
      opacity: 0.15,
      duration: 5 + index,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(ref.current, {
      rotation: 360,
      duration: 8 + index * 2,
      repeat: -1,
      ease: 'none',
    });
  }, [index]);

  return <div ref={ref} className="absolute text-2xl md:text-3xl select-none pointer-events-none">{emoji}</div>;
}

// ---------- 弹幕调度系统 ----------
// 关键约束（10 秒 50 条并发场景）：
// 1. 8 条轨道，每条轨道需保持安全距离
// 2. 最大同时渲染 24 条（8 × 3）
// 3. 超出时进入 FIFO 等待队列，按顺序释放
// 4. 新弹幕用 seenIds 集合去重，避免 re-render 导致重播
// 弹幕调度常量
const TRACK_COUNT = 10;                 // 轨道数（少一点，画面更清爽）
const TRACK_HEIGHT_PERCENT = 8;         // 每条轨道高度（%），10 条轨道 3%~83%
const TRACK_MIN_GAP_SECONDS = 5;        // 同轨道两条弹幕最小间隔（秒）
const MIN_DURATION = 16;                // 最短飞行时间（秒）
const MAX_DURATION = 26;                // 最长飞行时间（秒）
const MAX_QUEUE_SIZE = 40;              // 队列上限
const BLESSINGS_PER_CONFETTI = 5;       // 每 5 个祝福触发一次彩带

interface ActiveItem {
  id: string;
  blessing: Blessing;
  track: number;
  duration: number;
  startTime: number; // performance.now
}

// 选择最佳轨道：选 nextAvailableAt 最早的（即当前最空闲的）
// 返回 { track, waitMs }。waitMs > 2000 表示所有轨道都很忙，应该进入队列
function pickBestTrack(
  trackNextAvailable: number[],
  nowMs: number
): { track: number; waitMs: number } {
  let bestTrack = 0;
  let bestAvailable = trackNextAvailable[0];

  for (let t = 1; t < TRACK_COUNT; t++) {
    if (trackNextAvailable[t] < bestAvailable) {
      bestAvailable = trackNextAvailable[t];
      bestTrack = t;
    }
  }

  const waitMs = Math.max(0, bestAvailable - nowMs);
  return { track: bestTrack, waitMs };
}

function randomDuration(): number {
  // 随机速度，避免同批次弹幕成队飘过
  return MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
}

// 弹幕组件 — 用 ref 精确控制动画起止，不再依赖 props 变化重启动画
function DanmakuItem({
  blessing,
  track,
  duration,
  onComplete,
}: {
  blessing: Blessing;
  track: number;
  duration: number;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gownInfo = getGownInfo(blessing);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // 垂直位置：用 CSS top 百分比（相对父容器），避免 gsap y% 是相对自身高度
  // 12 条轨道，每条 7%，从 3% 起始到 87%，大致均匀铺满屏幕
  const topPercent = 3 + track * 7;

  useEffect(() => {
    if (!ref.current) return;

    // 初始状态：从右侧屏幕外、缩小、透明开始，准备进入（先清掉内联 transform，再设置）
    gsap.set(ref.current, {
      x: '110vw',
      scale: 0.85,
      opacity: 0,
      visibility: 'visible',
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onCompleteRef.current) onCompleteRef.current();
      },
    });

    // 入场（快速显现）
    tl.to(ref.current, {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'back.out(1.6)',
    });

    // 横向匀速穿过屏幕
    tl.to(ref.current, {
      x: '-120vw',
      duration,
      ease: 'none',
    }, '<');

    // 尾部淡出
    tl.to(ref.current, {
      opacity: 0,
      scale: 0.85,
      duration: 0.4,
    }, `-=0.4`);

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="absolute whitespace-nowrap flex items-end gap-1 will-change-transform"
      style={{
        top: `${topPercent}%`,
        left: 0,
        transform: 'translateX(110vw)',
        opacity: 0,
        visibility: 'hidden',
      }}
    >
      <BearDanmakuAvatar gownColor={gownInfo.gown} />
      {blessing.imageUrl && (
        <img
          src={blessing.imageUrl}
          alt=""
          className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-md"
        />
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
        {blessing.sticker && (
          <span className="text-2xl drop-shadow">
            {getStickerEmoji(blessing.sticker)}
          </span>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white">{blessing.name}</span>
          <span className="text-sm text-white/85">{blessing.message}</span>
        </div>
      </div>
    </div>
  );
}

export default function ScreenPage() {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<'danmaku' | 'wall'>('danmaku');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isHistory, setIsHistory] = useState(false);

  // 弹幕动态渲染列表（受控，不跟 blessings 数组直接 1:1 映射）
  const [activeDanmaku, setActiveDanmaku] = useState<ActiveItem[]>([]);

  const danmakuContainerRef = useRef<HTMLDivElement>(null);

  // 已处理过的 blessing id
  const seenIdsRef = useRef<Set<string>>(new Set());
  // 每条轨道的"下一次可用时间"（performance.now() 毫秒）
  // 参考 CommentCoreLibrary 的轨道时间戳管理
  const trackNextAvailableRef = useRef<number[]>(new Array(TRACK_COUNT).fill(0));
  // FIFO 等待队列
  const waitQueueRef = useRef<ActiveItem[]>([]);
  // 定时尝试释放队列的 interval 句柄
  const queueTimerRef = useRef<number | null>(null);
  // 新祝福计数器（每累计 BLESSINGS_PER_CONFETTI 条触发一次彩带）
  const confettiCountRef = useRef<number>(0);
  // 第一次加载的标记（避免初次加载所有老祝福全部涌入）
  const firstLoadRef = useRef<boolean>(true);

  const triggerConfetti = useCallback(async () => {
    const confettiFn = await getConfettiFn();
    if (!confettiFn) return;
    // 随机选一种彩带主题（6 选 1），每次触发都不同
    const theme = Math.floor(Math.random() * 6);
    // 统一的基础参数：zIndex 要大到能覆盖页面其他层，gravity 让彩带下落，ticks 控制持续时间
    const common = { origin: { y: 0.7 }, zIndex: 9999, startVelocity: 45, gravity: 1.0, ticks: 200, disableForReducedMotion: false };

    if (theme === 0) {
      // 金箔彩纸（经典）
      confettiFn({
        ...common,
        particleCount: 120,
        spread: 70,
        shapes: ['square', 'circle'],
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFFFFF', '#7CFC00'],
        scalar: 0.9,
      });
    } else if (theme === 1) {
      // 星星雨
      confettiFn({
        ...common,
        particleCount: 150,
        spread: 90,
        shapes: ['star', 'circle'],
        colors: ['#FFD700', '#FFF8DC', '#FFA500', '#FF6B9D'],
        scalar: 1.3,
      });
    } else if (theme === 2) {
      // 大号彩纸
      confettiFn({
        ...common,
        particleCount: 80,
        spread: 80,
        shapes: ['square', 'circle'],
        colors: ['#FF6B9D', '#FFD700', '#3498DB', '#2ECC71', '#FFFFFF'],
        scalar: 1.4,
      });
    } else if (theme === 3) {
      // 左右双炮烟花
      confettiFn({
        ...common,
        particleCount: 80,
        spread: 55,
        angle: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#FF6B9D', '#FFD700', '#FFFFFF', '#9B59B6'],
        scalar: 1.0,
      });
      confettiFn({
        ...common,
        particleCount: 80,
        spread: 55,
        angle: 120,
        origin: { x: 1, y: 0.7 },
        colors: ['#FF6B9D', '#FFD700', '#FFFFFF', '#3498DB'],
        scalar: 1.0,
      });
    } else if (theme === 4) {
      // 粉紫色梦幻
      confettiFn({
        ...common,
        particleCount: 130,
        spread: 65,
        shapes: ['square', 'circle'],
        colors: ['#FFC0CB', '#FF69B4', '#DDA0DD', '#FFFFFF', '#9370DB'],
        scalar: 1.1,
      });
    } else {
      // 礼花大爆发：分三层，上中下错开
      confettiFn({
        ...common,
        origin: { y: 0.7 },
        particleCount: 60,
        spread: 80,
        shapes: ['circle', 'square', 'star'],
        colors: ['#FFD700', '#FF6B9D', '#3498DB', '#2ECC71', '#F39C12', '#FFFFFF'],
        scalar: 1.1,
      });
      setTimeout(() => {
        confettiFn({
          ...common,
          origin: { y: 0.5 },
          particleCount: 60,
          spread: 80,
          shapes: ['circle', 'square', 'star'],
          colors: ['#FFD700', '#FF6B9D', '#3498DB', '#2ECC71', '#F39C12', '#FFFFFF'],
          scalar: 1.1,
        });
      }, 150);
      setTimeout(() => {
        confettiFn({
          ...common,
          origin: { y: 0.35 },
          particleCount: 60,
          spread: 80,
          shapes: ['circle', 'square', 'star'],
          colors: ['#FFD700', '#FF6B9D', '#3498DB', '#2ECC71', '#F39C12', '#FFFFFF'],
          scalar: 1.1,
        });
      }, 300);
    }
  }, []);

  // 尝试从队列释放最多 2 条到屏幕（每 400ms 最多释放 2 条）
  const tryReleaseFromQueue = useCallback(() => {
    if (waitQueueRef.current.length === 0) return;

    const nowMs = performance.now();
    let released = 0;
    const batch: ActiveItem[] = [];

    // 每一轮最多放 2 条，让屏幕慢慢"填满"而不是一次性涌入
    while (waitQueueRef.current.length > 0 && released < 2) {
      const { track, waitMs } = pickBestTrack(trackNextAvailableRef.current, nowMs);
      // 任何轨道都要等超过 1 秒？那就本轮不释放，等下一轮
      if (waitMs > 1000) break;

      const next = waitQueueRef.current.shift()!;
      const duration = randomDuration();
      const item: ActiveItem = {
        ...next,
        track,
        duration,
        startTime: nowMs,
      };
      trackNextAvailableRef.current[track] = nowMs + TRACK_MIN_GAP_SECONDS * 1000;
      batch.push(item);
      released++;
    }

    if (batch.length > 0) {
      setActiveDanmaku((prev) => [...prev, ...batch]);
    }
  }, []);

  // 启动队列定时检查器（懒启动）
  const ensureQueueTimer = useCallback(() => {
    if (queueTimerRef.current !== null) return;
    queueTimerRef.current = window.setInterval(() => {
      tryReleaseFromQueue();
      // 队列空了超过几轮就停掉计时器，避免空转
      if (waitQueueRef.current.length === 0 && queueTimerRef.current !== null) {
        clearInterval(queueTimerRef.current);
        queueTimerRef.current = null;
      }
    }, 400);
  }, [tryReleaseFromQueue]);

  // 添加一条新弹幕
  const enqueueDanmaku = useCallback(
    (blessing: Blessing) => {
      const now = performance.now();
      const { track, waitMs } = pickBestTrack(trackNextAvailableRef.current, now);

      const duration = randomDuration();

      // 所有轨道都需等超过 3 秒 → 进入等待队列
      if (waitMs > 3000) {
        waitQueueRef.current.push({
          id: blessing.id,
          blessing,
          track: 0, // 占位，释放时重新分配
          duration: 0,
          startTime: 0,
        });
        // 队列上限保护
        if (waitQueueRef.current.length > MAX_QUEUE_SIZE) {
          waitQueueRef.current.splice(0, waitQueueRef.current.length - MAX_QUEUE_SIZE);
        }
        ensureQueueTimer();
        return;
      }

      // 可以立即发射（允许一点小延迟）
      const item: ActiveItem = {
        id: blessing.id,
        blessing,
        track,
        duration,
        startTime: now,
      };
      // 锁死这条轨道
      trackNextAvailableRef.current[track] = now + TRACK_MIN_GAP_SECONDS * 1000;
      setActiveDanmaku((prev) => [...prev, item]);
    },
    [ensureQueueTimer]
  );

  // 弹幕播放完成
  const onDanmakuComplete = useCallback(
    (id: string) => {
      setActiveDanmaku((prev) => prev.filter((x) => x.id !== id));
      // 尝试释放一条等待的
      if (waitQueueRef.current.length > 0) {
        setTimeout(tryReleaseFromQueue, 80);
      }
    },
    [tryReleaseFromQueue]
  );

  // 轮询获取 blessings
  const fetchBlessings = useCallback(async () => {
    try {
      const res = await fetch('/api/blessings?mode=active');
      if (!res.ok) return;
      const data: Blessing[] = await res.json();

      setBlessings(data); // 墙模式用

      if (mode !== 'danmaku' || isHistory) return;

      const isFirst = firstLoadRef.current;
      firstLoadRef.current = false;

      const newBlessings: Blessing[] = [];
      for (const b of data) {
        if (!seenIdsRef.current.has(b.id)) {
          seenIdsRef.current.add(b.id);
          newBlessings.push(b);
        }
      }

      // 按创建时间正序（先到先入场）
      newBlessings.sort((a, b) => a.createdAt - b.createdAt);

      // 首屏/后续都只保留最近 30 条入队，防止突发大量涌入
      const eligible = newBlessings.length > 30
        ? newBlessings.slice(newBlessings.length - 30)
        : newBlessings;

      if (eligible.length > 0 && isPlaying) {
        // 首屏不触发特效，但要计入计数器，从下一条新增开始累计判断
        confettiCountRef.current += eligible.length;
        if (!isFirst) {
          playNotificationSound();
          // 每累计 BLESSINGS_PER_CONFETTI 个祝福触发一次彩带（一次轮询触发多次也支持）
          const times = Math.floor(confettiCountRef.current / BLESSINGS_PER_CONFETTI);
          if (times > 0) {
            confettiCountRef.current = confettiCountRef.current % BLESSINGS_PER_CONFETTI;
            for (let i = 0; i < times; i++) {
              setTimeout(() => triggerConfetti(), i * 400);
            }
          }
        }
      }

      // 分批进入调度器：每条间隔 180ms 调用 enqueueDanmaku
      // enqueueDanmaku 内部会判断是否入队/直接发射
      eligible.forEach((b, i) => {
        const delayMs = isFirst ? i * 220 : i * 180;
        setTimeout(() => enqueueDanmaku(b), delayMs);
      });
    } catch {
      // 静默重试
    }
  }, [mode, isHistory, isPlaying, enqueueDanmaku, triggerConfetti]);

  useEffect(() => {
    // 重置状态
    seenIdsRef.current = new Set();
    trackNextAvailableRef.current = new Array(TRACK_COUNT).fill(0);
    waitQueueRef.current = [];
    firstLoadRef.current = true;
    setActiveDanmaku([]);

    if (mode === 'danmaku' && !isHistory) {
      fetchBlessings();
      const interval = window.setInterval(fetchBlessings, 2500);
      return () => clearInterval(interval);
    } else if (isHistory) {
      fetch('/api/blessings?mode=history')
        .then((r) => r.json())
        .then((data: Blessing[]) => setBlessings(data))
        .catch(() => {});
    }
  }, [mode, isHistory, fetchBlessings]);

  const handleClear = async () => {
    await fetch('/api/blessings?action=clear', { method: 'POST' });
    setShowClearConfirm(false);
    // 清空本地调度器状态
    trackNextAvailableRef.current = new Array(TRACK_COUNT).fill(0);
    waitQueueRef.current = [];
    setActiveDanmaku([]);
  };

  const toggleHistory = async () => {
    if (isHistory) {
      setIsHistory(false);
      return;
    }
    try {
      const res = await fetch('/api/blessings?mode=history');
      const data: Blessing[] = await res.json();
      setBlessings(data);
      setIsHistory(true);
    } catch {}
  };

  const floatingParticles = useMemo(() => {
    const particles = ['🌸', '⭐', '🌺', '✨'];
    return particles.map((p, i) => ({ emoji: p, index: i }));
  }, []);

  const emptyState = (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium bg-white/25 hover:bg-white/35 border border-white/30 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </Link>
      </div>

      <div className="relative z-10 text-center px-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            毕业祝福墙
          </h1>
          <p className="text-xl md:text-2xl text-white/60 animate-pulse">
            等待祝福到来...
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16" />
    </div>
  );

  if (blessings.length === 0 && mode === 'wall') return emptyState;
  if (blessings.length === 0 && !isHistory) return emptyState;

  const header = (
    <header className="flex items-center justify-between px-3 md:px-6 py-3 border-b border-white/10 glass-card-light rounded-none mx-0 mb-0">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium bg-white/25 hover:bg-white/35 border border-white/30 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </Link>
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <h2 className="text-sm font-bold text-white hidden sm:inline">
          {mode === 'danmaku' ? '弹幕模式' : '评论墙'}
          {isHistory && ' (历史)'}
        </h2>
        {!isHistory && (
          <span className="text-white/50 text-xs bg-white/10 px-2 py-0.5 rounded-full font-medium">
            {blessings.length} 条
            {activeDanmaku.length > 0 && ` · 同屏 ${activeDanmaku.length}`}
            {waitQueueRef.current.length > 0 && ` · 等待 ${waitQueueRef.current.length}`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 md:gap-2">
        {!isHistory ? (
          <>
            <button
              onClick={() => {
                const container = danmakuContainerRef.current?.parentElement;
                if (container) {
                  gsap.to(container, {
                    opacity: 0,
                    scale: 0.97,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                      setMode(mode === 'danmaku' ? 'wall' : 'danmaku');
                      gsap.fromTo(container,
                        { opacity: 0, scale: 1.03 },
                        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
                      );
                    }
                  });
                } else {
                  setMode(mode === 'danmaku' ? 'wall' : 'danmaku');
                }
              }}
              className="px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
            >
              {mode === 'danmaku' ? '墙模式' : '弹幕'}
            </button>
            <button
              onClick={toggleHistory}
              className="px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
            >
              历史
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              清屏
            </button>
          </>
        ) : (
          <button
            onClick={toggleHistory}
            className="px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 glass-btn-accent transition-all"
          >
            返回
          </button>
        )}
        <Link
          href="/"
          className="px-2 md:px-3 py-1.5 rounded-lg text-xs font-bold text-white glass-btn-accent transition-all"
        >
          首页
        </Link>
      </div>
    </header>
  );

  const clearModal = showClearConfirm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}>
      <div
        ref={(el) => {
          if (el) {
            gsap.fromTo(el,
              { opacity: 0, scale: 0.9 },
              { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
            );
          }
        }}
        className="bg-white rounded-3xl p-8 mx-4 max-w-sm text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">{getGraduationEmoji()}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">确认清屏？</h3>
        <p className="text-gray-500 text-sm mb-6">
          当前祝福将被隐藏，可在历史记录中查看
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl font-medium hover:from-red-500 hover:to-rose-600 transition-all"
          >
            确认清屏
          </button>
        </div>
      </div>
    </div>
  );

  // 弹幕模式
  if (mode === 'danmaku' && !isHistory) {
    return (
      <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
        {header}
        {clearModal}

        {floatingParticles.map((p) => (
          <FloatingParticle key={`float-${p.index}`} emoji={p.emoji} index={p.index} />
        ))}

        <div ref={danmakuContainerRef} className="flex-1 relative overflow-hidden">
          {activeDanmaku.map((item) => (
            <DanmakuItem
              key={item.id}
              blessing={item.blessing}
              track={item.track}
              duration={item.duration}
              onComplete={() => onDanmakuComplete(item.id)}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" />
      </div>
    );
  }

  // 墙模式
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {header}
      {clearModal}

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1400px] mx-auto">
          {blessings.map((blessing, index) => {
            const gownInfo = getGownInfo(blessing);

            return (
              <div
                key={blessing.id}
                ref={(el) => {
                  if (el && !el.dataset.gsapTilt) {
                    el.dataset.gsapTilt = 'true';
                    const card = el;
                    card.addEventListener('mouseenter', () => {
                      gsap.to(card, {
                        y: -6,
                        rotateX: -3,
                        rotateY: 3,
                        duration: 0.4,
                        ease: 'power2.out',
                      });
                    });
                    card.addEventListener('mouseleave', () => {
                      gsap.to(card, {
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.4,
                        ease: 'power2.out',
                      });
                    });
                    gsap.fromTo(card,
                      { opacity: 0, y: 40, scale: 0.9, rotationX: -15 },
                      {
                        opacity: 1, y: 0, scale: 1, rotationX: 0,
                        duration: 0.6,
                        delay: index * 0.08,
                        ease: 'back.out(1.4)',
                      }
                    );
                  }
                }}
                className="glass-card p-5"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br ${gownInfo.bg} flex items-center justify-center text-white text-base font-bold shadow-md border ${gownInfo.border}`}>
                    {blessing.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-white">
                        {blessing.name}
                      </h3>
                      <span className="text-white/40 text-xs">
                        {new Date(blessing.createdAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed break-words">
                      {blessing.message}
                    </p>
                    {blessing.sticker && (
                      <div className="mt-2">
                        <span className="text-4xl drop-shadow-lg">
                          {getStickerEmoji(blessing.sticker)}
                        </span>
                      </div>
                    )}
                    {blessing.imageUrl && (
                      <div className="mt-3 relative w-full h-36 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={blessing.imageUrl}
                          alt="祝福图片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" />
    </div>
  );
}
