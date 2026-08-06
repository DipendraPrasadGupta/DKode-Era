/** Design tokens for /pages/* routes — cinematic dark theme */
export const pageTokens = {
  bg: '#050810',
  bgAlt: 'rgba(8,13,26,0.5)',
  surface: 'rgba(13,20,37,0.6)',
  surfaceMuted: 'rgba(13,20,37,0.5)',
  text: '#e8edf5',
  textMuted: '#9ab0c8',
  textDim: '#7a8aa0',
  border: 'rgba(99,179,237,0.12)',
  borderHover: 'rgba(0,212,255,0.35)',
  cyan: '#00d4ff',
  purple: '#a855f7',
  green: '#00e5a0',
  gold: '#f5c842',
  red: '#ff6b6b',
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'Outfit', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  maxWidth: 1100,
  maxWidthWide: 1200,
  sectionPad: 'clamp(48px, 8vw, 80px)',
  containerPad: 'clamp(20px, 5vw, 80px)',
} as const;

export type AccentColor = string;
