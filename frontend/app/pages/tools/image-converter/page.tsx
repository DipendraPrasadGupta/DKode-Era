'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import JSZip from 'jszip';

// ─── Supported Formats ───────────────────────────────────────────────────────

export type OutputFormat = 'webp' | 'png' | 'jpeg' | 'avif' | 'bmp' | 'ico' | 'base64';

interface FormatConfig {
  id: OutputFormat;
  label: string;
  ext: string;
  mime: string;
  badge: string;
  desc: string;
  supportsQuality: boolean;
}

const FORMATS: FormatConfig[] = [
  { id: 'webp', label: 'WebP', ext: 'webp', mime: 'image/webp', badge: 'Recommended', desc: 'Modern web standard — exceptional compression with transparency.', supportsQuality: true },
  { id: 'png', label: 'PNG', ext: 'png', mime: 'image/png', badge: 'Lossless', desc: 'Pixel-perfect quality with full alpha transparency support.', supportsQuality: false },
  { id: 'jpeg', label: 'JPEG / JPG', ext: 'jpg', mime: 'image/jpeg', badge: 'Universal', desc: 'Classic photograph standard compatible with all devices.', supportsQuality: true },
  { id: 'avif', label: 'AVIF', ext: 'avif', mime: 'image/avif', badge: 'Next-Gen', desc: 'Ultra-efficient modern codec for cutting-edge web performance.', supportsQuality: true },
  { id: 'bmp', label: 'BMP', ext: 'bmp', mime: 'image/bmp', badge: 'Uncompressed', desc: 'Standard Windows bitmap format without compression artifacts.', supportsQuality: false },
  { id: 'ico', label: 'ICO (Favicon)', ext: 'ico', mime: 'image/x-icon', badge: 'Web Icon', desc: 'Standard favicon format for website bookmarks and tabs.', supportsQuality: false },
  { id: 'base64', label: 'Base64 Data URI', ext: 'txt', mime: 'text/plain', badge: 'Code Snippet', desc: 'Direct embeddable data URI for CSS, HTML, and markdown.', supportsQuality: true },
];

export interface ConvertedFile {
  id: string;
  originalName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalType: string;
  originalPreviewUrl: string;
  format: OutputFormat;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedWidth?: number;
  convertedHeight?: number;
  base64String?: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  errorMessage?: string;
}

