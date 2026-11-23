import { pageTokens as tk } from '@/lib/pageTokens';

export interface ToolItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  badge: string;
  category: string;
  color: string;
  href: string;
  available: boolean;
}

export const toolsList: ToolItem[] = [
  {
    id: 'image-converter',
    icon: '📑',
    title: 'Universal File & Document Converter',
    desc: 'Convert PDF to Word, Word to PDF, Images to PDF, WebP, PNG, JPG, AVIF, and Favicon with 100% in-browser privacy.',
    badge: 'All-in-One · Free',
    category: 'Utility',
    color: tk.purple,
    href: '/pages/tools/image-converter',
    available: true,
  },
  {
    id: 'date-converter',
    icon: '📅',
    title: 'Nepali (BS) ⇄ English (AD) Date Suite',
    desc: 'Instant Bikram Sambat to Gregorian conversion, date difference, age calculator, and developer Unix epoch converter.',
    badge: 'Popular · Free',
    category: 'Utility',
    color: tk.cyan,
    href: '/pages/tools/date-converter',
    available: true,
  },
  {
    id: 'quote-calc',
    icon: '💰',
    title: 'Project Cost Estimator',
    desc: 'Calculate estimated budget and timeline for custom Web, Mobile, or AI app projects in real-time.',
    badge: 'Interactive',
    category: 'Business',
    color: tk.gold,
    href: '/pages/tools/quote-calc',
    available: true,
  },
  {
    id: 'qr-generator',
    icon: '📱',
    title: 'Shareable QR Code Studio',
    desc: 'Create brand QR codes and share instantly via WhatsApp, AirDrop, clipboard copy, or 1024px print files.',
    badge: 'Shareable · Free',
    category: 'Marketing',
    color: tk.green,
    href: '/pages/tools/qr-generator',
    available: true,
  },
  {
    id: 'speed-test',
    icon: '⚡',
    title: 'Website Speed & SEO Analyzer',
    desc: 'Audit your website performance, SEO metrics, and core web vitals for instant optimizations.',
    badge: 'Free Tool',
    category: 'Performance',
    color: tk.cyan,
    href: '/pages/contact',
    available: false,
  },
  {
    id: 'ai-prompt',
    icon: '🧠',
    title: 'AI Prompt Studio',
    desc: 'Craft structured, high-yield prompts for ChatGPT, Claude, Gemini, and Midjourney with instant frameworks and templates.',
    badge: 'Featured · AI Studio',
    category: 'Productivity',
    color: tk.purple,
    href: '/pages/tools/ai-prompt',
    available: true,
  },
  {
    id: 'color-palette',
    icon: '🎨',
    title: 'Modern Color Palette Generator',
    desc: 'Generate accessible, vibrant glassmorphism and dark mode color palettes for UI designers with contrast checks and code exports.',
    badge: 'Featured · Free',
    category: 'UI/UX',
    color: tk.green,
    href: '/pages/tools/color-palette',
    available: true,
  },
  {
    id: 'meta-gen',
    icon: '🏷️',
    title: 'Meta Tag & OpenGraph Generator',
    desc: 'Craft social preview tags, Twitter cards, and search engine metadata instantly.',
    badge: 'SEO',
    category: 'Marketing',
    color: tk.red,
    href: '/pages/contact',
    available: false,
  },
  {
    id: 'snaptext',
    icon: '🔍',
    title: 'SnapText – Image to Editable Text',
    desc: 'Extract editable text from screenshots, scanned documents, and photographs with OCR. Supports Nepali and English.',
    badge: 'OCR · Nepali & English',
    category: 'Utility',
    color: tk.green,
    href: '/pages/tools/snaptext',
    available: true,
  },
  {
    id: 'nepalitype',
    icon: '🇳🇵',
    title: 'NepaliType – Smart Nepali Typing',
    desc: 'Type Nepali using English letters and convert into Devanagari Unicode. Includes Unicode cleanup and Preeti font converter.',
    badge: 'Smart Typing · Free',
    category: 'Utility',
    color: tk.cyan,
    href: '/pages/tools/nepalitype',
    available: true,
  },
  {
    id: 'typing-test',
    icon: '⌨️',
    title: 'Typing Speed Test',
    desc: 'Measure your WPM, accuracy, and typing progress with real-time analytics, live keyboard, and fun difficulty modes.',
    badge: 'Fun & Interactive',
    category: 'Productivity',
    color: tk.cyan,
    href: '/pages/tools/typing-test',
    available: true,
  },
  {
    id: 'json-formatter',
    icon: '🛠️',
    title: 'JSON Formatter & Validator',
    desc: 'Format, validate, sanitize, and convert raw JSON data with syntax highlighting.',
    badge: 'Developer',
    category: 'Utility',
    color: tk.cyan,
    href: '/pages/contact',
    available: false,
  },
];

export const toolCategories = ['All', 'Business', 'Marketing', 'Performance', 'Productivity', 'UI/UX', 'SEO', 'Utility'];
