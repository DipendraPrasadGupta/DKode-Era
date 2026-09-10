'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import ServiceDetailPage from '@/components/ServiceDetailPage';
import { usePages } from '@/context/PagesContext';

const tk = {
  bg: '#050810',
  text: '#e8edf5',
  textMuted: '#9ab0c8',
  cyan: '#00d4ff',
  purple: '#a855f7',
  border: 'rgba(99,179,237,0.12)',
  fontDisplay: "'Syne', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

export default function ServicePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { colors, dark } = usePages();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch(`/api/services/${slug}`);

        if (!data) {
          setError('Service not found');
          setService(null);
          return;
        }

        // Parse JSON fields if string
        const tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags || [];
        const rawPricing = typeof data.pricing === 'string' ? JSON.parse(data.pricing) : data.pricing || [];

        // Build rich transformed service object
        const transformed = {
          slug: slug,
          icon: data.icon || '',
          title: data.title,
          shortDesc: data.desc,
          longDescription: data.desc,
          price: data.price || (rawPricing[0]?.price || ''),
          features: tags.map((tag: string) => `${tag} Integration & Implementation`),
          benefits: [],
          process: [],
          technologies: tags,
          pricing: rawPricing,
          faqs: [],
        };

        setService(transformed);
      } catch (err) {
        console.error('Error loading service:', err);
        setError('Failed to load service details');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  /* ── SKELETON LOADING STATE ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: tk.bg, color: tk.text, padding: '120px 20px 80px', display: 'flex', justifyContent: 'center' }}>
        <style>{`
          @keyframes pulse-bg {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .sk-box {
            background: rgba(13,20,37,0.8);
            border-radius: 8px;
            animation: pulse-bg 1.5s ease-in-out infinite;
          }
        `}</style>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <div className="sk-box" style={{ width: 120, height: 16, marginBottom: 40 }} />
          <div className="sk-box" style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 24 }} />
          <div className="sk-box" style={{ width: '70%', height: 48, marginBottom: 20 }} />
          <div className="sk-box" style={{ width: '90%', height: 24, marginBottom: 40 }} />
          <div style={{ display: 'flex', gap: 16, marginBottom: 60 }}>
            <div className="sk-box" style={{ width: 140, height: 44, borderRadius: 8 }} />
            <div className="sk-box" style={{ width: 140, height: 44, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <div className="sk-box" style={{ height: 160 }} />
            <div className="sk-box" style={{ height: 160 }} />
            <div className="sk-box" style={{ height: 160 }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── 404 / ERROR STATE ── */
  if (error || !service) {
    return (
      <div style={{ minHeight: '100vh', background: tk.bg, color: tk.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
          <h1 style={{ fontFamily: tk.fontDisplay, fontSize: 36, fontWeight: 800, marginBottom: 14, color: tk.text }}>
            Service Not Found
          </h1>
          <p style={{ color: tk.textMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            The service <code style={{ color: tk.cyan, fontFamily: tk.fontMono }}>{slug}</code> could not be found or may have been updated.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/pages/services')}
              style={{
                padding: '12px 24px', background: tk.cyan, color: '#050810',
                border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Browse All Services
            </button>
            <Link
              href="/pages/contact"
              style={{
                padding: '12px 24px', background: 'transparent', color: tk.cyan,
                border: `1.5px solid ${tk.cyan}`, borderRadius: 8, fontWeight: 600,
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ServiceDetailPage
      service={service}
      colors={colors}
      dark={dark}
    />
  );
}
