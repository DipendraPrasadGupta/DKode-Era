import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/context/PagesContext';

export const metadata: Metadata = {
  title: 'D-Kode Era - Nepal\'s Premier IT Company',
  description: 'Full-Stack, Mobile Apps, SaaS & Digital Marketing. Built in Butwal for Nepal\'s businesses.',
  keywords: 'IT company Nepal, Web development, Mobile apps, Digital marketing',
  openGraph: {
    title: 'D-Kode Era - Digital Solutions for Nepal',
    description: 'World-class IT services from Butwal, Nepal',
    type: 'website',
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

