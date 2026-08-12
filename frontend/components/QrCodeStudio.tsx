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

type QRCodeStylingInstance = {
  append: (el: HTMLElement) => void;
  update: (options: Record<string, unknown>) => void;
  download: (opts: { name: string; extension: 'png' | 'svg' | 'jpeg' | 'webp' }) => Promise<void>;
};

const DEFAULT_URL = 'https://dipendraprasadgupta.vercel.app/';

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
  const [downloading, setDownloading] = useState(false);

  const patternDef = patternOptions.find(p => p.id === pattern)!;
  const cornerDef = cornerOptions.find(c => c.id === corner)!;
  const validUrl = isValidUrl(url);

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

  const handleDownload = async (ext: 'png' | 'svg') => {
    if (!qrRef.current) return;
    setDownloading(true);
    try {
      const safeName = (name.trim() || 'qr-code').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
      await qrRef.current.download({ name: safeName, extension: ext });
    } finally {
      setDownloading(false);
    }
  };

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 28, alignItems: 'start' }}>
      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Basic info */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Add basic information</div>
          <div style={sectionSub}>Start with where your QR should point.</div>

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
            <label style={labelStyle}>QR code name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Untitled QR code"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Style */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Customise how it looks</div>
          <div style={sectionSub}>Tweak the style, colours, and logo.</div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Patterns</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {patternOptions.map(p => (
                <button key={p.id} type="button" onClick={() => setPattern(p.id)} style={chipBtn(pattern === p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Corners</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
              {cornerOptions.map(c => (
                <button key={c.id} type="button" onClick={() => setCorner(c.id)} style={chipBtn(corner === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Code colours</label>
            <ColorSwatches presets={codeColorPresets} value={codeColor} onChange={setCodeColor} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Background colours</label>
            <ColorSwatches presets={bgColorPresets} value={bgColor} onChange={setBgColor} />
          </div>

          <div>
            <label style={labelStyle}>Logos</label>
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
                Remove logo
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
              Upload custom logo
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ position: 'sticky', top: 100 }}>
        <div style={{ ...cardStyle, borderColor: `${tk.cyan}35`, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Live Preview
          </div>
          <div style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, color: tk.text, marginBottom: 20 }}>
            {name.trim() || 'Untitled QR code'}
          </div>

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
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              minHeight: 320,
            }}
          >
            <div ref={containerRef} style={{ lineHeight: 0, opacity: validUrl ? 1 : 0.15, pointerEvents: validUrl ? 'auto' : 'none' }} />
            {!validUrl && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.textDim, fontSize: 14, padding: 24, textAlign: 'center' }}>
                Enter a valid URL to generate your QR code
              </div>
            )}
          </div>

          <p style={{ fontSize: 12, color: tk.textDim, marginBottom: 20, lineHeight: 1.6 }}>
            Updates automatically as you customize.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={!validUrl || downloading}
              onClick={() => handleDownload('png')}
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: tk.cyan,
                color: '#050810',
                fontFamily: tk.fontMono,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: validUrl && !downloading ? 'pointer' : 'not-allowed',
                opacity: validUrl && !downloading ? 1 : 0.5,
              }}
            >
              Download PNG
            </button>
            <button
              type="button"
              disabled={!validUrl || downloading}
              onClick={() => handleDownload('svg')}
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                border: `1px solid ${tk.border}`,
                background: 'transparent',
                color: tk.text,
                fontFamily: tk.fontMono,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: validUrl && !downloading ? 'pointer' : 'not-allowed',
                opacity: validUrl && !downloading ? 1 : 0.5,
              }}
            >
              Download SVG
            </button>
          </div>

          {validUrl && (
            <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${tk.border}`, textAlign: 'left' }}>
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 4, letterSpacing: '0.08em' }}>ENCODES</div>
              <div style={{ fontSize: 13, color: tk.textMuted, wordBreak: 'break-all' }}>{normalizeUrl(url)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
