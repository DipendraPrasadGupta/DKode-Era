'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';

// ─── Color Helper Utilities ──────────────────────────────────────────────────

interface ColorItem {
  id: string;
  hex: string;
  locked: boolean;
  name: string;
}

// Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Calculate relative luminance for WCAG contrast
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Contrast ratio between two hex colors
function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

// Determine if text should be dark or light on top of this color
function getReadableTextColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#050810' : '#FFFFFF';
}

// Generate shades / tints for a given color
function getShades(hex: string): string[] {
  const { r, g, b } = hexToRgb(hex);
  const { h, s } = rgbToHsl(r, g, b);
  return [15, 30, 45, 60, 75, 90].map(light => hslToHex(h, s, light));
}

// Generate human-friendly descriptive name
function getDescriptiveName(h: number, s: number, l: number): string {
  let hueName = 'Red';
  if (h >= 15 && h < 45) hueName = 'Orange';
  else if (h >= 45 && h < 70) hueName = 'Amber';
  else if (h >= 70 && h < 160) hueName = 'Green';
  else if (h >= 160 && h < 200) hueName = 'Cyan';
  else if (h >= 200 && h < 260) hueName = 'Blue';
  else if (h >= 260 && h < 310) hueName = 'Purple';
  else if (h >= 310 && h < 345) hueName = 'Pink';

  let tone = 'Vibrant';
  if (l < 25) tone = 'Deep';
  else if (l > 75) tone = 'Pastel';
  else if (s < 25) tone = 'Muted';
  else if (s > 80) tone = 'Electric';

  return `${tone} ${hueName}`;
}

// ─── Harmony Generators ──────────────────────────────────────────────────────

type HarmonyType = 'vibrant' | 'analogous' | 'complementary' | 'triadic' | 'monochrome' | 'cyberpunk' | 'pastel';

function generateHarmonyPalette(harmony: HarmonyType): string[] {
  const baseHue = Math.floor(Math.random() * 360);

  switch (harmony) {
    case 'analogous':
      return [
        hslToHex((baseHue - 40 + 360) % 360, 75, 55),
        hslToHex((baseHue - 20 + 360) % 360, 80, 50),
        hslToHex(baseHue, 85, 48),
        hslToHex((baseHue + 20) % 360, 80, 55),
        hslToHex((baseHue + 40) % 360, 75, 65),
      ];
    case 'complementary':
      const compHue = (baseHue + 180) % 360;
      return [
        hslToHex(baseHue, 80, 45),
        hslToHex(baseHue, 60, 65),
        hslToHex((baseHue + 30) % 360, 30, 20),
        hslToHex(compHue, 70, 70),
        hslToHex(compHue, 85, 50),
      ];
    case 'triadic':
      const tri1 = (baseHue + 120) % 360;
      const tri2 = (baseHue + 240) % 360;
      return [
        hslToHex(baseHue, 85, 52),
        hslToHex(baseHue, 60, 70),
        hslToHex(tri1, 80, 50),
        hslToHex(tri2, 75, 45),
        hslToHex(tri2, 85, 62),
      ];
    case 'monochrome':
      return [
        hslToHex(baseHue, 85, 20),
        hslToHex(baseHue, 80, 35),
        hslToHex(baseHue, 75, 50),
        hslToHex(baseHue, 70, 68),
        hslToHex(baseHue, 65, 85),
      ];
    case 'cyberpunk':
      return [
        hslToHex(185, 100, 50), // Neon Cyan
        hslToHex(280, 95, 55),  // Neon Purple
        hslToHex(330, 100, 55), // Hot Pink
        hslToHex(45, 100, 50),  // Cyber Yellow
        hslToHex(220, 40, 12),  // Deep Void Slate
      ];
    case 'pastel':
      return [
        hslToHex((baseHue + 0) % 360, 65, 80),
        hslToHex((baseHue + 45) % 360, 60, 82),
        hslToHex((baseHue + 90) % 360, 70, 85),
        hslToHex((baseHue + 160) % 360, 55, 82),
        hslToHex((baseHue + 220) % 360, 60, 80),
      ];
    case 'vibrant':
    default:
      return [
        hslToHex((baseHue + 0) % 360, 85, 52),
        hslToHex((baseHue + 72) % 360, 80, 58),
        hslToHex((baseHue + 144) % 360, 75, 48),
        hslToHex((baseHue + 216) % 360, 85, 55),
        hslToHex((baseHue + 288) % 360, 80, 62),
      ];
  }
}

