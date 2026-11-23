'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import Tesseract from 'tesseract.js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import {
  ScanText,
  Upload,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Download,
  RotateCw,
  RotateCcw,
  Sliders,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Languages,
  Maximize2,
  FileDown,
  Eye,
  Search,
  Replace,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Zap,
} from 'lucide-react';

// ─── Supported OCR Languages ────────────────────────────────────────────────

export type OcrLanguage = 'eng' | 'nep' | 'eng+nep';

interface LanguageOption {
  code: OcrLanguage;
  name: string;
  nativeName: string;
  flag: string;
  badge: string;
  desc: string;
}

const languageOptions: LanguageOption[] = [
  {
    code: 'nep',
    name: 'Nepali',
    nativeName: 'नेपाली (देवनागरी)',
    flag: '🇳🇵',
    badge: 'Devanagari',
    desc: 'Extract text from Nepali documents, notices, citizenship cards & books.',
  },
  {
    code: 'eng',
    name: 'English',
    nativeName: 'English (Latin)',
    flag: '🇬🇧',
    badge: 'Universal',
    desc: 'Extract text from English screenshots, scanned PDFs, receipts & papers.',
  },
  {
    code: 'eng+nep',
    name: 'Bilingual (Eng + Nep)',
    nativeName: 'English + नेपाली',
    flag: '🌐',
    badge: 'Auto Dual',
    desc: 'Best for mixed bilingual forms, bills, university transcripts & invoices.',
  },
];

// ─── Image Filter Pre-Processing ────────────────────────────────────────────

type FilterMode = 'normal' | 'grayscale' | 'contrast' | 'binarize' | 'invert';

interface FilterOption {
  id: FilterMode;
  label: string;
  desc: string;
}

const filterOptions: FilterOption[] = [
  { id: 'normal', label: 'Original', desc: 'No enhancement' },
  { id: 'grayscale', label: 'Grayscale', desc: 'Removes color noise' },
  { id: 'contrast', label: 'High Contrast', desc: 'Sharpen faded text' },
  { id: 'binarize', label: 'B & W Scan', desc: 'Thresholding for docs' },
  { id: 'invert', label: 'Invert', desc: 'For dark-mode screenshots' },
];

// ─── Glassmorphic Card Wrapper ──────────────────────────────────────────────

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

// ─── Generate Built-in Sample Image Canvases ────────────────────────────────

