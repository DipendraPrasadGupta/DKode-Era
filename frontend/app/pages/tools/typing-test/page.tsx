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
  Sliders,
  Settings,
  FileText,
  Check,
  X,
  Plus,
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
    'the sun is hot and the sky is blue today',
    'a little dog can run and play in the green park',
    'my cat likes to sleep on the soft red rug',
    'we can go to the shop and buy some sweet milk',
    'the bird can fly high up in the blue sky',
    'he has a new pen and a small red book to read',
    'she sat by the big tree and read a good book',
    'the water in the lake is cool and clear today',
    'they walk to school hand in hand every day',
    'come here and see the big fish swim so fast',
    'the white sheep eat green grass on the hill',
    'look at that bright star shine in the night sky',
    'a good friend is kind and helps you every day',
    'we like to jump and sing in the warm rain',
    'the red ball rolled down the long hill',
    'open the door and let the fresh air come in',
    'he made a cup of warm tea on a cold day',
    'sing a sweet song and have a happy day with friends',
    'the cow gives us sweet milk every morning',
    'i have a small red car and a fast blue boat',
    'the green tree has many red apples to eat',
    'we play with a round ball in the warm sun',
    'she has a nice smile and a kind heart for all',
    'the rain fell on the green leaves all night long',
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

const beginnerWordsList = [
  'the', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was',
  'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this',
  'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all',
  'we', 'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each', 'she',
  'do', 'how', 'if', 'will', 'up', 'out', 'many', 'then', 'them', 'so',
  'some', 'her', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two',
  'more', 'go', 'see', 'no', 'way', 'my', 'than', 'been', 'call', 'who',
  'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come',
  'made', 'may', 'cat', 'dog', 'sun', 'run', 'tree', 'book', 'ball', 'fish',
  'bird', 'park', 'play', 'fast', 'good', 'hand', 'home', 'star', 'milk', 'rain',
  'road', 'red', 'blue', 'warm', 'cool', 'jump', 'walk', 'sing', 'help', 'kind',
  'cake', 'cup', 'hat', 'pen', 'box', 'bed', 'car', 'bus', 'sky', 'sea',
  'hill', 'lake', 'wood', 'leaf', 'wind', 'snow', 'door', 'ring', 'song', 'bell',
  'cup', 'egg', 'fan', 'fun', 'hot', 'ice', 'jam', 'key', 'leg', 'map', 'nut', 'pot',
  'sun', 'top', 'van', 'win', 'zoo', 'baby', 'bake', 'bear', 'duck', 'frog', 'gold'
];

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
  easy: { label: 'Beginner', color: tk.green, desc: 'All small letters · Very easy words', icon: <Target size={14} /> },
  medium: { label: 'Intermediate', color: tk.gold, desc: 'Everyday paragraphs & sentences', icon: <TrendingUp size={14} /> },
  hard: { label: 'Advanced', color: tk.purple, desc: 'Academic & technical vocabulary', icon: <Zap size={14} /> },
  code: { label: 'Code Mode', color: tk.cyan, desc: 'TypeScript & JavaScript syntax', icon: <Hash size={14} /> },
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

// ─── Funny Animated Dancing Typist Mascot ("Byte") ──────────────────────────

interface DancingTypistMascotProps {
  dance: 'disco' | 'hype' | 'robot' | 'rock';
  wpm: number;
  accuracy: number;
}

