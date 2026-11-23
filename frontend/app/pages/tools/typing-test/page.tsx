'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import {
  Keyboard,
  RotateCcw,
  Shuffle,
  Trophy,
  Flame,
  ArrowLeft,
  Timer,
  Target,
  Zap,
  TrendingUp,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart3,
  Award,
  CheckCircle2,
  XCircle,
  Gauge,
  Clock,
  Hash,
  Sparkles,
  Crown,
  Share2,
  Repeat,
  AlertCircle,
  LineChart,
  Type,
  Quote as QuoteIcon,
  BookOpen,
} from 'lucide-react';

// ─── Audio Synthesizer (Native Web Audio API) ────────────────────────────────

function playKeySound(isError = false, soundEnabled = true) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isError) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550 + Math.random() * 150, ctx.currentTime);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch {
    // Audio context may be restricted by browser policy before first interaction
  }
}

function playVictoryFanfare(soundEnabled = true) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.22);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.24);
    });
  } catch {
    // Ignore audio restriction
  }
}

// ─── Data Banks: Sentences, Words & Quotes ──────────────────────────────────

const sentenceBanks: Record<string, string[]> = {
  easy: [
    'The quick brown fox jumps over the lazy dog near the riverbank every morning.',
    'She sells seashells by the seashore while the golden sun sets behind the mountains.',
    'A journey of a thousand miles begins with a single step forward into the unknown.',
    'The cat sat on the warm windowsill and watched the birds fly across the clear blue sky.',
    'Every great dream begins with a dreamer who believes in the power of creative thought.',
    'Life is what happens when you are busy making other plans for the bright future ahead.',
    'The early bird catches the worm but the second mouse gets the cheese from the trap.',
    'Practice makes perfect and patience is the key to mastering any new skill in this life.',
    'Stars shine brightest in the darkest of nights reminding us that hope never fades away.',
    'Technology is best when it brings people together and makes the world feel closer.',
    'The snow fell gently over the quiet village coating the houses in a blanket of silence.',
    'Clear your mind, take a deep breath, and let your fingers dance across the keyboard effortlessly.',
  ],
  medium: [
    'The rapid evolution of artificial intelligence continues to reshape how humanity works, communicates, and innovates across every industry.',
    'Quantum computing introduces revolutionary paradigms capable of solving complex molecular, climate, and cryptographic equations at unprecedented speeds.',
    'The harmony between minimalist design principles and robust engineering produces digital experiences that feel intuitive, elegant, and timeless.',
    'Modern web ecosystems demand proficiency in responsive design, resilient state management, and real-time streaming architectures.',
    'Creative problem solving requires synthesizing diverse perspectives and cross-pollinating disciplines to discover groundbreaking insights.',
    'Cybersecurity is no longer just a technical requirement but a fundamental pillar supporting trust in the modern digital economy.',
    'Machine learning models uncover intricate patterns buried within massive data oceans that human intuition alone could never isolate.',
    'Open source ecosystems have transformed the digital era by democratizing knowledge and fostering global collaborative innovation.',
  ],
  hard: [
    'Asynchronous concurrency paradigms, encompassing non-blocking event loops and reactive streams, are fundamental for architecting high-throughput distributed microservices.',
    'Epistemological inquiries regarding synthetic consciousness challenge our fundamental definitions of sentience, cognitive autonomy, and semantic comprehension.',
    'Decentralized consensus algorithms must rigorously balance partition tolerance, cryptographic integrity, and state consistency under Byzantine fault constraints.',
    'Neuromorphic architectures emulate biological synaptic plasticity, achieving computational density while drastically slashing thermodynamic dissipation.',
    'The convergence of nanomedicine, algorithmic genomics, and bio-computation heralds an inflection point for precision therapeutics and proactive longevity.',
    'Zero-knowledge succint non-interactive arguments of knowledge (zk-SNARKs) empower provable computational integrity without exposing sensitive underlying payloads.',
  ],
  code: [
    'const fetchData = async (url: string) => { const response = await fetch(url); return response.json(); };',
    'function fibonacci(n: number): number { return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); }',
    'const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number) => { let timer: NodeJS.Timeout; return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };',
    'interface UserRecord { id: string; username: string; email: string; role: "admin" | "contributor"; active: boolean; }',
    'export const useStorage = <T>(key: string, init: T): [T, (val: T) => void] => { const [val, setVal] = useState(init); return [val, setVal]; };',
    'const pipeline = (...fns: Function[]) => (initial: any) => fns.reduce((acc, fn) => fn(acc), initial);',
  ],
};

const commonWordsList = [
  'time', 'year', 'people', 'way', 'day', 'man', 'thing', 'woman', 'life', 'child',
  'world', 'school', 'state', 'family', 'student', 'group', 'country', 'problem',
  'hand', 'part', 'place', 'case', 'week', 'company', 'system', 'program', 'question',
  'work', 'government', 'number', 'night', 'point', 'home', 'water', 'room', 'mother',
  'area', 'money', 'story', 'fact', 'month', 'lot', 'right', 'study', 'book', 'eye',
  'job', 'word', 'business', 'issue', 'side', 'kind', 'head', 'house', 'service',
  'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'member', 'law', 'car',
  'city', 'community', 'name', 'president', 'team', 'minute', 'idea', 'kid', 'body',
  'information', 'back', 'parent', 'face', 'others', 'level', 'office', 'door', 'health',
  'person', 'art', 'war', 'history', 'party', 'result', 'change', 'morning', 'reason',
  'research', 'girl', 'guy', 'moment', 'air', 'teacher', 'force', 'education', 'always',
  'create', 'build', 'future', 'design', 'nature', 'vision', 'energy', 'focus', 'simple',
  'code', 'light', 'sound', 'dream', 'space', 'speed', 'swift', 'action', 'smart', 'clean',
  'logic', 'matrix', 'signal', 'memory', 'engine', 'canvas', 'bright', 'planet', 'wonder',
  'flow', 'spark', 'quest', 'modern', 'digital', 'global', 'effort', 'master', 'skill',
  'brave', 'silver', 'shadow', 'forest', 'stream', 'beacon', 'harbor', 'summit', 'rhythm',
  'craft', 'impact', 'bridge', 'orbit', 'vision', 'glory', 'stride', 'zenith', 'pulse'
];

interface QuoteItem {
  id: string;
  text: string;
  author: string;
  length: 'short' | 'medium' | 'long';
}

