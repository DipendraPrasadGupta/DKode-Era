'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { pageTokens as tk } from '@/lib/pageTokens';
import { useSiteSettings } from '@/lib/useSiteSettings';

const services = [
  'Web Development', 'Mobile App (iOS/Android)', 'UI/UX Design',
  'SaaS / Platform', 'AI Integration', 'Cloud & DevOps',
  'Cybersecurity Audit', 'Digital Marketing', 'Other',
];

const budgets = [
  'Under Rs. 20,000', 'Rs. 20,000 – 50,000', 'Rs. 50,000 – 1,50,000',
  'Rs. 1,50,000 – 5,00,000', 'Rs. 5,00,000+', 'Not sure yet',
];

const timelines = [
  'ASAP (within 1 week)', '2–4 weeks', '1–3 months', '3–6 months', 'Flexible',
];

export default function ContactPage() {
  const { settings } = useSiteSettings();

  const contactInfo = [
    { icon: '📍', label: 'Our Office', value: settings.agency_address || 'Butwal-10, Rupandehi, Lumbini Province, Nepal', color: tk.cyan },
    { icon: '📧', label: 'Email Us', value: settings.agency_email || 'hello@dkodeera.com', color: tk.purple },
    { icon: '📱', label: 'Call / WhatsApp', value: settings.agency_phone || '+977-9800000000', color: tk.green },
    { icon: '🕐', label: 'Office Hours', value: settings.business_hours || 'Sunday – Friday: 9AM – 6PM NST', color: tk.gold },
  ];
  const [form, setForm] = useState({
    name: '', phone: '', email: '', company: '',
    service: '', budget: '', timeline: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus('error');
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }
    setStatus('sending');
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setStatus('success');
      setForm({ name: '', phone: '', email: '', company: '', service: '', budget: '', timeline: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Network error. Please try again.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(13,20,37,0.8)',
    border: `1px solid ${tk.border}`,
    borderRadius: 8, color: tk.text,
    fontSize: 14, fontFamily: tk.fontBody,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: tk.textDim, letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 8,
    fontFamily: tk.fontMono,
  };

  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #050810 0%, #0d1220 60%, #131a30 100%)',
        minHeight: '50vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', textAlign: 'center',
        borderBottom: `1px solid ${tk.border}`,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', padding: '8px 18px',
            background: 'rgba(0,212,255,0.08)', border: `1px solid rgba(0,212,255,0.25)`,
            borderRadius: 20, color: tk.cyan, fontSize: 12,
            fontFamily: tk.fontMono, letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>◎ 24h Response Guaranteed</div>
          <h1 style={{
            fontFamily: tk.fontDisplay, fontSize: 'clamp(36px,6vw,68px)',
            fontWeight: 800, color: tk.text, lineHeight: 1.1,
            marginBottom: 20, letterSpacing: '-0.03em',
          }}>
            Let&apos;s Build Something<br />
            <span style={{ color: tk.cyan }}>Great Together.</span>
          </h1>
          <p style={{ fontSize: 17, color: tk.textMuted, maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
            Whether you have a full project spec or just an idea on a napkin — reach out. We&apos;ll respond within 24 hours and schedule a free consultation.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div className="contact-main-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 64, alignItems: 'start' }}>

          {/* Contact Form */}
          <div>
            <div style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.cyan, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>GET IN TOUCH</div>
            <h2 style={{ fontFamily: tk.fontDisplay, fontSize: 32, fontWeight: 800, color: tk.text, marginBottom: 32 }}>Send Us a Message</h2>

            {status === 'success' && (
              <div style={{ padding: '20px 24px', background: 'rgba(0,229,160,0.08)', border: `1px solid rgba(0,229,160,0.3)`, borderRadius: 10, color: tk.green, marginBottom: 32, fontSize: 15, fontWeight: 600 }}>
                ✅ Message sent! We&apos;ll get back to you within 24 hours.
              </div>
            )}
            {status === 'error' && (
              <div style={{ padding: '16px 20px', background: 'rgba(255,107,107,0.08)', border: `1px solid rgba(255,107,107,0.3)`, borderRadius: 10, color: tk.red, marginBottom: 24, fontSize: 14 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name + Phone */}
              <div className="form-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Hari Bahadur" required />
                </div>
                <div>
                  <label style={labelStyle}>Phone / WhatsApp</label>
                  <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+977 98XXXXXXXX" />
                </div>
              </div>

              {/* Email + Company */}
              <div className="form-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="hello@yourbiz.com.np" required />
                </div>
                <div>
                  <label style={labelStyle}>Company / Business</label>
                  <input style={inputStyle} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your Business Name" />
                </div>
              </div>

              {/* Service */}
              <div>
                <label style={labelStyle}>What service do you need?</label>
                <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.service} onChange={e => set('service', e.target.value)}>
                  <option value="">Select a service...</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Budget + Timeline */}
              <div className="form-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Budget Range</label>
                  <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.budget} onChange={e => set('budget', e.target.value)}>
                    <option value="">Select budget...</option>
                    {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Timeline</label>
                  <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.timeline} onChange={e => set('timeline', e.target.value)}>
                    <option value="">Select timeline...</option>
                    {timelines.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>Tell us about your project *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 160, resize: 'vertical', lineHeight: 1.7 }}
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder="Describe your project, goals, and any specific requirements..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '15px 32px', background: tk.cyan, color: '#050810',
                  border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
                  fontFamily: tk.fontBody, cursor: status === 'sending' ? 'wait' : 'pointer',
                  opacity: status === 'sending' ? 0.7 : 1,
                  transition: 'all 0.2s', alignSelf: 'flex-start',
                  boxShadow: `0 4px 20px rgba(0,212,255,0.25)`,
                }}
              >
                {status === 'sending' ? '⏳ Sending...' : '🚀 Send Message →'}
              </button>
            </form>
          </div>

          {/* Sidebar: Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontFamily: tk.fontMono, fontSize: 11, color: tk.cyan, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>CONTACT INFO</div>
            {contactInfo.map((c) => (
              <div key={c.label} style={{ padding: 22, background: 'rgba(13,20,37,0.6)', border: `1px solid ${tk.border}`, borderRadius: 12, borderLeft: `3px solid ${c.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <span style={{ fontSize: 11, color: c.color, fontFamily: tk.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.label}</span>
                </div>
                <div style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.6 }}>{c.value}</div>
              </div>
            ))}

            {/* Why us quick pitch */}
            <div style={{ padding: 24, background: `rgba(0,212,255,0.04)`, border: `1px solid rgba(0,212,255,0.15)`, borderRadius: 12, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 12 }}>Why D-Kode Era?</div>
              {[
                '⚡ Response within 24 hours',
                '✅ Fixed price, no surprises',
                '🇳🇵 eSewa & Khalti accepted',
                '🛡️ 30 days free support',
                '📍 Based in Butwal — reachable',
              ].map((item) => (
                <div key={item} style={{ fontSize: 13, color: tk.textMuted, marginBottom: 8, lineHeight: 1.5 }}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder / location card */}
      <section style={{ padding: '0 clamp(20px,5vw,80px) clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="contact-map-grid" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(168,85,247,0.04))',
            border: `1px solid ${tk.border}`, borderRadius: 16, padding: 'clamp(24px,4vw,48px)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>FIND US</div>
              <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 28, fontWeight: 800, color: tk.text, marginBottom: 16 }}>Visit Our Office</h3>
              <p style={{ fontSize: 15, color: tk.textMuted, lineHeight: 1.8, marginBottom: 24 }}>
                We&apos;re based in the heart of Butwal. Drop in any time during office hours — no appointment needed. We love meeting clients face to face.
              </p>
              <div style={{ fontSize: 14, color: tk.textMuted, lineHeight: 2 }}>
                📍 {settings.agency_address || 'Butwal-10, Rupandehi, Nepal'}
              </div>
            </div>
            <div style={{
              background: 'rgba(13,20,37,0.8)', border: `1px solid ${tk.border}`,
              borderRadius: 12, padding: 32, textAlign: 'center',
              height: 220, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 48 }}>🗺️</div>
              <div style={{ fontSize: 14, color: tk.textMuted }}>Butwal, Rupandehi, Nepal</div>
              <a
                href="https://maps.google.com/?q=Butwal,Nepal"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '10px 24px', background: 'transparent', color: tk.cyan, border: `1px solid ${tk.cyan}`, borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 768px) {
          .contact-main-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .form-row-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-map-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </>
  );
}
