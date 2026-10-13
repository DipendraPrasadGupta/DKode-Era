'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import JSZip from 'jszip';
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  FileDown,
  Download,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Plus,
  Trash2,
  FileUp,
  Files,
  Cpu,
} from 'lucide-react';
import {
  convertDocxToPdf,
  convertPdfToDocx,
  convertImagesToPdf,
  convertTextToDocx,
} from '@/lib/documentConverter';

// ─── Supported Image Formats ─────────────────────────────────────────────────

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

const IMAGE_FORMATS: FormatConfig[] = [
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

// ─── Document Converter Operations ───────────────────────────────────────────

type DocConversionMode = 'word-to-pdf' | 'pdf-to-word' | 'images-to-pdf' | 'text-to-word';

interface ConvertedDocItem {
  id: string;
  name: string;
  size: number;
  targetExt: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputFilename?: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  errorMessage?: string;
}

export default function UniversalFileConverterPage() {
  const [suiteCategory, setSuiteCategory] = useState<'documents' | 'images'>('documents');

  // ── Document State ─────────────────────────────────────────────────────────
  const [docMode, setDocMode] = useState<DocConversionMode>('pdf-to-word');
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [convertedDocs, setConvertedDocs] = useState<ConvertedDocItem[]>([]);
  const [isConvertingDocs, setIsConvertingDocs] = useState<boolean>(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // ── Image State ────────────────────────────────────────────────────────────
  const [targetFormat, setTargetFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState<number>(85);
  const [resizeMode, setResizeMode] = useState<'original' | 'fit' | 'square'>('original');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [squareSize, setSquareSize] = useState<number>(512);

  const [imageFiles, setImageFiles] = useState<ConvertedFile[]>([]);
  const [isConvertingImages, setIsConvertingImages] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Format Helper ──────────────────────────────────────────────────────────
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // ── Document Conversion Process ────────────────────────────────────────────
  const handleDocConversion = async () => {
    if (docFiles.length === 0) return;
    setIsConvertingDocs(true);

    const results: ConvertedDocItem[] = [];

    try {
      if (docMode === 'word-to-pdf') {
        for (const f of docFiles) {
          try {
            const { blob, filename } = await convertDocxToPdf(f);
            const url = URL.createObjectURL(blob);
            results.push({
              id: `${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              targetExt: 'pdf',
              outputBlob: blob,
              outputUrl: url,
              outputFilename: filename,
              status: 'done',
            });
          } catch (err: any) {
            results.push({
              id: `${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              targetExt: 'pdf',
              status: 'error',
              errorMessage: err.message || 'Failed to convert DOCX to PDF',
            });
          }
        }
      } else if (docMode === 'pdf-to-word') {
        for (const f of docFiles) {
          try {
            const { blob, filename } = await convertPdfToDocx(f);
            const url = URL.createObjectURL(blob);
            results.push({
              id: `${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              targetExt: 'docx',
              outputBlob: blob,
              outputUrl: url,
              outputFilename: filename,
              status: 'done',
            });
          } catch (err: any) {
            results.push({
              id: `${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              targetExt: 'docx',
              status: 'error',
              errorMessage: err.message || 'Failed to convert PDF to DOCX',
            });
          }
        }
      } else if (docMode === 'images-to-pdf') {
        try {
          const { blob, filename } = await convertImagesToPdf(docFiles);
          const url = URL.createObjectURL(blob);
          results.push({
            id: `${Date.now()}-${Math.random()}`,
            name: `${docFiles.length} Images Combined`,
            size: docFiles.reduce((acc, c) => acc + c.size, 0),
            targetExt: 'pdf',
            outputBlob: blob,
            outputUrl: url,
            outputFilename: filename,
            status: 'done',
          });
        } catch (err: any) {
          results.push({
            id: `${Date.now()}-${Math.random()}`,
            name: 'Images to PDF',
            size: 0,
            targetExt: 'pdf',
            status: 'error',
            errorMessage: err.message || 'Failed to compile images to PDF',
          });
        }
      } else if (docMode === 'text-to-word') {
        for (const f of docFiles) {
          try {
            const { blob, filename } = await convertTextToDocx(f);
            const url = URL.createObjectURL(blob);
            results.push({
              id: `${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              targetExt: 'docx',
              outputBlob: blob,
              outputUrl: url,
              outputFilename: filename,
              status: 'done',
            });
          } catch (err: any) {
            results.push({
              id: `${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              targetExt: 'docx',
              status: 'error',
              errorMessage: err.message || 'Failed to convert Text to Word',
            });
          }
        }
      }

      setConvertedDocs(results);
    } finally {
      setIsConvertingDocs(false);
    }
  };

  // ── Process Single Image in Canvas ─────────────────────────────────────────
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

        if (fmt === 'jpeg' || fmt === 'bmp') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        if (rMode === 'square' && img.width !== img.height) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetW, targetH);
        } else {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        }

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

        if (fmt === 'ico') {
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              resolve({ status: 'error', errorMessage: 'Failed to create ICO blob' });
              return;
            }
            pngBlob.arrayBuffer().then((buffer) => {
              const pngBytes = new Uint8Array(buffer);
              const icoHeader = new Uint8Array(22);
              const view = new DataView(icoHeader.buffer);

              view.setUint16(0, 0, true);
              view.setUint16(2, 1, true);
              view.setUint16(4, 1, true);

              view.setUint8(6, targetW >= 256 ? 0 : targetW);
              view.setUint8(7, targetH >= 256 ? 0 : targetH);
              view.setUint8(8, 0);
              view.setUint8(9, 0);
              view.setUint16(10, 1, true);
              view.setUint16(12, 32, true);
              view.setUint32(14, pngBytes.length, true);
              view.setUint32(18, 22, true);

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

  // ── Image Files Handlers ───────────────────────────────────────────────────
  const handleImagesAdded = (rawFiles: FileList | File[]) => {
    const newItems: ConvertedFile[] = [];

    Array.from(rawFiles).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImageFiles((prev) =>
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
      setImageFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleConvertAllImages = async () => {
    if (imageFiles.length === 0) return;
    setIsConvertingImages(true);

    const updated = await Promise.all(
      imageFiles.map(async (item) => {
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

    setImageFiles(updated);
    setIsConvertingImages(false);
  };

  // ── Downloads ──────────────────────────────────────────────────────────────
  const downloadSingleImage = (item: ConvertedFile) => {
    if (!item.convertedUrl && !item.base64String) return;

    if (item.format === 'base64' && item.base64String) {
      navigator.clipboard.writeText(item.base64String);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
      return;
    }

    const fmtConfig = IMAGE_FORMATS.find((f) => f.id === item.format) || IMAGE_FORMATS[0];
    const baseName = item.originalName.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.${fmtConfig.ext}`;

    const a = document.createElement('a');
    a.href = item.convertedUrl!;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllImagesAsZip = async () => {
    const doneItems = imageFiles.filter((f) => f.status === 'done' && f.convertedBlob);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    const fmtConfig = IMAGE_FORMATS.find((f) => f.id === targetFormat) || IMAGE_FORMATS[0];

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

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* ── Top Hero Banner ──────────────────────────────────────────────── */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(168,85,247,0.14), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(0,212,255,0.12), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 36px',
          borderBottom: `1px solid ${tk.border}`,
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
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
            <div style={{ maxWidth: 720 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.3)',
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
                <Sparkles size={14} />
                <span>All-in-One Universal Converter Suite</span>
              </div>

              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 56px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                Universal File &{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.purple}, ${tk.cyan})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Document Converter
                </span>
              </h1>

              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
                Convert PDF to Word, Word to PDF, Images to PDF, WebP, PNG, JPG, AVIF, BMP, and Favicon. 100% private, client-side processing — your files never leave your computer.
              </p>
            </div>

            {/* Privacy Guarantee Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 18,
                padding: '18px 22px',
                minWidth: 280,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={18} color={tk.green} />
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.green, fontWeight: 700, textTransform: 'uppercase' }}>
                  100% In-Browser Privacy
                </span>
              </div>
              <p style={{ fontSize: 12, color: tk.textDim, margin: 0, lineHeight: 1.6 }}>
                All document parsing and image conversions execute locally via WebAssembly and Canvas. Zero server uploads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Workspace ───────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Top-Level Mode Selector: Documents vs Images */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
          <button
            onClick={() => setSuiteCategory('documents')}
            style={{
              background: suiteCategory === 'documents' ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${suiteCategory === 'documents' ? tk.cyan : tk.border}`,
              borderRadius: 16,
              padding: '18px 22px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              transition: 'all 0.25s ease',
              boxShadow: suiteCategory === 'documents' ? '0 4px 24px rgba(0,212,255,0.15)' : 'none',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: suiteCategory === 'documents' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: suiteCategory === 'documents' ? tk.cyan : tk.textDim,
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: suiteCategory === 'documents' ? tk.cyan : tk.text }}>
                📄 PDF & Office Documents
              </div>
              <div style={{ fontSize: 12, color: tk.textDim, marginTop: 2, fontFamily: tk.fontMono }}>
                PDF ⇄ Word (DOCX), Images ➔ PDF, Text ➔ Word
              </div>
            </div>
          </button>

          <button
            onClick={() => setSuiteCategory('images')}
            style={{
              background: suiteCategory === 'images' ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${suiteCategory === 'images' ? tk.purple : tk.border}`,
              borderRadius: 16,
              padding: '18px 22px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              transition: 'all 0.25s ease',
              boxShadow: suiteCategory === 'images' ? '0 4px 24px rgba(168,85,247,0.15)' : 'none',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: suiteCategory === 'images' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: suiteCategory === 'images' ? tk.purple : tk.textDim,
              }}
            >
              <ImageIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: suiteCategory === 'images' ? tk.purple : tk.text }}>
                🖼️ Image & Media Formats
              </div>
              <div style={{ fontSize: 12, color: tk.textDim, marginTop: 2, fontFamily: tk.fontMono }}>
                WebP, PNG, JPG, AVIF, BMP, Favicon, Base64
              </div>
            </div>
          </button>
        </div>

        {/* ── SUITE 1: DOCUMENT CONVERTER ─────────────────────────────────── */}
        {suiteCategory === 'documents' && (
          <div>
            {/* Conversion Mode Pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { id: 'pdf-to-word', label: '📕 PDF ➔ Word (.docx)', desc: 'Extract & format into editable Word doc' },
                { id: 'word-to-pdf', label: '📘 Word (.docx) ➔ PDF', desc: 'Compile DOCX into clean PDF' },
                { id: 'images-to-pdf', label: '🖼️ Images ➔ PDF', desc: 'Combine JPG/PNG photos into A4 PDF' },
                { id: 'text-to-word', label: '📝 Text / Notes ➔ Word', desc: 'Format plain text notes into DOCX' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setDocMode(m.id as DocConversionMode);
                    setDocFiles([]);
                    setConvertedDocs([]);
                  }}
                  style={{
                    background: docMode === m.id ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${docMode === m.id ? tk.cyan : tk.border}`,
                    color: docMode === m.id ? tk.cyan : tk.textDim,
                    borderRadius: 12,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontFamily: tk.fontMono,
                    fontWeight: docMode === m.id ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{m.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Document Drag & Drop Box */}
            <div
              onClick={() => docInputRef.current?.click()}
              style={{
                border: `2px dashed rgba(0,212,255,0.35)`,
                background: 'rgba(0,212,255,0.02)',
                borderRadius: 20,
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                marginBottom: 28,
              }}
            >
              <input
                ref={docInputRef}
                type="file"
                multiple={docMode === 'images-to-pdf'}
                accept={
                  docMode === 'pdf-to-word'
                    ? '.pdf'
                    : docMode === 'word-to-pdf'
                    ? '.docx'
                    : docMode === 'images-to-pdf'
                    ? 'image/*'
                    : '.txt,.md'
                }
                onChange={(e) => {
                  if (e.target.files) {
                    setDocFiles(Array.from(e.target.files));
                    setConvertedDocs([]);
                  }
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
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tk.cyan,
                }}
              >
                <FileUp size={30} />
              </div>

              <h3 style={{ fontSize: 18, fontFamily: tk.fontDisplay, fontWeight: 700, margin: '0 0 8px' }}>
                {docFiles.length === 0 ? (
                  <>
                    Drop your {docMode === 'pdf-to-word' ? 'PDF' : docMode === 'word-to-pdf' ? 'Word (.docx)' : docMode === 'images-to-pdf' ? 'Images' : 'Text'} file here, or{' '}
                    <span style={{ color: tk.cyan }}>Browse Computer</span>
                  </>
                ) : (
                  <>
                    Selected {docFiles.length} file{docFiles.length === 1 ? '' : 's'}:{' '}
                    <span style={{ color: tk.cyan }}>{docFiles.map((f) => f.name).join(', ')}</span>
                  </>
                )}
              </h3>
              <p style={{ fontSize: 13, color: tk.textDim, margin: 0 }}>
                Fast local processing with high fidelity extraction.
              </p>
            </div>

            {/* Document Action Button */}
            {docFiles.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <button
                  onClick={handleDocConversion}
                  disabled={isConvertingDocs}
                  style={{
                    background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                    color: '#050810',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 4px 20px rgba(0,212,255,0.25)',
                  }}
                >
                  {isConvertingDocs ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Converting Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>
                        Convert Now to{' '}
                        {docMode === 'pdf-to-word' || docMode === 'text-to-word'
                          ? 'DOCX (Word)'
                          : 'PDF'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Document Results List */}
            {convertedDocs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {convertedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                      border: `1px solid ${doc.status === 'done' ? 'rgba(0,229,160,0.3)' : tk.border}`,
                      borderRadius: 16,
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: doc.status === 'done' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: doc.status === 'done' ? tk.green : tk.textDim,
                        }}
                      >
                        <FileText size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: tk.text }}>
                          {doc.outputFilename || doc.name}
                        </div>
                        <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 2 }}>
                          {doc.status === 'done' ? `Ready to download · .${doc.targetExt.toUpperCase()}` : doc.errorMessage || 'Processing'}
                        </div>
                      </div>
                    </div>

                    {doc.status === 'done' && doc.outputUrl && (
                      <a
                        href={doc.outputUrl}
                        download={doc.outputFilename}
                        style={{
                          background: 'rgba(0,229,160,0.14)',
                          border: `1px solid ${tk.green}`,
                          color: tk.green,
                          padding: '10px 20px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: tk.fontMono,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Download size={16} />
                        <span>Download .{doc.targetExt.toUpperCase()}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUITE 2: IMAGE CONVERTER ────────────────────────────────────── */}
        {suiteCategory === 'images' && (
          <div>
            {/* Format Selector Bar */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Choose Target Image Output Format:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {IMAGE_FORMATS.map((fmt) => {
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

            {/* Image Advanced Settings */}
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
              {/* Quality */}
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
                  disabled={!IMAGE_FORMATS.find((f) => f.id === targetFormat)?.supportsQuality}
                  style={{ width: '100%', accentColor: tk.cyan, cursor: 'pointer' }}
                />
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

              {/* Fit dimensions */}
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

              {/* Square size */}
              {resizeMode === 'square' && (
                <div>
                  <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Square Side (px):</span>
                  <select
                    value={squareSize}
                    onChange={(e) => setSquareSize(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '8px 10px', color: tk.text, fontFamily: tk.fontMono }}
                  >
                    <option value="32" style={{ background: '#080d1a' }}>32 × 32 (Favicon)</option>
                    <option value="64" style={{ background: '#080d1a' }}>64 × 64 (Hi-DPI Favicon)</option>
                    <option value="128" style={{ background: '#080d1a' }}>128 × 128 (App Icon)</option>
                    <option value="512" style={{ background: '#080d1a' }}>512 × 512 (PWA / Avatar)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Images Drag & Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) handleImagesAdded(e.dataTransfer.files);
              }}
              onClick={() => imageInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragOver ? tk.cyan : 'rgba(168,85,247,0.35)'}`,
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
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleImagesAdded(e.target.files);
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
                  color: tk.purple,
                }}
              >
                <ImageIcon size={30} />
              </div>

              <h3 style={{ fontSize: 18, fontFamily: tk.fontDisplay, fontWeight: 700, margin: '0 0 8px' }}>
                Drop Images Here, or <span style={{ color: tk.cyan }}>Browse Files</span>
              </h3>
              <p style={{ fontSize: 13, color: tk.textDim, margin: 0 }}>
                Supports JPG, PNG, WEBP, GIF, SVG, BMP, AVIF, TIFF, and ICO. Batch convert in parallel.
              </p>
            </div>

            {/* Image Actions Toolbar */}
            {imageFiles.length > 0 && (
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
                    {imageFiles.length} {imageFiles.length === 1 ? 'Image' : 'Images'} Uploaded
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleConvertAllImages}
                    disabled={isConvertingImages}
                    style={{
                      background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
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
                      gap: 8,
                    }}
                  >
                    {isConvertingImages ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{isConvertingImages ? 'Converting...' : `Convert All to ${targetFormat.toUpperCase()}`}</span>
                  </button>

                  {imageFiles.some((f) => f.status === 'done' && f.convertedBlob) && targetFormat !== 'base64' && (
                    <button
                      onClick={downloadAllImagesAsZip}
                      style={{
                        background: 'rgba(0,229,160,0.14)',
                        border: `1px solid ${tk.green}`,
                        color: tk.green,
                        padding: '10px 18px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: tk.fontMono,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Download size={15} />
                      <span>Download All as ZIP</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Images List */}
            {imageFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {imageFiles.map((file) => {
                  const fmtConfig = IMAGE_FORMATS.find((f) => f.id === (file.format || targetFormat)) || IMAGE_FORMATS[0];
                  const isDone = file.status === 'done';

                  return (
                    <div
                      key={file.id}
                      style={{
                        background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                        border: `1px solid ${isDone ? 'rgba(0,229,160,0.3)' : tk.border}`,
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

                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: tk.text }}>
                            {file.originalName}
                          </div>
                          <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4 }}>
                            {formatBytes(file.originalSize)}
                            {file.originalWidth > 0 && ` · ${file.originalWidth} × ${file.originalHeight}px`}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {isDone && (
                          <div style={{ textAlign: 'right', fontFamily: tk.fontMono }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: tk.green }}>
                              ➔ {fmtConfig.label.toUpperCase()} · {formatBytes(file.convertedSize || 0)}
                            </div>
                          </div>
                        )}

                        {isDone ? (
                          <button
                            onClick={() => downloadSingleImage(file)}
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
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Download size={14} />
                            <span>Download .{fmtConfig.ext}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono }}>
                            Ready to convert
                          </span>
                        )}

                        <button
                          onClick={() => setImageFiles((prev) => prev.filter((i) => i.id !== file.id))}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: tk.textDim,
                            cursor: 'pointer',
                            padding: 4,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
