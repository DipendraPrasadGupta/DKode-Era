'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import {
  transliterateRomanToNepali,
  transliterateNepaliToRoman,
  cleanNepaliUnicode,
  convertPreetiToUnicode,
  convertUnicodeToPreeti,
  NEPALI_KEYMAP_GUIDE,
} from '@/lib/nepaliTransliterator';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import {
  Keyboard,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FileDown,
  Search,
  CheckCircle2,
  HelpCircle,
  Share2,
  Sliders,
  Type,
  FileText,
  BookOpen,
  Split,
  Maximize2,
  Wand2,
  ArrowLeftRight,
} from 'lucide-react';

// ─── Preset Templates ───────────────────────────────────────────────────────

const PRESET_TEMPLATES = [
  {
    id: 'greeting',
    title: 'नमस्ते एवं अभिवादन',
    subtitle: 'Greetings & Introduction',
    roman: 'namaste sathi, mero naam dipen ho. ma nepalma baschhu. tapailai kasto chha?',
    nepali: 'नमस्ते साथी, मेरो नाम दिपेन हो। म नेपालमा बस्छु। तपाईंलाई कस्तो छ?',
    desc: 'Common introductory greeting and conversation starter.',
  },
  {
    id: 'formal',
    title: 'औपचारिक निवेदन पत्र',
    subtitle: 'Formal Letter Opening',
    roman: 'shreeman nirdeshakjyu, vishaya: aavedan sambandhama. mahodaya, maile yo aavedan patra pesh gareko chhu. kripaya mero anurodh swikar garnuhola. dhanyabad.',
    nepali: 'श्रीमान् निर्देशकज्यू, विषय: निवेदन सम्बन्धमा। महोदय, मैले यो आवेदन पत्र पेश गरेको छु। कृपया मेरो अनुरोध स्वीकार गर्नुहोला। धन्यवाद।',
    desc: 'Official office and academic application format.',
  },
  {
    id: 'anthem',
    title: 'राष्ट्रिय गानको अंश',
    subtitle: 'National Anthem Lines',
    roman: 'sayau thunga phoolka hami, eutai maala nepali. saarvabhaum bhai phailiyeka, mechi-mahakali.',
    nepali: 'सयौं थुँगा फूलका हामी, एउटै माला नेपाली। सार्वभौम भई फैलिएका, मेची-महाकाली।',
    desc: 'Official national anthem lines.',
  },
  {
    id: 'festive',
    title: 'शुभकामना सन्देश',
    subtitle: 'Festival Greeting Message',
    roman: 'bijaya dashami tatha shubha dipawaliko paawan avasarma tapai ra tapaiko parivarlai hardik mangalmaya shubhakamana byakta gardachhu.',
    nepali: 'विजया दशमी तथा शुभ दीपावलीको पावन अवसरमा तपाईं र तपाईंको परिवारलाई हार्दिक मङ्गलमय शुभकामना व्यक्त गर्दछु।',
    desc: 'Dashain and Tihar celebration greeting message.',
  },
];

// ─── Interactive Virtual Devanagari Keyboard Keys ───────────────────────────

