/** QR Code Generator presets — pattern & corner mappings for qr-code-styling */

export type PatternId = 'classic' | 'dots' | 'spark' | 'soft' | 'playful';
export type CornerId = 'square' | 'rounded' | 'circle' | 'cut' | 'tilt-left' | 'tilt-right' | 'pill';
export type SocialLogoId = 'instagram' | 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'youtube';

export interface PatternOption {
  id: PatternId;
  label: string;
  dotsType: 'square' | 'dots' | 'classy-rounded' | 'rounded' | 'extra-rounded';
}

export interface CornerOption {
  id: CornerId;
  label: string;
  squareType: 'square' | 'extra-rounded' | 'dot' | 'classy' | 'classy-rounded' | 'rounded';
  dotType: 'square' | 'dot' | 'classy' | 'classy-rounded' | 'extra-rounded';
}

export interface SocialLogo {
  id: SocialLogoId;
  label: string;
  image: string;
}

export const patternOptions: PatternOption[] = [
  { id: 'classic', label: 'Classic grid', dotsType: 'square' },
  { id: 'dots', label: 'Dots', dotsType: 'dots' },
  { id: 'spark', label: 'Spark', dotsType: 'classy-rounded' },
  { id: 'soft', label: 'Soft blocks', dotsType: 'rounded' },
  { id: 'playful', label: 'Playful', dotsType: 'extra-rounded' },
];

export const cornerOptions: CornerOption[] = [
  { id: 'square', label: 'Square', squareType: 'square', dotType: 'square' },
  { id: 'rounded', label: 'Rounded', squareType: 'extra-rounded', dotType: 'dot' },
  { id: 'circle', label: 'Circle', squareType: 'dot', dotType: 'dot' },
  { id: 'cut', label: 'Cut', squareType: 'square', dotType: 'square' },
  { id: 'tilt-left', label: 'Tilt left', squareType: 'classy', dotType: 'classy' },
  { id: 'tilt-right', label: 'Tilt right', squareType: 'classy-rounded', dotType: 'classy-rounded' },
  { id: 'pill', label: 'Pill', squareType: 'extra-rounded', dotType: 'dot' },
];

export const codeColorPresets = ['#050810', '#00d4ff', '#a855f7', '#f5c842', '#00e5a0', '#ff6b6b', '#ffffff', '#4267B2'];
export const bgColorPresets = ['#ffffff', '#f8fafc', '#050810', '#0d1425', '#e8edf5', '#fef3c7', '#ecfdf5', '#fdf2f8'];

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const socialLogos: SocialLogo[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    image: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FD5949"/><stop offset="50%" stop-color="#D6249F"/><stop offset="100%" stop-color="#285AEB"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#g)"/><circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="24" cy="24" r="4" fill="#fff"/><circle cx="34" cy="14" r="2.5" fill="#fff"/></svg>`),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    image: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#25D366"/><path fill="#fff" d="M24 10c-7.7 0-14 6.1-14 13.6 0 2.4.6 4.7 1.8 6.8L10 38l7.9-2.1c2 1.1 4.2 1.7 6.5 1.7 7.7 0 14-6.1 14-13.6S31.7 10 24 10zm0 24.9c-2 0-4-.5-5.7-1.5l-.4-.2-4.7 1.2 1.3-4.5-.3-.5a11.2 11.2 0 0 1-1.7-6c0-6.2 5.2-11.2 11.5-11.2S35.5 17.1 35.5 23.3 29.3 34.9 24 34.9zm6.3-8.4c-.3-.2-2-.9-2.3-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5 0-.2 0-.3-.1-.5-.1-.2-.7-1.6-.9-2.2-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.3z"/></svg>`),
  },
  {
    id: 'twitter',
    label: 'Twitter',
    image: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#000"/><path fill="#fff" d="M28.5 14h3.2l-7 8 8.2 12h-6.4l-5-6.6-5.7 6.6H12l7.5-8.6L11.8 14h6.6l4.5 6 5.6-6zm-1.1 16.8h1.8L18.8 15.6h-1.9l10.5 15.2z"/></svg>`),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    image: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1877F2"/><path fill="#fff" d="M28 25h3l-1.2 4H28v12h-5V29h-3v-4h3v-2.5c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2V20h-1.5c-1.5 0-2 1-2 2v3z"/></svg>`),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    image: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0A66C2"/><path fill="#fff" d="M14 20h4v16h-4V20zm2-6a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 16 14zM22 20h3.8v2.2h.1c.5-1 1.8-2.2 3.8-2.2 4 0 4.7 2.6 4.7 6v10H30v-8.9c0-2.1 0-4.8-2.9-4.8-2.9 0-3.4 2.3-3.4 4.7V36H22V20z"/></svg>`),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    image: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#FF0000"/><path fill="#fff" d="M38 18.2c-.2-1.3-.9-2.3-2-2.7C34 15 24 15 24 15s-10 0-12 .5c-1.1.4-1.8 1.4-2 2.7C9.5 19.5 9.5 24 9.5 24s0 4.5.5 5.8c.2 1.3.9 2.3 2 2.7 2 .5 12 .5 12 .5s10 0 12-.5c1.1-.4 1.8-1.4 2-2.7.5-1.3.5-5.8.5-5.8s0-4.5-.5-5.8zM21 28V20l8 4-8 4z"/></svg>`),
  },
];

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(raw: string): boolean {
  try {
    const url = new URL(normalizeUrl(raw));
    return !!url.hostname && url.hostname.includes('.');
  } catch {
    return false;
  }
}
