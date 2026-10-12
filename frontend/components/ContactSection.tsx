'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { ThemeColors } from '@/lib/styles';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface ContactSectionProps {
  colors: ThemeColors;
  t: any;
}

interface ServiceOption {
  id: string | number;
  label: string;
  tag?: string;
  desc?: string;
  iconType: 'web' | 'mobile' | 'ai' | 'saas' | 'design' | 'cloud' | 'custom';
}

const DEFAULT_SERVICES: ServiceOption[] = [
  { id: 'web', label: 'Web Development', tag: 'Full-Stack', desc: 'Next.js, React, modern web apps & portals', iconType: 'web' },
  { id: 'mobile', label: 'Mobile Apps', tag: 'iOS & Android', desc: 'React Native, Flutter cross-platform apps', iconType: 'mobile' },
  { id: 'ai', label: 'AI & Automation', tag: 'Intelligent', desc: 'LLM agents, chatbots & business automation', iconType: 'ai' },
  { id: 'saas', label: 'SaaS & ERP Systems', tag: 'Enterprise', desc: 'Hotel, school, hospital & retail management', iconType: 'saas' },
  { id: 'design', label: 'UI/UX Design', tag: 'Figma to Code', desc: 'High-conversion design systems & prototypes', iconType: 'design' },
  { id: 'cloud', label: 'Cloud Architecture & DevOps', tag: 'Scalable', desc: 'AWS, Docker, CI/CD & database optimization', iconType: 'cloud' },
];

const BUDGET_OPTIONS = [
  { value: 'NPR 30,000 – 60,000', label: 'NPR 30,000 – 60,000', tier: 'Starter / MVP', desc: 'Standard business site or portfolio' },
  { value: 'NPR 60,000 – 1,50,000', label: 'NPR 60,000 – 1,50,000', tier: 'Growth Business', desc: 'E-commerce, portal or dynamic web app' },
  { value: 'NPR 1,50,000 – 4,00,000', label: 'NPR 1,50,000 – 4,00,000', tier: 'Advanced Scale', desc: 'Full-stack platform or native mobile app' },
  { value: 'NPR 4,00,000+ / Enterprise', label: 'NPR 4,00,000+ / Enterprise', tier: 'Enterprise Tier', desc: 'Multi-tenant SaaS, ERP or custom ecosystem' },
  { value: 'Flexible / Discuss with Team', label: 'Flexible / Discuss with Team', tier: 'Bespoke Scope', desc: 'Tailored timeline and phased development' },
];

// Clean Real SVG Icons
function ServiceIcon({ type, size = 18, color = 'currentColor' }: { type: string; size?: number; color?: string }) {
  switch (type) {
    case 'web':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'mobile':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'ai':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8.01" y2="16" />
          <line x1="16" y1="16" x2="16.01" y2="16" />
        </svg>
      );
    case 'saas':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'design':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      );
    case 'cloud':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
  }
}

