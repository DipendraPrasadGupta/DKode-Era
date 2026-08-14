import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteShell } from '@/context/PagesContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dkodeera.com'),
  title: {
    default: 'D-Kode Era — Nepal\'s Premier Software & IT Company',
    template: '%s | D-Kode Era',
  },
  description:
    'D-Kode Era builds enterprise-grade web apps, mobile apps, SaaS products, and AI-powered tools. Based in Butwal, Nepal — serving businesses nationwide and globally.',
  keywords: [
    'IT company Nepal', 'software company Nepal', 'web development Nepal',
    'mobile app development Nepal', 'SaaS Nepal', 'Next.js development',
    'React development Nepal', 'Butwal IT company', 'D-Kode Era',
    'AI software Nepal', 'digital marketing Nepal',
  ],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/apple-icon.png',
  },
  authors: [{ name: 'Dipendra Prasad Gupta', url: 'https://dkodeera.com' }],
  creator: 'D-Kode Era',
  publisher: 'D-Kode Era',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dkodeera.com',
    siteName: 'D-Kode Era',
    title: 'D-Kode Era — Nepal\'s Premier Software & IT Company',
    description:
      'Enterprise web apps, SaaS, AI agents, and mobile apps built by D-Kode Era — the top IT company in Butwal, Nepal.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'D-Kode Era — Premier IT Company in Nepal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dkodeera',
    creator: '@dkodeera',
    title: 'D-Kode Era — Nepal\'s Premier Software & IT Company',
    description:
      'Enterprise web, mobile, SaaS & AI solutions from Butwal, Nepal.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: 'https://dkodeera.com',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}

