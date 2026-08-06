'use client';

import { useState } from 'react';
import { ThemeColors } from '@/lib/styles';

interface ContactSectionProps {
  colors: ThemeColors;
  t: any;
}

export default function ContactSection({ colors, t }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceNeeded: 'Website Development',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const contactInfo = [
    { icon: '📍', label: 'Address', val: 'Butwal-10, Rupandehi, Lumbini Province, Nepal' },
    { icon: '📞', label: 'Phone / WhatsApp', val: '+977-XXXX-XXXXXX' },
    { icon: '✉️', label: 'Email', val: 'info@dkodeera.com' },
    { icon: '🕐', label: 'Working Hours', val: 'Sun–Fri, 9:00 AM – 6:00 PM (Nepal Time)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', email: '', serviceNeeded: 'Website Development', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" style={{ background: colors.bg, position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.3em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 1, background: colors.cyan }} />
              {t.contactEye}
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,54px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
              {t.contactTitle}
            </h2>
            <p style={{ fontSize: 15, color: colors.muted, marginBottom: 36, lineHeight: 1.8 }}>
              Book a free 1-hour consultation. We'll assess your needs and send a detailed quote within 24 hours — at no cost.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {contactInfo.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '18px 20px',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    transition: 'border-color 0.25s',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 9,
                        color: colors.muted,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: 3,
                      }}
                    >
                      {c.label}
                    </div>
                    <div style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>
                      {c.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: '44px 40px' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.2em', color: colors.cyan, textTransform: 'uppercase', marginBottom: 28 }}>
              Send Us a Message
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Your Name
                </div>
                <input
                  type="text"
                  placeholder="Ram Bahadur Thapa"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', background: colors.bg2, border: `1px solid ${colors.border}`, padding: '13px 16px', color: colors.text, fontFamily: "'Outfit',sans-serif", fontSize: 14 }}
                />
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Phone / WhatsApp
                </div>
                <input
                  type="tel"
                  placeholder="+977-98XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ width: '100%', background: colors.bg2, border: `1px solid ${colors.border}`, padding: '13px 16px', color: colors.text, fontFamily: "'Outfit',sans-serif", fontSize: 14 }}
                />
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Email
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{ width: '100%', background: colors.bg2, border: `1px solid ${colors.border}`, padding: '13px 16px', color: colors.text, fontFamily: "'Outfit',sans-serif", fontSize: 14 }}
                />
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Service Needed
                </div>
                <select
                  value={formData.serviceNeeded}
                  onChange={(e) => setFormData({...formData, serviceNeeded: e.target.value})}
                  style={{ width: '100%', background: colors.bg2, border: `1px solid ${colors.border}`, padding: '13px 16px', color: colors.text, fontFamily: "'Outfit',sans-serif", fontSize: 14 }}
                >
                  {['Website Development', 'Mobile App', 'Management System', 'Digital Marketing', 'Branding & Design', 'SaaS Product', 'Other'].map((o, i) => (
                    <option key={i}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.2em', color: colors.muted, textTransform: 'uppercase', marginBottom: 8 }}>
                  Your Message
                </div>
                <textarea
                  placeholder="Brief description of what you need..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  style={{ width: '100%', background: colors.bg2, border: `1px solid ${colors.border}`, padding: '13px 16px', color: colors.text, fontFamily: "'Outfit',sans-serif", fontSize: 14, height: 110, resize: 'none' }}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  background: colors.cyan,
                  color: '#050810',
                  padding: '15px 36px',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                  transition: 'all 0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  justifyContent: 'center',
                }}
              >
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Message →'}
              </button>
              {status === 'error' && (
                <div style={{ color: '#ff4444', fontSize: 12, marginTop: 8 }}>Failed to send message. Please try again.</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