export default function ImageConverterPage() {
  const [targetFormat, setTargetFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState<number>(85); // 10 to 100
  const [resizeMode, setResizeMode] = useState<'original' | 'fit' | 'square'>('original');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [squareSize, setSquareSize] = useState<number>(512);

  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helper to format byte sizes ────────────────────────────────────────────
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // ── Convert single file in Canvas ──────────────────────────────────────────
  const processImage = async (
    fileItem: ConvertedFile,
    fmt: OutputFormat,
    q: number,
    rMode: 'original' | 'fit' | 'square',
    maxW: number,
    maxH: number,
    sqSize: number
  ): Promise<Partial<ConvertedFile>> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let targetW = img.width;
        let targetH = img.height;

        if (rMode === 'fit') {
          const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
          targetW = Math.round(img.width * ratio);
          targetH = Math.round(img.height * ratio);
        } else if (rMode === 'square') {
          targetW = sqSize;
          targetH = sqSize;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ status: 'error', errorMessage: 'Canvas context unavailable' });
          return;
        }

        // Background handling
        if (fmt === 'jpeg' || fmt === 'bmp') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        if (rMode === 'square' && img.width !== img.height) {
          // Centered cover crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetW, targetH);
        } else {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        }

        // Handle Base64 export
        if (fmt === 'base64') {
          const dataUrl = canvas.toDataURL('image/webp', q / 100);
          const blob = new Blob([dataUrl], { type: 'text/plain' });
          resolve({
            status: 'done',
            format: fmt,
            convertedBlob: blob,
            convertedUrl: dataUrl,
            convertedSize: blob.size,
            convertedWidth: targetW,
            convertedHeight: targetH,
            base64String: dataUrl,
          });
          return;
        }

        // Handle ICO format
        if (fmt === 'ico') {
          // Generate a PNG blob then wrap in Windows ICO structure
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              resolve({ status: 'error', errorMessage: 'Failed to create ICO blob' });
              return;
            }
            pngBlob.arrayBuffer().then((buffer) => {
              const pngBytes = new Uint8Array(buffer);
              const icoHeader = new Uint8Array(22);
              const view = new DataView(icoHeader.buffer);

              // ICONDIR
              view.setUint16(0, 0, true); // reserved
              view.setUint16(2, 1, true); // 1 = ICO
              view.setUint16(4, 1, true); // 1 image

              // ICONDIRENTRY
              view.setUint8(6, targetW >= 256 ? 0 : targetW);
              view.setUint8(7, targetH >= 256 ? 0 : targetH);
              view.setUint8(8, 0); // color palette
              view.setUint8(9, 0); // reserved
              view.setUint16(10, 1, true); // color planes
              view.setUint16(12, 32, true); // bpp
              view.setUint32(14, pngBytes.length, true); // size of image data
              view.setUint32(18, 22, true); // offset of image data

              const icoBlob = new Blob([icoHeader, pngBytes], { type: 'image/x-icon' });
              const url = URL.createObjectURL(icoBlob);

              resolve({
                status: 'done',
                format: fmt,
                convertedBlob: icoBlob,
                convertedUrl: url,
                convertedSize: icoBlob.size,
                convertedWidth: targetW,
                convertedHeight: targetH,
              });
            });
          }, 'image/png');
          return;
        }

        // Standard mime types: webp, png, jpeg, avif
        const mimeMap: Record<string, string> = {
          webp: 'image/webp',
          png: 'image/png',
          jpeg: 'image/jpeg',
          avif: 'image/avif',
          bmp: 'image/bmp',
        };

        const targetMime = mimeMap[fmt] || 'image/webp';
        const qFactor = fmt === 'png' ? 1.0 : q / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ status: 'error', errorMessage: 'Blob generation failed' });
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve({
              status: 'done',
              format: fmt,
              convertedBlob: blob,
              convertedUrl: url,
              convertedSize: blob.size,
              convertedWidth: targetW,
              convertedHeight: targetH,
            });
          },
          targetMime,
          qFactor
        );
      };

      img.onerror = () => {
        resolve({ status: 'error', errorMessage: 'Failed to decode image' });
      };

      img.src = fileItem.originalPreviewUrl;
    });
  };

  // ── Handle incoming files ──────────────────────────────────────────────────
  const handleFilesAdded = (rawFiles: FileList | File[]) => {
    const newItems: ConvertedFile[] = [];

    Array.from(rawFiles).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setFiles((prev) =>
          prev.map((item) =>
            item.originalPreviewUrl === previewUrl
              ? { ...item, originalWidth: img.width, originalHeight: img.height }
              : item
          )
        );
      };
      img.src = previewUrl;

      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        originalName: file.name,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalType: file.type,
        originalPreviewUrl: previewUrl,
        format: targetFormat,
        status: 'pending',
      });
    });

    if (newItems.length > 0) {
      setFiles((prev) => [...prev, ...newItems]);
    }
  };

  // ── Convert all pending files ──────────────────────────────────────────────
  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setIsConvertingAll(true);

    const updated = await Promise.all(
      files.map(async (item) => {
        const result = await processImage(
          item,
          targetFormat,
          quality,
          resizeMode,
          maxWidth,
          maxHeight,
          squareSize
        );
        return { ...item, ...result };
      })
    );

    setFiles(updated);
    setIsConvertingAll(false);
  };

  // Auto-convert on format change if files already exist
  useEffect(() => {
    if (files.length > 0 && files.some((f) => f.status === 'done')) {
      handleConvertAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFormat, quality, resizeMode, maxWidth, maxHeight, squareSize]);

  // ── Single file download ───────────────────────────────────────────────────
  const downloadFile = (item: ConvertedFile) => {
    if (!item.convertedUrl && !item.base64String) return;

    if (item.format === 'base64' && item.base64String) {
      navigator.clipboard.writeText(item.base64String);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
      return;
    }

    const fmtConfig = FORMATS.find((f) => f.id === item.format) || FORMATS[0];
    const baseName = item.originalName.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.${fmtConfig.ext}`;

    const a = document.createElement('a');
    a.href = item.convertedUrl!;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Batch ZIP download ─────────────────────────────────────────────────────
  const downloadAllAsZip = async () => {
    const doneItems = files.filter((f) => f.status === 'done' && f.convertedBlob);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    const fmtConfig = FORMATS.find((f) => f.id === targetFormat) || FORMATS[0];

    doneItems.forEach((item, index) => {
      const baseName = item.originalName.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_converted_${index + 1}.${fmtConfig.ext}`;
      zip.file(filename, item.convertedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dkode_converted_images_${fmtConfig.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Remove single item ─────────────────────────────────────────────────────
  const removeItem = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // ── Clear all ──────────────────────────────────────────────────────────────
  const clearAll = () => {
    files.forEach((f) => {
      if (f.originalPreviewUrl) URL.revokeObjectURL(f.originalPreviewUrl);
      if (f.convertedUrl && !f.convertedUrl.startsWith('data:')) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
  };

  // ── Overall Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const done = files.filter((f) => f.status === 'done');
    const totalOriginal = done.reduce((acc, cur) => acc + cur.originalSize, 0);
    const totalConverted = done.reduce((acc, cur) => acc + (cur.convertedSize || 0), 0);
    const savedBytes = Math.max(0, totalOriginal - totalConverted);
    const savedPercent = totalOriginal > 0 ? Math.round((savedBytes / totalOriginal) * 100) : 0;

    return { doneCount: done.length, totalOriginal, totalConverted, savedBytes, savedPercent };
  }, [files]);

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(168,85,247,0.12), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(0,212,255,0.1), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 40px',
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
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: tk.purple,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                🖼️ Free Developer & Creator Suite · Client-Side Processing
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
                Universal Image{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.purple}, ${tk.cyan})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Format Converter
                </span>
              </h1>

              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.7, maxWidth: 620, margin: 0 }}>
                Convert single or batch images to WebP, PNG, JPEG, AVIF, BMP, ICO Favicon, or Base64 data URIs. 100% private in-browser conversion with instant zero-server processing.
              </p>
            </div>

            {/* Privacy Guarantee Card */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>🛡️</span>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.green, fontWeight: 700, textTransform: 'uppercase' }}>
                  100% Private & Secure
                </span>
              </div>
              <p style={{ fontSize: 12, color: tk.textDim, margin: 0, lineHeight: 1.6 }}>
                Images are transformed locally on your device via HTML5 Canvas. Your files are never uploaded or stored on any server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Interactive Section ─────────────────────────────────────── */}
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Format Selector Bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Choose Target Output Format:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {FORMATS.map((fmt) => {
              const isActive = targetFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setTargetFormat(fmt.id)}
                  style={{
                    background: isActive ? 'rgba(168,85,247,0.14)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? tk.purple : tk.border}`,
                    borderRadius: 14,
                    padding: '14px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: isActive ? tk.purple : tk.text }}>
                      {fmt.label}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: tk.fontMono,
                        color: isActive ? tk.cyan : tk.textDim,
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 6px',
                        borderRadius: 6,
                      }}
                    >
                      .{fmt.ext}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: tk.textDim, lineHeight: 1.4 }}>
                    {fmt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Advanced Controls Bar ────────────────────────────────────────── */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
            border: `1px solid ${tk.border}`,
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            alignItems: 'center',
          }}
        >
          {/* Quality Control */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontFamily: tk.fontMono }}>
              <span style={{ color: tk.textDim }}>Compression Quality:</span>
              <span style={{ color: tk.cyan, fontWeight: 700 }}>{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={!FORMATS.find((f) => f.id === targetFormat)?.supportsQuality}
              style={{ width: '100%', accentColor: tk.cyan, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: tk.textDim, marginTop: 4 }}>
              <span>Smaller Size</span>
              <span>Balanced (85%)</span>
              <span>Max Quality</span>
            </div>
          </div>

          {/* Resize Mode */}
          <div>
            <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 8 }}>
              Resolution / Rescaling:
            </div>
            <select
              value={resizeMode}
              onChange={(e) => setResizeMode(e.target.value as any)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${tk.border}`,
                borderRadius: 10,
                padding: '10px 14px',
                color: tk.text,
                fontSize: 14,
                fontFamily: tk.fontMono,
              }}
            >
              <option value="original" style={{ background: '#080d1a' }}>Original Dimensions (No Resize)</option>
              <option value="fit" style={{ background: '#080d1a' }}>Fit Within Max Box ({maxWidth} × {maxHeight})</option>
              <option value="square" style={{ background: '#080d1a' }}>Square Avatar / Favicon ({squareSize} × {squareSize})</option>
            </select>
          </div>

          {/* Dimension presets */}
          {resizeMode === 'fit' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Max W (px):</span>
                <input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '8px 10px', color: tk.text, fontFamily: tk.fontMono }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Max H (px):</span>
                <input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '8px 10px', color: tk.text, fontFamily: tk.fontMono }}
                />
              </div>
            </div>
          )}

          {resizeMode === 'square' && (
            <div>
              <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Square Side (px):</span>
              <select
                value={squareSize}
                onChange={(e) => setSquareSize(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '8px 10px', color: tk.text, fontFamily: tk.fontMono }}
              >
                <option value="32" style={{ background: '#080d1a' }}>32 × 32 (Standard Favicon)</option>
                <option value="64" style={{ background: '#080d1a' }}>64 × 64 (Hi-DPI Favicon)</option>
                <option value="128" style={{ background: '#080d1a' }}>128 × 128 (App Icon)</option>
                <option value="256" style={{ background: '#080d1a' }}>256 × 256 (Windows Tile)</option>
                <option value="512" style={{ background: '#080d1a' }}>512 × 512 (PWA / Avatar)</option>
                <option value="1024" style={{ background: '#080d1a' }}>1024 × 1024 (HD Square)</option>
              </select>
            </div>
          )}
        </div>

        {/* ── Drag & Drop Upload Zone ─────────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? tk.cyan : 'rgba(168,85,247,0.3)'}`,
            background: isDragOver ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.015)',
            borderRadius: 20,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            marginBottom: 32,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleFilesAdded(e.target.files);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              borderRadius: 16,
              background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            📂
          </div>

          <h3 style={{ fontSize: 18, fontFamily: tk.fontDisplay, fontWeight: 700, margin: '0 0 8px' }}>
            Drop Images Here, or <span style={{ color: tk.cyan }}>Browse Files</span>
          </h3>
          <p style={{ fontSize: 13, color: tk.textDim, margin: 0 }}>
            Supports JPG, PNG, WEBP, GIF, SVG, BMP, AVIF, TIFF, HEIC, and ICO files. Batch convert multiple images in seconds.
          </p>
        </div>

        {/* ── Action Toolbar (When files exist) ────────────────────────────── */}
        {files.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.3)',
              padding: '16px 20px',
              borderRadius: 14,
              border: `1px solid ${tk.border}`,
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                {files.length} {files.length === 1 ? 'Image' : 'Images'} Uploaded
              </span>
              {stats.doneCount > 0 && stats.savedBytes > 0 && (
                <span
                  style={{
                    background: 'rgba(0,229,160,0.1)',
                    border: '1px solid rgba(0,229,160,0.3)',
                    color: tk.green,
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                  }}
                >
                  Saved {stats.savedPercent}% ({formatBytes(stats.savedBytes)}) 📉
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handleConvertAll}
                disabled={isConvertingAll}
                style={{
                  background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                  color: '#050810',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: tk.fontMono,
                  cursor: 'pointer',
                  opacity: isConvertingAll ? 0.6 : 1,
                }}
              >
                {isConvertingAll ? '🔄 Converting...' : `⚡ Convert All to ${targetFormat.toUpperCase()}`}
              </button>

              {files.some((f) => f.status === 'done' && f.convertedBlob) && targetFormat !== 'base64' && (
                <button
                  onClick={downloadAllAsZip}
                  style={{
                    background: 'rgba(0,229,160,0.12)',
                    border: '1px solid rgba(0,229,160,0.35)',
                    color: tk.green,
                    padding: '9px 18px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                  }}
                >
                  📦 Download All as ZIP
                </button>
              )}

              <button
                onClick={clearAll}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tk.border}`,
                  color: tk.textDim,
                  padding: '9px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: tk.fontMono,
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* ── Files List Grid ─────────────────────────────────────────────── */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {files.map((file) => {
              const fmtConfig = FORMATS.find((f) => f.id === (file.format || targetFormat)) || FORMATS[0];
              const isDone = file.status === 'done';
              const isError = file.status === 'error';
              const savedBytes = isDone && file.convertedSize ? file.originalSize - file.convertedSize : 0;
              const savedPercent = isDone && file.convertedSize ? Math.round((savedBytes / file.originalSize) * 100) : 0;

              return (
                <div
                  key={file.id}
                  style={{
                    background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                    border: `1px solid ${isDone ? 'rgba(0,229,160,0.25)' : tk.border}`,
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  {/* Thumbnail & File Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260, flex: 1 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#000',
                        border: `1px solid ${tk.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.convertedUrl || file.originalPreviewUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: tk.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 320,
                        }}
                      >
                        {file.originalName}
                      </div>
                      <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4 }}>
                        {formatBytes(file.originalSize)}
                        {file.originalWidth > 0 && ` · ${file.originalWidth} × ${file.originalHeight}px`}
                      </div>
                    </div>
                  </div>

                  {/* Output Status & Metrics */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {isDone && (
                      <div style={{ textAlign: 'right', fontFamily: tk.fontMono }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: tk.green }}>
                          ➔ {fmtConfig.label.toUpperCase()} · {formatBytes(file.convertedSize || 0)}
                        </div>
                        {savedPercent > 0 && (
                          <div style={{ fontSize: 11, color: tk.cyan, marginTop: 2 }}>
                            Saved {savedPercent}% file size
                          </div>
                        )}
                        {file.convertedWidth && file.convertedHeight && (
                          <div style={{ fontSize: 10, color: tk.textDim, marginTop: 1 }}>
                            {file.convertedWidth} × {file.convertedHeight}px
                          </div>
                        )}
                      </div>
                    )}

                    {isError && (
                      <span style={{ color: tk.red, fontSize: 12, fontFamily: tk.fontMono }}>
                        ⚠️ {file.errorMessage || 'Failed'}
                      </span>
                    )}

                    {file.status === 'pending' && (
                      <span style={{ color: tk.textDim, fontSize: 12, fontFamily: tk.fontMono }}>
                        ⏳ Ready to convert
                      </span>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isDone ? (
                        <button
                          onClick={() => downloadFile(file)}
                          style={{
                            background: file.format === 'base64' ? 'rgba(0,212,255,0.12)' : 'rgba(0,229,160,0.14)',
                            border: `1px solid ${file.format === 'base64' ? tk.cyan : tk.green}`,
                            color: file.format === 'base64' ? tk.cyan : tk.green,
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: tk.fontMono,
                            cursor: 'pointer',
                          }}
                        >
                          {file.format === 'base64'
                            ? copiedId === file.id
                              ? '✓ Copied URI'
                              : '📋 Copy URI'
                            : `⬇️ Download .${fmtConfig.ext}`}
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await processImage(
                              file,
                              targetFormat,
                              quality,
                              resizeMode,
                              maxWidth,
                              maxHeight,
                              squareSize
                            );
                            setFiles((prev) =>
                              prev.map((item) => (item.id === file.id ? { ...item, ...res } : item))
                            );
                          }}
                          style={{
                            background: 'rgba(168,85,247,0.14)',
                            border: `1px solid ${tk.purple}`,
                            color: tk.purple,
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: tk.fontMono,
                            cursor: 'pointer',
                          }}
                        >
                          Convert
                        </button>
                      )}

                      <button
                        onClick={() => removeItem(file.id)}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${tk.border}`,
                          color: tk.textDim,
                          padding: '8px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
