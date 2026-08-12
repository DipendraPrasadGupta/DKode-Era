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
    title: 'QR Code Generator',
    desc: 'Clean, Canva-style controls to create a polished QR code for your link with custom colours and logos.',
    badge: 'Free Tool',
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
    desc: 'Generate optimized prompts for ChatGPT, Claude, and Midjourney to boost design and code workflows.',
    badge: 'AI Powered',
    category: 'Productivity',
    color: tk.purple,
    href: '/pages/contact',
    available: false,
  },
  {
    id: 'color-palette',
    icon: '🎨',
    title: 'Modern Color Palette Generator',
    desc: 'Generate accessible, vibrant glassmorphism and dark mode color palettes for UI designers.',
    badge: 'Design',
    category: 'UI/UX',
    color: tk.green,
    href: '/pages/contact',
    available: false,
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
