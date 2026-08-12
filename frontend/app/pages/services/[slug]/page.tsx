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

        // Fetch direct slug endpoint from backend
        let data: any = null;
        try {
          data = await apiFetch(`/api/services/${slug}`);
        } catch {
          // Fallback: fetch all services and match locally
          const allServices = await apiFetch('/api/services');
          const formattedSlug = slug.toLowerCase().replace(/-/g, ' ');
          data = allServices.find((s: any) =>
            s.title.toLowerCase() === formattedSlug ||
            s.title.toLowerCase().replace(/\s+/g, '-') === slug
          );
        }

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
          icon: data.icon || '⚡',
          title: data.title,
          shortDesc: data.desc,
          longDescription: data.desc,
          price: data.price || (rawPricing.length > 0 ? rawPricing[0].price : 'Custom Quote'),
          features: tags.length > 0 ? tags.map((t: string) => `${t} Integration & Implementation`) : [
            'Custom Architecture & Clean Code',
            'Full Responsive & Mobile Optimization',
            'API & Payment Gateway Integration',
            'Security Hardening & SSL Setup',
            'Performance Optimization & Caching',
            '30 Days Free Support & Maintenance',
          ],
          benefits: [
            `Tailored ${data.title} engineered specifically for your business goals`,
            'Fast delivery with regular milestone updates',
            'Full code ownership — no lock-in fees',
            'Seamless integration with eSewa, Khalti & global payment providers',
            'Post-launch maintenance & dedicated local support in Butwal',
            'SEO-optimized for max visibility in Nepal & global markets',
          ],
          process: [
            { step: 1, title: 'Discovery & Consultation', description: 'We analyze your business model, target audience, and functional requirements.' },
            { step: 2, title: 'Architecture & UI Design', description: 'Wireframing and high-fidelity prototype design with your feedback at every step.' },
            { step: 3, title: 'Development & Testing', description: 'Clean, scalable code built with modern frameworks, rigorously tested across devices.' },
            { step: 4, title: 'Deployment & Training', description: 'Smooth launch on secure servers with full team training and documentation.' },
            { step: 5, title: 'Ongoing Support', description: '30 days free post-launch monitoring, updates, and maintenance support.' },
          ],
          technologies: tags.length > 0 ? tags : ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
          pricing: rawPricing.length > 0 ? rawPricing : [
            { tier: 'Starter', price: 'Rs. 25,000', features: ['Core features', 'Mobile responsive', 'Basic SEO', '1 month support'] },
            { tier: 'Professional', price: 'Rs. 50,000', features: ['Full customization', 'API integrations', 'Advanced SEO', 'Priority support'] },
            { tier: 'Enterprise', price: 'Custom Quote', features: ['Dedicated team', 'SLA guarantee', 'Custom architecture', '24/7 support'] },
          ],
          faqs: [
            { question: `How long does a ${data.title} project take?`, answer: `Most ${data.title} projects take between 2 to 6 weeks depending on project scope. We provide a guaranteed delivery date before starting.` },
            { question: 'Do I own the source code and assets?', answer: 'Yes! Upon project completion, 100% of the code, IP rights, and assets belong to you. No ongoing license fees.' },
            { question: 'Can we pay via eSewa, Khalti, or bank transfer?', answer: 'Yes, we accept eSewa, Khalti, local NPR bank transfers, as well as international cards & wire transfers.' },
            { question: 'What happens after the 30 days of free support?', answer: 'You can extend support with our monthly maintenance plans starting from Rs. 3,000/month, or handle maintenance independently.' },
            { question: 'Where is D-Kode Era based?', answer: 'We are headquartered in Butwal-10, Rupandehi. You can visit our office or meet us virtually anytime.' },
          ],
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