export default function ContactSection({ colors, t }: ContactSectionProps) {
  const { settings: hookSettings } = useSiteSettings();
  const [liveSettings, setLiveSettings] = useState<Record<string, string>>({});
  const isDark = colors.bg !== '#fafafa';

  // Direct real-time fetch from backend API on mount
  useEffect(() => {
    apiFetch('/api/settings')
      .then((data) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setLiveSettings(data);
        }
      })
      .catch((err) => console.warn('Live settings fetch error:', err));
  }, []);

  const settings = { ...hookSettings, ...liveSettings };

  // Real-time services loaded directly from backend API
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>(DEFAULT_SERVICES);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const budgetDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service: 'Web Development',
    budget: 'NPR 60,000 – 1,50,000',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Real-time Nepal Standard Time (NST) clock
  const [nepalTime, setNepalTime] = useState<string>('');
  const [isOfficeOpen, setIsOfficeOpen] = useState<boolean>(true);

  // IntersectionObserver for entrance reveal
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 1. Fetch real-time services from backend on mount
  useEffect(() => {
    apiFetch('/api/services')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ServiceOption[] = data.map((s: any, idx: number) => {
            const titleLower = (s.title || '').toLowerCase();
            let iconType: ServiceOption['iconType'] = 'web';
            if (titleLower.includes('mobile') || titleLower.includes('app')) iconType = 'mobile';
            else if (titleLower.includes('ai') || titleLower.includes('bot') || titleLower.includes('machine')) iconType = 'ai';
            else if (titleLower.includes('saas') || titleLower.includes('erp') || titleLower.includes('management') || titleLower.includes('hotel')) iconType = 'saas';
            else if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) iconType = 'design';
            else if (titleLower.includes('cloud') || titleLower.includes('security') || titleLower.includes('devops')) iconType = 'cloud';

            return {
              id: s.id || idx,
              label: s.title || `Service ${idx + 1}`,
              tag: s.price ? s.price : 'Custom Quote',
              desc: s.desc ? s.desc.slice(0, 55) + '...' : 'Tailored digital architecture',
              iconType,
            };
          });

          // Merge backend services with defaults so list is comprehensive
          const existingLabels = new Set(mapped.map((m) => m.label.toLowerCase()));
          const combined = [...mapped];
          DEFAULT_SERVICES.forEach((ds) => {
            if (!existingLabels.has(ds.label.toLowerCase())) {
              combined.push(ds);
            }
          });

          setAvailableServices(combined);
          if (combined[0] && !formData.service) {
            setFormData((prev) => ({ ...prev, service: combined[0].label }));
          }
        }
      })
      .catch((err) => {
        console.warn('Using standard services fallback:', err);
      });
  }, []);

  // 2. Click outside handlers for custom dropdown models
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setServiceOpen(false);
      }
      if (budgetDropdownRef.current && !budgetDropdownRef.current.contains(e.target as Node)) {
        setBudgetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Section entrance reveal
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 4. Live Nepal Clock
  useEffect(() => {
    const updateNepalClock = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Asia/Kathmandu',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        };
        setNepalTime(now.toLocaleTimeString('en-US', options));

        const hourStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour12: false,
          hour: 'numeric',
        });
        const hour = parseInt(hourStr, 10);
        const dayStr = now.toLocaleDateString('en-US', {
          timeZone: 'Asia/Kathmandu',
          weekday: 'short',
        });

        // Office hours: Sun through Fri, 9:00 AM – 6:00 PM NST
        const isOpen = dayStr !== 'Sat' && hour >= 9 && hour < 18;
        setIsOfficeOpen(isOpen);
      } catch {
        setNepalTime('Nepal (UTC+5:45)');
      }
    };

    updateNepalClock();
    const interval = setInterval(updateNepalClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const phoneRaw = settings.agency_phone || settings.whatsapp_number || '+977 9807544395';
  const phoneClean = (phoneRaw || '9779807544395').replace(/[^0-9]/g, '');
  const emailAddr = settings.agency_email || 'dkodeera2026@gmail.com';
  const officeAddress = settings.agency_address || 'Manigram, Butwal, Nepal';

  // 5. Backend Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and project message.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          service: formData.service,
          serviceNeeded: formData.service,
          budget: formData.budget,
          message: formData.message.trim(),
        }),
      });

      setStatus('success');
      setSubmittedData({
        name: formData.name,
        service: formData.service,
        id: response?.data?.id || 'SUB-' + Math.floor(1000 + Math.random() * 9000),
      });

      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        service: availableServices[0]?.label || 'Web Development',
        budget: 'NPR 60,000 – 1,50,000',
        message: '',
      });
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to submit inquiry. Please try again or WhatsApp us directly.');
    }
  };

  const whatsappInquiryUrl = `https://wa.me/${phoneClean || '9779807544395'}?text=${encodeURIComponent(
    `Hi D-Kode Era team, I would like to consult on a ${formData.service || 'project'}.`
  )}`;

  const currentServiceObj = availableServices.find((s) => s.label === formData.service) || availableServices[0];
  const currentBudgetObj = BUDGET_OPTIONS.find((b) => b.value === formData.budget) || BUDGET_OPTIONS[1];

  return (
    <>
      <section
        id="contact"
        ref={sectionRef}
        style={{
          background: colors.bg,
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          scrollMarginTop: 96,
        }}
      >
        {/* Animated ambient background glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div
            className="contact-ambient-blob-1"
            style={{
              position: 'absolute',
              width: 650,
              height: 650,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 65%)',
              top: '8%',
              left: '-10%',
              filter: 'blur(3px)',
            }}
          />
          <div
            className="contact-ambient-blob-2"
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 65%)',
              bottom: '8%',
              right: '-8%',
              filter: 'blur(3px)',
            }}
          />
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: 'clamp(90px, 10vw, 130px) clamp(20px, 5vw, 80px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div className="contact-grid-container">
            {/* ── Left Column: Live Hub & Real Contact Information ── */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Eyebrow Capsule */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '7px 16px 7px 12px',
                  borderRadius: 999,
                  background: isDark
                    ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)'
                    : 'linear-gradient(90deg, rgba(8, 145, 178, 0.1) 0%, rgba(139, 92, 246, 0.06) 100%)',
                  border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.28)' : 'rgba(8, 145, 178, 0.25)'}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px -4px rgba(6, 182, 212, 0.2)',
                  marginBottom: 22,
                }}
              >
                <span
                  className="contact-radar-dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: colors.cyan,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {t.contactEye || 'Get In Touch'}
                </span>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 11 }}>•</span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isDark ? 'rgba(226, 232, 240, 0.75)' : '#64748b',
                    fontWeight: 600,
                  }}
                >
                  Priority 24h Response
                </span>
              </div>

              {/* Headline */}
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 'clamp(34px, 4.8vw, 56px)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.text} 0%, #38bdf8 50%, #a78bfa 100%)`
                    : `linear-gradient(135deg, ${colors.text} 0%, ${colors.cyan} 50%, #7c3aed 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '0 0 18px 0',
                }}
              >
                {t.contactTitle || 'Let’s Build Something Extraordinary.'}
              </h2>

              {/* Lead quote */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 28 }}>
                <div
                  style={{
                    width: 3,
                    height: 52,
                    borderRadius: 3,
                    background: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)',
                    flexShrink: 0,
                    marginTop: 3,
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.55)',
                  }}
                />
                <p
                  style={{
                    fontSize: 'clamp(15px, 1.1vw, 17px)',
                    color: isDark ? 'rgba(240, 246, 252, 0.9)' : '#334155',
                    lineHeight: 1.7,
                    margin: 0,
                    fontWeight: 450,
                  }}
                >
                  Schedule a technical discovery session with our software architects. We review your requirements and provide a transparent blueprint and estimate within 24 hours — free of charge.
                </p>
              </div>

              {/* Live Nepal Standard Time Clock */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(20, 24, 39, 0.5) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 24px -10px rgba(0,0,0,0.06)',
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        fontWeight: 700,
                        color: colors.text,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {nepalTime || 'Loading Time...'}
                    </span>
                    <span style={{ color: colors.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>NST (UTC+5:45)</span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: colors.muted,
                      marginTop: 3,
                    }}
                  >
                    Butwal Engineering Studio
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 8,
                      background: isOfficeOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                      border: `1px solid ${isOfficeOpen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      color: isOfficeOpen ? '#10b981' : '#a78bfa',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isOfficeOpen ? '#10b981' : '#a78bfa',
                        boxShadow: `0 0 8px ${isOfficeOpen ? '#10b981' : '#a78bfa'}`,
                      }}
                    />
                    {isOfficeOpen ? 'Studio Open Now' : 'After Hours · Active Queue'}
                  </span>
                </div>
              </div>

              {/* Interactive Contact Channels with Real SVG Icons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 1. Address */}
                <div
                  className="contact-channel-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(20, 24, 39, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 100%)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}`,
                    backdropFilter: 'blur(16px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#06b6d4',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: colors.muted,
                          fontWeight: 600,
                        }}
                      >
                        Studio Headquarters
                      </div>
                      <div
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          color: colors.text,
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {officeAddress}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: colors.cyan,
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Butwal HQ
                  </span>
                </div>

                {/* 2. WhatsApp & Phone */}
                <div
                  className="contact-channel-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(20, 24, 39, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 100%)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}`,
                    backdropFilter: 'blur(16px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.16 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
                      </svg>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: colors.muted,
                          fontWeight: 600,
                        }}
                      >
                        Direct WhatsApp & Hotline
                      </div>
                      <div
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          color: colors.text,
                          marginTop: 2,
                        }}
                      >
                        {phoneRaw}
                      </div>
                    </div>
                  </div>
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: '#10b981',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.28)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    className="contact-action-link"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>

                {/* 3. Email */}
                <div
                  className="contact-channel-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(20, 24, 39, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 100%)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}`,
                    backdropFilter: 'blur(16px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: 'rgba(139, 92, 246, 0.12)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a78bfa',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: colors.muted,
                          fontWeight: 600,
                        }}
                      >
                        Official Corporate Email
                      </div>
                      <div
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          color: colors.text,
                          marginTop: 2,
                        }}
                      >
                        {emailAddr}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`mailto:${emailAddr}`}
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: '#a78bfa',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.28)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    className="contact-action-link"
                  >
                    Send Direct Email →
                  </a>
                </div>
              </div>
            </div>

            {/* ── Right Column: High-End Terminal Inquiry Form ── */}
            <div
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(36px)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
              }}
            >
              <div
                className="contact-terminal-card"
                style={{
                  position: 'relative',
                  borderRadius: 24,
                  overflow: 'visible',
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 15, 29, 0.82) 100%)'
                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                  backdropFilter: 'blur(24px)',
                  boxShadow: isDark
                    ? '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 40px -10px rgba(6, 182, 212, 0.18)'
                    : '0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 0 30px -10px rgba(6, 182, 212, 0.1)',
                  padding: 'clamp(28px, 4vw, 42px)',
                }}
              >
                {/* Terminal Header Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 20,
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: colors.muted,
                        letterSpacing: '0.04em',
                      }}
                    >
                      secure-inquiry-protocol.ts
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: colors.cyan,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    ✦ Direct Engineer Dispatch
                  </span>
                </div>

                {/* Success Screen */}
                {status === 'success' ? (
                  <div
                    style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 16,
                      animation: 'contactFadeIn 0.5s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '2px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 24,
                        fontWeight: 800,
                        color: colors.text,
                        margin: 0,
                      }}
                    >
                      Inquiry Logged Into Backend!
                    </h3>

                    <p
                      style={{
                        fontSize: 14,
                        color: isDark ? 'rgba(226, 232, 240, 0.85)' : '#475569',
                        maxWidth: 420,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      Thank you, <strong>{submittedData?.name}</strong>. Your project inquiry for <strong>{submittedData?.service}</strong> has been stored in our backend database. Our lead software architect will review your scope and respond within 24 hours.
                    </p>

                    <div
                      style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: colors.cyan,
                      }}
                    >
                      Database Reference: #{submittedData?.id}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px 22px',
                          borderRadius: 10,
                          background: '#10b981',
                          color: '#050810',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                        }}
                      >
                        <span>Follow Up On WhatsApp →</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                          padding: '12px 20px',
                          borderRadius: 10,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* 1. Custom Choose-Option Model for Service Vertical */}
                    <div ref={serviceDropdownRef} style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <label
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            color: colors.cyan,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          1. Select Service Vertical *
                        </label>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: colors.muted,
                          }}
                        >
                          Real-time Backend Data
                        </span>
                      </div>

                      {/* Dropdown Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setServiceOpen(!serviceOpen);
                          setBudgetOpen(false);
                        }}
                        className="contact-select-trigger"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '13px 16px',
                          borderRadius: 12,
                          background: isDark ? 'rgba(10, 15, 29, 0.75)' : 'rgba(255, 255, 255, 0.95)',
                          border: `1px solid ${serviceOpen ? colors.cyan : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
                          boxShadow: serviceOpen ? `0 0 0 3px rgba(6, 182, 212, 0.2)` : 'none',
                          color: colors.text,
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: `${colors.cyan}16`,
                              border: `1px solid ${colors.cyan}33`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.cyan,
                              flexShrink: 0,
                            }}
                          >
                            <ServiceIcon type={currentServiceObj.iconType} size={17} color={colors.cyan} />
                          </span>
                          <div>
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: colors.text }}>
                              {formData.service}
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: colors.muted }}>
                              {currentServiceObj.tag || 'Specialized Engineering'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: `${colors.cyan}12`,
                              color: colors.cyan,
                              border: `1px solid ${colors.cyan}25`,
                              fontWeight: 600,
                            }}
                          >
                            Choose Option
                          </span>
                          <span
                            style={{
                              transform: serviceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease',
                              color: colors.muted,
                              display: 'flex',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </button>

                      {/* Dropdown Options Popover Model */}
                      {serviceOpen && (
                        <div
                          className="contact-options-dropdown"
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 40,
                            borderRadius: 16,
                            background: isDark ? '#0c1224' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)'}`,
                            boxShadow: isDark
                              ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15)'
                              : '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 20px rgba(6, 182, 212, 0.08)',
                            padding: 8,
                            maxHeight: 280,
                            overflowY: 'auto',
                            animation: 'contactDropdownSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {availableServices.map((svc) => {
                            const isSelected = formData.service === svc.label;
                            return (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, service: svc.label });
                                  setServiceOpen(false);
                                }}
                                className="contact-option-item"
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 12,
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  background: isSelected
                                    ? isDark ? 'rgba(6, 182, 212, 0.14)' : 'rgba(6, 182, 212, 0.08)'
                                    : 'transparent',
                                  border: `1px solid ${isSelected ? 'rgba(6, 182, 212, 0.3)' : 'transparent'}`,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                  <span
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 8,
                                      background: isSelected ? `${colors.cyan}25` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: isSelected ? colors.cyan : colors.muted,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <ServiceIcon type={svc.iconType} size={16} color={isSelected ? colors.cyan : undefined} />
                                  </span>
                                  <div style={{ minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontFamily: "'Outfit', sans-serif",
                                        fontSize: 14,
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? colors.cyan : colors.text,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {svc.label}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: colors.muted,
                                      }}
                                    >
                                      {svc.desc || svc.tag}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  {svc.tag && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        padding: '2px 7px',
                                        borderRadius: 6,
                                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                        color: colors.muted,
                                      }}
                                    >
                                      {svc.tag}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span style={{ color: colors.cyan, display: 'flex' }}>
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Name & Phone Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="contact-two-cols">
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.12em',
                            color: colors.muted,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dipendra Prasad Gupta"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="contact-input-field"
                          style={{
                            width: '100%',
                            background: isDark ? 'rgba(10, 15, 29, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: colors.text,
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14,
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.12em',
                            color: colors.muted,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +977 98XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="contact-input-field"
                          style={{
                            width: '100%',
                            background: isDark ? 'rgba(10, 15, 29, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: colors.text,
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14,
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                        />
                      </div>
                    </div>

                    {/* Email & Organization Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="contact-two-cols">
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.12em',
                            color: colors.muted,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="contact-input-field"
                          style={{
                            width: '100%',
                            background: isDark ? 'rgba(10, 15, 29, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: colors.text,
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14,
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.12em',
                            color: colors.muted,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: 6,
                          }}
                        >
                          Organization / Company
                        </label>
                        <input
                          type="text"
                          placeholder="Optional"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="contact-input-field"
                          style={{
                            width: '100%',
                            background: isDark ? 'rgba(10, 15, 29, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                            borderRadius: 10,
                            padding: '12px 14px',
                            color: colors.text,
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14,
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                        />
                      </div>
                    </div>

                    {/* 2. Custom Choose-Option Model for Estimated Budget Bracket */}
                    <div ref={budgetDropdownRef} style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <label
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            color: '#a78bfa',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          2. Estimated Budget Bracket
                        </label>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: colors.muted,
                          }}
                        >
                          Choose Bracket
                        </span>
                      </div>

                      {/* Dropdown Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetOpen(!budgetOpen);
                          setServiceOpen(false);
                        }}
                        className="contact-select-trigger"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '13px 16px',
                          borderRadius: 12,
                          background: isDark ? 'rgba(10, 15, 29, 0.75)' : 'rgba(255, 255, 255, 0.95)',
                          border: `1px solid ${budgetOpen ? '#8b5cf6' : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
                          boxShadow: budgetOpen ? `0 0 0 3px rgba(139, 92, 246, 0.2)` : 'none',
                          color: colors.text,
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#8b5cf616',
                              border: '1px solid #8b5cf633',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#a78bfa',
                              flexShrink: 0,
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="6" width="20" height="12" rx="2" />
                              <circle cx="12" cy="12" r="2" />
                              <path d="M6 12h.01M18 12h.01" />
                            </svg>
                          </span>
                          <div>
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: colors.text }}>
                              {currentBudgetObj.label}
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: colors.muted }}>
                              {currentBudgetObj.tier} • {currentBudgetObj.desc}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#8b5cf612',
                              color: '#a78bfa',
                              border: '1px solid #8b5cf625',
                              fontWeight: 600,
                            }}
                          >
                            Choose Option
                          </span>
                          <span
                            style={{
                              transform: budgetOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease',
                              color: colors.muted,
                              display: 'flex',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      </button>

                      {/* Dropdown Options Popover Model */}
                      {budgetOpen && (
                        <div
                          className="contact-options-dropdown"
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 40,
                            borderRadius: 16,
                            background: isDark ? '#0c1224' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)'}`,
                            boxShadow: isDark
                              ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.15)'
                              : '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 20px rgba(139, 92, 246, 0.08)',
                            padding: 8,
                            maxHeight: 280,
                            overflowY: 'auto',
                            animation: 'contactDropdownSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {BUDGET_OPTIONS.map((tier, idx) => {
                            const isSelected = formData.budget === tier.value;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, budget: tier.value });
                                  setBudgetOpen(false);
                                }}
                                className="contact-option-item"
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 12,
                                  padding: '11px 14px',
                                  borderRadius: 10,
                                  background: isSelected
                                    ? isDark ? 'rgba(139, 92, 246, 0.14)' : 'rgba(139, 92, 246, 0.08)'
                                    : 'transparent',
                                  border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.3)' : 'transparent'}`,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                  <span
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 8,
                                      background: isSelected ? '#8b5cf625' : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: isSelected ? '#a78bfa' : colors.muted,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="2" y="6" width="20" height="12" rx="2" />
                                      <circle cx="12" cy="12" r="2" />
                                    </svg>
                                  </span>
                                  <div style={{ minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontFamily: "'Outfit', sans-serif",
                                        fontSize: 14,
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? '#a78bfa' : colors.text,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {tier.label}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: colors.muted,
                                      }}
                                    >
                                      {tier.desc}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontFamily: "'JetBrains Mono', monospace",
                                      padding: '2px 7px',
                                      borderRadius: 6,
                                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                      color: colors.muted,
                                    }}
                                  >
                                    {tier.tier}
                                  </span>
                                  {isSelected && (
                                    <span style={{ color: '#a78bfa', display: 'flex' }}>
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Message Area */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          letterSpacing: '0.12em',
                          color: colors.muted,
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          marginBottom: 6,
                        }}
                      >
                        Project Scope & Goals *
                      </label>
                      <textarea
                        required
                        placeholder="Describe your vision, target audience, expected deliverables, preferred timeline..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="contact-input-field"
                        style={{
                          width: '100%',
                          height: 115,
                          background: isDark ? 'rgba(10, 15, 29, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                          borderRadius: 10,
                          padding: '12px 14px',
                          color: colors.text,
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 14,
                          outline: 'none',
                          resize: 'none',
                          lineHeight: 1.6,
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                      />
                    </div>

                    {/* Error Notice */}
                    {status === 'error' && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{errorMessage || 'Failed to send inquiry. Please try again.'}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="contact-submit-btn"
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '15px 28px',
                        borderRadius: 12,
                        background: colors.cyan,
                        color: '#050810',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        border: 'none',
                        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        opacity: status === 'loading' ? 0.75 : 1,
                        boxShadow: '0 8px 30px rgba(6, 182, 212, 0.35)',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        overflow: 'hidden',
                      }}
                    >
                      {status === 'loading' ? (
                        <>
                          <span
                            className="contact-spinner"
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: '2px solid rgba(5,8,16,0.3)',
                              borderTopColor: '#050810',
                              display: 'inline-block',
                            }}
                          />
                          <span>Transmitting to Studio...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Project Inquiry</span>
                          <span className="contact-btn-arrow">→</span>
                        </>
                      )}
                    </button>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        color: colors.muted,
                        fontFamily: "'JetBrains Mono', monospace",
                        marginTop: -6,
                      }}
                    >
                      <span>🔒 SSL Encrypted & Non-Disclosure Protected</span>
                      <span>⚡ 24hr Turnaround</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoped CSS for Contact Section */}
      <style>{`
        .contact-grid-container {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.25fr);
          gap: 68px;
          align-items: flex-start;
        }

        /* Ambient Keyframe Drift */
        @keyframes contactBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -25px) scale(1.06); }
        }
        @keyframes contactBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 30px) scale(1.05); }
        }
        .contact-ambient-blob-1 { animation: contactBlob1 14s ease-in-out infinite; }
        .contact-ambient-blob-2 { animation: contactBlob2 16s ease-in-out infinite; }

        /* Radar ping */
        @keyframes contactRadarPing {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .contact-radar-dot { animation: contactRadarPing 2.2s infinite; }

        /* Spinner keyframe */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .contact-spinner { animation: spin 0.8s linear infinite; }

        /* Dropdown Slide Animation */
        @keyframes contactDropdownSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Fade in */
        @keyframes contactFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Channel Card Hover */
        .contact-channel-card:hover {
          transform: translateY(-2px);
          border-color: rgba(6, 182, 212, 0.35) !important;
          box-shadow: 0 10px 24px -8px rgba(6, 182, 212, 0.15);
        }
        .contact-action-link:hover {
          background: rgba(6, 182, 212, 0.22) !important;
        }

        /* Dropdown Item Hover */
        .contact-option-item:hover {
          background: ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'} !important;
        }

        /* Input field focus styles */
        .contact-input-field:focus {
          border-color: ${colors.cyan} !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2) !important;
        }

        /* Submit Button Hover */
        .contact-submit-btn:hover:not(:disabled) {
          box-shadow: 0 12px 38px rgba(6, 182, 212, 0.55) !important;
          transform: translateY(-2px);
        }
        .contact-submit-btn:hover:not(:disabled) .contact-btn-arrow {
          transform: translateX(4px);
        }
        .contact-btn-arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .contact-grid-container {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 600px) {
          .contact-two-cols {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