const quoteBank: QuoteItem[] = [
  // Short quotes (< 80 chars)
  { id: 'q1', text: 'Stay hungry, stay foolish.', author: 'Steve Jobs', length: 'short' },
  { id: 'q2', text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', length: 'short' },
  { id: 'q3', text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates', length: 'short' },
  { id: 'q4', text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds', length: 'short' },
  { id: 'q5', text: 'Knowledge is power. Power to do evil or power to do good.', author: 'Richard Feynman', length: 'short' },
  { id: 'q6', text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', length: 'short' },
  { id: 'q7', text: 'Premature optimization is the root of all evil.', author: 'Donald Knuth', length: 'short' },
  { id: 'q8', text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', length: 'short' },
  { id: 'q9', text: 'Make each day your masterpiece.', author: 'John Wooden', length: 'short' },
  { id: 'q10', text: 'It always seems impossible until it is done.', author: 'Nelson Mandela', length: 'short' },

  // Medium quotes (80 - 170 chars)
  { id: 'q11', text: 'Your time is limited, so don\'t waste it living someone else\'s life. Have the courage to follow your heart and intuition.', author: 'Steve Jobs', length: 'medium' },
  { id: 'q12', text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler', length: 'medium' },
  { id: 'q13', text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela', length: 'medium' },
  { id: 'q14', text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.', author: 'Alan Turing', length: 'medium' },
  { id: 'q15', text: 'The present is theirs; the future, for which I really worked, is mine.', author: 'Nikola Tesla', length: 'medium' },
  { id: 'q16', text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson', length: 'medium' },
  { id: 'q17', text: 'If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.', author: 'Nikola Tesla', length: 'medium' },
  { id: 'q18', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', length: 'medium' },

  // Long quotes (170+ chars)
  { id: 'q19', text: 'Here\'s to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. Because the people who are crazy enough to think they can change the world, are the ones who do.', author: 'Steve Jobs', length: 'long' },
  { id: 'q20', text: 'The most important property of a program is whether it accomplishes the intention of its user. The second most important property is whether it can be understood and maintained by other programmers.', author: 'C.A.R. Hoare', length: 'long' },
  { id: 'q21', text: 'Sometimes it is the people no one imagines anything of who do the things that no one can imagine. We are not just building machines, we are unraveling the secrets of logic and possibility.', author: 'Alan Turing', length: 'long' },
  { id: 'q22', text: 'I am not discouraged, because every wrong attempt discarded is another step forward. Geniuses are just common people who had the discipline to persevere when everyone else quit.', author: 'Thomas Edison', length: 'long' },
  { id: 'q23', text: 'Somewhere, something incredible is waiting to be known. The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.', author: 'Carl Sagan', length: 'long' },
];

export type TestMode = 'time' | 'words' | 'quote';

const timeOptions = [15, 30, 60, 120];
const wordCountOptions = [10, 25, 50, 100];
const quoteLengthOptions: { id: 'all' | 'short' | 'medium' | 'long'; label: string }[] = [
  { id: 'all', label: 'All Lengths' },
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

const difficultyConfig: Record<string, { label: string; color: string; desc: string; icon: React.ReactNode }> = {
  easy: { label: 'Beginner', color: tk.green, desc: 'Everyday sentences', icon: <Target size={14} /> },
  medium: { label: 'Intermediate', color: tk.gold, desc: 'Complex paragraphs', icon: <TrendingUp size={14} /> },
  hard: { label: 'Advanced', color: tk.purple, desc: 'Academic & technical', icon: <Zap size={14} /> },
  code: { label: 'Code Mode', color: tk.cyan, desc: 'TypeScript & JavaScript', icon: <Hash size={14} /> },
};

// ─── Confetti System ────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  life: number;
  shape: 'rect' | 'circle' | 'triangle';
}

function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const burst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const colors = ['#00d4ff', '#a855f7', '#00e5a0', '#f5c842', '#ff6b6b', '#ff79c6', '#50fa7b', '#bd93f9'];
    const shapes: Particle['shape'][] = ['rect', 'circle', 'triangle'];
    const particles: Particle[] = [];
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    for (let i = 0; i < 220; i++) {
      particles.push({
        x: cw / 2 + (Math.random() - 0.5) * 360,
        y: ch * 0.35,
        vx: (Math.random() - 0.5) * 22,
        vy: Math.random() * -22 - 6,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 16,
        opacity: 1,
        life: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, cw, ch);
      let alive = false;

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.life -= 0.011;
        p.opacity = Math.max(0, p.life);

        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.45);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(animRef.current);
    animate();
  }, [canvasRef]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return burst;
}

// ─── Rank / Level Progression Model ─────────────────────────────────────────

interface RankInfo {
  tier: number;
  title: string;
  emoji: string;
  color: string;
  glow: string;
  minWpm: number;
  maxWpm: number;
  percentile: string;
  nextTierTitle?: string;
  nextTierWpm?: number;
}

function getRank(wpm: number): RankInfo {
  if (wpm >= 120) {
    return {
      tier: 7,
      title: 'Legendary Typist',
      emoji: '👑',
      color: '#FFD700',
      glow: 'rgba(255,215,0,0.4)',
      minWpm: 120,
      maxWpm: 200,
      percentile: 'Top 0.5% (World Class)',
    };
  }
  if (wpm >= 100) {
    return {
      tier: 6,
      title: 'Speed Demon',
      emoji: '⚡',
      color: tk.cyan,
      glow: 'rgba(0,212,255,0.4)',
      minWpm: 100,
      maxWpm: 120,
      percentile: 'Top 3% (Master Typist)',
      nextTierTitle: 'Legendary Typist',
      nextTierWpm: 120,
    };
  }
  if (wpm >= 80) {
    return {
      tier: 5,
      title: 'Keyboard Ninja',
      emoji: '🥷',
      color: tk.purple,
      glow: 'rgba(168,85,247,0.35)',
      minWpm: 80,
      maxWpm: 100,
      percentile: 'Top 10% (Elite)',
      nextTierTitle: 'Speed Demon',
      nextTierWpm: 100,
    };
  }
  if (wpm >= 60) {
    return {
      tier: 4,
      title: 'Fast Typist',
      emoji: '🚀',
      color: tk.green,
      glow: 'rgba(0,229,160,0.35)',
      minWpm: 60,
      maxWpm: 80,
      percentile: 'Top 25% (Above Average)',
      nextTierTitle: 'Keyboard Ninja',
      nextTierWpm: 80,
    };
  }
  if (wpm >= 40) {
    return {
      tier: 3,
      title: 'Fluent Typist',
      emoji: '✨',
      color: tk.gold,
      glow: 'rgba(245,200,66,0.3)',
      minWpm: 40,
      maxWpm: 60,
      percentile: 'Top 50% (Standard Pace)',
      nextTierTitle: 'Fast Typist',
      nextTierWpm: 60,
    };
  }
  if (wpm >= 20) {
    return {
      tier: 2,
      title: 'Getting Started',
      emoji: '🌱',
      color: '#8bc34a',
      glow: 'rgba(139,195,74,0.25)',
      minWpm: 20,
      maxWpm: 40,
      percentile: 'Top 75% (Building Muscle Memory)',
      nextTierTitle: 'Fluent Typist',
      nextTierWpm: 40,
    };
  }
  return {
    tier: 1,
    title: 'Warming Up',
    emoji: '🐢',
    color: tk.textDim,
    glow: 'rgba(122,138,160,0.2)',
    minWpm: 0,
    maxWpm: 20,
    percentile: 'Entry Level (Practice Mode)',
    nextTierTitle: 'Getting Started',
    nextTierWpm: 20,
  };
}

// ─── Glassmorphic Card ──────────────────────────────────────────────────────

function GlassCard({
  children,
  style,
  glowColor,
  noPad,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glowColor?: string;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(13,20,37,0.78), rgba(13,20,37,0.58))',
        border: '1px solid rgba(99,179,237,0.12)',
        borderRadius: 20,
        padding: noPad ? 0 : '24px',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${glowColor || 'rgba(255,255,255,0.09)'}, transparent)`,
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}

// ─── Virtual Keyboard Component ─────────────────────────────────────────────

const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

const homeRowKeys = new Set(['A', 'S', 'D', 'F', 'J', 'K', 'L', ';']);

function LiveKeyboard({ activeKey, errorKey }: { activeKey: string; errorKey: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0' }}>
      {keyboardRows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6, marginLeft: ri === 2 ? 16 : ri === 3 ? 36 : 0 }}>
          {row.map((key) => {
            const isActive = activeKey.toUpperCase() === key.toUpperCase();
            const isError = errorKey.toUpperCase() === key.toUpperCase();
            const isHome = homeRowKeys.has(key);
            return (
              <div
                key={key}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontFamily: tk.fontMono,
                  fontWeight: 600,
                  position: 'relative',
                  background: isError
                    ? 'rgba(255,107,107,0.25)'
                    : isActive
                    ? 'linear-gradient(135deg, rgba(0,212,255,0.35), rgba(168,85,247,0.25))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    isError
                      ? 'rgba(255,107,107,0.6)'
                      : isActive
                      ? 'rgba(0,212,255,0.6)'
                      : isHome
                      ? 'rgba(0,212,255,0.18)'
                      : 'rgba(255,255,255,0.06)'
                  }`,
                  color: isError ? tk.red : isActive ? tk.cyan : isHome ? tk.textMuted : tk.textDim,
                  transition: 'all 0.08s ease-out',
                  transform: isActive ? 'scale(1.14) translateY(-2px)' : 'scale(1)',
                  boxShadow: isActive
                    ? '0 4px 18px rgba(0,212,255,0.35)'
                    : isError
                    ? '0 4px 14px rgba(255,107,107,0.3)'
                    : 'none',
                }}
              >
                {key}
                {isHome && !isActive && !isError && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: 'rgba(0,212,255,0.5)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6 }}>
        <div
          style={{
            width: 320,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontFamily: tk.fontMono,
            fontWeight: 600,
            letterSpacing: '0.2em',
            background: activeKey === ' '
              ? 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(168,85,247,0.2))'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeKey === ' ' ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
            color: activeKey === ' ' ? tk.cyan : tk.textDim,
            transition: 'all 0.08s ease-out',
            transform: activeKey === ' ' ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          SPACE
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TypingSpeedTestPage() {
  // Test Mode state: 'time' | 'words' | 'quote'
  const [testMode, setTestMode] = useState<TestMode>('time');

  // Sub-options
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [wordCount, setWordCount] = useState<number>(25);
  const [quoteLength, setQuoteLength] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [currentQuoteAuthor, setCurrentQuoteAuthor] = useState<string>('');

  // Style / Difficulty state (for Time & Words)
  const [difficulty, setDifficulty] = useState<string>('easy');

  // Test Execution State
  const [text, setText] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [activeKey, setActiveKey] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [personalBest, setPersonalBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [totalTests, setTotalTests] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showTextReview, setShowTextReview] = useState(false);

  // Time-series history for rich graph
  const [historyPoints, setHistoryPoints] = useState<{ sec: number; wpm: number; errors: number }[]>([]);
  const [missedKeysMap, setMissedKeysMap] = useState<Record<string, number>>({});
  const [, setTotalErrorsCount] = useState(0);

  // High precision timing refs
  const startTimeRef = useRef<number>(0);
  const finalElapsedRef = useRef<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentInputRef = useRef<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const burst = useConfetti(canvasRef);

  currentInputRef.current = input;

  // ─── Text Generator Across Modes ──────────────────────────────────────────
  const generateText = useCallback(() => {
    let generated = '';
    let author = '';

    if (testMode === 'quote') {
      const filtered = quoteLength === 'all'
        ? quoteBank
        : quoteBank.filter((q) => q.length === quoteLength);
      const list = filtered.length > 0 ? filtered : quoteBank;
      const picked = list[Math.floor(Math.random() * list.length)];
      generated = picked.text;
      author = picked.author;
      setCurrentQuoteAuthor(author);
    } else if (testMode === 'words') {
      const wordsArr: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const randWord = commonWordsList[Math.floor(Math.random() * commonWordsList.length)];
        wordsArr.push(randWord);
      }
      generated = wordsArr.join(' ');
      setCurrentQuoteAuthor('');
    } else {
      // Time mode
      const bank = sentenceBanks[difficulty] || sentenceBanks.easy;
      const shuffled = [...bank].sort(() => Math.random() - 0.5);
      const sentencesCount = timeLimit >= 60 ? 5 : 3;
      generated = shuffled.slice(0, sentencesCount).join(' ');
      setCurrentQuoteAuthor('');
    }

    setText(generated);
    setInput('');
    currentInputRef.current = '';
    setStarted(false);
    setFinished(false);
    setTimeLeft(timeLimit);
    setElapsedTime(0);
    finalElapsedRef.current = 0;
    setHistoryPoints([]);
    setMissedKeysMap({});
    setTotalErrorsCount(0);
    setActiveKey('');
    setErrorKey('');
    setShowTextReview(false);
  }, [testMode, timeLimit, wordCount, quoteLength, difficulty]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  // ─── LocalStorage Load ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedPb = localStorage.getItem('typing-test-pb');
      if (savedPb) setPersonalBest(Number(savedPb));
      const savedCount = localStorage.getItem('typing-test-total');
      if (savedCount) setTotalTests(Number(savedCount));
    } catch {
      // Safe fallback
    }
  }, []);

  // ─── Stable Timer Engine ──────────────────────────────────────────────────
  useEffect(() => {
    if (!started || finished) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);

      if (testMode === 'time') {
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          finalElapsedRef.current = timeLimit;
          setFinished(true);
          clearInterval(interval);
          burst();
          playVictoryFanfare(soundEnabled);
        }
      }

      // Record snapshot points every 1 second
      const secInt = Math.floor(elapsed);
      if (secInt > 0) {
        const currentTyped = currentInputRef.current;
        const words = currentTyped.trim().split(/\s+/).filter(Boolean).length;
        const currentWpm = Math.round(words / (elapsed / 60));

        setHistoryPoints((prev) => {
          if (prev.length === 0 || prev[prev.length - 1].sec !== secInt) {
            return [...prev, { sec: secInt, wpm: currentWpm, errors: 0 }];
          }
          return prev;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [started, finished, testMode, timeLimit, burst, soundEnabled]);

  // ─── Real-Time Stats Computation ──────────────────────────────────────────
  const stats = useMemo(() => {
    const elapsed = started
      ? finished
        ? finalElapsedRef.current || (testMode === 'time' ? timeLimit - timeLeft : elapsedTime)
        : (Date.now() - (startTimeRef.current || Date.now())) / 1000
      : 0;
    const minutes = Math.max(elapsed / 60, 0.01);

    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < input.length; i++) {
      if (i < text.length && input[i] === text[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const totalChars = input.length;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
    const rawWpm = Math.round(totalChars / 5 / minutes);
    const wpm = Math.max(0, Math.round(correctChars / 5 / minutes));
    const cpm = Math.round(correctChars / minutes);

    // Progress computation based on mode
    let progress = 0;
    if (text.length > 0) {
      progress = Math.min(100, (input.length / text.length) * 100);
    }

    // Typed words count
    const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;

    // Consistency score
    let consistency = 100;
    if (historyPoints.length > 2) {
      const wpms = historyPoints.map((p) => p.wpm);
      const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      if (avg > 0) {
        const variance = wpms.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / avg) * 100)));
      }
    }

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      progress,
      cpm,
      rawWpm,
      consistency,
      wordsTyped,
      elapsed: Math.round(elapsed * 10) / 10,
    };
  }, [text, input, started, finished, testMode, timeLimit, timeLeft, elapsedTime, historyPoints]);

  // ─── Completion Trigger when passage ends ─────────────────────────────────
  useEffect(() => {
    if (started && !finished && input.length >= text.length && text.length > 0) {
      const finalSec = (Date.now() - startTimeRef.current) / 1000;
      finalElapsedRef.current = Math.max(0.5, finalSec);
      setFinished(true);

      const wpm = stats.wpm;
      if (wpm > personalBest) {
        setPersonalBest(wpm);
        try {
          localStorage.setItem('typing-test-pb', String(wpm));
        } catch {}
      }

      setStreak((s) => s + 1);
      setTotalTests((t) => {
        const next = t + 1;
        try {
          localStorage.setItem('typing-test-total', String(next));
        } catch {}
        return next;
      });

      burst();
      playVictoryFanfare(soundEnabled);
    }
  }, [input, text, started, finished, stats.wpm, personalBest, burst, soundEnabled]);

  // ─── Keystroke Handler ────────────────────────────────────────────────────
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (finished) return;
      const val = e.target.value;

      if (!started) {
        setStarted(true);
        startTimeRef.current = Date.now();
      }

      setInput(val);

      const lastChar = val[val.length - 1] || '';
      const expectedChar = text[val.length - 1] || '';
      setActiveKey(lastChar);

      if (lastChar !== expectedChar && lastChar !== '') {
        setErrorKey(lastChar);
        setTotalErrorsCount((c) => c + 1);
        setMissedKeysMap((prev) => ({
          ...prev,
          [expectedChar || 'space']: (prev[expectedChar || 'space'] || 0) + 1,
        }));
        playKeySound(true, soundEnabled);
        setTimeout(() => setErrorKey(''), 250);
      } else {
        setErrorKey('');
        playKeySound(false, soundEnabled);
      }
    },
    [started, finished, text, soundEnabled]
  );

  // ─── Global Keyboard Shortcuts ────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        generateText();
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        generateText();
      } else if (finished && e.key === 'Enter') {
        generateText();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [generateText, finished]
  );

  // ─── Auto Scroll Cursor ───────────────────────────────────────────────────
  useEffect(() => {
    if (!textContainerRef.current || !started) return;
    const container = textContainerRef.current;
    const cursor = container.querySelector('[data-cursor="true"]');
    if (cursor) {
      const rect = cursor.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      if (rect.top > cRect.bottom - 45 || rect.bottom < cRect.top + 45) {
        cursor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [input, started]);

  // ─── Character Rendering with Syntax Coloration ───────────────────────────
  const renderedText = useMemo(() => {
    return text.split('').map((char, idx) => {
      let color: string = 'rgba(255,255,255,0.25)';
      let bg: string = 'transparent';
      let textDecoration: string = 'none';
      const isCursor = idx === input.length;

      if (idx < input.length) {
        if (input[idx] === char) {
          color = tk.green;
        } else {
          color = '#ff6b6b';
          bg = 'rgba(255,107,107,0.18)';
          textDecoration = char === ' ' ? 'none' : 'underline wavy rgba(255,107,107,0.6)';
        }
      } else if (isCursor) {
        color = tk.text;
      }

      return (
        <span
          key={idx}
          data-cursor={isCursor || undefined}
          style={{
            color,
            background: bg,
            textDecoration,
            borderRadius: bg !== 'transparent' ? 3 : 0,
            transition: 'color 0.05s ease',
            position: 'relative',
            ...(isCursor
              ? {
                  borderLeft: `2px solid ${tk.cyan}`,
                  marginLeft: -1,
                  paddingLeft: 1,
                  animation: 'cursorBlink 0.9s ease-in-out infinite',
                }
              : {}),
          }}
        >
          {char}
        </span>
      );
    });
  }, [text, input]);

  // ─── SVG WPM Progression Chart ────────────────────────────────────────────
  const sparkline = useMemo(() => {
    if (historyPoints.length < 2) return null;
    const w = 580;
    const h = 120;
    const pad = 14;

    const maxWpm = Math.max(...historyPoints.map((p) => p.wpm), stats.wpm, 10);
    const minWpm = Math.max(0, Math.min(...historyPoints.map((p) => p.wpm)) - 5);
    const avgWpm = Math.round(historyPoints.reduce((a, b) => a + b.wpm, 0) / historyPoints.length);

    const points = historyPoints.map((p, i) => {
      const x = pad + (i / (historyPoints.length - 1)) * (w - pad * 2);
      const y = pad + (h - pad * 2) - ((p.wpm - minWpm) / (maxWpm - minWpm || 1)) * (h - pad * 2);
      return { x, y, ...p };
    });

    const pathD = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = points[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x},${h - pad} L ${points[0].x},${h - pad} Z`;
    const lastP = points[points.length - 1];

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="resultAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tk.cyan} stopOpacity="0.3" />
              <stop offset="100%" stopColor={tk.cyan} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="resultLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={tk.cyan} />
              <stop offset="50%" stopColor={tk.purple} />
              <stop offset="100%" stopColor={tk.green} />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((lvl) => (
            <line
              key={lvl}
              x1={pad}
              y1={pad + (h - pad * 2) * (1 - lvl)}
              x2={w - pad}
              y2={pad + (h - pad * 2) * (1 - lvl)}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />
          ))}

          <line
            x1={pad}
            y1={pad + (h - pad * 2) - ((avgWpm - minWpm) / (maxWpm - minWpm || 1)) * (h - pad * 2)}
            x2={w - pad}
            y2={pad + (h - pad * 2) - ((avgWpm - minWpm) / (maxWpm - minWpm || 1)) * (h - pad * 2)}
            stroke={tk.gold}
            strokeDasharray="5 3"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />

          <path d={areaD} fill="url(#resultAreaGrad)" />
          <path
            d={pathD}
            fill="none"
            stroke="url(#resultLineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${tk.cyan}55)` }}
          />

          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === points.length - 1 ? 5 : 2}
              fill={idx === points.length - 1 ? tk.cyan : 'rgba(255,255,255,0.5)'}
            />
          ))}

          {lastP && (
            <circle
              cx={lastP.x}
              cy={lastP.y}
              r="9"
              fill="none"
              stroke={tk.cyan}
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          )}
        </svg>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            fontFamily: tk.fontMono,
            color: tk.textDim,
            marginTop: 6,
          }}
        >
          <span>0s ({minWpm} WPM)</span>
          <span style={{ color: tk.gold, fontWeight: 600 }}>Avg: {avgWpm} WPM</span>
          <span>
            {historyPoints.length}s Peak ({maxWpm} WPM)
          </span>
        </div>
      </div>
    );
  }, [historyPoints, stats.wpm]);

  // ─── Format Subtitle Description for Mode ─────────────────────────────────
  const modeSubtitle = useMemo(() => {
    if (testMode === 'time') return `⏱️ ${timeLimit}s Time Challenge · ${difficultyConfig[difficulty].label}`;
    if (testMode === 'words') return `📝 ${wordCount} Words Challenge in ${stats.elapsed}s`;
    return `💬 Quote by ${currentQuoteAuthor || 'Famous Figure'} in ${stats.elapsed}s`;
  }, [testMode, timeLimit, wordCount, difficulty, currentQuoteAuthor, stats.elapsed]);

  // ─── Copy Result Card to Clipboard ────────────────────────────────────────
  const handleCopyResult = () => {
    const textToCopy = `⌨️ Typing Speed Test Result\n⚡ Speed: ${stats.wpm} WPM (Raw: ${stats.rawWpm} WPM)\n🎯 Accuracy: ${Math.round(stats.accuracy)}%\n🏆 Rank: ${rank.title} (${rank.emoji})\n🎮 Mode: ${modeSubtitle}\n✨ Consistency: ${stats.consistency}%\n🔗 Tested on D-kode Era Tools`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const timerPercent = testMode === 'time' ? timeLeft / timeLimit : stats.progress / 100;
  const timerColor = testMode === 'time'
    ? timerPercent > 0.5 ? tk.green : timerPercent > 0.2 ? tk.gold : tk.red
    : tk.cyan;
  const rank = getRank(stats.wpm);
  const isNewPB = finished && stats.wpm > 0 && stats.wpm >= personalBest;

  return (
    <div
      style={{
        background: tk.bg,
        color: tk.text,
        minHeight: '100vh',
        fontFamily: tk.fontBody,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 999,
        }}
      />

      {/* Ambient Lighting Gradients */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: `
            radial-gradient(ellipse 1100px 900px at 15% 10%, rgba(0,212,255,0.06), transparent 60%),
            radial-gradient(ellipse 900px 750px at 85% 25%, rgba(168,85,247,0.05), transparent 55%),
            radial-gradient(ellipse 800px 600px at 50% 90%, rgba(0,229,160,0.04), transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grid Pattern */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ─── Navigation Header ─── */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1360,
          margin: '0 auto',
          padding: '20px clamp(16px, 3vw, 36px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link
          href="/pages/tools"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: tk.textDim,
            textDecoration: 'none',
            fontFamily: tk.fontMono,
            fontSize: 12,
            letterSpacing: '0.05em',
            padding: '8px 18px',
            borderRadius: 12,
            border: `1px solid ${tk.border}`,
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.25s ease',
          }}
        >
          <ArrowLeft size={14} /> Tools Hub
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {totalTests > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontFamily: tk.fontMono,
                color: tk.textDim,
                padding: '6px 12px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${tk.border}`,
              }}
            >
              <BarChart3 size={12} /> {totalTests} sessions
            </div>
          )}
          {personalBest > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontFamily: tk.fontMono,
                color: tk.gold,
                padding: '6px 14px',
                borderRadius: 10,
                background: 'rgba(245,200,66,0.08)',
                border: '1px solid rgba(245,200,66,0.22)',
              }}
            >
              <Trophy size={13} /> PB: {personalBest} WPM
            </div>
          )}
          {streak > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontFamily: tk.fontMono,
                color: '#ff6b6b',
                padding: '6px 12px',
                borderRadius: 10,
                background: 'rgba(255,107,107,0.08)',
                border: '1px solid rgba(255,107,107,0.2)',
              }}
            >
              <Flame size={13} /> {streak} Streak
            </div>
          )}
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      {!finished && (
        <section
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            padding: '12px 24px 28px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 24,
              padding: '6px 16px',
              color: tk.cyan,
              fontSize: 11,
              fontFamily: tk.fontMono,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            <Keyboard size={13} /> Multi-Mode Typing Laboratory
          </div>
          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 10,
              letterSpacing: '-0.03em',
            }}
          >
            Type with{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Time, Words & Famous Quotes
            </span>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: tk.textDim,
              maxWidth: 580,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Choose your challenge: test timed endurance, sprint through exact word counts, or master historic quotes.
          </p>
        </section>
      )}

      {/* ─── Comprehensive Multi-Mode Toolbar ─── */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '0 clamp(16px, 3vw, 36px) 20px' }}>
        <GlassCard style={{ padding: '14px 22px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Primary Mode Selector: Time / Words / Quotes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Mode:
              </span>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
                {[
                  { id: 'time', label: 'Time', icon: <Timer size={13} /> },
                  { id: 'words', label: 'Words', icon: <Type size={13} /> },
                  { id: 'quote', label: 'Quotes', icon: <QuoteIcon size={13} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setTestMode(m.id as TestMode);
                      if (!started) generateText();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 15px',
                      borderRadius: 9,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      fontWeight: testMode === m.id ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      background: testMode === m.id ? 'rgba(0,212,255,0.2)' : 'transparent',
                      color: testMode === m.id ? tk.cyan : tk.textDim,
                      transition: 'all 0.2s ease',
                      boxShadow: testMode === m.id ? '0 0 14px rgba(0,212,255,0.2)' : 'none',
                    }}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contextual Sub-Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {testMode === 'time' ? 'Duration:' : testMode === 'words' ? 'Word Count:' : 'Quote Type:'}
              </span>

              {/* Time sub-options */}
              {testMode === 'time' && (
                <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
                  {timeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTimeLimit(t);
                        setTimeLeft(t);
                        if (!started) generateText();
                      }}
                      style={{
                        padding: '7px 13px',
                        borderRadius: 9,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: timeLimit === t ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        background: timeLimit === t ? 'rgba(0,212,255,0.22)' : 'transparent',
                        color: timeLimit === t ? tk.cyan : tk.textDim,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              )}

              {/* Words sub-options */}
              {testMode === 'words' && (
                <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
                  {wordCountOptions.map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setWordCount(cnt);
                        if (!started) generateText();
                      }}
                      style={{
                        padding: '7px 13px',
                        borderRadius: 9,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: wordCount === cnt ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        background: wordCount === cnt ? 'rgba(0,229,160,0.22)' : 'transparent',
                        color: wordCount === cnt ? tk.green : tk.textDim,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              )}

              {/* Quotes sub-options */}
              {testMode === 'quote' && (
                <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
                  {quoteLengthOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setQuoteLength(opt.id);
                        if (!started) generateText();
                      }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 9,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: quoteLength === opt.id ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        background: quoteLength === opt.id ? 'rgba(168,85,247,0.22)' : 'transparent',
                        color: quoteLength === opt.id ? tk.purple : tk.textDim,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty Selector (for Time & Words mode) */}
            {testMode !== 'quote' && (
              <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
                {Object.entries(difficultyConfig).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setDifficulty(key);
                      if (!started) generateText();
                    }}
                    title={val.desc}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '7px 12px',
                      borderRadius: 9,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      fontWeight: difficulty === key ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      background: difficulty === key ? `${val.color}22` : 'transparent',
                      color: difficulty === key ? val.color : tk.textDim,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {val.icon}
                    {val.label}
                  </button>
                ))}
              </div>
            )}

            {/* Toggles */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                title={showKeyboard ? 'Hide live keyboard' : 'Show live keyboard'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 12px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${showKeyboard ? 'rgba(168,85,247,0.3)' : tk.border}`,
                  cursor: 'pointer',
                  background: showKeyboard ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                  color: showKeyboard ? tk.purple : tk.textDim,
                  transition: 'all 0.2s ease',
                }}
              >
                {showKeyboard ? <Eye size={13} /> : <EyeOff size={13} />}
                <span style={{ fontSize: 10 }}>Keyboard</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute sound effects' : 'Enable tactile audio'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 12px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${soundEnabled ? 'rgba(0,229,160,0.3)' : tk.border}`,
                  cursor: 'pointer',
                  background: soundEnabled ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.02)',
                  color: soundEnabled ? tk.green : tk.textDim,
                  transition: 'all 0.2s ease',
                }}
              >
                {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span style={{ fontSize: 10 }}>Audio</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ─── Active Test Stage ─── */}
      {!finished ? (
        <section style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '0 clamp(16px, 3vw, 36px) 40px' }}>
          {/* Live Telemetry Bar */}
          {started && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                { label: 'Speed', val: `${stats.wpm} WPM`, icon: <Gauge size={14} />, color: tk.cyan },
                {
                  label: 'Accuracy',
                  val: `${Math.round(stats.accuracy)}%`,
                  icon: <Target size={14} />,
                  color: stats.accuracy >= 95 ? tk.green : stats.accuracy >= 80 ? tk.gold : tk.red,
                },
                { label: 'Correct', val: stats.correctChars, icon: <CheckCircle2 size={14} />, color: tk.green },
                { label: 'Typos', val: stats.incorrectChars, icon: <XCircle size={14} />, color: tk.red },
                {
                  label: testMode === 'words' ? 'Words' : 'Cadence',
                  val: testMode === 'words' ? `${stats.wordsTyped} / ${wordCount}` : `${stats.cpm} CPM`,
                  icon: testMode === 'words' ? <Type size={14} /> : <Zap size={14} />,
                  color: tk.purple,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${m.color}0a, transparent)`,
                    border: `1px solid ${m.color}20`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <div style={{ color: m.color, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: tk.fontMono }}>
                    {m.icon}
                    {m.label}
                  </div>
                  <div style={{ fontSize: 20, fontFamily: tk.fontDisplay, fontWeight: 800, color: tk.text }}>
                    {m.val}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timing & Progress Bar */}
          {started && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={12} />
                  {testMode === 'time'
                    ? `Time Elapsed: ${stats.elapsed}s / ${timeLimit}s`
                    : testMode === 'words'
                    ? `Words Typed: ${stats.wordsTyped} / ${wordCount} words`
                    : `Quote by ${currentQuoteAuthor || 'Famous Figure'}`}
                </span>
                <span style={{ fontSize: 22, fontFamily: tk.fontDisplay, fontWeight: 900, color: timerColor }}>
                  {testMode === 'time' ? `${Math.ceil(timeLeft)}s` : `${stats.elapsed}s`}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${timerPercent * 100}%`,
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${timerColor}, ${timerColor}99)`,
                    transition: 'width 0.15s linear, background 0.3s ease',
                    boxShadow: `0 0 14px ${timerColor}44`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Typing Area Card */}
          <GlassCard
            style={{
              padding: 0,
              cursor: 'text',
              borderColor: isFocused ? 'rgba(0,212,255,0.3)' : undefined,
              boxShadow: isFocused ? '0 0 40px rgba(0,212,255,0.08)' : 'none',
              marginBottom: 16,
            }}
            glowColor={isFocused ? 'rgba(0,212,255,0.2)' : undefined}
            noPad
          >
            {/* Quote Author Ribbon if in Quote Mode */}
            {testMode === 'quote' && currentQuoteAuthor && (
              <div
                style={{
                  padding: '10px 32px',
                  background: 'rgba(168,85,247,0.08)',
                  borderBottom: `1px solid ${tk.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontFamily: tk.fontMono,
                  color: tk.purple,
                }}
              >
                <QuoteIcon size={14} />
                <span>
                  Quote by <strong>{currentQuoteAuthor}</strong>
                </span>
              </div>
            )}

            {/* Progress line */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${stats.progress}%`,
                  background: `linear-gradient(90deg, ${tk.cyan}, ${tk.purple})`,
                  transition: 'width 0.1s ease',
                }}
              />
            </div>

            {/* Rendered Text Block */}
            <div
              ref={textContainerRef}
              style={{
                padding: '32px clamp(24px, 4vw, 48px) 28px',
                fontSize: difficulty === 'code' ? 16 : 22,
                fontFamily: difficulty === 'code' ? tk.fontMono : tk.fontBody,
                lineHeight: 2.15,
                letterSpacing: difficulty === 'code' ? '0.01em' : '0.025em',
                minHeight: 150,
                maxHeight: 280,
                overflow: 'auto',
                userSelect: 'none',
                wordBreak: 'break-word',
              }}
              onClick={() => inputRef.current?.focus()}
            >
              {renderedText}
            </div>

            {/* Hidden Input Layer */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'text',
                zIndex: 5,
              }}
            />

            {/* Start Prompt Overlay */}
            {!started && (
              <div style={{ padding: '0 32px 20px', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 20px',
                    borderRadius: 14,
                    background: isFocused ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.05)',
                    border: `1px solid ${isFocused ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.15)'}`,
                    color: tk.cyan,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    animation: 'pulse 2.2s infinite ease-in-out',
                  }}
                >
                  <Keyboard size={14} />
                  {isFocused ? 'Start typing to begin...' : 'Click here or press any key to start...'}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Quick Action Controls */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            <button
              onClick={() => {
                generateText();
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 12,
                fontSize: 12,
                fontFamily: tk.fontMono,
                fontWeight: 600,
                border: `1px solid ${tk.border}`,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                color: tk.text,
                transition: 'all 0.2s ease',
              }}
            >
              <Shuffle size={14} /> New Passage
              <span style={{ fontSize: 9, color: tk.textDim }}>Tab</span>
            </button>

            <button
              onClick={() => {
                setInput('');
                currentInputRef.current = '';
                setStarted(false);
                setTimeLeft(timeLimit);
                setElapsedTime(0);
                setHistoryPoints([]);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 12,
                fontSize: 12,
                fontFamily: tk.fontMono,
                fontWeight: 600,
                border: `1px solid ${tk.border}`,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                color: tk.text,
                transition: 'all 0.2s ease',
              }}
            >
              <RotateCcw size={14} /> Reset
              <span style={{ fontSize: 9, color: tk.textDim }}>Esc</span>
            </button>
          </div>

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <GlassCard style={{ padding: '12px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, padding: '0 8px' }}>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Interactive Home-Row Keyboard
                </span>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: 'rgba(0,212,255,0.6)' }}>
                  ● ASDF JKL; Target Keys
                </span>
              </div>
              <LiveKeyboard activeKey={activeKey} errorKey={errorKey} />
            </GlassCard>
          )}
        </section>
      ) : (
        /* ─── Highly Professional & Managed Performance Result Dashboard ─── */
        <section
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 1360,
            margin: '0 auto',
            padding: '0 clamp(16px, 3vw, 36px) 60px',
            animation: 'fadeInUp 0.4s ease-out',
          }}
        >
          {/* Top Result Banner */}
          {isNewPB && (
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(245,200,66,0.18), rgba(245,200,66,0.05))',
                border: '1px solid rgba(245,200,66,0.35)',
                borderRadius: 16,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color={tk.gold} />
                <span style={{ fontFamily: tk.fontDisplay, fontWeight: 800, color: tk.gold, fontSize: 15 }}>
                  🎉 New All-Time Personal Record Achieved!
                </span>
              </div>
              <span style={{ fontFamily: tk.fontMono, fontSize: 12, color: tk.textMuted }}>
                Previous Record: {personalBest} WPM → <strong style={{ color: tk.gold }}>{stats.wpm} WPM</strong>
              </span>
            </div>
          )}

          {/* Main Performance Showcase */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 18,
              marginBottom: 20,
            }}
          >
            {/* Rank & Tier Certification Card */}
            <div
              style={{
                position: 'relative',
                background: `linear-gradient(145deg, rgba(13,20,37,0.9), rgba(13,20,37,0.7))`,
                border: `1px solid ${rank.color}35`,
                borderRadius: 24,
                padding: '32px 28px',
                backdropFilter: 'blur(30px)',
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${rank.glow}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -80,
                  right: -80,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${rank.glow}, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    Skill Tier Rating
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      padding: '3px 10px',
                      borderRadius: 10,
                      background: `${rank.color}20`,
                      color: rank.color,
                      fontWeight: 700,
                    }}
                  >
                    Tier {rank.tier} of 7
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 48,
                      filter: `drop-shadow(0 0 16px ${rank.glow})`,
                      animation: 'bounceIn 0.5s ease-out',
                    }}
                  >
                    {rank.emoji}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: tk.fontDisplay,
                        fontSize: 24,
                        fontWeight: 900,
                        color: rank.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      {rank.tier >= 5 && <Crown size={20} />}
                      {rank.title}
                    </h3>
                    <p style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono }}>
                      {rank.percentile}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode indicator */}
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  color: tk.textMuted,
                  marginBottom: 12,
                }}
              >
                {modeSubtitle}
              </div>

              {/* Tier Progress Bar */}
              {rank.nextTierWpm ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: tk.fontMono, marginBottom: 6 }}>
                    <span style={{ color: tk.textDim }}>Next: {rank.nextTierTitle}</span>
                    <span style={{ color: rank.color }}>
                      {Math.max(0, rank.nextTierWpm - stats.wpm)} WPM needed
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (stats.wpm / rank.nextTierWpm) * 100)}%`,
                        background: `linear-gradient(90deg, ${rank.color}, ${tk.cyan})`,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    color: tk.gold,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Award size={14} /> Maximum Benchmark Rank Achieved
                </div>
              )}
            </div>

            {/* Primary Tri-Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {/* WPM */}
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(0,212,255,0.1), rgba(13,20,37,0.7))',
                  border: '1px solid rgba(0,212,255,0.25)',
                  borderRadius: 20,
                  padding: '24px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: tk.cyan, marginBottom: 8, opacity: 0.9 }}>
                  <Gauge size={22} />
                </div>
                <div style={{ fontSize: 44, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text, lineHeight: 1 }}>
                  {stats.wpm}
                </div>
                <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 6, fontWeight: 700 }}>
                  Net WPM
                </div>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginTop: 4 }}>
                  Raw: {stats.rawWpm}
                </span>
              </div>

              {/* Accuracy */}
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(0,229,160,0.1), rgba(13,20,37,0.7))',
                  border: '1px solid rgba(0,229,160,0.25)',
                  borderRadius: 20,
                  padding: '24px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: tk.green, marginBottom: 8, opacity: 0.9 }}>
                  <Target size={22} />
                </div>
                <div style={{ fontSize: 44, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text, lineHeight: 1 }}>
                  {Math.round(stats.accuracy)}%
                </div>
                <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 6, fontWeight: 700 }}>
                  Accuracy
                </div>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginTop: 4 }}>
                  {stats.incorrectChars} typos
                </span>
              </div>

              {/* Consistency */}
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(168,85,247,0.1), rgba(13,20,37,0.7))',
                  border: '1px solid rgba(168,85,247,0.25)',
                  borderRadius: 20,
                  padding: '24px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: tk.purple, marginBottom: 8, opacity: 0.9 }}>
                  <TrendingUp size={22} />
                </div>
                <div style={{ fontSize: 44, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text, lineHeight: 1 }}>
                  {stats.consistency}%
                </div>
                <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.purple, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 6, fontWeight: 700 }}>
                  Consistency
                </div>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginTop: 4 }}>
                  Pace stability
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Telemetry & Speed Progression Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 18,
              marginBottom: 20,
            }}
          >
            {/* Speed Progression Graph Card */}
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <LineChart size={14} /> Speed Telemetry Over Time
                </span>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>
                  Sampled at 1.0s intervals
                </span>
              </div>

              {historyPoints.length >= 2 ? (
                sparkline
              ) : (
                <div style={{ padding: '30px 0', textAlign: 'center', color: tk.textDim, fontSize: 12, fontFamily: tk.fontMono }}>
                  Fast test completed! Take a longer test for an extensive velocity progression chart.
                </div>
              )}
            </GlassCard>

            {/* Diagnostics & Character Breakdown */}
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.gold, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <BarChart3 size={14} /> Keystroke Diagnostics
                </span>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>
                  {stats.totalChars} total keystrokes
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${tk.border}` }}>
                  <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>Characters / Minute</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: tk.fontDisplay, color: tk.text, marginTop: 2 }}>
                    {stats.cpm} CPM
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${tk.border}` }}>
                  <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>Test Duration</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: tk.fontDisplay, color: tk.cyan, marginTop: 2 }}>
                    {stats.elapsed}s
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${tk.border}` }}>
                  <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>Correct Characters</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: tk.fontDisplay, color: tk.green, marginTop: 2 }}>
                    {stats.correctChars}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${tk.border}` }}>
                  <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>Error Penalty</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: tk.fontDisplay, color: stats.incorrectChars > 0 ? tk.red : tk.green, marginTop: 2 }}>
                    -{stats.rawWpm - stats.wpm} WPM
                  </div>
                </div>
              </div>

              {/* Problem Keys Analysis */}
              {Object.keys(missedKeysMap).length > 0 ? (
                <div>
                  <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertCircle size={12} color={tk.red} /> Missed Target Keys:
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {Object.entries(missedKeysMap)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([keyName, count]) => (
                        <div
                          key={keyName}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 8,
                            background: 'rgba(255,107,107,0.12)',
                            border: '1px solid rgba(255,107,107,0.25)',
                            fontSize: 11,
                            fontFamily: tk.fontMono,
                            color: tk.red,
                          }}
                        >
                          <strong style={{ color: tk.text }}>{keyName === ' ' ? 'SPACE' : keyName}</strong>: {count}x
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6 }}>
                  <CheckCircle2 size={14} /> Flawless test! Zero character misses detected.
                </div>
              )}
            </GlassCard>
          </div>

          {/* Expandable Text Review Drawer */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowTextReview(!showTextReview)}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${tk.border}`,
                color: tk.textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontFamily: tk.fontMono,
                fontSize: 12,
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={14} /> {showTextReview ? 'Hide' : 'Inspect'} Full Typed Text & Error Map
              </span>
              <ChevronRight
                size={14}
                style={{
                  transform: showTextReview ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {showTextReview && (
              <div
                style={{
                  marginTop: 10,
                  padding: '20px 24px',
                  borderRadius: 16,
                  background: 'rgba(8,13,26,0.6)',
                  border: `1px solid ${tk.border}`,
                  fontSize: 15,
                  fontFamily: difficulty === 'code' ? tk.fontMono : tk.fontBody,
                  lineHeight: 1.9,
                }}
              >
                {renderedText}
              </div>
            )}
          </div>

          {/* Primary Action Button Suite */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '10px 0',
            }}
          >
            {/* Play Again (Hero CTA) */}
            <button
              onClick={() => {
                generateText();
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '15px 36px',
                borderRadius: 16,
                fontSize: 14,
                fontFamily: tk.fontMono,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                color: '#050810',
                transition: 'all 0.25s ease',
                letterSpacing: '0.04em',
                boxShadow: `0 6px 28px ${tk.cyan}35`,
              }}
            >
              <RotateCcw size={16} /> Play Again
              <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>(Tab + Enter)</span>
            </button>

            {/* Retest Same Text */}
            <button
              onClick={() => {
                setInput('');
                currentInputRef.current = '';
                setStarted(false);
                setFinished(false);
                setTimeLeft(timeLimit);
                setElapsedTime(0);
                finalElapsedRef.current = 0;
                setHistoryPoints([]);
                setMissedKeysMap({});
                setTotalErrorsCount(0);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              title="Practice the exact same text again"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 24px',
                borderRadius: 16,
                fontSize: 13,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                border: `1px solid ${tk.border}`,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                color: tk.text,
                transition: 'all 0.25s ease',
              }}
            >
              <Repeat size={15} /> Repeat Same Passage
            </button>

            {/* Share / Copy Result */}
            <button
              onClick={handleCopyResult}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 24px',
                borderRadius: 16,
                fontSize: 13,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                border: copiedNotification ? `1px solid ${tk.green}` : `1px solid ${tk.border}`,
                cursor: 'pointer',
                background: copiedNotification ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.03)',
                color: copiedNotification ? tk.green : tk.text,
                transition: 'all 0.25s ease',
              }}
            >
              {copiedNotification ? <CheckCircle2 size={15} /> : <Share2 size={15} />}
              {copiedNotification ? 'Score Copied!' : 'Share Score Card'}
            </button>
          </div>
        </section>
      )}

      {/* ─── Training Methodology & Best Practices ─── */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '0 clamp(16px, 3vw, 36px) 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              icon: <Target size={18} />,
              title: 'Rhythm over Rush',
              desc: 'High velocity comes from unbroken cadence. Keep a continuous pace rather than bursting and pausing.',
              color: tk.cyan,
            },
            {
              icon: <Keyboard size={18} />,
              title: 'Touch Typing Anchors',
              desc: 'Your index fingers should naturally rest on F and J bumps. Rely on spatial muscle memory, not sight.',
              color: tk.green,
            },
            {
              icon: <BookOpen size={18} />,
              title: 'Learn from Quotes',
              desc: 'Typing quotes from world changers trains your punctuation, rhythm, and capital letter precision simultaneously.',
              color: tk.purple,
            },
            {
              icon: <Award size={18} />,
              title: 'Word Sprints',
              desc: 'Word mode lets you focus purely on word completion speed without a ticking countdown clock pressure.',
              color: tk.gold,
            },
          ].map((item) => (
            <GlassCard key={item.title} style={{ padding: '20px' }}>
              <div style={{ color: item.color, marginBottom: 12 }}>{item.icon}</div>
              <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 14, fontWeight: 700, color: tk.text, marginBottom: 6 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 12, color: tk.textDim, lineHeight: 1.7 }}>{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ─── CSS Keyframes ─── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(0.99); }
        }
        @keyframes cursorBlink {
          0%, 100% { border-color: ${tk.cyan}; }
          50% { border-color: transparent; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        div::-webkit-scrollbar { width: 5px; height: 5px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 4px; }
        div::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.4); }
      `}</style>
    </div>
  );
}
