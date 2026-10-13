'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import {
  convertADtoBS,
  convertBStoAD,
  calculateDateDifference,
  toNepaliNumerals,
  NEPALI_MONTHS,
  NEPALI_DAYS,
  POPULAR_TIMEZONES,
  formatInTimezone,
  type BSConversionResult,
} from '@/lib/dateUtils';

type ActiveTab = 'bs-to-ad' | 'ad-to-bs' | 'diff-age' | 'epoch-time' | 'date-math' | 'guide';

export default function DateConverterPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('bs-to-ad');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live ticking clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today in BS for quick reference
  const todayBS = useMemo(() => convertADtoBS(now), [now]);

  // ── State for BS ➔ AD ──────────────────────────────────────────────────────
  const [bsYear, setBsYear] = useState<number>(todayBS.bsYear);
  const [bsMonth, setBsMonth] = useState<number>(todayBS.bsMonth);
  const [bsDay, setBsDay] = useState<number>(todayBS.bsDate);

  // ── State for AD ➔ BS ──────────────────────────────────────────────────────
  const [adDateInput, setAdDateInput] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // ── State for Date Difference & Age ────────────────────────────────────────
  const [diffMode, setDiffMode] = useState<'age' | 'between'>('age');
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');
  const [rangeStart, setRangeStart] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [rangeEnd, setRangeEnd] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // ── State for Epoch / Timestamp ────────────────────────────────────────────
  const [epochInput, setEpochInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [epochUnit, setEpochUnit] = useState<'s' | 'ms'>('s');

  // ── State for Date Math ────────────────────────────────────────────────────
  const [mathStartDate, setMathStartDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [mathAmount, setMathAmount] = useState<number>(14);
  const [mathUnit, setMathUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [mathOperation, setMathOperation] = useState<'add' | 'subtract'>('add');
  const [mathSkipWeekends, setMathSkipWeekends] = useState<boolean>(false);

  // ── Copy helper ────────────────────────────────────────────────────────────
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // ── Conversions ────────────────────────────────────────────────────────────
  const bsToAdResult = useMemo<BSConversionResult | null>(() => {
    try {
      return convertBStoAD(Number(bsYear), Number(bsMonth), Number(bsDay));
    } catch {
      return null;
    }
  }, [bsYear, bsMonth, bsDay]);

  const adToBsResult = useMemo<BSConversionResult | null>(() => {
    try {
      if (!adDateInput) return null;
      const [y, m, d] = adDateInput.split('-').map(Number);
      const parsed = new Date(y, m - 1, d);
      return convertADtoBS(parsed);
    } catch {
      return null;
    }
  }, [adDateInput]);

  // ── Age Calculation ────────────────────────────────────────────────────────
  const ageResult = useMemo(() => {
    try {
      const [y, m, d] = birthDate.split('-').map(Number);
      const bDate = new Date(y, m - 1, d);
      const diff = calculateDateDifference(bDate, now);

      // Next Birthday Countdown
      const nextBday = new Date(now.getFullYear(), m - 1, d);
      if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
      const countdown = calculateDateDifference(now, nextBday);

      return { ...diff, nextBdayCountdown: countdown };
    } catch {
      return null;
    }
  }, [birthDate, now]);

  // ── Range Difference Calculation ───────────────────────────────────────────
  const rangeDiffResult = useMemo(() => {
    try {
      const [y1, m1, d1] = rangeStart.split('-').map(Number);
      const [y2, m2, d2] = rangeEnd.split('-').map(Number);
      return calculateDateDifference(new Date(y1, m1 - 1, d1), new Date(y2, m2 - 1, d2));
    } catch {
      return null;
    }
  }, [rangeStart, rangeEnd]);

  // ── Epoch Result ───────────────────────────────────────────────────────────
  const epochResult = useMemo(() => {
    try {
      const num = Number(epochInput.trim());
      if (isNaN(num)) return null;
      const ms = epochUnit === 's' ? num * 1000 : num;
      const date = new Date(ms);
      if (isNaN(date.getTime())) return null;
      const bs = convertADtoBS(date);
      return {
        iso: date.toISOString(),
        utc: date.toUTCString(),
        npt: formatInTimezone(date, 'Asia/Kathmandu').full,
        bsFormatted: bs.bsFormattedEn,
        bsNpFormatted: bs.bsFormattedNp,
      };
    } catch {
      return null;
    }
  }, [epochInput, epochUnit]);

  // ── Date Math Result ───────────────────────────────────────────────────────
  const mathResult = useMemo(() => {
    try {
      const [y, m, d] = mathStartDate.split('-').map(Number);
      const base = new Date(y, m - 1, d);
      const target = new Date(base);
      const factor = mathOperation === 'add' ? 1 : -1;

      if (mathSkipWeekends && mathUnit === 'days') {
        let added = 0;
        while (added < mathAmount) {
          target.setDate(target.getDate() + factor);
          // In Nepal, Saturday is day 6
          if (target.getDay() !== 6) {
            added++;
          }
        }
      } else {
        if (mathUnit === 'days') target.setDate(target.getDate() + factor * mathAmount);
        if (mathUnit === 'weeks') target.setDate(target.getDate() + factor * mathAmount * 7);
        if (mathUnit === 'months') target.setMonth(target.getMonth() + factor * mathAmount);
        if (mathUnit === 'years') target.setFullYear(target.getFullYear() + factor * mathAmount);
      }

      const bs = convertADtoBS(target);
      return {
        targetDate: target,
        iso: target.toISOString().split('T')[0],
        full: target.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        bsFormatted: bs.bsFormattedEn,
        bsNpFormatted: bs.bsFormattedNp,
      };
    } catch {
      return null;
    }
  }, [mathStartDate, mathAmount, mathUnit, mathOperation, mathSkipWeekends]);

  // ── Preset Quick Setters ───────────────────────────────────────────────────
  const setAdToday = () => {
    const d = new Date();
    setAdDateInput(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const setBsToday = () => {
    setBsYear(todayBS.bsYear);
    setBsMonth(todayBS.bsMonth);
    setBsDay(todayBS.bsDate);
  };

  // Generate BS years range 2000 to 2095
  const bsYearsList = useMemo(() => {
    const list = [];
    for (let y = 2095; y >= 2000; y--) list.push(y);
    return list;
  }, []);

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* ── Top Header / Hero ────────────────────────────────────────────── */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(0,212,255,0.12), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(168,85,247,0.1), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 40px',
          borderBottom: `1px solid ${tk.border}`,
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <Link
            href="/pages/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontFamily: tk.fontMono,
              color: tk.textDim,
              textDecoration: 'none',
              marginBottom: 24,
              letterSpacing: '0.05em',
            }}
          >
            ← Back to Tools
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: 680 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.25)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: tk.cyan,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                🇳🇵 Free Digital Suite · Bikram Sambat & Gregorian
              </div>

              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 54px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                Nepali & English{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Date Converter
                </span>
              </h1>

              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.7, maxWidth: 620, margin: 0 }}>
                Instant two-way conversion between Bikram Sambat (BS) and Gregorian (AD) calendars, exact age & duration calculations, developer Unix timestamps, and Nepal world clock.
              </p>
            </div>

            {/* Live Today Badge Widget */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 16,
                padding: '16px 20px',
                minWidth: 280,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: tk.green, boxShadow: `0 0 10px ${tk.green}` }} />
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Live Time (NPT UTC+5:45)
                </span>
              </div>
              <div style={{ fontFamily: tk.fontMono, fontSize: 22, fontWeight: 800, color: tk.text, marginBottom: 4 }}>
                {formatInTimezone(now, 'Asia/Kathmandu').time}
              </div>
              <div style={{ fontSize: 13, color: tk.cyan, fontWeight: 600, marginBottom: 2 }}>
                🇳🇵 {todayBS.bsFormattedEn} ({todayBS.bsStandardIso})
              </div>
              <div style={{ fontSize: 12, color: tk.textDim }}>
                🌐 {todayBS.adFormatted}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Interactive Section ─────────────────────────────────────── */}
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 32,
            borderBottom: `1px solid ${tk.border}`,
            paddingBottom: 16,
          }}
        >
          {[
            { id: 'bs-to-ad', label: '🇳🇵 BS ➔ AD', desc: 'Nepali to English' },
            { id: 'ad-to-bs', label: '🌐 AD ➔ BS', desc: 'English to Nepali' },
            { id: 'diff-age', label: '⏳ Age & Difference', desc: 'Days & Duration' },
            { id: 'epoch-time', label: '⏱️ Timestamp & Epoch', desc: 'Developer Timestamps' },
            { id: 'date-math', label: '➕ Date Arithmetic', desc: 'Add/Subtract Days' },
            { id: 'guide', label: '📖 Nepali Months', desc: 'Seasons & Festivals' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              style={{
                background: activeTab === tab.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                color: activeTab === tab.id ? tk.cyan : tk.textDim,
                border: `1px solid ${activeTab === tab.id ? 'rgba(0,212,255,0.4)' : tk.border}`,
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: 10, color: activeTab === tab.id ? 'rgba(0,212,255,0.8)' : 'rgba(255,255,255,0.4)', fontFamily: tk.fontMono }}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: BS ➔ AD (Nepali to English) ─────────────────────────── */}
        {activeTab === 'bs-to-ad' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Input Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 18,
                padding: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: tk.fontDisplay, fontWeight: 700, color: tk.cyan }}>
                  Select Nepali (BS) Date
                </h3>
                <button
                  onClick={setBsToday}
                  style={{
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    color: tk.cyan,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Today
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                    BS Year (वर्ष)
                  </label>
                  <select
                    value={bsYear}
                    onChange={e => setBsYear(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      color: tk.text,
                      fontSize: 15,
                      fontFamily: tk.fontMono,
                    }}
                  >
                    {bsYearsList.map(y => (
                      <option key={y} value={y} style={{ background: '#080d1a', color: '#fff' }}>
                        {y} BS ({toNepaliNumerals(y)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                    BS Month (महिना)
                  </label>
                  <select
                    value={bsMonth}
                    onChange={e => setBsMonth(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      color: tk.text,
                      fontSize: 15,
                      fontFamily: tk.fontMono,
                    }}
                  >
                    {NEPALI_MONTHS.map(m => (
                      <option key={m.index} value={m.index + 1} style={{ background: '#080d1a', color: '#fff' }}>
                        {String(m.index + 1).padStart(2, '0')} - {m.enName} ({m.npName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                    BS Day (गते)
                  </label>
                  <select
                    value={bsDay}
                    onChange={e => setBsDay(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      color: tk.text,
                      fontSize: 15,
                      fontFamily: tk.fontMono,
                    }}
                  >
                    {Array.from({ length: 32 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d} style={{ background: '#080d1a', color: '#fff' }}>
                        {d} ({toNepaliNumerals(d)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Conversion Result Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 18,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    ✨ Converted English (AD) Date
                  </span>
                  <span style={{ fontSize: 12, color: tk.textDim }}>
                    {bsToAdResult?.bsDayNameEn} ({bsToAdResult?.bsDayNameNp})
                  </span>
                </div>

                {bsToAdResult ? (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 12, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>
                        Standard Gregorian Format (YYYY-MM-DD)
                      </div>
                      <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: tk.cyan, fontFamily: tk.fontMono }}>
                        {bsToAdResult.adStandardIso}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 24 }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 10, border: `1px solid ${tk.border}` }}>
                        <div style={{ fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Full Formatted English Date</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: tk.text }}>{bsToAdResult.adFormatted}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 10, border: `1px solid ${tk.border}` }}>
                        <div style={{ fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Nepali Devanagari Format</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: tk.text }}>{bsToAdResult.bsFormattedNp}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: tk.red, padding: 20 }}>Invalid BS Date combination. Please adjust day or month.</div>
                )}
              </div>

              {bsToAdResult && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopy(bsToAdResult.adStandardIso, 'bs-ad-iso')}
                    style={{
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: tk.cyan,
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedKey === 'bs-ad-iso' ? '✓ Copied ISO' : '📋 Copy ISO'}
                  </button>

                  <button
                    onClick={() => handleCopy(bsToAdResult.adFormatted, 'bs-ad-full')}
                    style={{
                      background: 'rgba(168,85,247,0.1)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      color: tk.purple,
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedKey === 'bs-ad-full' ? '✓ Copied Full Text' : '📋 Copy Full Text'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: AD ➔ BS (English to Nepali) ─────────────────────────── */}
        {activeTab === 'ad-to-bs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Input Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 18,
                padding: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: tk.fontDisplay, fontWeight: 700, color: tk.purple }}>
                  Select English (AD) Date
                </h3>
                <button
                  onClick={setAdToday}
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    color: tk.purple,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Today
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 8, fontFamily: tk.fontMono }}>
                  Pick Gregorian Date
                </label>
                <input
                  type="date"
                  value={adDateInput}
                  onChange={e => setAdDateInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    color: tk.text,
                    fontSize: 16,
                    fontFamily: tk.fontMono,
                    colorScheme: 'dark',
                  }}
                />
              </div>

              {/* Quick Presets */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 8 }}>
                  Quick Presets:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Yesterday', offset: -1 },
                    { label: 'Tomorrow', offset: 1 },
                    { label: '+7 Days', offset: 7 },
                    { label: '+30 Days', offset: 30 },
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + p.offset);
                        setAdDateInput(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${tk.border}`,
                        color: tk.textDim,
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversion Result Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 18,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    🇳🇵 Converted Nepali (BS) Date
                  </span>
                  <span style={{ fontSize: 12, color: tk.textDim }}>
                    {adToBsResult?.bsDayNameEn} ({adToBsResult?.bsDayNameNp})
                  </span>
                </div>

                {adToBsResult ? (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 12, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>
                        Standard Bikram Sambat (YYYY-MM-DD)
                      </div>
                      <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: tk.purple, fontFamily: tk.fontMono }}>
                        {adToBsResult.bsStandardIso}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: tk.cyan, marginTop: 4 }}>
                        {adToBsResult.bsDevanagariIso}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 24 }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 10, border: `1px solid ${tk.border}` }}>
                        <div style={{ fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Nepali (Devanagari)</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: tk.text }}>{adToBsResult.bsFormattedNp}</div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 10, border: `1px solid ${tk.border}` }}>
                        <div style={{ fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>English Transliteration</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: tk.text }}>{adToBsResult.bsFormattedEn}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: tk.red, padding: 20 }}>Please select a valid Gregorian date.</div>
                )}
              </div>

              {adToBsResult && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopy(adToBsResult.bsStandardIso, 'ad-bs-iso')}
                    style={{
                      background: 'rgba(168,85,247,0.1)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      color: tk.purple,
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedKey === 'ad-bs-iso' ? '✓ Copied BS ISO' : '📋 Copy BS ISO'}
                  </button>

                  <button
                    onClick={() => handleCopy(adToBsResult.bsFormattedNp, 'ad-bs-np')}
                    style={{
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: tk.cyan,
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copiedKey === 'ad-bs-np' ? '✓ Copied Nepali' : '📋 Copy Devanagari'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: AGE & DATE DIFFERENCE ───────────────────────────────── */}
        {activeTab === 'diff-age' && (
          <div>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button
                onClick={() => setDiffMode('age')}
                style={{
                  background: diffMode === 'age' ? tk.cyan : 'rgba(255,255,255,0.03)',
                  color: diffMode === 'age' ? '#050810' : tk.textDim,
                  border: `1px solid ${diffMode === 'age' ? tk.cyan : tk.border}`,
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🎂 Calculate Age
              </button>
              <button
                onClick={() => setDiffMode('between')}
                style={{
                  background: diffMode === 'between' ? tk.cyan : 'rgba(255,255,255,0.03)',
                  color: diffMode === 'between' ? '#050810' : tk.textDim,
                  border: `1px solid ${diffMode === 'between' ? tk.cyan : tk.border}`,
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                📅 Duration Between Two Dates
              </button>
            </div>

            {diffMode === 'age' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 18, fontFamily: tk.fontDisplay, color: tk.cyan }}>
                    Your Date of Birth
                  </h3>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 8, fontFamily: tk.fontMono }}>
                    Select Birthdate (Gregorian AD)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 10,
                      padding: '14px 16px',
                      color: tk.text,
                      fontSize: 16,
                      fontFamily: tk.fontMono,
                      colorScheme: 'dark',
                    }}
                  />
                  <div style={{ marginTop: 16, fontSize: 13, color: tk.textDim }}>
                    💡 Age is accurately calculated against current time in Nepal.
                  </div>
                </div>

                {ageResult && (
                  <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                    <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                      🎉 Exact Age Breakdown
                    </span>

                    <div style={{ margin: '16px 0', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: tk.gold, fontFamily: tk.fontDisplay }}>
                      {ageResult.years} <span style={{ fontSize: 18, color: tk.textDim }}>years</span>, {ageResult.months} <span style={{ fontSize: 18, color: tk.textDim }}>months</span>, {ageResult.days} <span style={{ fontSize: 18, color: tk.textDim }}>days</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Total Days Lived</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.cyan }}>{ageResult.totalDays.toLocaleString()} days</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Total Weeks</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.purple }}>{ageResult.totalWeeks.toLocaleString()} weeks</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Total Hours</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.green }}>{ageResult.totalHours.toLocaleString()} hrs</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Next Birthday in</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: tk.gold }}>
                          {ageResult.nextBdayCountdown.months}m, {ageResult.nextBdayCountdown.days}d
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {diffMode === 'between' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 18, fontFamily: tk.fontDisplay, color: tk.cyan }}>
                    Select Start and End Dates
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>Start Date</label>
                      <input
                        type="date"
                        value={rangeStart}
                        onChange={e => setRangeStart(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text, colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>End Date</label>
                      <input
                        type="date"
                        value={rangeEnd}
                        onChange={e => setRangeEnd(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text, colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
                </div>

                {rangeDiffResult && (
                  <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                    <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                      📊 Date Interval Analysis
                    </span>
                    <div style={{ margin: '16px 0', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: tk.cyan, fontFamily: tk.fontDisplay }}>
                      {rangeDiffResult.summary}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Total Days</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.text }}>{rangeDiffResult.totalDays} days</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Business / Work Days</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.green }}>{rangeDiffResult.businessDays} days (excl. Sat)</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Weeks + Days</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.purple }}>{rangeDiffResult.totalWeeks}w {rangeDiffResult.remainingDays}d</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Total Hours</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tk.gold }}>{rangeDiffResult.totalHours.toLocaleString()} hrs</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: UNIX TIMESTAMP & TIMEZONE ───────────────────────────── */}
        {activeTab === 'epoch-time' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
              {/* Epoch Converter Card */}
              <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontFamily: tk.fontDisplay, color: tk.cyan }}>
                    Developer Unix Epoch
                  </h3>
                  <button
                    onClick={() => setEpochInput(Math.floor(Date.now() / (epochUnit === 's' ? 1000 : 1)).toString())}
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: tk.cyan, padding: '4px 8px', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}
                  >
                    ⚡ Current Epoch
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    value={epochInput}
                    onChange={e => setEpochInput(e.target.value)}
                    placeholder="e.g. 1728888888"
                    style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text, fontFamily: tk.fontMono, fontSize: 15 }}
                  />
                  <select
                    value={epochUnit}
                    onChange={e => setEpochUnit(e.target.value as 's' | 'ms')}
                    style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text, fontFamily: tk.fontMono }}
                  >
                    <option value="s" style={{ background: '#080d1a' }}>Seconds</option>
                    <option value="ms" style={{ background: '#080d1a' }}>Milliseconds</option>
                  </select>
                </div>

                {epochResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono }}>ISO 8601 (UTC)</div>
                      <div style={{ fontSize: 14, fontFamily: tk.fontMono, color: tk.cyan }}>{epochResult.iso}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono }}>Nepal Standard Time (NPT)</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tk.text }}>{epochResult.npt}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono }}>Nepali Bikram Sambat Date</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tk.purple }}>{epochResult.bsFormatted}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: tk.red, fontSize: 13 }}>Invalid Unix Timestamp format.</div>
                )}
              </div>

              {/* Live Nepal Clock Reference */}
              <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontFamily: tk.fontDisplay, color: tk.purple }}>
                  Current System Timestamps
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono }}>Unix Seconds</div>
                      <div style={{ fontSize: 18, fontFamily: tk.fontMono, color: tk.cyan, fontWeight: 700 }}>
                        {Math.floor(now.getTime() / 1000)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(Math.floor(now.getTime() / 1000).toString(), 'copy-secs')}
                      style={{ background: 'rgba(0,212,255,0.1)', border: 'none', color: tk.cyan, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}
                    >
                      {copiedKey === 'copy-secs' ? '✓' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono }}>Unix Milliseconds</div>
                      <div style={{ fontSize: 18, fontFamily: tk.fontMono, color: tk.purple, fontWeight: 700 }}>
                        {now.getTime()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(now.getTime().toString(), 'copy-ms')}
                      style={{ background: 'rgba(168,85,247,0.1)', border: 'none', color: tk.purple, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}
                    >
                      {copiedKey === 'copy-ms' ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Timezones World Clock */}
            <h3 style={{ fontSize: 20, fontFamily: tk.fontDisplay, marginBottom: 16 }}>
              🌍 World Clocks & Timezone Matrix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {POPULAR_TIMEZONES.map(tz => {
                const info = formatInTimezone(now, tz.tz);
                return (
                  <div
                    key={tz.tz}
                    style={{
                      background: `linear-gradient(135deg, ${tk.surface}dd, ${tk.surfaceMuted}88)`,
                      border: `1px solid ${tk.border}`,
                      borderRadius: 14,
                      padding: 18,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: tk.text }}>{tz.city}</span>
                      <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, background: 'rgba(0,212,255,0.08)', padding: '2px 6px', borderRadius: 6 }}>
                        {tz.offset}
                      </span>
                    </div>
                    <div style={{ fontSize: 20, fontFamily: tk.fontMono, fontWeight: 800, color: tk.gold, marginBottom: 4 }}>
                      {info.time}
                    </div>
                    <div style={{ fontSize: 12, color: tk.textDim }}>{info.date}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 5: DATE ARITHMETIC ───────────────────────────────────────── */}
        {activeTab === 'date-math' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18, fontFamily: tk.fontDisplay, color: tk.cyan }}>
                Add or Subtract Duration
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>Start Date</label>
                  <input
                    type="date"
                    value={mathStartDate}
                    onChange={e => setMathStartDate(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text, colorScheme: 'dark' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>Operation</label>
                    <select
                      value={mathOperation}
                      onChange={e => setMathOperation(e.target.value as 'add' | 'subtract')}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text }}
                    >
                      <option value="add" style={{ background: '#080d1a' }}>➕ Add (+)</option>
                      <option value="subtract" style={{ background: '#080d1a' }}>➖ Subtract (-)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>Amount</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={mathAmount}
                      onChange={e => setMathAmount(Math.max(1, Number(e.target.value)))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>Unit</label>
                  <select
                    value={mathUnit}
                    onChange={e => setMathUnit(e.target.value as any)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text }}
                  >
                    <option value="days" style={{ background: '#080d1a' }}>Days</option>
                    <option value="weeks" style={{ background: '#080d1a' }}>Weeks</option>
                    <option value="months" style={{ background: '#080d1a' }}>Months</option>
                    <option value="years" style={{ background: '#080d1a' }}>Years</option>
                  </select>
                </div>

                {mathUnit === 'days' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: tk.text, cursor: 'pointer', marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={mathSkipWeekends}
                      onChange={e => setMathSkipWeekends(e.target.checked)}
                      style={{ accentColor: tk.cyan }}
                    />
                    Skip Saturdays (Calculate Business Days only)
                  </label>
                )}
              </div>
            </div>

            {mathResult && (
              <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  🎯 Projected Target Date
                </span>

                <div style={{ margin: '18px 0', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: tk.cyan, fontFamily: tk.fontMono }}>
                  {mathResult.iso}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Gregorian Full Date</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: tk.text }}>{mathResult.full}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Bikram Sambat (BS)</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: tk.purple }}>{mathResult.bsFormatted}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Nepali Devanagari</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: tk.gold }}>{mathResult.bsNpFormatted}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: NEPALI MONTHS GUIDE ─────────────────────────────────── */}
        {activeTab === 'guide' && (
          <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 18, padding: 28 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontFamily: tk.fontDisplay, color: tk.cyan }}>
              Nepali Calendar Month Reference (विक्रम संवत्)
            </h3>
            <p style={{ color: tk.textDim, fontSize: 14, marginBottom: 24 }}>
              The Bikram Sambat calendar is approximately 56 years and 8.5 months ahead of the Gregorian calendar. Here is the full seasonal and cultural mapping:
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 640 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${tk.border}`, color: tk.textDim, fontSize: 12, fontFamily: tk.fontMono }}>
                    <th style={{ padding: '12px 14px' }}>#</th>
                    <th style={{ padding: '12px 14px' }}>Month (English)</th>
                    <th style={{ padding: '12px 14px' }}>महिना (नेपाली)</th>
                    <th style={{ padding: '12px 14px' }}>Gregorian Range</th>
                    <th style={{ padding: '12px 14px' }}>Season (ऋतु)</th>
                    <th style={{ padding: '12px 14px' }}>Major Festivals</th>
                  </tr>
                </thead>
                <tbody>
                  {NEPALI_MONTHS.map(m => (
                    <tr
                      key={m.index}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        fontSize: 14,
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '14px', fontFamily: tk.fontMono, color: tk.cyan }}>
                        {String(m.index + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: tk.text }}>
                        {m.enName}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 600, color: tk.gold }}>
                        {m.npName}
                      </td>
                      <td style={{ padding: '14px', color: tk.textDim, fontFamily: tk.fontMono, fontSize: 13 }}>
                        {m.adEquivalent}
                      </td>
                      <td style={{ padding: '14px', color: tk.purple }}>
                        {m.season} ({m.seasonNp})
                      </td>
                      <td style={{ padding: '14px', color: tk.textMuted, fontSize: 13 }}>
                        {m.notableFestivals}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