function DancingTypistMascot({ dance, wpm }: DancingTypistMascotProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 290,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg
        width="100%"
        height="240"
        viewBox="0 0 280 250"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Spotlight Gradient */}
          <linearGradient id="mascotSpotlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#a855f7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ff79c6" stopOpacity="0.0" />
          </linearGradient>

          {/* Disco Floor Rings */}
          <radialGradient id="mascotDiscoRing" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#050814" stopOpacity="0.9" />
          </radialGradient>

          <radialGradient id="mascotFloorPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff79c6" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#00d4ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Chassis Metallic Gradient */}
          <linearGradient id="mascotChassisGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Sunglasses Shimmer */}
          <linearGradient id="mascotSunglassesGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="35%" stopColor="#334155" />
            <stop offset="50%" stopColor="#00ffff" />
            <stop offset="65%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Sneakers Gradients */}
          <linearGradient id="mascotSneakerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff007f" />
            <stop offset="100%" stopColor="#7928ca" />
          </linearGradient>
          <linearGradient id="mascotSoleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="mascotNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ─── Sweeping Spotlight Beam ─── */}
        <polygon
          points="140,0 45,230 235,230"
          fill="url(#mascotSpotlight)"
          style={{ animation: 'spotlightSweep 3.5s ease-in-out infinite' }}
        />

        {/* ─── Floating Musical Notes & Dancing Sparks ─── */}
        <g style={{ animation: 'noteFloat 2.6s ease-in-out infinite' }}>
          <text x="36" y="80" fontSize="18" fill="#00ffff" style={{ filter: 'url(#mascotNeonGlow)' }}>♪</text>
        </g>
        <g style={{ animation: 'noteFloat 2.2s ease-in-out 0.6s infinite' }}>
          <text x="222" y="72" fontSize="20" fill="#ff79c6" style={{ filter: 'url(#mascotNeonGlow)' }}>♫</text>
        </g>
        <g style={{ animation: 'noteFloat 3s ease-in-out 1.2s infinite' }}>
          <text x="44" y="140" fontSize="14" fill="#ffd700" style={{ filter: 'url(#mascotNeonGlow)' }}>⭐</text>
        </g>
        <g style={{ animation: 'noteFloat 2.4s ease-in-out 0.4s infinite' }}>
          <text x="216" y="135" fontSize="16" fill="#00ff88" style={{ filter: 'url(#mascotNeonGlow)' }}>⚡</text>
        </g>

        {/* ─── Pulsing Disco Dance Floor ─── */}
        <ellipse cx="140" cy="225" rx="95" ry="19" fill="#060913" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1.5" />
        <ellipse cx="140" cy="225" rx="76" ry="14" fill="url(#mascotDiscoRing)" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1" />
        <ellipse
          cx="140"
          cy="225"
          rx="50"
          ry="9"
          fill="url(#mascotFloorPulse)"
          style={{ animation: 'floorPulse 1.1s ease-in-out infinite' }}
        />
        <line x1="85" y1="225" x2="195" y2="225" stroke="rgba(0,212,255,0.4)" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="140" y1="208" x2="140" y2="242" stroke="rgba(255,121,198,0.4)" strokeWidth="1" strokeDasharray="3 3" />

        {/* ─── Foot Shadow ─── */}
        <ellipse
          cx="140"
          cy="222"
          rx={dance === 'hype' ? 26 : 34}
          ry="6"
          fill="rgba(0,0,0,0.6)"
          style={{
            animation: dance === 'hype' ? 'mascotHypeShadow 0.48s ease-in-out infinite' : 'shadowPulse 0.85s ease-in-out infinite',
            transformOrigin: '140px 222px',
          }}
        />

        {/* ─── Mascot Main Assembly (Bounces & Grooves) ─── */}
        <g
          id="mascotAssembly"
          style={{
            transformOrigin: '140px 200px',
            animation:
              dance === 'hype'
                ? 'mascotHypeBounce 0.48s ease-in-out infinite'
                : dance === 'robot'
                ? 'mascotRobotStaccato 1.2s steps(2, jump-none) infinite'
                : dance === 'rock'
                ? 'mascotRockBounce 0.65s ease-in-out infinite'
                : 'mascotBounce 0.85s ease-in-out infinite',
          }}
        >
          {/* Left Foot & Sneaker */}
          <g
            id="mascotLeftFoot"
            style={{
              transformOrigin: '115px 215px',
              animation: dance === 'robot' ? 'none' : 'footTapLeft 0.85s ease-in-out infinite',
            }}
          >
            <path d="M 98 212 C 98 207, 126 207, 128 214 L 130 220 C 130 223, 95 223, 95 220 Z" fill="url(#mascotSneakerGrad)" />
            <path d="M 94 219 Q 112 218 131 219 L 130 223 Q 112 222 94 223 Z" fill="url(#mascotSoleGrad)" />
            <line x1="108" y1="210" x2="118" y2="210" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="110" y1="213" x2="119" y2="213" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Right Foot & Sneaker */}
          <g
            id="mascotRightFoot"
            style={{
              transformOrigin: '165px 215px',
              animation: dance === 'robot' ? 'none' : 'footTapRight 0.85s ease-in-out infinite',
            }}
          >
            <path d="M 152 214 C 154 207, 182 207, 182 212 L 185 220 C 185 223, 150 223, 150 220 Z" fill="url(#mascotSneakerGrad)" />
            <path d="M 149 219 Q 168 218 186 219 L 186 223 Q 168 222 149 223 Z" fill="url(#mascotSoleGrad)" />
            <line x1="162" y1="210" x2="172" y2="210" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="161" y1="213" x2="170" y2="213" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Legs */}
          <line x1="115" y1="184" x2="115" y2="212" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1="165" y1="184" x2="165" y2="212" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="115" cy="196" rx="4" ry="2" fill="#00d4ff" />
          <ellipse cx="165" cy="196" rx="4" ry="2" fill="#00d4ff" />

          {/* ─── Chassis Body ─── */}
          <rect
            x="100"
            y="130"
            width="80"
            height="56"
            rx="14"
            fill="url(#mascotChassisGrad)"
            stroke="rgba(0,212,255,0.4)"
            strokeWidth="2"
          />

          {/* Equalizer Chest Screen */}
          <rect
            x="110"
            y="138"
            width="60"
            height="26"
            rx="6"
            fill="#050a17"
            stroke="rgba(168,85,247,0.4)"
            strokeWidth="1.2"
          />

          {/* Equalizer Bars on Chest */}
          <rect x="116" y="146" width="4" height="12" rx="2" fill="#00d4ff" style={{ animation: 'equalizerBar1 0.6s ease-in-out infinite' }} />
          <rect x="124" y="142" width="4" height="16" rx="2" fill="#a855f7" style={{ animation: 'equalizerBar2 0.7s ease-in-out infinite' }} />
          <rect x="132" y="140" width="4" height="18" rx="2" fill="#ff79c6" style={{ animation: 'equalizerBar3 0.5s ease-in-out infinite' }} />
          <rect x="140" y="143" width="4" height="15" rx="2" fill="#ffd700" style={{ animation: 'equalizerBar2 0.8s ease-in-out infinite' }} />
          <rect x="148" y="141" width="4" height="17" rx="2" fill="#00ff88" style={{ animation: 'equalizerBar1 0.65s ease-in-out infinite' }} />
          <rect x="156" y="147" width="4" height="11" rx="2" fill="#00d4ff" style={{ animation: 'equalizerBar3 0.75s ease-in-out infinite' }} />

          {/* Keyboard Spacebar Belt */}
          <rect x="115" y="169" width="50" height="11" rx="4" fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.6)" strokeWidth="1" />
          <text x="140" y="177" fill="#00d4ff" fontSize="7.5" fontFamily="monospace" fontWeight="900" textAnchor="middle">
            {wpm >= 60 ? '⚡ TURBO' : 'SPACE ↵'}
          </text>

          {/* ─── Arms & Hands (Animated per Dance Style) ─── */}
          {/* Left Arm */}
          <g
            id="mascotLeftArm"
            style={{
              transformOrigin: '100px 140px',
              animation:
                dance === 'hype'
                  ? 'hypeArmLeft 0.48s ease-in-out infinite'
                  : dance === 'robot'
                  ? 'robotArmLeft 1.2s steps(2, jump-none) infinite'
                  : dance === 'rock'
                  ? 'rockArmLeft 0.65s ease-in-out infinite'
                  : 'discoArmLeft 0.85s ease-in-out infinite',
            }}
          >
            <path
              d={
                dance === 'disco'
                  ? 'M 100 140 Q 78 154 84 176'
                  : dance === 'hype'
                  ? 'M 100 140 Q 72 114 65 89'
                  : dance === 'robot'
                  ? 'M 100 140 L 70 140 L 70 109'
                  : 'M 100 140 Q 70 134 60 154'
              }
              fill="none"
              stroke="#475569"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <circle
              cx={dance === 'disco' ? 84 : dance === 'hype' ? 64 : dance === 'robot' ? 70 : 60}
              cy={dance === 'disco' ? 177 : dance === 'hype' ? 88 : dance === 'robot' ? 108 : 154}
              r="6.5"
              fill="#ffffff"
              stroke="#00d4ff"
              strokeWidth="1.5"
            />
            {dance === 'disco' && (
              <line x1="84" y1="177" x2="74" y2="188" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            )}
            {dance === 'rock' && (
              <text x="46" y="154" fontSize="13">🎸</text>
            )}
          </g>

          {/* Right Arm */}
          <g
            id="mascotRightArm"
            style={{
              transformOrigin: '180px 140px',
              animation:
                dance === 'hype'
                  ? 'hypeArmRight 0.48s ease-in-out infinite'
                  : dance === 'robot'
                  ? 'robotArmRight 1.2s steps(2, jump-none) infinite'
                  : dance === 'rock'
                  ? 'rockArmRight 0.65s ease-in-out infinite'
                  : 'discoArmRight 0.85s ease-in-out infinite',
            }}
          >
            <path
              d={
                dance === 'disco'
                  ? 'M 180 140 Q 205 119 218 90'
                  : dance === 'hype'
                  ? 'M 180 140 Q 208 114 215 89'
                  : dance === 'robot'
                  ? 'M 180 140 L 210 140 L 210 174'
                  : 'M 180 140 Q 195 164 160 172'
              }
              fill="none"
              stroke="#475569"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <circle
              cx={dance === 'disco' ? 219 : dance === 'hype' ? 216 : dance === 'robot' ? 210 : 160}
              cy={dance === 'disco' ? 89 : dance === 'hype' ? 88 : dance === 'robot' ? 174 : 172}
              r="6.5"
              fill="#ffffff"
              stroke="#ff79c6"
              strokeWidth="1.5"
            />
            {dance === 'disco' && (
              <line x1="219" y1="89" x2="232" y2="72" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            )}
          </g>

          {/* ─── Head Assembly ─── */}
          <g
            id="mascotHead"
            style={{
              transformOrigin: '140px 124px',
              animation:
                dance === 'rock'
                  ? 'mascotRockHead 0.32s ease-in-out infinite'
                  : 'mascotHeadBob 0.85s ease-in-out infinite',
            }}
          >
            {/* Neck Joint */}
            <rect x="133" y="122" width="14" height="10" rx="3" fill="#334155" />
            <line x1="133" y1="127" x2="147" y2="127" stroke="#00d4ff" strokeWidth="1" />

            {/* Head Chassis */}
            <rect
              x="96"
              y="62"
              width="88"
              height="62"
              rx="18"
              fill="url(#mascotChassisGrad)"
              stroke="rgba(0,212,255,0.6)"
              strokeWidth="2.2"
            />

            {/* Antenna stalk */}
            <line x1="140" y1="62" x2="140" y2="38" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="140" cy="38" r="3" fill="#a855f7" />

            {/* Spinning Disco Star on Antenna */}
            <g style={{ animation: 'crownStarSpin 3s linear infinite', transformOrigin: '140px 32px' }}>
              <polygon
                points="140,22 143,29 150,30 145,35 146,42 140,38 134,42 135,35 130,30 137,29"
                fill="#ffd700"
                stroke="#ffa500"
                strokeWidth="1"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.8))' }}
              />
            </g>

            {/* DJ Over-Ear Headphones */}
            <path d="M 90 92 A 50 50 0 0 1 190 92" fill="none" stroke="#ff79c6" strokeWidth="4.5" strokeLinecap="round" />
            <rect x="86" y="80" width="10" height="26" rx="5" fill="#ff79c6" stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="91" cy="93" rx="2" ry="7" fill="#ffffff" />
            <rect x="184" y="80" width="10" height="26" rx="5" fill="#ff79c6" stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="189" cy="93" rx="2" ry="7" fill="#ffffff" />

            {/* Screen Visor */}
            <rect
              x="105"
              y="72"
              width="70"
              height="33"
              rx="10"
              fill="#070d1e"
              stroke="rgba(0,212,255,0.4)"
              strokeWidth="1.2"
            />

            {/* Ultra Cool Sunglasses */}
            <path
              d="M 106 79 Q 140 82 174 79 L 171 95 Q 158 100 142 92 Q 126 100 109 95 Z"
              fill="url(#mascotSunglassesGrad)"
              stroke="#00ffff"
              strokeWidth="1.2"
            />
            {/* Sunglasses Neon Flare Lines */}
            <line x1="114" y1="82" x2="124" y2="93" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
            <line x1="126" y1="82" x2="132" y2="89" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="148" y1="82" x2="158" y2="93" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
            <line x1="160" y1="82" x2="166" y2="89" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Rosy Cheeks */}
            <ellipse cx="112" cy="111" rx="6" ry="3" fill="rgba(255,105,180,0.6)" />
            <ellipse cx="168" cy="111" rx="6" ry="3" fill="rgba(255,105,180,0.6)" />

            {/* Expressive Pixel Smile */}
            <path
              d="M 132 112 Q 140 119 148 112"
              fill="none"
              stroke="#00ff88"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