const KEYBOARD_VOWELS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'];
const KEYBOARD_MATRAS = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ँ', 'ः', '्'];
const KEYBOARD_CONSONANTS = [
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह',
  'क्ष', 'त्र', 'ज्ञ', 'श्र'
];
const KEYBOARD_NUMBERS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const KEYBOARD_SYMBOLS = ['।', 'ॐ', 'रु', '?', ',', '!', ':', ';', '-', '(', ')'];

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
        background: 'rgba(11,18,34,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${glowColor ? glowColor : tk.border}`,
        borderRadius: 18,
        padding: noPad ? 0 : '24px',
        position: 'relative',
        boxShadow: glowColor
          ? `0 16px 40px -10px ${glowColor}25, 0 0 20px 0 ${glowColor}15`
          : '0 16px 36px -12px rgba(0,0,0,0.4)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function NepaliTypePage() {
  // Mode & Direction State
  const [viewMode, setViewMode] = useState<'split' | 'preeti'>('split');
  const [typingDirection, setTypingDirection] = useState<'en-to-ne' | 'ne-to-en'>('en-to-ne');
  const [convertNumbers, setConvertNumbers] = useState<boolean>(true);

  // Split Studio Text States
  const [sourceText, setSourceText] = useState<string>('namaste! mero naam dipen ho. tapailai kasto chha?');
  const [convertedText, setConvertedText] = useState<string>('');

  // Legacy Preeti Converter State
  const [preetiDirection, setPreetiDirection] = useState<'preeti-to-uni' | 'uni-to-preeti'>('preeti-to-uni');
  const [preetiInput, setPreetiInput] = useState<string>('s]kfn');
  const [preetiOutput, setPreetiOutput] = useState<string>('');

  // UI Interactive States
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [showKeymapGuide, setShowKeymapGuide] = useState<boolean>(false);
  const [guideSearch, setGuideSearch] = useState<string>('');
  const [isSwappingAnim, setIsSwappingAnim] = useState<boolean>(false);

  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const targetTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Live Transliteration based on Direction ──────────────────────────────
  useEffect(() => {
    if (typingDirection === 'en-to-ne') {
      const converted = transliterateRomanToNepali(sourceText, convertNumbers);
      setConvertedText(converted);
    } else {
      const converted = transliterateNepaliToRoman(sourceText);
      setConvertedText(converted);
    }
  }, [sourceText, typingDirection, convertNumbers]);

  // ─── Live Preeti Converter based on Direction ─────────────────────────────
  useEffect(() => {
    if (preetiDirection === 'preeti-to-uni') {
      const converted = convertPreetiToUnicode(preetiInput);
      setPreetiOutput(converted);
    } else {
      const converted = convertUnicodeToPreeti(preetiInput);
      setPreetiOutput(converted);
    }
  }, [preetiInput, preetiDirection]);

  // ─── Swap English ⇄ Nepali Direction ─────────────────────────────────────
  const handleSwapDirection = () => {
    setIsSwappingAnim(true);
    setTimeout(() => setIsSwappingAnim(false), 400);

    const nextDirection = typingDirection === 'en-to-ne' ? 'ne-to-en' : 'en-to-ne';
    setTypingDirection(nextDirection);

    // Swap text contents seamlessly (the current output becomes the new input!)
    const currentConverted = convertedText;
    setSourceText(currentConverted);
  };

  // ─── Swap Preeti ⇄ Unicode Direction ──────────────────────────────────────
  const handleSwapPreeti = () => {
    const nextDirection = preetiDirection === 'preeti-to-uni' ? 'uni-to-preeti' : 'preeti-to-uni';
    setPreetiDirection(nextDirection);
    setPreetiInput(preetiOutput);
  };

  // ─── Unicode Cleanup ──────────────────────────────────────────────────────
  const handleCleanUnicode = () => {
    if (typingDirection === 'en-to-ne') {
      if (!convertedText) return;
      const cleaned = cleanNepaliUnicode(convertedText);
      setConvertedText(cleaned);
    } else {
      if (!sourceText) return;
      const cleaned = cleanNepaliUnicode(sourceText);
      setSourceText(cleaned);
    }
  };

  // ─── Copy to Clipboard ────────────────────────────────────────────────────
  const handleCopy = (textToCopy: string, targetId: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTarget(targetId);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  // ─── Virtual Keyboard Key Press ───────────────────────────────────────────
  const handleVirtualKeyPress = (char: string) => {
    // If we're in Nepali to English mode, user wants to type Devanagari into the source box
    // If in English to Nepali mode, user can append directly to the converted box
    const targetEl = typingDirection === 'ne-to-en'
      ? sourceTextareaRef.current
      : targetTextareaRef.current;

    if (typingDirection === 'ne-to-en') {
      if (!targetEl) {
        setSourceText((prev) => prev + char);
        return;
      }
      const start = targetEl.selectionStart;
      const end = targetEl.selectionEnd;
      const current = sourceText;
      const nextText = current.substring(0, start) + char + current.substring(end);
      setSourceText(nextText);

      setTimeout(() => {
        targetEl.focus();
        targetEl.setSelectionRange(start + char.length, start + char.length);
      }, 0);
    } else {
      if (!targetEl) {
        setConvertedText((prev) => prev + char);
        return;
      }
      const start = targetEl.selectionStart;
      const end = targetEl.selectionEnd;
      const current = convertedText;
      const nextText = current.substring(0, start) + char + current.substring(end);
      setConvertedText(nextText);

      setTimeout(() => {
        targetEl.focus();
        targetEl.setSelectionRange(start + char.length, start + char.length);
      }, 0);
    }
  };

  // ─── Text-to-Speech (TTS) ─────────────────────────────────────────────────
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = typingDirection === 'en-to-ne' ? convertedText : sourceText;
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ne-NP';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ─── Export Formats ───────────────────────────────────────────────────────
  const getExportText = () => {
    return typingDirection === 'en-to-ne' ? convertedText : sourceText;
  };

  const downloadTxt = () => {
    const text = getExportText();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepalitype-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDocx = async () => {
    const text = getExportText();
    if (!text) return;
    const paragraphs = text.split('\n').map(
      (line) =>
        new Paragraph({
          children: [new TextRun(line)],
        })
    );

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepalitype-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const text = getExportText();
    if (!text) return;
    const doc = new jsPDF();
    const margin = 15;
    const maxLineWidth = 180;
    const splitText = doc.splitTextToSize(text, maxLineWidth);

    doc.setFontSize(12);
    doc.text(splitText, margin, 20);
    doc.save(`nepalitype-${Date.now()}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const text = getExportText();
    if (!text) return;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // ─── Stats calculation ────────────────────────────────────────────────────
  const activeDevanagariText = typingDirection === 'en-to-ne' ? convertedText : sourceText;
  const stats = useMemo(() => {
    const chars = activeDevanagariText.length;
    const words = activeDevanagariText.trim() ? activeDevanagariText.trim().split(/\s+/).length : 0;
    const lines = activeDevanagariText.trim() ? activeDevanagariText.split('\n').length : 0;
    return { chars, words, lines };
  }, [activeDevanagariText]);

  // ─── Filtered Keymap Guide ────────────────────────────────────────────────
  const filteredGuide = useMemo(() => {
    if (!guideSearch.trim()) return NEPALI_KEYMAP_GUIDE;
    const q = guideSearch.toLowerCase();
    return NEPALI_KEYMAP_GUIDE.filter(
      (item) =>
        item.rom.toLowerCase().includes(q) ||
        item.dev.includes(q) ||
        item.note.toLowerCase().includes(q)
    );
  }, [guideSearch]);

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
            <ShieldCheck size={14} /> 100% Client-Side Privacy
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
          <ArrowLeftRight size={13} /> Bidirectional English ⇄ Nepali Smart Typing
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
          NepaliType – Smart{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nepali Typing
          </span>
        </h1>
        <p
          style={{
            fontSize: 14,
            color: tk.textDim,
            maxWidth: 640,
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          Type English letters to convert into Devanagari Unicode, or swipe to convert Devanagari Nepali back into Romanized English. Features instant language swap, Unicode cleanup, and Preeti font converter.
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
        {/* Top Feature Toolbar */}
        <GlassCard style={{ padding: '14px 22px', marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* View Mode: Split Transliteration vs Preeti Converter */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
              <button
                onClick={() => setViewMode('split')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 9,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: viewMode === 'split' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'split' ? 'rgba(0,212,255,0.2)' : 'transparent',
                  color: viewMode === 'split' ? tk.cyan : tk.textDim,
                  transition: 'all 0.2s ease',
                }}
              >
                <Languages size={13} /> Smart Typing Studio
              </button>

              <button
                onClick={() => setViewMode('preeti')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 9,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: viewMode === 'preeti' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'preeti' ? 'rgba(168,85,247,0.2)' : 'transparent',
                  color: viewMode === 'preeti' ? tk.purple : tk.textDim,
                  transition: 'all 0.2s ease',
                }}
              >
                <RefreshCw size={13} /> Preeti ⇄ Unicode Converter
              </button>
            </div>

            {/* Language Direction Switcher Bar in Split Mode */}
            {viewMode === 'split' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(0,0,0,0.4)',
                  padding: '4px 6px',
                  borderRadius: 14,
                  border: `1px solid ${tk.border}`,
                }}
              >
                <button
                  onClick={() => {
                    if (typingDirection !== 'en-to-ne') handleSwapDirection();
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                    background: typingDirection === 'en-to-ne' ? 'rgba(0,212,255,0.2)' : 'transparent',
                    color: typingDirection === 'en-to-ne' ? tk.cyan : tk.textDim,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>🔤 English</span>
                  <span style={{ opacity: 0.6 }}>➔</span>
                  <span>🇳🇵 Nepali</span>
                </button>

                {/* ⇄ Swap Button */}
                <button
                  onClick={handleSwapDirection}
                  title="Swap languages & text (English ⇄ Nepali)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))',
                    border: '1px solid rgba(0,212,255,0.3)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transform: isSwappingAnim ? 'rotate(180deg) scale(1.15)' : 'rotate(0deg)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <ArrowLeftRight size={14} />
                </button>

                <button
                  onClick={() => {
                    if (typingDirection !== 'ne-to-en') handleSwapDirection();
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                    background: typingDirection === 'ne-to-en' ? 'rgba(168,85,247,0.2)' : 'transparent',
                    color: typingDirection === 'ne-to-en' ? tk.purple : tk.textDim,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>🇳🇵 Nepali</span>
                  <span style={{ opacity: 0.6 }}>➔</span>
                  <span>🔤 English</span>
                </button>
              </div>
            )}

            {/* Formatting & Cleanup Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={handleCleanUnicode}
                title="Cleans zero-width artifacts, cleans duplicate punctuation, and formats trailing halantas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${tk.border}`,
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)',
                  color: tk.green,
                  transition: 'all 0.2s ease',
                }}
              >
                <Wand2 size={13} /> Clean Unicode
              </button>

              <button
                onClick={() => setConvertNumbers(!convertNumbers)}
                title={convertNumbers ? 'Converting to Devanagari numerals (१, २, ३)' : 'Keeping English numerals (1, 2, 3)'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${convertNumbers ? 'rgba(0,212,255,0.3)' : tk.border}`,
                  cursor: 'pointer',
                  background: convertNumbers ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                  color: convertNumbers ? tk.cyan : tk.textDim,
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{convertNumbers ? 'अङ्क: १२३' : 'Nums: 123'}</span>
              </button>

              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
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
                <Keyboard size={13} /> {showKeyboard ? 'Hide' : 'Show'} Keyboard
              </button>

              <button
                onClick={() => setShowKeymapGuide(!showKeymapGuide)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${showKeymapGuide ? 'rgba(245,200,66,0.3)' : tk.border}`,
                  cursor: 'pointer',
                  background: showKeymapGuide ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.02)',
                  color: showKeymapGuide ? tk.gold : tk.textDim,
                  transition: 'all 0.2s ease',
                }}
              >
                <HelpCircle size={13} /> Typing Rules
              </button>
            </div>
          </div>
        </GlassCard>

        {/* ─── Mode 1: Smart Transliteration Studio ─── */}
        {viewMode === 'split' ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
                gap: 20,
                alignItems: 'start',
                marginBottom: 20,
                position: 'relative',
              }}
            >
              {/* Left Box: Source Input */}
              <GlassCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      color: typingDirection === 'en-to-ne' ? tk.cyan : tk.purple,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 700,
                    }}
                  >
                    <Type size={15} />{' '}
                    {typingDirection === 'en-to-ne'
                      ? 'Type Romanized English (Phonetic)'
                      : 'Type or Paste Devanagari (नेपाली)'}
                  </span>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {sourceText && (
                      <button
                        onClick={() => setSourceText('')}
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
                          padding: '4px 8px',
                        }}
                      >
                        <Trash2 size={12} /> Clear
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(sourceText, 'source')}
                      title="Copy input text"
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: copiedTarget === 'source' ? 'rgba(0,229,160,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${copiedTarget === 'source' ? tk.green : tk.border}`,
                        color: copiedTarget === 'source' ? tk.green : tk.textDim,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {copiedTarget === 'source' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedTarget === 'source' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  ref={sourceTextareaRef}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={
                    typingDirection === 'en-to-ne'
                      ? 'Type in English letters here (e.g. namaste, nepali, tapailai kasto chha?)...'
                      : 'यहाँ नेपाली युनिकोड लेख्नुहोस् वा टाँस्नुहोस् (जस्तै: नमस्ते साथी, मेरो नाम दिपेन हो)...'
                  }
                  rows={12}
                  style={{
                    width: '100%',
                    minHeight: 280,
                    padding: '16px',
                    borderRadius: 14,
                    background: 'rgba(8,13,26,0.5)',
                    border: `1px solid ${tk.border}`,
                    color: tk.text,
                    fontSize: typingDirection === 'en-to-ne' ? 16 : 19,
                    fontFamily: typingDirection === 'en-to-ne' ? tk.fontMono : tk.fontBody,
                    lineHeight: 1.8,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                {/* Helper hint */}
                <div style={{ marginTop: 10, fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {typingDirection === 'en-to-ne'
                      ? 'E.g., `nepal` → नेपाल, `shanti` → शान्ति, `dhanyabad` → धन्यवाद'
                      : 'E.g., `नेपाल` → nepal, `शान्ति` → shanti, `धन्यवाद` → dhanyabad'}
                  </span>
                  <span>{sourceText.length} chars</span>
                </div>
              </GlassCard>

              {/* Right Box: Converted Output */}
              <GlassCard style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      color: typingDirection === 'en-to-ne' ? tk.green : tk.cyan,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={15} />{' '}
                    {typingDirection === 'en-to-ne'
                      ? 'Devanagari Unicode Output (नेपाली)'
                      : 'Romanized English Output (Phonetic)'}
                  </span>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={toggleSpeech}
                      title={isSpeaking ? 'Stop voice' : 'Listen in Nepali (TTS)'}
                      style={{
                        padding: '4px 10px',
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
                      onClick={() => handleCopy(convertedText, 'converted')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: copiedTarget === 'converted' ? 'rgba(0,229,160,0.2)' : 'rgba(0,212,255,0.15)',
                        border: `1px solid ${copiedTarget === 'converted' ? tk.green : 'rgba(0,212,255,0.3)'}`,
                        color: copiedTarget === 'converted' ? tk.green : tk.cyan,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontWeight: 700,
                      }}
                    >
                      {copiedTarget === 'converted' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedTarget === 'converted' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  ref={targetTextareaRef}
                  value={convertedText}
                  onChange={(e) => setConvertedText(e.target.value)}
                  placeholder={
                    typingDirection === 'en-to-ne'
                      ? 'देवनागरी युनिकोड यहाँ देखा पर्नेछ...'
                      : 'Converted Romanized English will appear here...'
                  }
                  rows={12}
                  style={{
                    width: '100%',
                    minHeight: 280,
                    padding: '16px',
                    borderRadius: 14,
                    background: 'rgba(8,13,26,0.6)',
                    border: `1px solid rgba(0,212,255,0.2)`,
                    color: '#ffffff',
                    fontSize: typingDirection === 'en-to-ne' ? 20 : 16,
                    fontFamily: typingDirection === 'en-to-ne' ? tk.fontBody : tk.fontMono,
                    lineHeight: 1.8,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                {/* Counter & Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    color: tk.textDim,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span>{stats.words} शब्द (Words)</span>
                    <span>{stats.chars} अक्षर (Chars)</span>
                    <span>{stats.lines} हरफ (Lines)</span>
                  </div>
                  <button
                    onClick={handleShareWhatsApp}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: tk.green,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Share2 size={12} /> WhatsApp Share
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* Quick Presets Drawer */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} color={tk.gold} /> Quick Starter Templates (Click to load):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      if (typingDirection === 'en-to-ne') {
                        setSourceText(tmpl.roman);
                      } else {
                        setSourceText(tmpl.nepali);
                      }
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${tk.border}`,
                      color: tk.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontFamily: tk.fontBody, fontSize: 13, fontWeight: 700, color: tk.cyan, marginBottom: 2 }}>
                      {tmpl.title}
                    </div>
                    <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                      {tmpl.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ─── Mode 2: Legacy Preeti ⇄ Unicode Converter ─── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
              gap: 20,
              alignItems: 'start',
              marginBottom: 20,
            }}
          >
            {/* Preeti Input */}
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.purple, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <FileText size={15} />{' '}
                  {preetiDirection === 'preeti-to-uni'
                    ? 'Legacy Preeti / Kantipur Font Text'
                    : 'Universal Devanagari Unicode Text'}
                </span>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={handleSwapPreeti}
                    title="Swap Preeti ⇄ Unicode"
                    style={{
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      color: tk.purple,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 8,
                    }}
                  >
                    <ArrowLeftRight size={12} /> Swap
                  </button>
                  {preetiInput && (
                    <button
                      onClick={() => setPreetiInput('')}
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
              </div>

              <textarea
                value={preetiInput}
                onChange={(e) => setPreetiInput(e.target.value)}
                placeholder={
                  preetiDirection === 'preeti-to-uni'
                    ? 'यहाँ प्रिती फन्टको अक्षर टाँस्नुहोस् (Paste Preeti text like s]kfn)...'
                    : 'यहाँ युनिकोड नेपाली अक्षर टाँस्नुहोस् (Paste Unicode like नेपाल)...'
                }
                rows={12}
                style={{
                  width: '100%',
                  minHeight: 280,
                  padding: '16px',
                  borderRadius: 14,
                  background: 'rgba(8,13,26,0.5)',
                  border: `1px solid ${tk.border}`,
                  color: tk.text,
                  fontSize: 16,
                  fontFamily: tk.fontMono,
                  lineHeight: 1.8,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <div style={{ marginTop: 10, fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                {preetiDirection === 'preeti-to-uni'
                  ? 'Converts old docx/pagemaker Preeti fonts into modern universal Unicode.'
                  : 'Converts modern universal Unicode into legacy Preeti keyboard keystrokes.'}
              </div>
            </GlassCard>

            {/* Converted Output from Preeti */}
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <CheckCircle2 size={15} />{' '}
                  {preetiDirection === 'preeti-to-uni'
                    ? 'Converted Universal Unicode'
                    : 'Converted Preeti Keystrokes'}
                </span>

                <button
                  onClick={() => handleCopy(preetiOutput, 'preeti')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    background: copiedTarget === 'preeti' ? 'rgba(0,229,160,0.2)' : 'rgba(0,212,255,0.15)',
                    border: `1px solid ${copiedTarget === 'preeti' ? tk.green : 'rgba(0,212,255,0.3)'}`,
                    color: copiedTarget === 'preeti' ? tk.green : tk.cyan,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 700,
                  }}
                >
                  {copiedTarget === 'preeti' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedTarget === 'preeti' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <textarea
                value={preetiOutput}
                readOnly
                placeholder="रुपान्तरण यहाँ देखा पर्नेछ..."
                rows={12}
                style={{
                  width: '100%',
                  minHeight: 280,
                  padding: '16px',
                  borderRadius: 14,
                  background: 'rgba(8,13,26,0.6)',
                  border: `1px solid rgba(0,229,160,0.2)`,
                  color: '#ffffff',
                  fontSize: 20,
                  fontFamily: preetiDirection === 'preeti-to-uni' ? tk.fontBody : tk.fontMono,
                  lineHeight: 1.8,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <div style={{ marginTop: 10, fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                Clean, standard UTF-8 ready for web, mobile, and official docs.
              </div>
            </GlassCard>
          </div>
        )}

        {/* ─── Export & Download Suite ─── */}
        <GlassCard style={{ padding: '16px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} color={tk.cyan} /> Export Formatted Document:
            </span>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={downloadTxt}
                disabled={!activeDevanagariText}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  color: activeDevanagariText ? tk.text : tk.textDim,
                  cursor: activeDevanagariText ? 'pointer' : 'not-allowed',
                  fontFamily: tk.fontMono,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FileDown size={13} color={tk.cyan} />
                <span>.TXT Text</span>
              </button>

              <button
                onClick={downloadDocx}
                disabled={!activeDevanagariText}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  color: activeDevanagariText ? tk.text : tk.textDim,
                  cursor: activeDevanagariText ? 'pointer' : 'not-allowed',
                  fontFamily: tk.fontMono,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FileDown size={13} color={tk.purple} />
                <span>.DOCX Word</span>
              </button>

              <button
                onClick={downloadPdf}
                disabled={!activeDevanagariText}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  color: activeDevanagariText ? tk.text : tk.textDim,
                  cursor: activeDevanagariText ? 'pointer' : 'not-allowed',
                  fontFamily: tk.fontMono,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FileDown size={13} color={tk.gold} />
                <span>.PDF File</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* ─── Virtual Clickable Devanagari Keyboard ─── */}
        {showKeyboard && (
          <GlassCard style={{ padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <Keyboard size={14} /> Interactive Devanagari Touchpad
              </span>
              <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim }}>
                Click any key to insert directly at cursor ({typingDirection === 'ne-to-en' ? 'Input Box' : 'Output Box'})
              </span>
            </div>

            {/* Vowels & Matras */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 5 }}>स्वर एवं मात्रा (Vowels & Signs):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[...KEYBOARD_VOWELS, ...KEYBOARD_MATRAS].map((key, i) => (
                  <button
                    key={i}
                    onClick={() => handleVirtualKeyPress(key)}
                    style={{
                      minWidth: 34,
                      height: 34,
                      padding: '0 6px',
                      borderRadius: 8,
                      background: 'rgba(0,212,255,0.06)',
                      border: '1px solid rgba(0,212,255,0.15)',
                      color: tk.cyan,
                      fontSize: 15,
                      fontFamily: tk.fontBody,
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Consonants */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 5 }}>व्यञ्जन (Consonants):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {KEYBOARD_CONSONANTS.map((key, i) => (
                  <button
                    key={i}
                    onClick={() => handleVirtualKeyPress(key)}
                    style={{
                      minWidth: 34,
                      height: 34,
                      padding: '0 6px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.025)',
                      border: `1px solid ${tk.border}`,
                      color: tk.text,
                      fontSize: 15,
                      fontFamily: tk.fontBody,
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Numbers & Punctuation */}
            <div>
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 5 }}>अङ्क एवं चिन्ह (Numerals & Punctuation):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[...KEYBOARD_NUMBERS, ...KEYBOARD_SYMBOLS].map((key, i) => (
                  <button
                    key={i}
                    onClick={() => handleVirtualKeyPress(key)}
                    style={{
                      minWidth: 34,
                      height: 34,
                      padding: '0 6px',
                      borderRadius: 8,
                      background: 'rgba(168,85,247,0.06)',
                      border: '1px solid rgba(168,85,247,0.15)',
                      color: tk.purple,
                      fontSize: 15,
                      fontFamily: tk.fontBody,
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* ─── Searchable Keymap Cheat Sheet ─── */}
        {showKeymapGuide && (
          <GlassCard style={{ padding: '24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 16, fontWeight: 700, color: tk.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={16} color={tk.gold} /> Phonetic Keymap Reference Guide
                </h3>
                <p style={{ fontSize: 12, color: tk.textDim }}>
                  Reference how English letter combinations resolve into Devanagari consonants, matras, and conjuncts.
                </p>
              </div>

              {/* Search input for guide */}
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: tk.textDim }} />
                <input
                  type="text"
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  placeholder="Search rules (e.g. ksh, aa)..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 28px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${tk.border}`,
                    color: tk.text,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
              {filteredGuide.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${tk.border}`,
                  }}
                >
                  <div>
                    <span style={{ fontFamily: tk.fontMono, fontSize: 12, color: tk.cyan, fontWeight: 700 }}>
                      {item.rom}
                    </span>
                    <div style={{ fontSize: 10, color: tk.textDim, marginTop: 2 }}>{item.note}</div>
                  </div>
                  <span style={{ fontFamily: tk.fontBody, fontSize: 18, color: '#ffffff', fontWeight: 600 }}>
                    {item.dev}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </section>

      {/* ─── Feature Highlights Footer ─── */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1360,
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 36px) 60px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              icon: <ArrowLeftRight size={20} />,
              title: 'Bidirectional Swap Engine',
              desc: 'Seamlessly toggle between Romanized English ➔ Devanagari and Devanagari ➔ Romanized English with automatic content flipping.',
              color: tk.cyan,
            },
            {
              icon: <Wand2 size={20} />,
              title: 'Unicode Sanitization & Cleanup',
              desc: 'Automatically resolves broken halanta sequences, strips irregular zero-width spaces, and normalizes Nepali punctuation.',
              color: tk.green,
            },
            {
              icon: <RefreshCw size={20} />,
              title: 'Legacy Preeti ⇄ Unicode',
              desc: 'Convert old Preeti and Kantipur font text into modern universal Unicode that works across all devices, phones, and websites.',
              color: tk.purple,
            },
            {
              icon: <FileDown size={20} />,
              title: 'Universal Multi-Format Export',
              desc: 'Download clean Devanagari text files as UTF-8 .txt, Microsoft Word (.docx), or print-ready PDF files in a single click.',
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