function generateSampleDataUrl(type: 'nepali' | 'english' | 'bilingual'): string {
  if (typeof window === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 750;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border & header line
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  ctx.fillStyle = '#0f172a';

  if (type === 'nepali') {
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('नेपाल सरकार - सूचना प्रविधि विभाग', 50, 75);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 95);
    ctx.lineTo(700, 95);
    ctx.stroke();

    ctx.font = '19px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('विषय: डिजिटल नेपाल तथा सफ्टवेयर प्रविधि सम्बन्धी जानकारी।', 50, 140);
    ctx.fillText('१. सूचना प्रविधिले मानव जीवनलाई निकै सहज र सरल बनाएको छ।', 50, 185);
    ctx.fillText('२. कम्प्युटर र इन्टरनेटको माध्यमबाट दैनिक कामहरु द्रुत गतिमा सम्भव छन्।', 50, 230);
    ctx.fillText('३. डिजिटलाइजेसनले सरकारी तथा निजी क्षेत्रको कार्यक्षमता अभिवृद्धि गर्दछ।', 50, 275);
    ctx.fillText('४. नयाँ प्रविधिको अध्ययन, अनुसन्धान र प्रयोगमा हामी सबै अग्रसर हुनुपर्छ।', 50, 320);

    ctx.font = 'italic 16px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('मिति: २०८१/०८/०२ | काठमाडौं, नेपाल', 50, 390);
  } else if (type === 'english') {
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('D-KODE ERA INNOVATION LABS', 50, 75);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 95);
    ctx.lineTo(700, 95);
    ctx.stroke();

    ctx.font = '19px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Executive Summary: Next-Generation Optical Character Recognition', 50, 140);
    ctx.fillText('1. Automated text recognition transforms physical documents into digital assets.', 50, 185);
    ctx.fillText('2. Intelligent document analysis reduces manual entry effort by 94%.', 50, 230);
    ctx.fillText('3. High-fidelity OCR models maintain structural integrity and punctuation.', 50, 275);
    ctx.fillText('4. Client-side processing ensures 100% confidentiality and absolute privacy.', 50, 320);

    ctx.font = 'italic 16px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Document Ref: DKE-OCR-2026-ALPHA | Confidential', 50, 390);
  } else {
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('TAX INVOICE / कर बिजक', 50, 75);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 95);
    ctx.lineTo(700, 95);
    ctx.stroke();

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Company / कम्पनी नाम: D-kode Digital Pvt. Ltd.', 50, 140);
    ctx.fillText('PAN / स्थायी लेखा नं: 609823412', 50, 185);
    ctx.fillText('Item Description / विवरण: Web App Development & Cloud Hosting', 50, 230);
    ctx.fillText('Total Amount / जम्मा रकम: NRs. 75,000.00 (In Words: Seventy Five Thousand)', 50, 275);
    ctx.fillText('Payment Status / भुक्तानी स्थिति: Paid / चुक्ता भएको', 50, 320);

    ctx.font = 'italic 16px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Kathmandu, Nepal | Customer Care: +977-1-445566', 50, 390);
  }

  return canvas.toDataURL('image/png');
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SnapTextPage() {
  // State
  const [selectedLanguage, setSelectedLanguage] = useState<OcrLanguage>('nep');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [processedSrc, setProcessedSrc] = useState<string>('');
  const [filterMode, setFilterMode] = useState<FilterMode>('normal');
  const [rotation, setRotation] = useState<number>(0);

  // OCR Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [confidence, setConfidence] = useState<number | null>(null);

  // Editor Utilities
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replaceTerm, setReplaceTerm] = useState<string>('');
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'extracted' | 'preview'>('extracted');

  // Drag & Drop
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Apply Canvas Filters & Rotation ────────────────────────────────────────
  const applyImageProcessing = useCallback((rawSrc: string, mode: FilterMode, rotDeg: number) => {
    if (!rawSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isRotated90or270 = Math.abs(rotDeg % 180) === 90;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotDeg * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Apply pixel level filters
      if (mode !== 'normal') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (mode === 'grayscale') {
            d[i] = gray;
            d[i + 1] = gray;
            d[i + 2] = gray;
          } else if (mode === 'contrast') {
            // Enhanced high contrast S-curve
            const factor = 1.6;
            d[i] = Math.min(255, Math.max(0, (r - 128) * factor + 128));
            d[i + 1] = Math.min(255, Math.max(0, (g - 128) * factor + 128));
            d[i + 2] = Math.min(255, Math.max(0, (b - 128) * factor + 128));
          } else if (mode === 'binarize') {
            // Otsu-inspired thresholding
            const threshold = 135;
            const val = gray > threshold ? 255 : 0;
            d[i] = val;
            d[i + 1] = val;
            d[i + 2] = val;
          } else if (mode === 'invert') {
            d[i] = 255 - r;
            d[i + 1] = 255 - g;
            d[i + 2] = 255 - b;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      setProcessedSrc(canvas.toDataURL('image/png'));
    };
    img.src = rawSrc;
  }, []);

  // Update processed image whenever imageSrc, filterMode or rotation changes
  useEffect(() => {
    if (imageSrc) {
      applyImageProcessing(imageSrc, filterMode, rotation);
    } else {
      setProcessedSrc('');
    }
  }, [imageSrc, filterMode, rotation, applyImageProcessing]);

  // ─── File Upload Handler ──────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, AVIF, BMP).');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
      setRotation(0);
      setFilterMode('normal');
      setExtractedText('');
      setConfidence(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // ─── Global Paste (Ctrl+V) Support ────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  // ─── Load Preset Sample ───────────────────────────────────────────────────
  const loadPreset = (type: 'nepali' | 'english' | 'bilingual') => {
    const dataUrl = generateSampleDataUrl(type);
    if (!dataUrl) return;
    setImageSrc(dataUrl);
    setImageFile(null);
    setRotation(0);
    setFilterMode('normal');
    setExtractedText('');
    setConfidence(null);

    if (type === 'nepali') setSelectedLanguage('nep');
    else if (type === 'english') setSelectedLanguage('eng');
    else setSelectedLanguage('eng+nep');
  };

  // ─── Execute OCR via Tesseract.js ─────────────────────────────────────────
  const runOcr = async () => {
    const targetSource = processedSrc || imageSrc;
    if (!targetSource) return;

    setIsProcessing(true);
    setProgressStatus('Initializing OCR engine...');
    setProgressPercent(5);

    try {
      const result = await Tesseract.recognize(targetSource, selectedLanguage, {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            setProgressStatus('Loading WebAssembly core...');
            setProgressPercent(15);
          } else if (m.status === 'initializing tesseract') {
            setProgressStatus('Configuring Tesseract worker...');
            setProgressPercent(25);
          } else if (m.status === 'loading language traineddata') {
            const pct = Math.round(m.progress * 40) + 25;
            setProgressStatus(`Fetching ${selectedLanguage === 'nep' ? 'Nepali' : selectedLanguage === 'eng' ? 'English' : 'Bilingual'} model...`);
            setProgressPercent(pct);
          } else if (m.status === 'initializing api') {
            setProgressStatus('Preparing recognition matrices...');
            setProgressPercent(70);
          } else if (m.status === 'recognizing text') {
            const pct = Math.round(m.progress * 28) + 70;
            setProgressStatus(`Analyzing image glyphs & text (${Math.round(m.progress * 100)}%)...`);
            setProgressPercent(pct);
          }
        },
      });

      const text = result.data.text.trim();
      setExtractedText(text);
      setConfidence(Math.round(result.data.confidence));
      setProgressPercent(100);
      setProgressStatus('Extraction complete!');
      setActiveTab('extracted');
    } catch (err: unknown) {
      console.error('OCR Error:', err);
      alert('OCR failed. Please check your internet connection for the language model download.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Text Manipulation Helpers ────────────────────────────────────────────
  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCleanWhitespace = () => {
    if (!extractedText) return;
    const cleaned = extractedText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
    setExtractedText(cleaned);
  };

  const handleCaseChange = (type: 'upper' | 'lower' | 'title') => {
    if (!extractedText) return;
    if (type === 'upper') {
      setExtractedText(extractedText.toUpperCase());
    } else if (type === 'lower') {
      setExtractedText(extractedText.toLowerCase());
    } else if (type === 'title') {
      const titled = extractedText.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()
      );
      setExtractedText(titled);
    }
  };

  const handleFindReplace = () => {
    if (!searchTerm) return;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    setExtractedText(extractedText.replace(regex, replaceTerm));
  };

  // ─── Export Formats ───────────────────────────────────────────────────────
  const downloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snaptext-extracted-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDocx = async () => {
    if (!extractedText) return;
    const paragraphs = extractedText.split('\n').map(
      (line) =>
        new Paragraph({
          children: [new TextRun(line)],
        })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snaptext-extracted-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!extractedText) return;
    const doc = new jsPDF();
    const margin = 15;
    const maxLineWidth = 180;
    const splitText = doc.splitTextToSize(extractedText, maxLineWidth);

    doc.setFontSize(11);
    doc.text(splitText, margin, 20);
    doc.save(`snaptext-extracted-${Date.now()}.pdf`);
  };

  // ─── Text to Speech ───────────────────────────────────────────────────────
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!extractedText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(extractedText);
    utterance.lang = selectedLanguage === 'nep' ? 'ne-NP' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const chars = extractedText.length;
    const words = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
    const lines = extractedText.trim() ? extractedText.split('\n').length : 0;
    return { chars, words, lines };
  }, [extractedText]);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontFamily: tk.fontMono,
              color: tk.green,
              padding: '6px 14px',
              borderRadius: 12,
              background: 'rgba(0,229,160,0.08)',
              border: '1px solid rgba(0,229,160,0.2)',
            }}
          >
            <ShieldCheck size={14} /> 100% In-Browser Privacy
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
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
          <ScanText size={13} /> Optical Character Recognition (OCR)
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
          SnapText – Image to{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Editable Text
          </span>
        </h1>
        <p
          style={{
            fontSize: 14,
            color: tk.textDim,
            maxWidth: 620,
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          Instant OCR extraction for screenshots, scanned documents, and photographs. Supports <strong>Nepali (नेपाली)</strong> and <strong>English</strong> with zero cloud upload.
        </p>
      </section>

      {/* ─── Main Workbench ─── */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1360,
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 36px) 60px',
        }}
      >
        {/* Language Selection Bar */}
        <GlassCard style={{ padding: '16px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Languages size={18} color={tk.cyan} />
              <div>
                <div style={{ fontFamily: tk.fontDisplay, fontWeight: 700, fontSize: 14, color: tk.text }}>
                  Select Document Language
                </div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                  Chooses optimized neural character set for high precision
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: selectedLanguage === lang.code ? 700 : 500,
                    border: `1px solid ${selectedLanguage === lang.code ? tk.cyan : tk.border}`,
                    cursor: 'pointer',
                    background: selectedLanguage === lang.code ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.02)',
                    color: selectedLanguage === lang.code ? tk.cyan : tk.textDim,
                    transition: 'all 0.2s ease',
                    boxShadow: selectedLanguage === lang.code ? '0 0 16px rgba(0,212,255,0.18)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {lang.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Dual Column Layout: Left (Upload & Preview), Right (Extracted Text & Editor) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* ─── Left Column: Image Source & Processing ─── */}
          <div>
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.cyan, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <ImageIcon size={15} /> Source Document / Image
                </span>
                {imageSrc && (
                  <button
                    onClick={() => {
                      setImageSrc('');
                      setImageFile(null);
                      setProcessedSrc('');
                      setExtractedText('');
                      setConfidence(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: tk.red,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Upload Drop Zone */}
              {!imageSrc ? (
                <div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? tk.cyan : 'rgba(99,179,237,0.2)'}`,
                      borderRadius: 16,
                      padding: '48px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.015)',
                      transition: 'all 0.25s ease',
                      marginBottom: 18,
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: 'rgba(0,212,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: tk.cyan,
                      }}
                    >
                      <Upload size={26} />
                    </div>
                    <div style={{ fontFamily: tk.fontDisplay, fontWeight: 700, fontSize: 16, color: tk.text, marginBottom: 6 }}>
                      Drag & Drop or Click to Upload
                    </div>
                    <p style={{ fontSize: 12, color: tk.textDim, marginBottom: 12 }}>
                      Supports PNG, JPG, WebP, AVIF, BMP, or screenshot captures
                    </p>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 10,
                        fontFamily: tk.fontMono,
                        color: tk.purple,
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: 'rgba(168,85,247,0.1)',
                      }}
                    >
                      💡 Pro-tip: Press Ctrl + V anywhere to paste from clipboard
                    </div>
                  </div>

                  {/* Sample Document Presets */}
                  <div>
                    <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 10 }}>
                      Or test immediately with pre-loaded samples:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      <button
                        onClick={() => loadPreset('nepali')}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${tk.border}`,
                          color: tk.text,
                          fontSize: 11,
                          fontFamily: tk.fontMono,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>🇳🇵</span>
                        <span>Nepali Notice</span>
                      </button>

                      <button
                        onClick={() => loadPreset('english')}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${tk.border}`,
                          color: tk.text,
                          fontSize: 11,
                          fontFamily: tk.fontMono,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>🇬🇧</span>
                        <span>English Paper</span>
                      </button>

                      <button
                        onClick={() => loadPreset('bilingual')}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${tk.border}`,
                          color: tk.text,
                          fontSize: 11,
                          fontFamily: tk.fontMono,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>🌐</span>
                        <span>Tax Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Image Preview & Pre-processing Controls */
                <div>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tk.border}`,
                      maxHeight: 380,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={processedSrc || imageSrc}
                      alt="Source for OCR"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 380,
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Pre-processing Filters & Rotation */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Sliders size={12} /> OCR Pre-Filters (Improves Accuracy)
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setRotation((r) => (r - 90) % 360)}
                          title="Rotate Left 90°"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${tk.border}`,
                            color: tk.textDim,
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCcw size={12} />
                        </button>
                        <button
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          title="Rotate Right 90°"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${tk.border}`,
                            color: tk.textDim,
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCw size={12} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                      {filterOptions.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFilterMode(f.id)}
                          style={{
                            padding: '6px 4px',
                            borderRadius: 8,
                            fontSize: 10,
                            fontFamily: tk.fontMono,
                            fontWeight: filterMode === f.id ? 700 : 500,
                            border: `1px solid ${filterMode === f.id ? tk.cyan : tk.border}`,
                            background: filterMode === f.id ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.02)',
                            color: filterMode === f.id ? tk.cyan : tk.textDim,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Extract Trigger */}
                  <button
                    onClick={runOcr}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: 14,
                      background: isProcessing
                        ? 'rgba(0,212,255,0.2)'
                        : `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                      color: '#050810',
                      border: 'none',
                      fontFamily: tk.fontDisplay,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: isProcessing ? 'none' : '0 4px 24px rgba(0,212,255,0.25)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Extracting Text...</span>
                      </>
                    ) : (
                      <>
                        <ScanText size={18} />
                        <span>Extract Text with OCR</span>
                      </>
                    )}
                  </button>

                  {/* Progress Indicator */}
                  {isProcessing && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: tk.fontMono, marginBottom: 5 }}>
                        <span style={{ color: tk.cyan }}>{progressStatus}</span>
                        <span style={{ color: tk.textDim }}>{progressPercent}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${progressPercent}%`,
                            background: `linear-gradient(90deg, ${tk.cyan}, ${tk.purple})`,
                            transition: 'width 0.2s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </div>

          {/* ─── Right Column: Extracted Text Editor & Export ─── */}
          <div>
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <FileText size={15} /> Extracted Text Editor
                  </span>
                  {confidence !== null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: tk.fontMono,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: confidence >= 85 ? 'rgba(0,229,160,0.15)' : 'rgba(245,200,66,0.15)',
                        color: confidence >= 85 ? tk.green : tk.gold,
                        border: `1px solid ${confidence >= 85 ? 'rgba(0,229,160,0.3)' : 'rgba(245,200,66,0.3)'}`,
                        fontWeight: 600,
                      }}
                    >
                      {confidence}% Confidence
                    </span>
                  )}
                </div>

                {extractedText && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={toggleSpeech}
                      title={isSpeaking ? 'Stop speech' : 'Listen text (TTS)'}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        background: isSpeaking ? 'rgba(0,229,160,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${tk.border}`,
                        color: isSpeaking ? tk.green : tk.textDim,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>

                    <button
                      onClick={handleCopy}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        background: copied ? 'rgba(0,229,160,0.2)' : 'rgba(0,212,255,0.12)',
                        border: `1px solid ${copied ? tk.green : 'rgba(0,212,255,0.25)'}`,
                        color: copied ? tk.green : tk.cyan,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontWeight: 600,
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Utility Action Bar */}
              {extractedText && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.25)',
                    marginBottom: 12,
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={handleCleanWhitespace}
                    title="Remove blank lines and trim extra spacing"
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tk.border}`,
                      color: tk.textDim,
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                    }}
                  >
                    Clean Lines
                  </button>
                  <button
                    onClick={() => handleCaseChange('upper')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tk.border}`,
                      color: tk.textDim,
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                    }}
                  >
                    UPPER
                  </button>
                  <button
                    onClick={() => handleCaseChange('lower')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tk.border}`,
                      color: tk.textDim,
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                    }}
                  >
                    lower
                  </button>
                  <button
                    onClick={() => handleCaseChange('title')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tk.border}`,
                      color: tk.textDim,
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                    }}
                  >
                    Title Case
                  </button>
                  <button
                    onClick={() => setShowFindReplace(!showFindReplace)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: showFindReplace ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tk.border}`,
                      color: showFindReplace ? tk.cyan : tk.textDim,
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Search size={10} /> Find & Replace
                  </button>
                </div>
              )}

              {/* Find and Replace Subpanel */}
              {showFindReplace && extractedText && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 12,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'rgba(0,212,255,0.05)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Find..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${tk.border}`,
                      color: tk.text,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${tk.border}`,
                      color: tk.text,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleFindReplace}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      background: tk.cyan,
                      color: '#050810',
                      border: 'none',
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Replace All
                  </button>
                </div>
              )}

              {/* Editable Text Area */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <textarea
                  ref={outputTextareaRef}
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here ready to copy, edit, or download..."
                  rows={15}
                  style={{
                    width: '100%',
                    minHeight: 330,
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: 'rgba(8,13,26,0.5)',
                    border: `1px solid ${tk.border}`,
                    color: tk.text,
                    fontSize: selectedLanguage === 'nep' ? 15 : 14,
                    fontFamily: selectedLanguage === 'nep' ? tk.fontBody : tk.fontMono,
                    lineHeight: 1.8,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                {/* Character Statistics Counter */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    color: tk.textDim,
                  }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span>{stats.words} words</span>
                    <span>{stats.chars} characters</span>
                    <span>{stats.lines} lines</span>
                  </div>
                  {extractedText && (
                    <span style={{ color: tk.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> Editable
                    </span>
                  )}
                </div>
              </div>

              {/* Export Buttons */}
              <div>
                <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 8 }}>
                  Export Extracted Text As:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <button
                    onClick={downloadTxt}
                    disabled={!extractedText}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: extractedText ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${tk.border}`,
                      color: extractedText ? tk.text : tk.textDim,
                      cursor: extractedText ? 'pointer' : 'not-allowed',
                      fontFamily: tk.fontMono,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FileDown size={14} color={tk.cyan} />
                    <span>.TXT Document</span>
                  </button>

                  <button
                    onClick={downloadDocx}
                    disabled={!extractedText}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: extractedText ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${tk.border}`,
                      color: extractedText ? tk.text : tk.textDim,
                      cursor: extractedText ? 'pointer' : 'not-allowed',
                      fontFamily: tk.fontMono,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FileDown size={14} color={tk.purple} />
                    <span>.DOCX Word</span>
                  </button>

                  <button
                    onClick={downloadPdf}
                    disabled={!extractedText}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: extractedText ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${tk.border}`,
                      color: extractedText ? tk.text : tk.textDim,
                      cursor: extractedText ? 'pointer' : 'not-allowed',
                      fontFamily: tk.fontMono,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FileDown size={14} color={tk.gold} />
                    <span>.PDF File</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── How SnapText Works & Features ─── */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1360,
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 36px) 80px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              icon: <Languages size={20} />,
              title: 'Full Nepali & English OCR',
              desc: 'Trained on Devanagari character sets and English typography for letters, notices, IDs, and mixed bills.',
              color: tk.cyan,
            },
            {
              icon: <ShieldCheck size={20} />,
              title: '100% Client-Side Privacy',
              desc: 'All recognition happens directly in your browser with WebAssembly. No sensitive scans or images ever leave your computer.',
              color: tk.green,
            },
            {
              icon: <Sliders size={20} />,
              title: 'Smart Pre-Processing',
              desc: 'Binarize scans, invert dark-mode screenshots, and rotate orientation to achieve the highest possible OCR accuracy.',
              color: tk.purple,
            },
            {
              icon: <FileDown size={20} />,
              title: 'Multi-Format Export',
              desc: 'Instantly download your extracted text as clean Word (.docx), PDF, or raw text (.txt) files in seconds.',
              color: tk.gold,
            },
          ].map((item) => (
            <GlassCard key={item.title} style={{ padding: '22px' }}>
              <div style={{ color: item.color, marginBottom: 12 }}>{item.icon}</div>
              <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 15, fontWeight: 700, color: tk.text, marginBottom: 6 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 13, color: tk.textDim, lineHeight: 1.7 }}>{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