// ─── Motivational Completion Hook System ────────────────────────────────────

interface CompletionHook {
  badge: string;
  badgeColor: string;
  title: string;
  quote: string;
  body: string;
  hook: string;
  actionText: string;
}

function getCompletionHook(
  wpm: number,
  accuracy: number,
  isNewPB: boolean,
  streak: number
): CompletionHook {
  if (isNewPB) {
    return {
      badge: '👑 ALL-TIME PEAK RECORD',
      badgeColor: '#FFD700',
      title: 'The ceiling you were staring at just became your new floor!',
      quote: 'When you break an invisible barrier, the horizon immediately expands.',
      body: 'You just shattered your historical best score! Your brain and fingers executed at peak cognitive velocity with zero friction.',
      hook: 'Athletes and world-class speedrunners know the golden rule: never walk away after a breakthrough run. Capitalize on this neural momentum right now and see if you can break it twice in a row!',
      actionText: '⚡ Double Down – Break Your New Record (Enter ↵)',
    };
  }

  if (streak >= 3) {
    return {
      badge: `🔥 UNSTOPPABLE STREAK · ${streak} IN A ROW`,
      badgeColor: '#ff6b6b',
      title: 'You are completely locked in! The streak demands more.',
      quote: 'Momentum is the rarest superpower in human performance.',
      body: `That's ${streak} consecutive tests completed without hesitation. Your fingers are warm, your hand placement is locked, and your rhythm is electric.`,
      hook: `Do not let the chain break now! Take test #${streak + 1} right now and push this streak into the stratosphere.`,
      actionText: `🔥 Defend the Streak – Test #${streak + 1} (Enter ↵)`,
    };
  }

  if (accuracy >= 97 && wpm >= 30) {
    return {
      badge: '🎯 SURGICAL PRECISION',
      badgeColor: tk.green,
      title: 'Flawless craftsmanship. Zero wasted energy.',
      quote: 'Slow is smooth, and smooth is blazing fast.',
      body: `${Math.round(accuracy)}% accuracy is textbook perfection. While most typists panic and hit backspace under pressure, your muscle memory stayed composed and laser-precise.`,
      hook: 'With accuracy this reliable, you have full license to step on the gas pedal. Push your fingers 10% faster on this next round—your muscle memory will catch you!',
      actionText: '🚀 Push the Throttle – Speed Run (Enter ↵)',
    };
  }

  if (wpm >= 75) {
    const list: CompletionHook[] = [
      {
        badge: '⚡ GODSPEED FLOW STATE',
        badgeColor: tk.cyan,
        title: 'Your fingers just conducted an orchestra of speed!',
        quote: 'Speed is not in the hands, it is in the quiet calm of instinct.',
        body: `Blistering pace! At ${wpm} WPM, you've stopped reading letter-by-letter and your subconscious is now streaming whole words straight to your fingertips.`,
        hook: 'You are only a breath away from breaking into the highest master bracket. Run it back right now while your fingers are still humming with kinetic energy!',
        actionText: '⚡ Claim Your Next Tier (Enter ↵)',
      },
      {
        badge: '🚀 ADRENALINE VELOCITY',
        badgeColor: tk.purple,
        title: 'Dangerously fast. Pure kinetic motion.',
        quote: 'When your fingers move faster than conscious thought, you are in flow.',
        body: `You just flew past 95% of typists on the planet. Notice how effortless those transitions were? Your brain just released a burst of dopamine.`,
        hook: 'Do not let your muscles cool down! The easiest +5 WPM jump happens right after a high-energy sprint like this. Hit Enter and prove it!',
        actionText: '🔥 Strike While Warm – Next Sprint (Enter ↵)',
      },
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  if (wpm >= 45) {
    const list: CompletionHook[] = [
      {
        badge: '✨ SYNAPTIC ACCELERATION',
        badgeColor: tk.cyan,
        title: 'That was dangerously smooth!',
        quote: 'The secret to speed is finding your unbroken cadence.',
        body: `Notice how natural that rhythm felt? At ${wpm} WPM, your typing cadence is establishing strong rhythmic consistency that builds effortless speed.`,
        hook: 'Your brain is primed right now. Run it back immediately and watch how your fingers anticipate the next word before your eyes even register it!',
        actionText: '⚡ Ride the Cadence – Beat This Score (Enter ↵)',
      },
      {
        badge: '🌟 MOMENTUM SURGE',
        badgeColor: tk.gold,
        title: 'Your muscle memory just leveled up!',
        quote: 'Every rep writes new code into your subconscious mind.',
        body: `Outstanding run! You maintained solid pacing and kept the momentum alive across the entire passage. That is how champions are forged.`,
        hook: 'You are on the threshold of breaking your ceiling. Give yourself one more round right now and lock in this speed permanently!',
        actionText: '🔥 Level Up Again – Start Next (Enter ↵)',
      },
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  // Beginner / warming up
  const beginnerList: CompletionHook[] = [
    {
      badge: '🌱 THE MASTER\'S SPARK',
      badgeColor: tk.green,
      title: 'Brilliant finish! Every master started right here.',
      quote: 'The journey of a thousand words begins with a single keypress.',
      body: 'You just mapped dozens of keyboard coordinates into your finger memory. Typing is a motor skill, and your brain just formed hundreds of new neural bridges.',
      hook: 'The hardest part is taking the first step, and you just crushed it! Take one more round right now while your hands remember the positions—you\'ll be shocked how much faster it feels!',
      actionText: '🚀 Take Round 2 – Feel the Speed (Enter ↵)',
    },
    {
      badge: '✨ MUSCLE MEMORY IN PROGRESS',
      badgeColor: tk.gold,
      title: 'Great persistence! Your hands are learning fast.',
      quote: 'Patience and repetition turn clumsy fingers into keyboard wizards.',
      body: 'Every single keystroke trains your hands to navigate without looking down. You\'re building the exact foundation that enables 80+ WPM typing.',
      hook: 'Don\'t stop now! Your fingers are in prime learning mode. One more quick round will cement what you just learned!',
      actionText: '🌱 Keep Growing – Next Round (Enter ↵)',
    },
  ];
  return beginnerList[Math.floor(Math.random() * beginnerList.length)];
}

// ─── High-Level Mechanical Animated Keyboard ─────────────────────────────────

interface KeyDef {
  key: string;
  label: string;
  w: number;
  home?: boolean;
  bump?: boolean;
  special?: boolean;
  space?: boolean;
  enter?: boolean;
}

const KEYBOARD_LAYOUT: KeyDef[][] = [
  [
    { key: '`', label: '~', w: 42 },
    { key: '1', label: '1', w: 42 },
    { key: '2', label: '2', w: 42 },
    { key: '3', label: '3', w: 42 },
    { key: '4', label: '4', w: 42 },
    { key: '5', label: '5', w: 42 },
    { key: '6', label: '6', w: 42 },
    { key: '7', label: '7', w: 42 },
    { key: '8', label: '8', w: 42 },
    { key: '9', label: '9', w: 42 },
    { key: '0', label: '0', w: 42 },
    { key: '-', label: '-', w: 42 },
    { key: '=', label: '=', w: 42 },
    { key: 'BACKSPACE', label: '⌫ Back', w: 82, special: true },
  ],
  [
    { key: 'TAB', label: 'Tab ⇥', w: 68, special: true },
    { key: 'Q', label: 'Q', w: 42 },
    { key: 'W', label: 'W', w: 42 },
    { key: 'E', label: 'E', w: 42 },
    { key: 'R', label: 'R', w: 42 },
    { key: 'T', label: 'T', w: 42 },
    { key: 'Y', label: 'Y', w: 42 },
    { key: 'U', label: 'U', w: 42 },
    { key: 'I', label: 'I', w: 42 },
    { key: 'O', label: 'O', w: 42 },
    { key: 'P', label: 'P', w: 42 },
    { key: '[', label: '[', w: 42 },
    { key: ']', label: ']', w: 42 },
    { key: '\\', label: '\\', w: 56, special: true },
  ],
  [
    { key: 'CAPS', label: 'Caps ⇪', w: 78, special: true },
    { key: 'A', label: 'A', w: 42, home: true },
    { key: 'S', label: 'S', w: 42, home: true },
    { key: 'D', label: 'D', w: 42, home: true },
    { key: 'F', label: 'F', w: 42, home: true, bump: true },
    { key: 'G', label: 'G', w: 42 },
    { key: 'H', label: 'H', w: 42 },
    { key: 'J', label: 'J', w: 42, home: true, bump: true },
    { key: 'K', label: 'K', w: 42, home: true },
    { key: 'L', label: 'L', w: 42, home: true },
    { key: ';', label: ';', w: 42, home: true },
    { key: "'", label: "'", w: 42 },
    { key: 'ENTER', label: 'Enter ↵', w: 88, special: true, enter: true },
  ],
  [
    { key: 'SHIFT', label: '⇧ Shift', w: 100, special: true },
    { key: 'Z', label: 'Z', w: 42 },
    { key: 'X', label: 'X', w: 42 },
    { key: 'C', label: 'C', w: 42 },
    { key: 'V', label: 'V', w: 42 },
    { key: 'B', label: 'B', w: 42 },
    { key: 'N', label: 'N', w: 42 },
    { key: 'M', label: 'M', w: 42 },
    { key: ',', label: ',', w: 42 },
    { key: '.', label: '.', w: 42 },
    { key: '/', label: '/', w: 42 },
    { key: 'RSHIFT', label: '⇧ Shift', w: 108, special: true },
  ],
  [
    { key: 'CTRL', label: 'Ctrl', w: 56, special: true },
    { key: 'ALT', label: 'Alt', w: 56, special: true },
    { key: ' ', label: 'SPACEBAR', w: 340, space: true },
    { key: 'ALT_R', label: 'Alt', w: 56, special: true },
    { key: 'CTRL_R', label: 'Ctrl', w: 56, special: true },
  ],
];

function LiveKeyboard({
  activeKey,
  errorKey,
  nextKey,
}: {
  activeKey: string;
  errorKey: string;
  nextKey: string;
}) {
  const normActive = activeKey ? activeKey.toUpperCase() : '';
  const normError = errorKey ? errorKey.toUpperCase() : '';
  const normNext = nextKey ? nextKey.toUpperCase() : '';

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(8, 14, 28, 0.95), rgba(4, 7, 16, 0.98))',
        border: '1px solid rgba(0, 212, 255, 0.25)',
        borderRadius: 18,
        padding: '16px 20px 20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 212, 255, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Animated RGB Lightbar Chassis Edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #00d4ff, #a855f7, #00e5a0, #f5c842, #ff6b6b, #00d4ff)',
          backgroundSize: '300% 100%',
          animation: 'rgbChassisGlow 6s linear infinite',
        }}
      />

      {/* Cyberdeck Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: 11,
          fontFamily: tk.fontMono,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tk.cyan }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: tk.green,
              boxShadow: `0 0 8px ${tk.green}`,
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: '0.08em' }}>
            TACTILE CYBERDECK · 1000Hz POLLING
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Upcoming key indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 8,
              padding: '3px 10px',
              color: tk.cyan,
            }}
          >
            <span style={{ fontSize: 10, color: tk.textDim, textTransform: 'uppercase' }}>Upcoming:</span>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>
              {nextKey === ' ' ? '␣ SPACE' : nextKey ? nextKey.toUpperCase() : 'END 🏁'}
            </span>
          </div>

          <span style={{ color: tk.textDim, fontSize: 10 }}>● F & J Home Anchors</span>
        </div>
      </div>

      {/* Horizontal Scroll wrapper for responsive keyboards */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 7,
            minWidth: 690,
            margin: '0 auto',
          }}
        >
          {KEYBOARD_LAYOUT.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 6 }}>
              {row.map((item) => {
                const isMatchActive = item.space
                  ? normActive === ' '
                  : normActive === item.key.toUpperCase();
                const isMatchError = item.space
                  ? normError === ' '
                  : normError === item.key.toUpperCase();
                const isMatchNext = item.space
                  ? normNext === ' '
                  : normNext === item.key.toUpperCase();

                // Compute keycap styling
                let bg = 'linear-gradient(180deg, rgba(24, 34, 56, 0.95) 0%, rgba(13, 19, 32, 0.95) 100%)';
                let textColor = item.special ? tk.textDim : '#cbd5e1';
                let borderColor = 'rgba(255, 255, 255, 0.08)';
                let borderTopColor = 'rgba(255, 255, 255, 0.22)';
                let boxShadow =
                  '0 4px 0 rgba(4, 7, 14, 0.95), 0 6px 14px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)';
                let transform = 'translateY(0)';
                let animation = 'none';

                if (isMatchError) {
                  bg = 'linear-gradient(180deg, #ff6b6b 0%, #c53030 100%)';
                  textColor = '#ffffff';
                  borderColor = '#ff6b6b';
                  borderTopColor = '#ffa8a8';
                  boxShadow = '0 1px 0 rgba(197, 48, 48, 0.9), 0 0 25px rgba(255, 107, 107, 0.85)';
                  transform = 'translateY(3px)';
                  animation = 'keyErrorShake 0.18s ease-in-out';
                } else if (isMatchActive) {
                  bg = 'linear-gradient(180deg, #00d4ff 0%, #0090bf 100%)';
                  textColor = '#030814';
                  borderColor = '#00d4ff';
                  borderTopColor = '#ffffff';
                  boxShadow =
                    '0 1px 0 rgba(0, 144, 191, 0.9), 0 0 28px rgba(0, 212, 255, 0.95), inset 0 1px 2px rgba(255, 255, 255, 0.8)';
                  transform = 'translateY(3px) scale(0.98)';
                } else if (isMatchNext) {
                  bg = 'linear-gradient(180deg, rgba(0, 212, 255, 0.18) 0%, rgba(14, 28, 52, 0.95) 100%)';
                  borderColor = 'rgba(0, 212, 255, 0.85)';
                  borderTopColor = 'rgba(0, 212, 255, 1)';
                  textColor = '#00d4ff';
                  boxShadow =
                    '0 4px 0 rgba(4, 7, 14, 0.95), 0 0 20px rgba(0, 212, 255, 0.65), inset 0 0 10px rgba(0, 212, 255, 0.35)';
                  animation = 'nextKeyPulse 1.2s infinite ease-in-out';
                } else if (item.enter) {
                  bg = 'linear-gradient(180deg, rgba(0, 229, 160, 0.14) 0%, rgba(13, 24, 36, 0.95) 100%)';
                  textColor = tk.green;
                  borderColor = 'rgba(0, 229, 160, 0.3)';
                } else if (item.home) {
                  borderColor = 'rgba(0, 212, 255, 0.2)';
                }

                return (
                  <div
                    key={item.key}
                    style={{
                      width: item.w,
                      height: 42,
                      borderRadius: 9,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: item.special ? 10 : 13,
                      fontFamily: tk.fontMono,
                      fontWeight: (isMatchActive || isMatchNext || item.enter) ? 800 : 600,
                      position: 'relative',
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderTop: `1px solid ${borderTopColor}`,
                      color: textColor,
                      boxShadow,
                      transform,
                      animation,
                      userSelect: 'none',
                      transition: 'transform 0.06s ease, background 0.08s ease, box-shadow 0.08s ease',
                      flexShrink: 0,
                    }}
                  >
                    <span>{item.label}</span>

                    {/* Raised Physical Tactile Bump on F & J keys */}
                    {item.bump && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 5,
                          width: 12,
                          height: 2.5,
                          borderRadius: 2,
                          background: isMatchActive ? '#030814' : 'rgba(0,212,255,0.7)',
                          boxShadow: '0 0 6px rgba(0,212,255,0.5)',
                        }}
                      />
                    )}

                    {/* Home-row subtle indicator dot */}
                    {item.home && !item.bump && !isMatchActive && !isMatchNext && !isMatchError && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 5,
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: 'rgba(0,212,255,0.4)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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

  // Customization & Practice Lab State
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customTargetType, setCustomTargetType] = useState<'time' | 'words' | 'text'>('time');
  const [customTimeInput, setCustomTimeInput] = useState<number>(45);
  const [customWordInput, setCustomWordInput] = useState<number>(30);
  const [customDifficultyInput, setCustomDifficultyInput] = useState<string>('easy');
  const [forceLowercase, setForceLowercase] = useState<boolean>(false);
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [customTextDraft, setCustomTextDraft] = useState<string>('');
  const [isCustomTextMode, setIsCustomTextMode] = useState<boolean>(false);
  const [customTextContent, setCustomTextContent] = useState<string>('');

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
  const [completionHook, setCompletionHook] = useState<CompletionHook | null>(null);
  const [mascotDance, setMascotDance] = useState<'disco' | 'hype' | 'robot' | 'rock'>('disco');

  // High-Energy Motivational Voice Coach
  const speakCoachMessage = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!completionHook) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${completionHook.title}. ${completionHook.body} ${completionHook.hook}`
    );
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }, [completionHook]);

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

    if (isCustomTextMode && customTextContent.trim()) {
      generated = customTextContent.trim();
      setCurrentQuoteAuthor('Custom Practice Text');
    } else if (testMode === 'quote') {
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
      const sourceWords = difficulty === 'easy' ? beginnerWordsList : commonWordsList;
      for (let i = 0; i < wordCount; i++) {
        let randWord = sourceWords[Math.floor(Math.random() * sourceWords.length)];
        if (includeNumbers && Math.random() < 0.15) {
          randWord = String(Math.floor(Math.random() * 90 + 10));
        }
        wordsArr.push(randWord);
      }
      generated = wordsArr.join(' ');
      setCurrentQuoteAuthor('');
    } else {
      // Time mode
      const bank = sentenceBanks[difficulty] || sentenceBanks.easy;
      const shuffled = [...bank].sort(() => Math.random() - 0.5);
      const sentencesCount = timeLimit >= 120 ? 8 : timeLimit >= 60 ? 5 : 3;
      generated = shuffled.slice(0, sentencesCount).join(' ');
      setCurrentQuoteAuthor('');
    }

    // Force lowercase if Beginner mode or if user enabled forceLowercase toggle
    if ((difficulty === 'easy' || forceLowercase) && !isCustomTextMode && difficulty !== 'code') {
      generated = generated.toLowerCase();
    }

    // If user disabled punctuation (except code mode and custom text)
    if (!includePunctuation && difficulty !== 'code' && !isCustomTextMode) {
      generated = generated.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    // Normalize spacing
    generated = generated.replace(/\s+/g, ' ').trim();

    setText(generated);
    setInput('');
    currentInputRef.current = '';
    setStarted(false);
    setFinished(false);
    setCompletionHook(null);
    setTimeLeft(timeLimit);
    setElapsedTime(0);
    finalElapsedRef.current = 0;
    setHistoryPoints([]);
    setMissedKeysMap({});
    setTotalErrorsCount(0);
    setActiveKey('');
    setErrorKey('');
    setShowTextReview(false);
  }, [
    testMode,
    timeLimit,
    wordCount,
    quoteLength,
    difficulty,
    isCustomTextMode,
    customTextContent,
    forceLowercase,
    includePunctuation,
    includeNumbers,
  ]);

  // ─── Apply Custom Settings from Modal ─────────────────────────────────────
  const handleApplyCustomSettings = useCallback(() => {
    if (customTargetType === 'text') {
      if (!customTextDraft.trim()) {
        alert('Please enter or paste some custom text to practice.');
        return;
      }
      setIsCustomTextMode(true);
      setCustomTextContent(customTextDraft.trim());
    } else {
      setIsCustomTextMode(false);
      if (customTargetType === 'time') {
        setTestMode('time');
        const val = Math.max(5, Math.min(600, Number(customTimeInput) || 30));
        setTimeLimit(val);
        setTimeLeft(val);
      } else if (customTargetType === 'words') {
        setTestMode('words');
        const val = Math.max(5, Math.min(500, Number(customWordInput) || 25));
        setWordCount(val);
      }
      setDifficulty(customDifficultyInput);
    }
    setShowCustomModal(false);
    setTimeout(() => {
      generateText();
      inputRef.current?.focus();
    }, 50);
  }, [
    customTargetType,
    customTextDraft,
    customTimeInput,
    customWordInput,
    customDifficultyInput,
    generateText,
  ]);

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

  // ─── Generate Completion Motivation Hook ──────────────────────────────────
  useEffect(() => {
    if (finished) {
      const isNew = stats.wpm > 0 && stats.wpm >= personalBest;
      const hook = getCompletionHook(stats.wpm, stats.accuracy, isNew, streak);
      setCompletionHook(hook);
    }
  }, [finished, stats.wpm, stats.accuracy, personalBest, streak]);

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
    if (isCustomTextMode) return `✍️ Custom Practice Text in ${stats.elapsed}s`;
    if (testMode === 'time') return `⏱️ ${timeLimit}s Time Challenge · ${difficultyConfig[difficulty]?.label || 'Custom'}`;
    if (testMode === 'words') return `📝 ${wordCount} Words Challenge in ${stats.elapsed}s · ${difficultyConfig[difficulty]?.label || 'Custom'}`;
    return `💬 Quote by ${currentQuoteAuthor || 'Famous Figure'} in ${stats.elapsed}s`;
  }, [isCustomTextMode, testMode, timeLimit, wordCount, difficulty, currentQuoteAuthor, stats.elapsed]);

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
            {/* Primary Mode Selector: Time / Words / Quotes / Custom */}
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
                      setIsCustomTextMode(false);
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
                      fontWeight: (!isCustomTextMode && testMode === m.id) ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      background: (!isCustomTextMode && testMode === m.id) ? 'rgba(0,212,255,0.2)' : 'transparent',
                      color: (!isCustomTextMode && testMode === m.id) ? tk.cyan : tk.textDim,
                      transition: 'all 0.2s ease',
                      boxShadow: (!isCustomTextMode && testMode === m.id) ? '0 0 14px rgba(0,212,255,0.2)' : 'none',
                    }}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}

                {isCustomTextMode && (
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 15px',
                      borderRadius: 9,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: 'rgba(168,85,247,0.25)',
                      color: tk.purple,
                      boxShadow: '0 0 14px rgba(168,85,247,0.25)',
                    }}
                  >
                    <FileText size={13} />
                    Custom Text
                  </button>
                )}
              </div>
            </div>

            {/* Contextual Sub-Options */}
            {!isCustomTextMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {testMode === 'time' ? 'Duration:' : testMode === 'words' ? 'Word Count:' : 'Quote Type:'}
                </span>

                {/* Time sub-options */}
                {testMode === 'time' && (
                  <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3, alignItems: 'center' }}>
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

                    {!timeOptions.includes(timeLimit) && (
                      <button
                        style={{
                          padding: '7px 12px',
                          borderRadius: 9,
                          fontSize: 11,
                          fontFamily: tk.fontMono,
                          fontWeight: 700,
                          border: 'none',
                          background: 'rgba(0,212,255,0.25)',
                          color: tk.cyan,
                        }}
                      >
                        {timeLimit}s (Custom)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCustomTargetType('time');
                        setShowCustomModal(true);
                      }}
                      title="Set custom time duration"
                      style={{
                        padding: '7px 10px',
                        borderRadius: 9,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.03)',
                        color: tk.textDim,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Sliders size={11} />
                      <span>Custom</span>
                    </button>
                  </div>
                )}

                {/* Words sub-options */}
                {testMode === 'words' && (
                  <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3, alignItems: 'center' }}>
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

                    {!wordCountOptions.includes(wordCount) && (
                      <button
                        style={{
                          padding: '7px 12px',
                          borderRadius: 9,
                          fontSize: 11,
                          fontFamily: tk.fontMono,
                          fontWeight: 700,
                          border: 'none',
                          background: 'rgba(0,229,160,0.25)',
                          color: tk.green,
                        }}
                      >
                        {wordCount} (Custom)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCustomTargetType('words');
                        setShowCustomModal(true);
                      }}
                      title="Set custom word count"
                      style={{
                        padding: '7px 10px',
                        borderRadius: 9,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.03)',
                        color: tk.textDim,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Sliders size={11} />
                      <span>Custom</span>
                    </button>
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
            )}

            {/* Difficulty Selector (for Time & Words mode) */}
            {testMode !== 'quote' && !isCustomTextMode && (
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

            {/* Toggles & Customize Button */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setShowCustomModal(true)}
                title="Open Practice Laboratory Customizer (customize time, words, difficulty, or paste text)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: 700,
                  border: '1px solid rgba(0,212,255,0.35)',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(168,85,247,0.14))',
                  color: tk.cyan,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 0 14px rgba(0,212,255,0.12)',
                }}
              >
                <Sliders size={13} />
                <span>Customize</span>
              </button>

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
          {/* Custom Mode / Practice Notice */}
          {isCustomTextMode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 18px',
                borderRadius: 14,
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.3)',
                marginBottom: 16,
                fontSize: 12,
                fontFamily: tk.fontMono,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tk.purple }}>
                <FileText size={15} />
                <span style={{ fontWeight: 700 }}>Practicing Custom Text</span>
                <span style={{ color: tk.textDim }}>
                  ({text.trim().split(/\s+/).filter(Boolean).length} words · {text.length} chars)
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCustomTextMode(false);
                  generateText();
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${tk.border}`,
                  color: tk.text,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                }}
              >
                Exit Custom Text
              </button>
            </div>
          )}

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

          {/* High-Level Mechanical Virtual Keyboard */}
          {showKeyboard && (
            <div style={{ marginTop: 14 }}>
              <LiveKeyboard
                activeKey={activeKey}
                errorKey={errorKey}
                nextKey={text[input.length] || ''}
              />
            </div>
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
          {/* ─── BYTE – Victory Celebration Card ─── */}
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(160deg, rgba(7,11,24,0.98) 0%, rgba(12,18,38,0.98) 100%)',
              border: `1.5px solid ${completionHook?.badgeColor ? `${completionHook.badgeColor}50` : 'rgba(0,212,255,0.35)'}`,
              borderRadius: 24,
              marginBottom: 24,
              backdropFilter: 'blur(40px)',
              boxShadow: `0 20px 60px -10px rgba(0,0,0,0.7), 0 0 50px ${completionHook?.badgeColor ? `${completionHook.badgeColor}18` : 'rgba(0,212,255,0.1)'}`,
              overflow: 'hidden',
              animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Rainbow top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#00d4ff,#a855f7,#ff79c6,#ffd700,#00ff88,#00d4ff)', backgroundSize: '300% 100%', animation: 'hookShimmer 2.5s linear infinite' }} />

            {/* Ambient orbs */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${completionHook?.badgeColor ? `${completionHook.badgeColor}14` : 'rgba(0,212,255,0.1)'}, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)', pointerEvents: 'none' }} />

            {/* Inner layout: mascot left, content right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(200px, 26%, 280px) 1fr',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* ── LEFT: Mascot Stage ── */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 12px 20px',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  gap: 12,
                  background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.03))',
                }}
              >
                {/* Mascot SVG */}
                <DancingTypistMascot dance={mascotDance} wpm={stats.wpm} accuracy={stats.accuracy} />

                {/* Speech bubble */}
                <div
                  style={{
                    position: 'relative',
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    fontSize: 11.5,
                    fontFamily: tk.fontMono,
                    color: '#c8d8e8',
                    textAlign: 'center',
                    lineHeight: 1.5,
                    maxWidth: 210,
                    animation: 'speechBubbleBounce 2.4s ease-in-out infinite',
                  }}
                >
                  <div style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid rgba(0,212,255,0.3)' }} />
                  {mascotDance === 'disco' && <span>🕺 &ldquo;DISCO KING OF KEYBOARDS!&rdquo;</span>}
                  {mascotDance === 'hype' && <span>🥳 &ldquo;YOUR FINGERS ARE ON FIRE!!&rdquo;</span>}
                  {mascotDance === 'robot' && <span>🤖 &ldquo;SPEED.EXE MAXED OUT&rdquo;</span>}
                  {mascotDance === 'rock' && <span>🎸 &ldquo;SHRED THOSE KEYS!!&rdquo;</span>}
                </div>

                {/* Dance switcher */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(['disco', 'hype', 'robot', 'rock'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setMascotDance(s)}
                      style={{
                        padding: '4px 10px', borderRadius: 20,
                        fontSize: 10.5, fontFamily: tk.fontMono, fontWeight: 700,
                        cursor: 'pointer',
                        border: mascotDance === s ? '1.5px solid #00d4ff' : '1px solid rgba(255,255,255,0.08)',
                        background: mascotDance === s ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                        color: mascotDance === s ? '#00d4ff' : tk.textDim,
                        transform: mascotDance === s ? 'scale(1.07)' : 'scale(1)',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {s === 'disco' ? '🕺' : s === 'hype' ? '🥳' : s === 'robot' ? '🤖' : '🎸'} {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Content ── */}
              <div
                style={{
                  padding: 'clamp(20px, 3vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  justifyContent: 'center',
                }}
              >
                {/* Top row: badge + coach button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '5px 13px', borderRadius: 20,
                      background: `${completionHook?.badgeColor || tk.cyan}15`,
                      border: `1px solid ${completionHook?.badgeColor || tk.cyan}45`,
                      color: completionHook?.badgeColor || tk.cyan,
                      fontSize: 10.5, fontFamily: tk.fontMono, fontWeight: 800,
                      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      animation: 'floatBadge 2.5s ease-in-out infinite',
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{completionHook?.badge || '⚡ HIGH VELOCITY FINISH'}</span>
                  </div>
                  <button
                    onClick={speakCoachMessage}
                    title="Listen to coach"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 11px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid rgba(255,255,255,0.08)`,
                      color: tk.textDim, cursor: 'pointer',
                      fontSize: 10.5, fontFamily: tk.fontMono, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Volume2 size={12} color={tk.gold} />
                    <span>Coach Voice</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h2
                    style={{
                      fontFamily: tk.fontDisplay,
                      fontSize: 'clamp(18px, 2.4vw, 26px)',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1.25,
                      marginBottom: 6,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {completionHook?.title}
                  </h2>
                  <p style={{ fontSize: 12.5, fontFamily: tk.fontMono, color: tk.gold, fontStyle: 'italic', lineHeight: 1.5 }}>
                    &ldquo;{completionHook?.quote}&rdquo;
                  </p>
                </div>

                {/* Hook message */}
                <div
                  style={{
                    padding: '11px 15px',
                    borderRadius: 12,
                    background: 'rgba(255,121,198,0.06)',
                    border: '1px solid rgba(255,121,198,0.2)',
                    display: 'flex', alignItems: 'flex-start', gap: 9,
                    fontSize: 12.5, color: '#d8e8f0', lineHeight: 1.6, fontFamily: tk.fontMono,
                  }}
                >
                  <Flame size={14} color="#ff79c6" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    <strong style={{ color: '#ff79c6' }}>Byte says: </strong>
                    {completionHook?.hook}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => { generateText(); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '13px 24px', borderRadius: 14,
                    background: 'linear-gradient(135deg, #00d4ff, #a855f7, #ff79c6)',
                    backgroundSize: '200% 100%',
                    animation: 'hookShimmer 3s linear infinite',
                    border: 'none', color: '#ffffff', cursor: 'pointer',
                    fontSize: 13, fontFamily: tk.fontDisplay, fontWeight: 900,
                    letterSpacing: '0.03em',
                    boxShadow: '0 6px 28px rgba(0,212,255,0.35)',
                    width: '100%',
                    marginTop: 2,
                  }}
                >
                  <Zap size={15} />
                  <span>{completionHook?.actionText || '🔥 Keep Dancing – Next Round (Enter ↵)'}</span>
                </button>
              </div>
            </div>
          </div>

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

      {/* ─── Practice Lab Customizer Modal ─── */}
      {showCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 24, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCustomModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(11, 18, 34, 0.95)',
              borderRadius: 20,
              border: `1px solid rgba(0, 212, 255, 0.3)`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.15)',
              padding: '28px',
              animation: 'fadeInUp 0.25s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tk.cyan, fontSize: 11, fontFamily: tk.fontMono, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  <Sliders size={14} /> Practice Laboratory Customizer
                </div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                  Customize Your Typing Test
                </h3>
                <p style={{ fontSize: 12, color: tk.textDim, marginTop: 4 }}>
                  Set your exact duration, word count, difficulty rules, or practice your own custom text.
                </p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tk.border}`,
                  color: tk.textDim,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Target Type Picker */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                1. Select Practice Target
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'time', label: '⏱️ Custom Time', desc: 'Type against countdown clock' },
                  { id: 'words', label: '📝 Custom Words', desc: 'Sprint exact number of words' },
                  { id: 'text', label: '📜 Custom Text', desc: 'Paste your own text / notes' },
                ].map((tgt) => (
                  <button
                    key={tgt.id}
                    onClick={() => setCustomTargetType(tgt.id as 'time' | 'words' | 'text')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 12,
                      border: `1px solid ${customTargetType === tgt.id ? tk.cyan : tk.border}`,
                      background: customTargetType === tgt.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                      color: customTargetType === tgt.id ? '#ffffff' : tk.textDim,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: tk.fontMono, marginBottom: 2 }}>
                      {tgt.label}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.75 }}>{tgt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Panel: Custom Time Options */}
            {customTargetType === 'time' && (
              <div style={{ marginBottom: 22, padding: '16px', borderRadius: 14, background: 'rgba(0,0,0,0.3)', border: `1px solid ${tk.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontFamily: tk.fontMono, fontWeight: 700, color: tk.cyan }}>
                    Set Exact Seconds (5 - 600s):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min={5}
                      max={600}
                      value={customTimeInput}
                      onChange={(e) => setCustomTimeInput(Math.max(5, Math.min(600, Number(e.target.value) || 5)))}
                      style={{
                        width: 72,
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.4)',
                        border: `1px solid ${tk.cyan}`,
                        color: '#ffffff',
                        fontSize: 14,
                        fontFamily: tk.fontMono,
                        fontWeight: 700,
                        textAlign: 'center',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim }}>sec</span>
                  </div>
                </div>

                {/* Quick chip presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[10, 15, 20, 30, 45, 60, 90, 120, 180, 300].map((s) => (
                    <button
                      key={s}
                      onClick={() => setCustomTimeInput(s)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        border: `1px solid ${customTimeInput === s ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        background: customTimeInput === s ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.02)',
                        color: customTimeInput === s ? tk.cyan : tk.textDim,
                        cursor: 'pointer',
                      }}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Panel: Custom Word Count */}
            {customTargetType === 'words' && (
              <div style={{ marginBottom: 22, padding: '16px', borderRadius: 14, background: 'rgba(0,0,0,0.3)', border: `1px solid ${tk.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontFamily: tk.fontMono, fontWeight: 700, color: tk.green }}>
                    Set Word Count (5 - 500 words):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={customWordInput}
                      onChange={(e) => setCustomWordInput(Math.max(5, Math.min(500, Number(e.target.value) || 5)))}
                      style={{
                        width: 72,
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.4)',
                        border: `1px solid ${tk.green}`,
                        color: '#ffffff',
                        fontSize: 14,
                        fontFamily: tk.fontMono,
                        fontWeight: 700,
                        textAlign: 'center',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim }}>words</span>
                  </div>
                </div>

                {/* Quick chip presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[10, 15, 25, 35, 50, 75, 100, 150, 200].map((w) => (
                    <button
                      key={w}
                      onClick={() => setCustomWordInput(w)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        border: `1px solid ${customWordInput === w ? 'rgba(0,229,160,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        background: customWordInput === w ? 'rgba(0,229,160,0.2)' : 'rgba(255,255,255,0.02)',
                        color: customWordInput === w ? tk.green : tk.textDim,
                        cursor: 'pointer',
                      }}
                    >
                      {w}w
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Panel: Custom Text Paste */}
            {customTargetType === 'text' && (
              <div style={{ marginBottom: 22, padding: '16px', borderRadius: 14, background: 'rgba(0,0,0,0.3)', border: `1px solid ${tk.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontFamily: tk.fontMono, fontWeight: 700, color: tk.purple }}>
                    Paste Your Own Practice Text:
                  </label>
                  <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>
                    {customTextDraft.trim().split(/\s+/).filter(Boolean).length} words · {customTextDraft.length} chars
                  </span>
                </div>
                <textarea
                  value={customTextDraft}
                  onChange={(e) => setCustomTextDraft(e.target.value)}
                  placeholder="Paste or write any essay, poem, medical vocabulary, interview speech, or coding notes here to practice..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid rgba(168,85,247,0.3)`,
                    color: '#ffffff',
                    fontSize: 13,
                    fontFamily: tk.fontMono,
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            )}

            {/* Difficulty Selector (when not custom text) */}
            {customTargetType !== 'text' && (
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                  2. Choose Difficulty Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {Object.entries(difficultyConfig).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setCustomDifficultyInput(key)}
                      style={{
                        padding: '10px',
                        borderRadius: 12,
                        border: `1px solid ${customDifficultyInput === key ? val.color : tk.border}`,
                        background: customDifficultyInput === key ? `${val.color}18` : 'rgba(255,255,255,0.02)',
                        color: customDifficultyInput === key ? val.color : tk.textDim,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, fontFamily: tk.fontMono, marginBottom: 2 }}>
                        {val.icon}
                        <span>{val.label}</span>
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.8 }}>{val.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fine-Tuning Switches */}
            {customTargetType !== 'text' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>
                  3. Content Modifiers & Switches
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* All Lowercase switch */}
                  <div
                    onClick={() => setForceLowercase(!forceLowercase)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${(forceLowercase || customDifficultyInput === 'easy') ? tk.green : tk.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: (forceLowercase || customDifficultyInput === 'easy') ? tk.green : '#ffffff', fontFamily: tk.fontMono }}>
                        🔤 All Small Letters (Lowercase Only)
                      </div>
                      <div style={{ fontSize: 11, color: tk.textDim }}>
                        {customDifficultyInput === 'easy'
                          ? 'Always active for Beginner mode (no capital letters or Shift required)'
                          : 'Strips capital letters for easy, uninterrupted typing'}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 12,
                        background: (forceLowercase || customDifficultyInput === 'easy') ? tk.green : 'rgba(255,255,255,0.1)',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: 3,
                          left: (forceLowercase || customDifficultyInput === 'easy') ? 21 : 3,
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Punctuation switch */}
                  <div
                    onClick={() => setIncludePunctuation(!includePunctuation)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${includePunctuation ? tk.cyan : tk.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: includePunctuation ? tk.cyan : '#ffffff', fontFamily: tk.fontMono }}>
                        🔡 Include Punctuation
                      </div>
                      <div style={{ fontSize: 11, color: tk.textDim }}>
                        Includes commas, periods, quotation marks, and apostrophes
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 12,
                        background: includePunctuation ? tk.cyan : 'rgba(255,255,255,0.1)',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: 3,
                          left: includePunctuation ? 21 : 3,
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Numbers switch */}
                  <div
                    onClick={() => setIncludeNumbers(!includeNumbers)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${includeNumbers ? tk.gold : tk.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: includeNumbers ? tk.gold : '#ffffff', fontFamily: tk.fontMono }}>
                        🔢 Include Numbers (0 - 9)
                      </div>
                      <div style={{ fontSize: 11, color: tk.textDim }}>
                        Mixes digits into words to practice the top number row
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 12,
                        background: includeNumbers ? tk.gold : 'rgba(255,255,255,0.1)',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: 3,
                          left: includeNumbers ? 21 : 3,
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: `1px solid ${tk.border}` }}>
              <button
                onClick={() => setShowCustomModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tk.border}`,
                  color: tk.textDim,
                  cursor: 'pointer',
                  fontFamily: tk.fontMono,
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomSettings}
                style={{
                  padding: '9px 24px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(168,85,247,0.3))',
                  border: '1px solid rgba(0,212,255,0.5)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontFamily: tk.fontMono,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 0 20px rgba(0,212,255,0.25)',
                }}
              >
                <Check size={14} />
                <span>Apply & Start Practice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CSS Keyframes ─── */}
      <style>{`
        @keyframes rgbChassisGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes keyErrorShake {
          0%, 100% { transform: translateY(3px) translateX(0); }
          25% { transform: translateY(3px) translateX(-4px); }
          75% { transform: translateY(3px) translateX(4px); }
        }
        @keyframes nextKeyPulse {
          0%, 100% {
            box-shadow: 0 4px 0 rgba(4, 7, 14, 0.95), 0 0 14px rgba(0, 212, 255, 0.6), inset 0 0 6px rgba(0, 212, 255, 0.3);
            border-color: rgba(0, 212, 255, 0.75);
          }
          50% {
            box-shadow: 0 4px 0 rgba(4, 7, 14, 0.95), 0 0 24px rgba(0, 212, 255, 0.95), inset 0 0 12px rgba(0, 212, 255, 0.5);
            border-color: rgba(0, 212, 255, 1);
          }
        }
        @keyframes hookShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
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
        /* ═══ Mascot & Celebration Keyframes ═══ */
        @keyframes spotlightSweep {
          0%, 100% { transform: rotate(-10deg) scaleX(0.9); opacity: 0.7; }
          50% { transform: rotate(10deg) scaleX(1.1); opacity: 1; }
        }
        @keyframes floorPulse {
          0%, 100% { rx: 50; ry: 9; opacity: 0.7; }
          50% { rx: 62; ry: 12; opacity: 1; }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.6; }
          50% { transform: scaleX(0.8); opacity: 0.3; }
        }
        /* ─── Main Body Bounces ─── */
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          25% { transform: translateY(-12px) rotate(2deg); }
          50% { transform: translateY(-18px) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes mascotHypeBounce {
          0%, 100% { transform: translateY(0) scaleY(1); }
          40% { transform: translateY(-24px) scaleY(1.05); }
          60% { transform: translateY(-22px) scaleY(1.05); }
        }
        @keyframes mascotHypeShadow {
          0%, 100% { rx: 26; opacity: 0.5; }
          40% { rx: 18; opacity: 0.2; }
        }
        @keyframes mascotRobotStaccato {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(0deg); }
        }
        @keyframes mascotRockBounce {
          0%, 100% { transform: translateY(0) rotate(-3deg) scaleY(1); }
          35% { transform: translateY(-16px) rotate(3deg) scaleY(1.04); }
          70% { transform: translateY(-10px) rotate(-2deg) scaleY(0.98); }
        }
        @keyframes mascotRockHead {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        /* ─── Head Bob ─── */
        @keyframes mascotHeadBob {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-6px); }
        }
        /* ─── Arm Animations Per Dance ─── */
        @keyframes discoArmLeft {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(30deg); }
        }
        @keyframes discoArmRight {
          0%, 100% { transform: rotate(25deg); }
          50% { transform: rotate(-15deg); }
        }
        @keyframes hypeArmLeft {
          0%, 100% { transform: rotate(-60deg) translateY(0); }
          50% { transform: rotate(-120deg) translateY(-10px); }
        }
        @keyframes hypeArmRight {
          0%, 100% { transform: rotate(60deg) translateY(0); }
          50% { transform: rotate(120deg) translateY(-10px); }
        }
        @keyframes robotArmLeft {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-90deg); }
        }
        @keyframes robotArmRight {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(90deg); }
        }
        @keyframes rockArmLeft {
          0%, 100% { transform: rotate(10deg) scaleX(1); }
          50% { transform: rotate(-30deg) scaleX(1.1); }
        }
        @keyframes rockArmRight {
          0%, 100% { transform: rotate(-10deg) scaleX(1); }
          50% { transform: rotate(20deg) scaleX(1.1); }
        }
        /* ─── Foot Taps ─── */
        @keyframes footTapLeft {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          40% { transform: rotate(-15deg) translateY(-8px); }
        }
        @keyframes footTapRight {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          60% { transform: rotate(15deg) translateY(-8px); }
        }
        /* ─── Equalizer Bars ─── */
        @keyframes equalizerBar1 {
          0%, 100% { height: 12px; y: 146px; }
          50% { height: 20px; y: 138px; }
        }
        @keyframes equalizerBar2 {
          0%, 100% { height: 16px; y: 142px; }
          50% { height: 8px; y: 150px; }
        }
        @keyframes equalizerBar3 {
          0%, 100% { height: 18px; y: 140px; }
          50% { height: 10px; y: 148px; }
        }
        /* ─── Star / Crown Spin ─── */
        @keyframes crownStarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* ─── Floating Musical Notes ─── */
        @keyframes noteFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          50% { transform: translateY(-18px) scale(1.15) rotate(10deg); opacity: 1; }
          100% { transform: translateY(-36px) scale(0.7); opacity: 0; }
        }
        /* ─── Speech Bubble Bounce ─── */
        @keyframes speechBubbleBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-5px) scale(1.03); }
          70% { transform: translateY(-3px) scale(1.01); }
        }

        div::-webkit-scrollbar { width: 5px; height: 5px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 4px; }
        div::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.4); }
      `}</style>
    </div>
  );
}
