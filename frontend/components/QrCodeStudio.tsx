'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { pageTokens as tk } from '@/lib/pageTokens';
import {
  patternOptions,
  cornerOptions,
  socialLogos,
  codeColorPresets,
  bgColorPresets,
  normalizeUrl,
  isValidUrl,
  type PatternId,
  type CornerId,
  type SocialLogoId,
} from '@/lib/qrPresets';
import {
  Share2,
  Copy,
  Check,
  Download,
  Smartphone,
  Send,
  MessageSquare,
  Mail,
  Printer,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  Sparkles,
  FileCode,
} from 'lucide-react';

type QRCodeStylingInstance = {
  append: (el: HTMLElement) => void;
  update: (options: Record<string, unknown>) => void;
  download: (opts: { name: string; extension: 'png' | 'svg' | 'jpeg' | 'webp' }) => Promise<void>;
  getRawData?: (extension?: 'png' | 'svg' | 'jpeg' | 'webp') => Promise<Blob | Buffer | null>;
};

const DEFAULT_URL = 'https://dipendraprasadgupta.vercel.app/';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function QrCodeStudio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStylingInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState(DEFAULT_URL);
  const [name, setName] = useState('Untitled QR code');
  const [pattern, setPattern] = useState<PatternId>('classic');
  const [corner, setCorner] = useState<CornerId>('rounded');
  const [codeColor, setCodeColor] = useState('#050810');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState<string | null>(null);
  const [activeSocial, setActiveSocial] = useState<SocialLogoId | null>(null);

  // Sharing & feedback state
  const [downloading, setDownloading] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const [sharingDevice, setSharingDevice] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const patternDef = patternOptions.find(p => p.id === pattern)!;
  const cornerDef = cornerOptions.find(c => c.id === corner)!;
  const validUrl = isValidUrl(url);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  // Hydrate from URL query parameters on mount (Hydration-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if navigator.share is available
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanNativeShare(true);
    }

    try {
      const search = window.location.search;
      if (!search) return;
      const params = new URLSearchParams(search);
      const u = params.get('url');
      if (u) setUrl(u);
      const n = params.get('name');
      if (n) setName(n);
      const p = params.get('pattern');
      if (p && patternOptions.some(opt => opt.id === p)) setPattern(p as PatternId);
      const c = params.get('corner');
      if (c && cornerOptions.some(opt => opt.id === c)) setCorner(c as CornerId);
      const cc = params.get('codeColor');
      if (cc) setCodeColor(cc);
      const bg = params.get('bgColor');
      if (bg) setBgColor(bg);
      const soc = params.get('social');
      if (soc) {
        const item = socialLogos.find(s => s.id === soc);
        if (item) {
          setLogo(item.image);
          setActiveSocial(item.id);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const buildOptions = useCallback(
    () => ({
      width: 320,
      height: 320,
      type: 'svg' as const,
      data: normalizeUrl(url) || DEFAULT_URL,
      margin: 8,
      qrOptions: { errorCorrectionLevel: 'H' as const },
      image: logo || undefined,
      dotsOptions: {
        color: codeColor,
        type: patternDef.dotsType,
      },
      cornersSquareOptions: {
        color: codeColor,
        type: cornerDef.squareType,
      },
      cornersDotOptions: {
        color: codeColor,
        type: cornerDef.dotType,
      },
      backgroundOptions: { color: bgColor },
      imageOptions: {
        crossOrigin: 'anonymous' as const,
        margin: 6,
        imageSize: 0.35,
      },
    }),
    [url, logo, codeColor, bgColor, patternDef, cornerDef],
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { default: QRCodeStyling } = await import('qr-code-styling');
      if (!mounted || !containerRef.current) return;

      const qr = new QRCodeStyling(buildOptions()) as QRCodeStylingInstance;
      containerRef.current.innerHTML = '';
      qr.append(containerRef.current);
      qrRef.current = qr;
    };

    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrRef.current || !validUrl) return;
    qrRef.current.update(buildOptions());
  }, [buildOptions, validUrl]);

  // Robust QR Blob extraction (tries getRawData, with bulletproof SVG-to-Canvas fallback)
  const getQrBlob = useCallback(
    async (format: 'png' | 'svg' | 'webp' = 'png', targetSize = 640): Promise<Blob> => {
      if (!qrRef.current) throw new Error('QR code instance not ready');

      // For standard 320px SVG, we can grab directly if requested
      const svgEl = containerRef.current?.querySelector('svg');
      if (format === 'svg') {
        if (svgEl) {
          const svgXml = new XMLSerializer().serializeToString(svgEl);
          return new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        }
      }

      // Try getRawData from qr-code-styling if standard size
      if (targetSize === 320 && qrRef.current.getRawData && format !== 'webp') {
        try {
          const raw = await qrRef.current.getRawData(format);
          if (raw instanceof Blob) return raw;
        } catch {
          // fallback to canvas
        }
      }

      // High-resolution Canvas rendering from SVG element
      if (!svgEl) throw new Error('QR DOM element not found');
      const svgXml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      return new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          URL.revokeObjectURL(blobUrl);
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable'));
            return;
          }

          // Fill background color
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, 0, 0, targetSize, targetSize);

          const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
          canvas.toBlob(
            blob => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            },
            mimeType,
            0.96,
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Failed to render SVG onto canvas'));
        };

        img.src = blobUrl;
      });
    },
    [bgColor],
  );

  // ── Share Actions ──────────────────────────────────────────────────────────

  // 1. Native Web Share (with image file attached if supported)
  const handleNativeShare = async () => {
    if (!validUrl) return;
    setSharingDevice(true);
    try {
      const safeName = (name.trim() || 'qr-code').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
      const blob = await getQrBlob('png', 640);
      const file = new File([blob], `${safeName}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${name.trim() || 'Custom'} QR Code`,
          text: `Scan this QR code to visit: ${normalizeUrl(url)}`,
          files: [file],
        });
        showToast('Shared successfully!', 'success');
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `${name.trim() || 'Custom'} QR Code`,
          text: `Scan this QR code to visit: ${normalizeUrl(url)}`,
          url: normalizeUrl(url),
        });
        showToast('Shared destination link!', 'success');
        return;
      }

      // If browser doesn't support navigator.share, open share modal
      setShowShareModal(true);
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        setShowShareModal(true);
      }
    } finally {
      setSharingDevice(false);
    }
  };

  // 2. Direct Clipboard Copy of Binary Image (PNG)
  const handleCopyImage = async () => {
    if (!validUrl) return;
    setCopyingImage(true);
    try {
      const blob = await getQrBlob('png', 640);
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedKey('copy-image');
        showToast('✨ QR code image copied to clipboard! Paste directly (Ctrl+V) into WhatsApp, Slack, Figma or Word.', 'success');
        setTimeout(() => setCopiedKey(null), 2500);
      } else {
        await handleCopyBase64();
      }
    } catch (err) {
      console.warn('Direct image clipboard copy failed, falling back to modal:', err);
      showToast('Clipboard image access is restricted in this browser. Opening share options...', 'info');
      setShowShareModal(true);
    } finally {
      setCopyingImage(false);
    }
  };

  // 3. Copy Shareable Studio Deep-Link (Preserves design settings)
  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (url && url !== DEFAULT_URL) params.set('url', url);
    if (name && name !== 'Untitled QR code') params.set('name', name);
    if (pattern !== 'classic') params.set('pattern', pattern);
    if (corner !== 'rounded') params.set('corner', corner);
    if (codeColor !== '#050810') params.set('codeColor', codeColor);
    if (bgColor !== '#ffffff') params.set('bgColor', bgColor);
    if (activeSocial) params.set('social', activeSocial);

    const shareUrl = `${window.location.origin}${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedKey('copy-link');
    showToast('🔗 Studio design link copied! Anyone opening this will see your exact custom QR code.', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // 4. Copy Base64 Data URI
  const handleCopyBase64 = async () => {
    try {
      const blob = await getQrBlob('png', 400);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        navigator.clipboard.writeText(base64);
        setCopiedKey('copy-base64');
        showToast('💻 Base64 Image URI copied! Embed directly in HTML <img> or CSS.', 'success');
        setTimeout(() => setCopiedKey(null), 2500);
      };
      reader.readAsDataURL(blob);
    } catch {
      showToast('Failed to create Base64 string.', 'error');
    }
  };

  // 5. Social Share Actions
  const handleSocialShare = (platform: 'whatsapp' | 'telegram' | 'twitter' | 'linkedin' | 'email') => {
    const destUrl = normalizeUrl(url);
    const title = name.trim() || 'Custom QR Code';
    const text = `Scan this QR code to visit: ${destUrl} — Created with D-Kode Era QR Studio`;

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${destUrl}`)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(destUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(destUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(destUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`QR Code: ${title}`)}&body=${encodeURIComponent(`${text}\n\n${destUrl}`)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 6. Direct Print
  const handlePrint = async () => {
    try {
      const blob = await getQrBlob('png', 800);
      const imgUrl = URL.createObjectURL(blob);
      const printWin = window.open('', '_blank');
      if (!printWin) {
        showToast('Popup blocked by browser. Please allow popups to print.', 'info');
        return;
      }
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${name.trim() || 'QR Code'} - D-Kode Era</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 95vh; margin: 0; font-family: system-ui, sans-serif; text-align: center; }
              img { max-width: 360px; width: 100%; height: auto; border-radius: 12px; }
              h1 { margin: 24px 0 8px; font-size: 22px; color: #111; }
              p { color: #666; font-size: 13px; margin: 0; word-break: break-all; max-width: 400px; }
              .badge { display: inline-block; margin-top: 16px; padding: 4px 12px; font-size: 11px; background: #eee; border-radius: 12px; font-weight: 600; color: #444; }
            </style>
          </head>
          <body>
            <img src="${imgUrl}" onload="window.print();window.close();" />
            <h1>${name.trim() || 'Scan to Visit'}</h1>
            <p>${normalizeUrl(url)}</p>
            <div class="badge">Created with D-Kode Era</div>
          </body>
        </html>
      `);
      printWin.document.close();
    } catch {
      showToast('Print preparation failed.', 'error');
    }
  };

  // 7. Download Handler
  const handleDownload = async (ext: 'png' | 'svg' | 'webp', size: 'standard' | 'hd' = 'standard') => {
    if (!qrRef.current || !validUrl) return;
    setDownloading(true);
    try {
      const safeName = (name.trim() || 'qr-code').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();

      if (ext === 'svg') {
        await qrRef.current.download({ name: safeName, extension: 'svg' });
      } else {
        const px = size === 'hd' ? 1024 : 320;
        const blob = await getQrBlob(ext, px);
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${safeName}-${size === 'hd' ? '1024px-hd' : '320px'}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      }
      showToast(`Downloaded ${ext.toUpperCase()}${size === 'hd' ? ' (1024px Ultra-HD)' : ''}!`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const selectSocialLogo = (id: SocialLogoId) => {
    const item = socialLogos.find(s => s.id === id);
    if (item) {
      setLogo(item.image);
      setActiveSocial(id);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setActiveSocial(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      setActiveSocial(null);
    };
    reader.readAsDataURL(file);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
    border: `1px solid ${tk.border}`,
    borderRadius: 16,
    padding: '24px 22px',
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: tk.fontDisplay,
    fontSize: 16,
    fontWeight: 800,
    color: tk.text,
    marginBottom: 4,
  };

  const sectionSub: React.CSSProperties = {
    fontSize: 13,
    color: tk.textDim,
    marginBottom: 18,
    lineHeight: 1.5,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: tk.textDim,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: tk.fontMono,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(13,20,37,0.8)',
    border: `1px solid ${tk.border}`,
    borderRadius: 10,
    color: tk.text,
    fontSize: 14,
    fontFamily: tk.fontBody,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const chipBtn = (active: boolean): React.CSSProperties => ({
    background: active ? `${tk.cyan}18` : 'rgba(255,255,255,0.02)',
    border: `1px solid ${active ? `${tk.cyan}55` : tk.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? tk.cyan : tk.textMuted,
    fontFamily: tk.fontBody,
    transition: 'all 0.2s',
    textAlign: 'center' as const,
  });

  const ColorSwatches = ({
    presets,
    value,
    onChange,
  }: {
    presets: string[];
    value: string;
    onChange: (c: string) => void;
  }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {presets.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: c,
            border: value === c ? `2px solid ${tk.cyan}` : `1px solid ${tk.border}`,
            cursor: 'pointer',
            boxShadow: value === c ? `0 0 0 2px ${tk.cyan}40` : 'none',
          }}
        />
      ))}
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          border: `1px dashed ${tk.border}`,
          cursor: 'pointer',
          fontSize: 12,
          color: tk.textDim,
          fontFamily: tk.fontMono,
        }}
      >
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 24, height: 24, border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }}
        />
        Add a colour
      </label>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Feedback */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 9999,
            background: toast.type === 'error' ? 'rgba(239,68,68,0.92)' : 'rgba(5,13,28,0.95)',
            border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.5)' : tk.cyan}`,
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: 14,
            boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            fontWeight: 600,
            maxWidth: 420,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {toast.type === 'error' ? <span>⚠️</span> : <Sparkles size={18} color={tk.cyan} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 28, alignItems: 'start' }}>
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic Info */}
          <div style={cardStyle}>
            <div style={sectionTitle}>1. Destination & Label</div>
            <div style={sectionSub}>Enter where your QR code will take scanners.</div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Destination URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://yoursite.com"
                style={{
                  ...inputStyle,
                  borderColor: url && !validUrl ? `${tk.red}60` : tk.border,
                }}
              />
              {url && !validUrl && (
                <div style={{ fontSize: 12, color: tk.red, marginTop: 6 }}>Enter a valid URL with a domain.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>QR Code Label / Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Untitled QR code"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Style Customization */}
          <div style={cardStyle}>
            <div style={sectionTitle}>2. Visual Styling & Branding</div>
            <div style={sectionSub}>Tweak dot patterns, corner shapes, colours, and logo badge.</div>

            {/* Patterns */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Dot Patterns</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                {patternOptions.map(p => (
                  <button key={p.id} type="button" onClick={() => setPattern(p.id)} style={chipBtn(pattern === p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corners */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Corner Framing</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                {cornerOptions.map(c => (
                  <button key={c.id} type="button" onClick={() => setCorner(c.id)} style={chipBtn(corner === c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Color */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>QR Foreground Colour</label>
              <ColorSwatches presets={codeColorPresets} value={codeColor} onChange={setCodeColor} />
            </div>

            {/* Background Color */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Background Fill</label>
              <ColorSwatches presets={bgColorPresets} value={bgColor} onChange={setBgColor} />
            </div>

            {/* Logos */}
            <div>
              <label style={labelStyle}>Center Brand Logo</label>
              {logo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  style={{
                    ...chipBtn(false),
                    width: '100%',
                    marginBottom: 12,
                    color: tk.red,
                    borderColor: `${tk.red}40`,
                  }}
                >
                  ✕ Remove Logo
                </button>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
                {socialLogos.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSocialLogo(s.id)}
                    style={{
                      ...chipBtn(activeSocial === s.id),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: '12px 8px',
                    }}
                  >
                    <img src={s.image} alt={s.label} width={28} height={28} style={{ borderRadius: 6 }} />
                    <span style={{ fontSize: 11 }}>{s.label}</span>
                  </button>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} id="qr-logo-upload" />
              <label
                htmlFor="qr-logo-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `1px dashed ${tk.cyan}50`,
                  background: `${tk.cyan}08`,
                  color: tk.cyan,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: tk.fontMono,
                }}
              >
                + Upload Custom Logo Image
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview & Shareable Hub Column */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{ ...cardStyle, borderColor: `${tk.cyan}40`, textAlign: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Live Canvas Preview
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: tk.fontMono,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(0,229,160,0.1)',
                  color: tk.green,
                  border: '1px solid rgba(0,229,160,0.25)',
                }}
              >
                Level H Error Resilient
              </span>
            </div>

            <div style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, color: tk.text, marginBottom: 16 }}>
              {name.trim() || 'Untitled QR code'}
            </div>

            {/* Rendered Canvas Display */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 24,
                borderRadius: 16,
                background: bgColor,
                margin: '0 auto 20px',
                maxWidth: 360,
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                minHeight: 320,
                border: `1px solid ${tk.border}`,
              }}
            >
              <div ref={containerRef} style={{ lineHeight: 0, opacity: validUrl ? 1 : 0.15, pointerEvents: validUrl ? 'auto' : 'none' }} />
              {!validUrl && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.textDim, fontSize: 14, padding: 24, textAlign: 'center' }}>
                  Enter a valid URL to generate your QR code
                </div>
              )}
            </div>

            {/* ── Prominent Sharing & Quick Action Bar ──────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {/* PRIMARY: Share Image / Open Share Sheet */}
              <button
                type="button"
                disabled={!validUrl || downloading}
                onClick={handleNativeShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                  color: '#ffffff',
                  fontFamily: tk.fontMono,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: validUrl ? 'pointer' : 'not-allowed',
                  opacity: validUrl ? 1 : 0.5,
                  boxShadow: '0 4px 20px rgba(0,212,255,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                <Share2 size={18} />
                {sharingDevice ? 'Opening Share...' : 'Share QR Code Image'}
              </button>

              {/* SECONDARY ROW: Copy Image to Clipboard & Full Share Modal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  disabled={!validUrl || copyingImage}
                  onClick={handleCopyImage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '11px 16px',
                    borderRadius: 10,
                    border: `1px solid ${copiedKey === 'copy-image' ? tk.green : tk.border}`,
                    background: copiedKey === 'copy-image' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.04)',
                    color: copiedKey === 'copy-image' ? tk.green : tk.text,
                    fontFamily: tk.fontMono,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: validUrl ? 'pointer' : 'not-allowed',
                    opacity: validUrl ? 1 : 0.5,
                  }}
                  title="Copy PNG image directly to clipboard for pasting into WhatsApp, Slack, Figma"
                >
                  {copiedKey === 'copy-image' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedKey === 'copy-image' ? 'Image Copied!' : 'Copy Image'}
                </button>

                <button
                  type="button"
                  disabled={!validUrl}
                  onClick={() => setShowShareModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '11px 16px',
                    borderRadius: 10,
                    border: `1px solid ${tk.cyan}40`,
                    background: 'rgba(0,212,255,0.06)',
                    color: tk.cyan,
                    fontFamily: tk.fontMono,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: validUrl ? 'pointer' : 'not-allowed',
                    opacity: validUrl ? 1 : 0.5,
                  }}
                >
                  <Send size={15} />
                  More Channels
                </button>
              </div>

              {/* TERTIARY ROW: Download Standard & Vector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  disabled={!validUrl || downloading}
                  onClick={() => handleDownload('png', 'standard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${tk.border}`,
                    background: 'rgba(255,255,255,0.02)',
                    color: tk.textDim,
                    fontFamily: tk.fontMono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: validUrl ? 'pointer' : 'not-allowed',
                    opacity: validUrl ? 1 : 0.5,
                  }}
                >
                  <Download size={14} />
                  PNG (320px)
                </button>

                <button
                  type="button"
                  disabled={!validUrl || downloading}
                  onClick={() => handleDownload('svg')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${tk.border}`,
                    background: 'rgba(255,255,255,0.02)',
                    color: tk.textDim,
                    fontFamily: tk.fontMono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: validUrl ? 'pointer' : 'not-allowed',
                    opacity: validUrl ? 1 : 0.5,
                  }}
                >
                  <FileCode size={14} />
                  SVG (Vector)
                </button>
              </div>
            </div>

            {/* Destination URL Metadata info */}
            {validUrl && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, letterSpacing: '0.08em' }}>ENCODED DESTINATION</div>
                  <div style={{ fontSize: 12, color: tk.cyan, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {normalizeUrl(url)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  title="Copy shareable link with this exact design"
                  style={{
                    background: 'rgba(0,212,255,0.1)',
                    border: `1px solid ${tk.cyan}30`,
                    color: tk.cyan,
                    padding: '6px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <LinkIcon size={12} />
                  {copiedKey === 'copy-link' ? 'Copied' : 'Share Link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Premium Comprehensive Share Modal ───────────────────────────────── */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${tk.surface} 0%, #0d1425 100%)`,
              border: `1px solid ${tk.cyan}40`,
              borderRadius: 22,
              padding: '32px 28px',
              maxWidth: 580,
              width: '100%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Sparkles size={14} />
                  Share Hub
                </div>
                <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: tk.text }}>
                  Share Generated QR Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 10,
                  color: tk.textDim,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Destination Snippet Card */}
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${tk.border}`,
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  border: `1px solid ${tk.border}`,
                }}
              >
                📱
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: tk.text, marginBottom: 2 }}>{name.trim() || 'Custom QR Code'}</div>
                <div style={{ fontSize: 12, color: tk.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {normalizeUrl(url)}
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Instant Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {/* 1. Native Device Share */}
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    style={{
                      background: 'rgba(0,212,255,0.08)',
                      border: `1px solid ${tk.cyan}35`,
                      borderRadius: 12,
                      padding: '14px 12px',
                      color: tk.cyan,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontFamily: tk.fontBody,
                    }}
                  >
                    <Smartphone size={22} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Device Share</span>
                    <span style={{ fontSize: 10, color: tk.textDim }}>AirDrop / System</span>
                  </button>
                )}

                {/* 2. Copy Image (PNG binary) */}
                <button
                  type="button"
                  onClick={handleCopyImage}
                  style={{
                    background: copiedKey === 'copy-image' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${copiedKey === 'copy-image' ? tk.green : tk.border}`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    color: copiedKey === 'copy-image' ? tk.green : tk.text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: tk.fontBody,
                  }}
                >
                  <Copy size={22} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {copiedKey === 'copy-image' ? 'Image Copied!' : 'Copy Image'}
                  </span>
                  <span style={{ fontSize: 10, color: tk.textDim }}>Paste anywhere (Ctrl+V)</span>
                </button>

                {/* 3. Copy Share Link */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  style={{
                    background: copiedKey === 'copy-link' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${copiedKey === 'copy-link' ? tk.green : tk.border}`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    color: copiedKey === 'copy-link' ? tk.green : tk.text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: tk.fontBody,
                  }}
                >
                  <LinkIcon size={22} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {copiedKey === 'copy-link' ? 'Link Copied!' : 'Copy Studio Link'}
                  </span>
                  <span style={{ fontSize: 10, color: tk.textDim }}>Deep design link</span>
                </button>

                {/* 4. Copy Base64 */}
                <button
                  type="button"
                  onClick={handleCopyBase64}
                  style={{
                    background: copiedKey === 'copy-base64' ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${copiedKey === 'copy-base64' ? tk.green : tk.border}`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    color: copiedKey === 'copy-base64' ? tk.green : tk.text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: tk.fontBody,
                  }}
                >
                  <FileCode size={22} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {copiedKey === 'copy-base64' ? 'URI Copied!' : 'Copy Base64'}
                  </span>
                  <span style={{ fontSize: 10, color: tk.textDim }}>Embed in HTML/CSS</span>
                </button>

                {/* 5. Print Ready */}
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    color: tk.text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: tk.fontBody,
                  }}
                >
                  <Printer size={22} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Print QR</span>
                  <span style={{ fontSize: 10, color: tk.textDim }}>For stickers / tents</span>
                </button>
              </div>
            </div>

            {/* Social Channels Row */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Direct Messaging & Social
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: 10 }}>
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('whatsapp')}
                  style={{
                    background: 'rgba(37,211,102,0.1)',
                    border: '1px solid rgba(37,211,102,0.3)',
                    color: '#25D366',
                    borderRadius: 10,
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <MessageSquare size={18} />
                  WhatsApp
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('telegram')}
                  style={{
                    background: 'rgba(0,136,204,0.1)',
                    border: '1px solid rgba(0,136,204,0.3)',
                    color: '#0088cc',
                    borderRadius: 10,
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <Send size={18} />
                  Telegram
                </button>

                {/* Twitter / X */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('twitter')}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${tk.border}`,
                    color: '#ffffff',
                    borderRadius: 10,
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / Twitter
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('linkedin')}
                  style={{
                    background: 'rgba(10,102,194,0.1)',
                    border: '1px solid rgba(10,102,194,0.3)',
                    color: '#0A66C2',
                    borderRadius: 10,
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  LinkedIn
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={() => handleSocialShare('email')}
                  style={{
                    background: 'rgba(245,200,66,0.1)',
                    border: '1px solid rgba(245,200,66,0.3)',
                    color: tk.gold,
                    borderRadius: 10,
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <Mail size={18} />
                  Email
                </button>
              </div>
            </div>

            {/* High-Resolution Export Formats */}
            <div>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                High-Resolution Image Downloads
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleDownload('png', 'standard')}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: tk.text,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  <Download size={14} />
                  PNG (320px)
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('png', 'hd')}
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: `1px solid ${tk.cyan}40`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: tk.cyan,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                  title="Ultra HD 1024x1024 suitable for high-resolution print marketing"
                >
                  <Sparkles size={14} />
                  HD PNG (1024px)
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('svg')}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: tk.text,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  <FileCode size={14} />
                  Vector SVG
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload('webp')}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: tk.text,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon size={14} />
                  WebP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
