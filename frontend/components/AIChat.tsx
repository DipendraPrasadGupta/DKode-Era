'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ThemeColors } from '@/lib/styles';

interface AIChatProps {
  colors: ThemeColors;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  t: any;
  lang: 'en' | 'np';
}

export default function AIChat({ colors, aiOpen, setAiOpen, t, lang }: AIChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [hoveredClose, setHoveredClose] = useState(false);
  const [hoveredToggle, setHoveredToggle] = useState(false);
  const [hoveredSend, setHoveredSend] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<number | null>(null);

  const aiEndRef = useRef<HTMLDivElement>(null);
  const isDark = colors.bg === '#0a0a0f' || colors.bg === '#050810';

  useEffect(() => {
    if (aiOpen) {
      aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiOpen]);

  const sendAI = useCallback(async (textToSend?: string) => {
    const rawText = textToSend || input;
    if (!rawText.trim() || loading) return;
    
    const userMsg = rawText.trim();
    if (!textToSend) setInput('');
    
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      if (!res.ok) throw new Error('API request failed');
      
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm having trouble connecting. Please WhatsApp us at +977-9807544395.";
      
      setMessages(prev => [...prev, { role: 'assistant' as const, content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant' as const, content: 'Sorry, I encountered a connection issue. Please feel free to WhatsApp us directly at +977-9807544395! 🙏' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleSuggestionClick = (suggestionText: string) => {
    sendAI(suggestionText);
  };

  const suggestions = lang === 'np' 
    ? [
        { label: '💸 मूल्य निर्धारण?', text: 'तपाईंको मूल्य निर्धारण के कस्तो छ?' },
        { label: '🛠️ सेवाहरू?', text: 'तपाईंहरूले के-के सेवाहरू प्रदान गर्नुहुन्छ?' },
        { label: '📞 सम्पर्क?', text: 'म तपाईंहरूलाई कसरी सम्पर्क गर्न सक्छु?' }
      ]
    : [
        { label: '💸 Pricing?', text: 'What is your service pricing?' },
        { label: '🛠️ Services?', text: 'What services do you offer?' },
        { label: '📞 Contact?', text: 'How do I contact D-Kode Era?' }
      ];

  return (
    <div style={{ position: 'fixed', bottom: 36, left: 36, zIndex: 999 }}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        onMouseEnter={() => setHoveredToggle(true)}
        onMouseLeave={() => setHoveredToggle(false)}
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: isDark
            ? `linear-gradient(135deg, ${colors.cyan} 0%, #0066cc 100%)`
            : `linear-gradient(135deg, #0891b2 0%, #0369a1 100%)`,
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          boxShadow: hoveredToggle
            ? `0 8px 32px rgba(6, 182, 212, ${isDark ? 0.6 : 0.45})`
            : `0 4px 20px rgba(6, 182, 212, ${isDark ? 0.35 : 0.25})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#050810',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hoveredToggle ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)',
          animation: aiOpen ? 'none' : 'aiFloat 3s ease-in-out infinite',
        }}
        aria-label="Toggle AI Assistant"
      >
        <span style={{ 
          display: 'inline-block', 
          transition: 'transform 0.4s ease', 
          transform: aiOpen ? 'rotate(90deg)' : 'rotate(0)' 
        }}>
          {aiOpen ? '✕' : '🤖'}
        </span>
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes aiFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes textBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .ai-chat-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .ai-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ai-chat-scroll::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(8, 145, 178, 0.2)'};
          border-radius: 10px;
        }
        .ai-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: ${colors.cyan};
        }
      `}</style>

      {/* Chat Window */}
      {aiOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 74,
            left: 0,
            width: 380,
            height: 520,
            background: isDark ? 'rgba(13, 20, 37, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1.5px solid ${isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(8, 145, 178, 0.2)'}`,
            borderRadius: 20,
            boxShadow: isDark
              ? '0 20px 50px -10px rgba(0, 0, 0, 0.65), 0 0 30px rgba(6, 182, 212, 0.08)'
              : '0 20px 50px -10px rgba(15, 23, 42, 0.15), 0 0 20px rgba(8, 145, 178, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #0d1a2e 0%, #051020 100%)'
                : 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)',
              borderBottom: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(8, 145, 178, 0.15)'}`,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.cyan} 0%, #0066cc 100%)`
                    : `linear-gradient(135deg, #0891b2 0%, #0369a1 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ 
                  fontFamily: "'Syne', sans-serif", 
                  fontSize: 15, 
                  fontWeight: 800, 
                  color: isDark ? '#ffffff' : '#0f172a' 
                }}>
                  {t.aiTitle || 'D-Kode AI'}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  fontSize: 11, 
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#475569' 
                }}>
                  <span style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: '#10b981', 
                    display: 'inline-block',
                    animation: 'dotPulse 1.8s infinite'
                  }} />
                  {t.aiSub || 'Online Assistant'}
                </div>
              </div>
            </div>

            {/* Header Close Link */}
            <button
              onClick={() => setAiOpen(false)}
              onMouseEnter={() => setHoveredClose(true)}
              onMouseLeave={() => setHoveredClose(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: hoveredClose ? colors.cyan : (isDark ? 'rgba(255,255,255,0.4)' : '#64748b'),
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'color 0.2s',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Minimize
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="ai-chat-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: isDark ? 'transparent' : '#fafafa',
            }}
          >
            {/* Welcome message */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  borderRadius: '16px 16px 16px 4px',
                  fontSize: 13.5,
                  color: isDark ? 'rgba(228, 228, 231, 0.85)' : '#334155',
                  lineHeight: 1.6,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                }}
              >
                {t.aiWelcome}
              </div>
            </div>

            {/* Message logs */}
            {messages.map((m, i) => {
              const userBubble = m.role === 'user';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: userBubble ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      background: userBubble
                        ? (isDark ? `linear-gradient(135deg, ${colors.cyan} 0%, #0891b2 100%)` : `linear-gradient(135deg, #0891b2 0%, #0e7490 100%)`)
                        : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff'),
                      color: userBubble
                        ? '#050810'
                        : (isDark ? '#e4e4e7' : '#1f2937'),
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      borderRadius: userBubble ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: !userBubble ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 20px',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                    borderRadius: '16px 16px 16px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {[0, 1, 2].map(idx => (
                    <div
                      key={idx}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: colors.cyan,
                        animation: `textBlink 1.4s infinite ease-in-out both`,
                        animationDelay: `${idx * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={aiEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length === 0 && (
            <div style={{
              padding: '10px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              background: isDark ? 'rgba(13, 20, 37, 0.3)' : '#f3f4f6',
              borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)'}`,
            }}>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s.text)}
                  onMouseEnter={() => setHoveredSuggestion(idx)}
                  onMouseLeave={() => setHoveredSuggestion(null)}
                  style={{
                    padding: '8px 12px',
                    background: hoveredSuggestion === idx 
                      ? (isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(8, 145, 178, 0.08)')
                      : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                    color: hoveredSuggestion === idx ? colors.cyan : (isDark ? '#a1a1aa' : '#4b5563'),
                    border: `1px solid ${hoveredSuggestion === idx ? colors.cyan : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)')}`,
                    borderRadius: 14,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
              background: isDark ? '#0a0f1d' : '#ffffff',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAI()}
              placeholder={t.aiPlaceholder}
              disabled={loading}
              style={{
                flex: 1,
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f3f4f6',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: 24,
                padding: '12px 18px',
                color: colors.text,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13.5,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = colors.cyan}
              onBlur={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}
            />
            <button
              onClick={() => sendAI()}
              disabled={loading || !input.trim()}
              onMouseEnter={() => setHoveredSend(true)}
              onMouseLeave={() => setHoveredSend(false)}
              style={{
                background: (loading || !input.trim())
                  ? (isDark ? 'rgba(255, 255, 255, 0.05)' : '#e5e7eb')
                  : colors.cyan,
                color: (loading || !input.trim())
                  ? (isDark ? 'rgba(255, 255, 255, 0.2)' : '#9ca3af')
                  : '#050810',
                border: 'none',
                width: 44,
                height: 44,
                borderRadius: '50%',
                cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                transition: 'all 0.25s',
                transform: hoveredSend && !loading && input.trim() ? 'scale(1.05)' : 'scale(1)',
                boxShadow: hoveredSend && !loading && input.trim() ? `0 4px 12px rgba(6, 182, 212, 0.3)` : 'none',
              }}
              title={t.aiSend}
            >
              ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
