'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getBlogs } from '@/lib/api/blogs';
import { pageTokens as tk } from '@/lib/pageTokens';
import { API_URL } from '@/lib/api';

const norm = (u?: string | null) => {
  if (!u) return '';
  return u.startsWith('http') ? u : `${API_URL}${u.startsWith('/') ? u : '/' + u}`;
};

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  authorRole: string;
  readTime: string;
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Engineering: '#00d4ff',
  Business: '#a855f7',
  'AI & Tech': '#00e5a0',
  'UI/UX Design': '#f5c842',
  Productivity: '#ff9a3c',
  News: '#ff6b6b',
};

const POPULAR_TAGS = [
  'Engineering',
  'SaaS',
  'AI & Tech',
  'Next.js 15',
  'Nepal Tech',
  'UI/UX Design',
  'Productivity',
  'Cloud Architecture',
  'E-Commerce',
];

const QUICK_TRENDING_SEARCHES = ['AI & Tech', 'Next.js 15', 'SaaS in Nepal', 'UI/UX Design', 'Engineering'];

function formatCount(n: number) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatShortDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe form state
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    getBlogs()
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching blogs:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K or Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = ['All', 'Engineering', 'Business', 'AI & Tech', 'UI/UX Design', 'Productivity', 'News'];

  // Filter posts based on category, search, and selected tag
  const filteredPosts = blogs.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      !selectedTag ||
      p.category.toLowerCase().includes(selectedTag.toLowerCase()) ||
      p.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(selectedTag.toLowerCase());
    return matchesCategory && matchesSearch && matchesTag;
  });

  // Top live search dropdown matching results (max 4)
  const searchSuggestions = searchQuery.trim()
    ? blogs.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const featuredBlog = blogs.find((b) => b.featured) || blogs[0];

  // Recent posts sorted by date
  const recentPosts = [...blogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  // Trending / Popular posts sorted by views & likes
  const trendingPosts = [...blogs].sort((a, b) => (b.views || 0) + (b.likes || 0) * 2 - ((a.views || 0) + (a.likes || 0) * 2)).slice(0, 3);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim() || !subscribeEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      showToast('Thank you for subscribing to D-Kode Era Insights!');
      setSubscribeEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }, 800);
  };

  const handleSearchExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchFocused(true);
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}"...`);
      // Scroll down to articles grid if not already there
      const gridElem = document.getElementById('articles-main-section');
      if (gridElem) {
        gridElem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      searchInputRef.current?.focus();
    }
  };

  return (
    <div style={{ background: tk.bg || '#050810', color: tk.text, minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: tk.cyan,
            color: '#050810',
            padding: '12px 20px',
            borderRadius: 12,
            fontFamily: tk.fontMono,
            fontWeight: 700,
            fontSize: 12,
            zIndex: 9999,
            boxShadow: '0 8px 30px rgba(0,212,255,0.4)',
          }}
        >
          ✓ {toastMsg}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          HERO SECTION WITH VERTICAL STATS ON RIGHT
      ═══════════════════════════════════════════════ */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 80% 20%, rgba(168,85,247,0.14), transparent 60%),
                       radial-gradient(ellipse 800px 700px at 20% 50%, rgba(0,212,255,0.12), transparent 60%),
                       ${tk.bg || '#050810'}`,
          padding: '120px 20px 65px',
          position: 'relative',
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Top Row: Left Title & Description + Right Vertical Stats Card */}
          <div
            className="hero-split-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 310px',
              gap: 40,
              alignItems: 'center',
              marginBottom: 44,
            }}
          >
            {/* LEFT SIDE: Title & Subtitle */}
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  borderRadius: 20,
                  padding: '6px 16px',
                  color: tk.purple,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                📰 D-Kode Era Knowledge Base & Blog
              </div>
              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(34px, 5.2vw, 58px)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  marginBottom: 18,
                  letterSpacing: '-0.03em',
                  color: tk.text,
                }}
              >
                Insights on Tech, AI, and{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.purple}, ${tk.cyan})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Digital Innovation
                </span>
              </h1>
              <p style={{ fontSize: 16.5, color: tk.textDim, lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
                Explore tutorials, architectural blueprints, SaaS insights, and tech deep-dives published live from our engineering team.
              </p>
            </div>

            {/* RIGHT SIDE: Vertical Stats Panel */}
            <div
              style={{
                background: `linear-gradient(135deg, rgba(13,20,37,0.8), rgba(8,13,26,0.6))`,
                border: `1px solid ${tk.borderHover}`,
                borderRadius: 24,
                padding: '24px 26px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
                📊 Platform Metrics
              </div>

              {/* Stat 1: Articles Published */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${tk.cyan}18`,
                    border: `1px solid ${tk.cyan}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  📝
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text, lineHeight: 1 }}>
                    {blogs.length ? `${blogs.length}+` : '12+'}
                  </div>
                  <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4 }}>
                    Articles Published
                  </div>
                </div>
              </div>

              {/* Stat 2: Tech Categories */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${tk.purple}18`,
                    border: `1px solid ${tk.purple}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🗂️
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text, lineHeight: 1 }}>
                    {categories.length - 1}
                  </div>
                  <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4 }}>
                    Tech Categories
                  </div>
                </div>
              </div>

              {/* Stat 3: Monthly Readers */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${tk.green}18`,
                    border: `1px solid ${tk.green}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  👥
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text, lineHeight: 1 }}>
                    12.5k+
                  </div>
                  <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4 }}>
                    Monthly Readers
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════
              ENHANCED SEARCH BAR WITH CLICKABLE SEARCH BUTTON
          ═══════════════════════════════════════════════ */}
          <div ref={searchContainerRef} style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 100 }}>
            <form onSubmit={handleSearchExecute}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 22,
                  padding: 2,
                  background: isSearchFocused
                    ? `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`
                    : `linear-gradient(135deg, ${tk.borderHover}, rgba(255,255,255,0.05))`,
                  transition: 'all 0.3s ease',
                  boxShadow: isSearchFocused
                    ? `0 12px 40px rgba(0, 212, 255, 0.25), 0 0 0 1px ${tk.cyan}80`
                    : '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  style={{
                    background: 'rgba(9, 13, 26, 0.94)',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px 6px 16px',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <span style={{ fontSize: 18, color: isSearchFocused ? tk.cyan : tk.textDim, transition: 'color 0.2s', marginRight: 12, display: 'flex', alignItems: 'center' }}>
                    🔍
                  </span>

                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search articles by title, topic, or author..."
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      background: 'transparent',
                      border: 'none',
                      color: tk.text,
                      fontSize: 14.5,
                      outline: 'none',
                      fontFamily: tk.fontBody,
                    }}
                  />

                  {/* Clear button if typed */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      title="Clear search"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: `1px solid ${tk.border}`,
                        color: tk.textDim,
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12,
                        marginRight: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  )}

                  {/* CLICKABLE SEARCH BUTTON */}
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                      color: '#050810',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 14,
                      fontSize: 13,
                      fontFamily: tk.fontMono,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0,
                      boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <span>Search</span> 🔍
                  </button>
                </div>
              </div>
            </form>

            {/* LIVE SEARCH RESULTS OVERLAY DROPDOWN */}
            {isSearchFocused && searchQuery.trim() && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(10, 15, 30, 0.96)',
                  border: `1px solid ${tk.borderHover}`,
                  borderRadius: 20,
                  padding: '16px 20px',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 30px rgba(0,212,255,0.15)',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'left',
                  maxHeight: 380,
                  overflowY: 'auto',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: `1px solid ${tk.border}`,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Matching Articles ({filteredPosts.length})
                  </span>
                  <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan }}>
                    Press Esc to close
                  </span>
                </div>

                {searchSuggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {searchSuggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/pages/blogs/${item.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        style={{ textDecoration: 'none' }}
                      >
                        <div
                          className="search-suggestion-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid transparent`,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {item.coverImage && (
                            <img
                              src={norm(item.coverImage)}
                              alt={item.title}
                              style={{ width: 44, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: tk.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                              <span
                                style={{
                                  fontSize: 9,
                                  fontFamily: tk.fontMono,
                                  padding: '2px 6px',
                                  borderRadius: 6,
                                  background: `${CATEGORY_COLORS[item.category] || tk.cyan}18`,
                                  color: CATEGORY_COLORS[item.category] || tk.cyan,
                                  fontWeight: 700,
                                }}
                              >
                                {item.category}
                              </span>
                              <span style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono }}>
                                ⏱️ {item.readTime}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: 12, color: tk.cyan, fontFamily: tk.fontMono }}>→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 10px', color: tk.textDim, fontSize: 13 }}>
                    No matching articles found for "{searchQuery}".
                  </div>
                )}
              </div>
            )}

            {/* QUICK TRENDING CHIPS BELOW SEARCH BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>Trending:</span>
              {QUICK_TRENDING_SEARCHES.map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => {
                    setSearchQuery(query);
                    setSelectedCategory('All');
                    setSelectedTag(null);
                  }}
                  style={{
                    background: searchQuery === query ? `${tk.cyan}25` : 'rgba(255,255,255,0.04)',
                    color: searchQuery === query ? tk.cyan : tk.textDim,
                    border: `1px solid ${searchQuery === query ? tk.cyan + '60' : tk.border}`,
                    borderRadius: 14,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontFamily: tk.fontMono,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  #{query}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Featured Banner (if available & no active search/tag query) */}
      {!loading && featuredBlog && !searchQuery && selectedCategory === 'All' && !selectedTag && (
        <section style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 20px' }}>
          <Link href={`/pages/blogs/${featuredBlog.slug}`} style={{ textDecoration: 'none' }}>
            <div
              className="featured-blog-card"
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.borderHover}`,
                borderRadius: 24,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                cursor: 'pointer',
                boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Cover Image Frame */}
                  {featuredBlog.coverImage && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 320,
                    maxHeight: 400,
                    overflow: 'hidden',
                    background: '#090d1a',
                  }}
                >
                  <img
                    src={norm(featuredBlog.coverImage)}
                    alt={featuredBlog.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="featured-cover-img"
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setZoomImage(norm(featuredBlog.coverImage));
                    }}
                    title="Expand Full Image"
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.65)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    🔍 Zoom
                  </button>
                </div>
              )}

              <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: tk.fontMono,
                      padding: '4px 12px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(0,229,160,0.18))',
                      color: tk.cyan,
                      border: '1px solid rgba(0,212,255,0.35)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}
                  >
                    ★ FEATURED ARTICLE
                  </span>
                  <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                    ⏱️ {featuredBlog.readTime}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: tk.fontDisplay,
                    fontSize: 'clamp(24px, 3.2vw, 34px)',
                    fontWeight: 800,
                    color: tk.text,
                    marginBottom: 16,
                    lineHeight: 1.25,
                  }}
                >
                  {featuredBlog.title}
                </h2>

                <p style={{ fontSize: 15, color: tk.textDim, lineHeight: 1.75, marginBottom: 28 }}>
                  {featuredBlog.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: 'rgba(0,212,255,0.15)',
                        border: '1px solid rgba(0,212,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: tk.fontDisplay,
                        fontWeight: 800,
                        color: tk.cyan,
                        fontSize: 15,
                      }}
                    >
                      {featuredBlog.author.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{featuredBlog.author}</div>
                      <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>{featuredBlog.authorRole}</div>
                    </div>
                  </div>

                  <button
                    style={{
                      background: `linear-gradient(135deg, ${tk.cyan}, #00e5a0)`,
                      color: '#050810',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontFamily: tk.fontMono,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0,212,255,0.35)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Read Full Article →
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Main Layout Section: Left (Articles) + Right (Sidebar) */}
      <section id="articles-main-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 20px 100px' }}>
        
        {/* Active Search / Filter Status Banner if active */}
        {(searchQuery || selectedCategory !== 'All' || selectedTag) && (
          <div
            style={{
              background: 'rgba(0,212,255,0.06)',
              border: `1px solid rgba(0,212,255,0.2)`,
              borderRadius: 16,
              padding: '14px 20px',
              marginBottom: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: tk.fontMono }}>
              <span style={{ color: tk.cyan, fontWeight: 700 }}>🔍 Filtered Results:</span>
              <span style={{ color: tk.text }}>
                Showing <strong>{filteredPosts.length}</strong> article{filteredPosts.length !== 1 ? 's' : ''}
                {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
                {selectedCategory !== 'All' && <> in <strong>{selectedCategory}</strong></>}
                {selectedTag && <> with tag <strong>#{selectedTag}</strong></>}
              </span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTag(null);
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${tk.border}`,
                color: tk.cyan,
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: 11,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset All Filters ✕
            </button>
          </div>
        )}

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 36, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginRight: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedTag(null);
              }}
              style={{
                background: selectedCategory === cat && !selectedTag ? tk.purple : 'rgba(255,255,255,0.03)',
                color: selectedCategory === cat && !selectedTag ? '#ffffff' : tk.textDim,
                border: `1px solid ${selectedCategory === cat && !selectedTag ? tk.purple : tk.border}`,
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 12,
                fontFamily: tk.fontMono,
                fontWeight: selectedCategory === cat && !selectedTag ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              {cat}
            </button>
          ))}

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                background: 'rgba(0,212,255,0.15)',
                color: tk.cyan,
                border: `1px solid ${tk.cyan}`,
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Tag: #{selectedTag} ✕
            </button>
          )}
        </div>

        {/* 2-Column Grid */}
        <div
          className="blog-listing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: 40,
            alignItems: 'start',
          }}
        >
          {/* LEFT: Articles Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80, color: tk.textDim, fontFamily: tk.fontMono }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2.5px solid ${tk.border}`, borderTopColor: tk.cyan, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                Loading blog articles...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, color: tk.textDim, background: tk.surfaceMuted, borderRadius: 24, border: `1px solid ${tk.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: tk.fontDisplay, color: tk.text, fontSize: 20, marginBottom: 8 }}>No Articles Found</h3>
                <p style={{ fontSize: 14, color: tk.textDim, marginBottom: 20 }}>
                  We couldn't find any articles matching "{searchQuery || selectedCategory || selectedTag}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedTag(null);
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                    color: '#050810',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {filteredPosts.map((post) => (
                  <Link key={post.id} href={`/pages/blogs/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <article
                      className="blog-card-item"
                      style={{
                        background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                        border: `1px solid ${tk.border}`,
                        borderRadius: 20,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        {/* Cover Image Frame */}
                        {post.coverImage && (
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: 200,
                              overflow: 'hidden',
                              background: '#090d1a',
                              borderBottom: `1px solid ${tk.border}`,
                            }}
                          >
                            <img
                              src={norm(post.coverImage)}
                              alt={post.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block',
                                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                              }}
                              className="card-cover-img"
                            />

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setZoomImage(norm(post.coverImage));
                              }}
                              title="Zoom Image"
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 3,
                                background: 'rgba(0,0,0,0.65)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff',
                                padding: '5px 9px',
                                borderRadius: 8,
                                fontSize: 10,
                                fontFamily: tk.fontMono,
                                cursor: 'pointer',
                                backdropFilter: 'blur(8px)',
                              }}
                            >
                              🔍
                            </button>
                          </div>
                        )}

                        <div style={{ padding: '24px 24px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: tk.fontMono,
                                padding: '3px 10px',
                                borderRadius: 12,
                                background: `${CATEGORY_COLORS[post.category] || tk.cyan}18`,
                                color: CATEGORY_COLORS[post.category] || tk.cyan,
                                border: `1px solid ${CATEGORY_COLORS[post.category] || tk.cyan}40`,
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {post.category}
                            </span>
                            <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                              ⏱️ {post.readTime}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, marginBottom: 10, lineHeight: 1.4, color: tk.text }}>
                            {post.title}
                          </h3>
                          <p style={{ fontSize: 13.5, color: tk.textDim, lineHeight: 1.65, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {post.excerpt}
                          </p>

                          {/* Stats strip */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              borderTop: `1px solid ${tk.border}`,
                              paddingTop: 12,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: tk.textDim, fontFamily: tk.fontMono }}>
                              <span>📅</span>
                              <span>{formatShortDate(post.createdAt)}</span>
                            </div>
                            <div style={{ width: 1, height: 12, background: tk.border }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: tk.textDim, fontFamily: tk.fontMono }}>
                              <span>👁️</span>
                              <span style={{ fontWeight: 700, color: tk.text }}>{formatCount(post.views ?? 0)}</span>
                            </div>
                            <div style={{ width: 1, height: 12, background: tk.border }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: tk.textDim, fontFamily: tk.fontMono }}>
                              <span>❤️</span>
                              <span style={{ fontWeight: 700, color: tk.text }}>{formatCount(post.likes ?? 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Author row */}
                      <div style={{ padding: '16px 24px 20px', borderTop: `1px solid ${tk.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 10,
                              background: 'rgba(168,85,247,0.15)',
                              border: '1px solid rgba(168,85,247,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: tk.fontDisplay,
                              fontWeight: 800,
                              color: tk.purple,
                              fontSize: 12,
                            }}
                          >
                            {post.author.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: tk.text }}>{post.author}</div>
                            <div style={{ fontSize: 9.5, color: tk.textDim, fontFamily: tk.fontMono }}>{post.authorRole}</div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: tk.fontMono,
                            color: tk.cyan,
                            fontWeight: 700,
                          }}
                        >
                          Read →
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar Widget Panel */}
          <aside style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* 1. SUBSCRIBE NEWSLETTER WIDGET */}
            <div
              style={{
                background: `linear-gradient(135deg, rgba(0,212,255,0.12), rgba(168,85,247,0.12))`,
                border: `1px solid ${tk.borderHover}`,
                borderRadius: 20,
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📩</div>
              <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 18, fontWeight: 800, color: tk.text, margin: '0 0 8px' }}>
                Subscribe to Insights
              </h3>
              <p style={{ fontSize: 12.5, color: tk.textDim, lineHeight: 1.6, margin: '0 0 18px' }}>
                Get our latest technical articles, SaaS tutorials, and AI developments straight to your inbox.
              </p>

              {subscribed ? (
                <div
                  style={{
                    background: `${tk.green}20`,
                    border: `1px solid ${tk.green}60`,
                    color: tk.green,
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 12,
                    fontFamily: tk.fontMono,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  ✓ You're subscribed! Welcome aboard.
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px',
                      background: 'rgba(5,8,16,0.7)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 12,
                      color: tk.text,
                      fontSize: 13,
                      outline: 'none',
                      fontFamily: tk.fontBody,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: `linear-gradient(135deg, ${tk.cyan}, ${tk.green})`,
                      color: '#050810',
                      border: 'none',
                      padding: '11px 16px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      fontWeight: 800,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: `0 4px 16px ${tk.cyan}35`,
                    }}
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe Now →'}
                  </button>
                </form>
              )}
            </div>

            {/* 2. RECENT POSTS WIDGET */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}, ${tk.surfaceMuted})`,
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                padding: '22px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  color: tk.cyan,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${tk.border}`,
                  paddingBottom: 10,
                }}
              >
                <span>🔥 Recent Posts</span>
                <span style={{ fontSize: 10, color: tk.textDim }}>{blogs.length} articles</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/pages/blogs/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="sidebar-recent-card"
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div
                        style={{
                          width: 60,
                          height: 50,
                          borderRadius: 10,
                          overflow: 'hidden',
                          background: '#090d1a',
                          flexShrink: 0,
                          border: `1px solid ${tk.border}`,
                        }}
                      >
                        {post.coverImage ? (
                          <img src={norm(post.coverImage)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📰</div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: tk.text,
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            marginBottom: 4,
                          }}
                        >
                          {post.title}
                        </div>
                        <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', gap: 8 }}>
                          <span>⏱️ {post.readTime}</span>
                          <span>· 👁️ {formatCount(post.views ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. POPULAR TAGS WIDGET */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}, ${tk.surfaceMuted})`,
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                padding: '22px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  color: tk.purple,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  borderBottom: `1px solid ${tk.border}`,
                  paddingBottom: 10,
                }}
              >
                🏷️ Popular Tags
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {POPULAR_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTag(null);
                        } else {
                          setSelectedTag(tag);
                          setSelectedCategory('All');
                        }
                      }}
                      style={{
                        background: isSelected ? tk.purple : 'rgba(255,255,255,0.04)',
                        color: isSelected ? '#ffffff' : tk.textDim,
                        border: `1px solid ${isSelected ? tk.purple : tk.border}`,
                        padding: '5px 12px',
                        borderRadius: 14,
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. TRENDING / RELATED POSTS WIDGET */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}, ${tk.surfaceMuted})`,
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                padding: '22px 24px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  color: tk.green,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  borderBottom: `1px solid ${tk.border}`,
                  paddingBottom: 10,
                }}
              >
                ⭐ Trending & Most Liked
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trendingPosts.map((post, idx) => (
                  <Link key={post.id} href={`/pages/blogs/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 10px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${tk.border}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          background: `${tk.green}20`,
                          color: tk.green,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontFamily: tk.fontMono,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        #{idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: tk.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {post.title}
                        </div>
                        <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', gap: 8, marginTop: 2 }}>
                          <span>👁️ {formatCount(post.views ?? 0)}</span>
                          <span>❤️ {formatCount(post.likes ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(20px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 30,
          }}
        >
          <button
            onClick={() => setZoomImage(null)}
            style={{
              position: 'absolute',
              top: 28,
              right: 28,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              width: 44,
              height: 44,
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            ✕
          </button>
          <img
            src={zoomImage}
            alt="Full Resolution View"
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 16,
              boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
            }}
          />
        </div>
      )}

      {/* CSS Micro-Interactions & Responsive Layouts */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .featured-blog-card:hover {
          transform: translateY(-4px);
          border-color: ${tk.cyan} !important;
          box-shadow: 0 28px 70px rgba(0,212,255,0.2) !important;
        }

        .featured-blog-card:hover .featured-cover-img {
          transform: scale(1.05);
        }

        .blog-card-item:hover {
          transform: translateY(-6px);
          border-color: ${tk.cyan} !important;
          box-shadow: 0 20px 50px rgba(0,212,255,0.15) !important;
        }

        .blog-card-item:hover .card-cover-img {
          transform: scale(1.08);
        }

        .sidebar-recent-card:hover div {
          color: ${tk.cyan} !important;
        }

        .search-suggestion-item:hover {
          background: rgba(0, 212, 255, 0.08) !important;
          border-color: rgba(0, 212, 255, 0.25) !important;
        }

        @media (max-width: 960px) {
          .hero-split-grid {
            grid-template-columns: 1fr !important;
          }
          .blog-listing-grid {
            grid-template-columns: 1fr !important;
          }
          aside {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