// ─── Curated Presets Library ─────────────────────────────────────────────────

const CURATED_PRESETS: Array<{ name: string; tag: string; colors: string[] }> = [
  { name: 'D-Kode Cyber Neon', tag: 'Neon UI', colors: ['#00D4FF', '#A855F7', '#00E5A0', '#F5C842', '#050810'] },
  { name: 'Himalayan Dawn', tag: 'Scenic', colors: ['#FF5E7E', '#FFA25B', '#FFE77A', '#5E72E4', '#172B4D'] },
  { name: 'Deep Emerald Matrix', tag: 'Organic', colors: ['#00E5A0', '#059669', '#10B981', '#34D399', '#064E3B'] },
  { name: 'Midnight Amethyst', tag: 'Luxury', colors: ['#8B5CF6', '#C084FC', '#6366F1', '#3B82F6', '#0F172A'] },
  { name: 'Nordic Minimalist', tag: 'Clean', colors: ['#E2E8F0', '#94A3B8', '#64748B', '#334155', '#0F172A'] },
  { name: 'Sunset Terracotta', tag: 'Warm', colors: ['#EA580C', '#F97316', '#FDBA74', '#FEF3C7', '#7C2D12'] },
  { name: 'Tokyo Synthwave', tag: 'Retro', colors: ['#FF007F', '#7928CA', '#00DFD8', '#FFE600', '#12002B'] },
  { name: 'Matcha & Oat', tag: 'Pastel', colors: ['#A7D7C5', '#F6F5F0', '#74B49B', '#5C8D89', '#2E4C48'] },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ColorPalettePage() {
  const [harmony, setHarmony] = useState<HarmonyType>('vibrant');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeExportTab, setActiveExportTab] = useState<'css' | 'tailwind' | 'json' | 'scss'>('css');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [activeShadeIndex, setActiveShadeIndex] = useState<number | null>(null);

  // Initial colors
  const [colors, setColors] = useState<ColorItem[]>([
    { id: '1', hex: '#00D4FF', locked: false, name: 'Electric Cyan' },
    { id: '2', hex: '#A855F7', locked: false, name: 'Neon Violet' },
    { id: '3', hex: '#00E5A0', locked: false, name: 'Vibrant Emerald' },
    { id: '4', hex: '#F5C842', locked: false, name: 'Warm Amber' },
    { id: '5', hex: '#0D1425', locked: false, name: 'Deep Space' },
  ]);

  // Generate new palette respecting locks
  const generateNew = useCallback((harmonyChoice?: HarmonyType) => {
    const activeHarmony = harmonyChoice || harmony;
    const newHexes = generateHarmonyPalette(activeHarmony);

    setColors(prev =>
      prev.map((c, i) => {
        if (c.locked) return c;
        const newHex = newHexes[i % newHexes.length];
        const { r, g, b } = hexToRgb(newHex);
        const { h, s, l } = rgbToHsl(r, g, b);
        return {
          ...c,
          hex: newHex,
          name: getDescriptiveName(h, s, l),
        };
      })
    );
  }, [harmony]);

  // Keyboard shortcut: Spacebar generates new colors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        generateNew();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNew]);

  // Toggle lock
  const toggleLock = (id: string) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  };

  // Change individual color
  const updateColor = (id: string, newHex: string) => {
    const { r, g, b } = hexToRgb(newHex);
    const { h, s, l } = rgbToHsl(r, g, b);
    setColors(prev =>
      prev.map(c => c.id === id ? { ...c, hex: newHex.toUpperCase(), name: getDescriptiveName(h, s, l) } : c)
    );
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Apply curated preset
  const applyPreset = (presetColors: string[]) => {
    setColors(
      presetColors.map((hex, index) => {
        const { r, g, b } = hexToRgb(hex);
        const { h, s, l } = rgbToHsl(r, g, b);
        return {
          id: String(index + 1),
          hex: hex.toUpperCase(),
          locked: false,
          name: getDescriptiveName(h, s, l),
        };
      })
    );
  };

  // Formatted exports
  const exportCSS = useMemo(() => {
    return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n')}\n}`;
  }, [colors]);

  const exportTailwind = useMemo(() => {
    const entries = colors.map((c, i) => `        'palette-${i + 1}': '${c.hex}', // ${c.name}`).join('\n');
    return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      }\n    }\n  }\n};`;
  }, [colors]);

  const exportJSON = useMemo(() => {
    return JSON.stringify(
      colors.map(c => ({ hex: c.hex, name: c.name, rgb: hexToRgb(c.hex), hsl: rgbToHsl(hexToRgb(c.hex).r, hexToRgb(c.hex).g, hexToRgb(c.hex).b) })),
      null,
      2
    );
  }, [colors]);

  const exportSCSS = useMemo(() => {
    return colors.map((c, i) => `$color-${i + 1}: ${c.hex}; // ${c.name}`).join('\n');
  }, [colors]);

  // Export as PNG swatch
  const downloadPaletteImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title banner
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('D-Kode Era — Modern Color Palette', 50, 70);

    const swatchWidth = (canvas.width - 100) / colors.length;
    const swatchHeight = 440;
    const startY = 120;

    colors.forEach((c, i) => {
      const x = 50 + i * swatchWidth;
      ctx.fillStyle = c.hex;
      ctx.fillRect(x, startY, swatchWidth - 6, swatchHeight);

      // Label text
      const textColor = getReadableTextColor(c.hex);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 20px monospace';
      ctx.fillText(c.hex, x + 16, startY + swatchHeight - 40);

      ctx.font = '14px sans-serif';
      ctx.fillText(c.name, x + 16, startY + swatchHeight - 16);
    });

    const link = document.createElement('a');
    link.download = 'dkode_color_palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* ── Top Header / Hero ────────────────────────────────────────────── */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(0,229,160,0.12), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(168,85,247,0.1), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 36px',
          borderBottom: `1px solid ${tk.border}`,
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <Link
            href="/pages/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontFamily: tk.fontMono,
              color: tk.textDim,
              textDecoration: 'none',
              marginBottom: 24,
              letterSpacing: '0.05em',
            }}
          >
            ← Back to Tools
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: 680 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(0,229,160,0.08)',
                  border: '1px solid rgba(0,229,160,0.25)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: tk.green,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                🎨 Free UI/UX & Design Suite · Glassmorphism Ready
              </div>

              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 54px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                Modern Color{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.green}, ${tk.cyan})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Palette Generator
                </span>
              </h1>

              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.7, maxWidth: 620, margin: 0 }}>
                Generate harmonic, accessible, and stunning color schemes for websites, dark mode interfaces, and mobile apps. Press <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6, border: `1px solid ${tk.border}`, color: tk.cyan, fontFamily: tk.fontMono }}>Spacebar</kbd> anytime to randomize.
              </p>
            </div>

            {/* Quick Controls Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 16,
                padding: '16px 20px',
                minWidth: 260,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>⌨️</span>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.cyan, fontWeight: 700, textTransform: 'uppercase' }}>
                  Quick Controls
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: tk.textDim, lineHeight: 1.7 }}>
                <li>Press <strong>Spacebar</strong> to randomize</li>
                <li>Click <strong>🔒 Lock</strong> to freeze a favorite color</li>
                <li>Click <strong>HEX code</strong> to copy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Workspace ───────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Toolbar: Harmony Mode Selector & Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            background: 'rgba(0,0,0,0.3)',
            padding: '14px 18px',
            borderRadius: 14,
            border: `1px solid ${tk.border}`,
          }}
        >
          {/* Harmony Modes */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginRight: 4 }}>
              Harmony:
            </span>
            {(['vibrant', 'analogous', 'complementary', 'triadic', 'monochrome', 'cyberpunk', 'pastel'] as HarmonyType[]).map(h => (
              <button
                key={h}
                onClick={() => {
                  setHarmony(h);
                  generateNew(h);
                }}
                style={{
                  background: harmony === h ? 'rgba(0,229,160,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${harmony === h ? tk.green : tk.border}`,
                  color: harmony === h ? tk.green : tk.textDim,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: tk.fontMono,
                  fontWeight: harmony === h ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => generateNew()}
              style={{
                background: `linear-gradient(135deg, ${tk.green}, ${tk.cyan})`,
                color: '#050810',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                fontFamily: tk.fontMono,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 16px rgba(0,229,160,0.25)',
              }}
            >
              <span>🎲</span>
              <span>Generate (Space)</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${tk.border}`,
                color: tk.text,
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontFamily: tk.fontMono,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📥 Export Code
            </button>

            <button
              onClick={downloadPaletteImage}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${tk.border}`,
                color: tk.text,
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontFamily: tk.fontMono,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🖼️ PNG Swatch
            </button>
          </div>
        </div>

        {/* ── The Hero Interactive Swatches Strip ─────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${colors.length}, 1fr)`,
            minHeight: 380,
            borderRadius: 20,
            overflow: 'hidden',
            border: `1px solid ${tk.border}`,
            boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
            marginBottom: 36,
          }}
        >
          {colors.map((color, index) => {
            const textColor = getReadableTextColor(color.hex);
            const { r, g, b } = hexToRgb(color.hex);
            const { h, s, l } = rgbToHsl(r, g, b);
            const contrastOnWhite = getContrastRatio(color.hex, '#FFFFFF');
            const contrastOnBlack = getContrastRatio(color.hex, '#050810');
            const shades = getShades(color.hex);

            return (
              <div
                key={color.id}
                style={{
                  background: color.hex,
                  color: textColor,
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  transition: 'background 0.3s ease',
                  minWidth: 140,
                }}
              >
                {/* Top Action: Lock / Unlock & Color Picker */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleLock(color.id)}
                    title={color.locked ? 'Unlock Color' : 'Lock Color'}
                    style={{
                      background: color.locked ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: 8,
                      width: 34,
                      height: 34,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      color: textColor,
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {color.locked ? '🔒' : '🔓'}
                  </button>

                  {/* Native Color Picker Trigger */}
                  <label
                    title="Choose custom color"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      width: 34,
                      height: 34,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      color: textColor,
                    }}
                  >
                    ✏️
                    <input
                      type="color"
                      value={color.hex}
                      onChange={e => updateColor(color.id, e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                  </label>
                </div>

                {/* Center: Interactive Copyable HEX Code */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.hex)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: textColor,
                      fontFamily: tk.fontMono,
                      fontSize: 'clamp(18px, 2.2vw, 24px)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {copiedText === color.hex ? '✓ Copied' : color.hex}
                  </button>

                  <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginTop: 4 }}>
                    {color.name}
                  </div>

                  <div style={{ fontSize: 11, fontFamily: tk.fontMono, opacity: 0.65, marginTop: 2 }}>
                    hsl({h}, {s}%, {l}%)
                  </div>
                </div>

                {/* Bottom: Shades Mini Strip & WCAG Badge */}
                <div style={{ width: '100%' }}>
                  {/* WCAG Contrast badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      opacity: 0.75,
                      marginBottom: 10,
                    }}
                  >
                    <span title={`Contrast with white: ${contrastOnWhite}:1`}>
                      W: {contrastOnWhite}:1 {contrastOnWhite >= 4.5 ? '✓' : ''}
                    </span>
                    <span>·</span>
                    <span title={`Contrast with black: ${contrastOnBlack}:1`}>
                      B: {contrastOnBlack}:1 {contrastOnBlack >= 4.5 ? '✓' : ''}
                    </span>
                  </div>

                  {/* Shades Palette preview */}
                  <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 16 }}>
                    {shades.map((shade, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => updateColor(color.id, shade)}
                        title={`Click to pick shade: ${shade}`}
                        style={{
                          flex: 1,
                          background: shade,
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Live UI Component Preview ────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 20, fontFamily: tk.fontDisplay, fontWeight: 700, marginBottom: 16 }}>
            🖥️ Real-World UI Simulation
          </h3>

          <div
            style={{
              background: colors[4]?.hex || '#080d1a',
              border: `1px solid ${tk.border}`,
              borderRadius: 20,
              padding: '36px 32px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* Mock Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: colors[0]?.hex }} />
                <span style={{ fontWeight: 800, fontSize: 16, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  D-Kode Studio UI
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: colors[1]?.hex, background: `${colors[1]?.hex}18`, padding: '4px 10px', borderRadius: 12 }}>
                  v2.0 Beta
                </span>
              </div>
            </div>

            {/* Mock Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {/* Card 1: Primary Feature */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${colors[0]?.hex}40`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: colors[0]?.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: getReadableTextColor(colors[0]?.hex), fontSize: 20 }}>
                  ⚡
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: 18, color: '#FFFFFF' }}>High Velocity Architecture</h4>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  Microservices engineered with millisecond responsiveness and unified state hydration.
                </p>
                <button
                  style={{
                    background: colors[0]?.hex,
                    color: getReadableTextColor(colors[0]?.hex),
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Explore Component
                </button>
              </div>

              {/* Card 2: Secondary Accent */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${colors[1]?.hex}40`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: colors[1]?.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: getReadableTextColor(colors[1]?.hex), fontSize: 20 }}>
                  🔮
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: 18, color: '#FFFFFF' }}>AI Agent Workflows</h4>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  Autonomous LLM orchestration pipelines automating customer acquisition and support.
                </p>
                <button
                  style={{
                    background: 'transparent',
                    border: `1px solid ${colors[1]?.hex}`,
                    color: colors[1]?.hex,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  View Blueprint
                </button>
              </div>

              {/* Card 3: Metrics & Badges */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${colors[2]?.hex}40`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: colors[2]?.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: getReadableTextColor(colors[2]?.hex), fontSize: 20 }}>
                  📈
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: 18, color: '#FFFFFF' }}>Performance Analytics</h4>
                <div style={{ fontSize: 28, fontWeight: 800, color: colors[3]?.hex, fontFamily: tk.fontMono, margin: '8px 0' }}>
                  +99.94%
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  Verified Lighthouse Core Web Vitals score across all generated screens.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Curated Trending Palettes Library ────────────────────────────── */}
        <div>
          <h3 style={{ fontSize: 20, fontFamily: tk.fontDisplay, fontWeight: 700, marginBottom: 8 }}>
            🔥 Curated Designer Palettes
          </h3>
          <p style={{ fontSize: 14, color: tk.textDim, marginBottom: 20 }}>
            Click any palette below to instantly load it into the editor and preview.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {CURATED_PRESETS.map((preset) => (
              <div
                key={preset.name}
                onClick={() => applyPreset(preset.colors)}
                style={{
                  background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                  border: `1px solid ${tk.border}`,
                  borderRadius: 14,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>{preset.name}</span>
                  <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, background: 'rgba(0,212,255,0.08)', padding: '2px 6px', borderRadius: 6 }}>
                    {preset.tag}
                  </span>
                </div>

                {/* Swatches mini preview */}
                <div style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden' }}>
                  {preset.colors.map((hex, i) => (
                    <div key={i} style={{ flex: 1, background: hex }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Code Export Modal ────────────────────────────────────────────── */}
        {showExportModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#090E1A',
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                width: '100%',
                maxWidth: 640,
                padding: 28,
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: tk.fontDisplay, color: tk.cyan }}>
                  Export Color Palette
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  style={{ background: 'transparent', border: 'none', color: tk.textDim, fontSize: 20, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Format Tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['css', 'tailwind', 'json', 'scss'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveExportTab(tab)}
                    style={{
                      background: activeExportTab === tab ? tk.cyan : 'rgba(255,255,255,0.03)',
                      color: activeExportTab === tab ? '#050810' : tk.textDim,
                      border: `1px solid ${activeExportTab === tab ? tk.cyan : tk.border}`,
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Code Snippet Box */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 12,
                  padding: 16,
                  fontFamily: tk.fontMono,
                  fontSize: 13,
                  color: tk.text,
                  maxHeight: 280,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 20,
                }}
              >
                {activeExportTab === 'css' && exportCSS}
                {activeExportTab === 'tailwind' && exportTailwind}
                {activeExportTab === 'json' && exportJSON}
                {activeExportTab === 'scss' && exportSCSS}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => {
                    const content =
                      activeExportTab === 'css' ? exportCSS :
                      activeExportTab === 'tailwind' ? exportTailwind :
                      activeExportTab === 'json' ? exportJSON : exportSCSS;
                    copyToClipboard(content, 'export');
                  }}
                  style={{
                    background: tk.cyan,
                    color: '#050810',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                  }}
                >
                  {copiedText === 'export' ? '✓ Copied to Clipboard' : '📋 Copy Code'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
