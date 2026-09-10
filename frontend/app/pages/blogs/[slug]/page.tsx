'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, API_URL, normalizeImageUrl } from '@/lib/api';
import { getBlogBySlug, getBlogComments, getBlogs, likeBlog, postBlogComment } from '@/lib/api/blogs';
import { pageTokens as tk } from '@/lib/pageTokens';
import { sanitizeHtml } from '@/lib/security';
import {
  BookOpen,
  BarChart3,
  FileText,
  Layers,
  Users,
  Clock,
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  MessageSquare,
  MessageSquarePlus,
  Inbox,
  User,
  Rocket,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';

const XTwitterIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  author: string;
  authorRole: string;
  readTime: string;
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
}

interface Comment {
  id: number;
  name: string;
  avatar: string;
  content: string;
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

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCount(n: number) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const norm = (u?: string | null) => normalizeImageUrl(u);

function estimateWordCount(text: string) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

const LS_LIKED_KEY = (slug: string) => `dke_liked_${slug}`;

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const [copied, setCopied] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewFired = useRef(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [formShake, setFormShake] = useState(false);

  /* Read-progress bar */
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docH > 0 ? Math.min(100, (scrollTop / docH) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Fetch blog + all blogs */
  useEffect(() => {
    if (!slug) return;

    getBlogBySlug(slug)
      .then((data: Blog) => {
        if (!data) return;
        setBlog(data);
        setViews(data.views ?? 0);
        setLikes(data.likes ?? 0);
        setLoading(false);

        if (typeof document !== 'undefined') {
          document.title = `${data.title} | D-Kode Era Blog`;

          // Inject / update Open Graph + Twitter Card meta tags dynamically
          const siteUrl = 'https://dkodeera.com';
          const pageUrl = `${siteUrl}/pages/blogs/${data.slug}`;
          const imgUrl = normalizeImageUrl(data.coverImage).replace(
            /localhost:5000/,
            'dkodeera.com'
          );

          const setMeta = (prop: string, val: string, attr = 'property') => {
            let el = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null;
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute(attr, prop);
              document.head.appendChild(el);
            }
            el.content = val;
          };

          setMeta('og:type', 'article');
          setMeta('og:title', `${data.title} | D-Kode Era`);
          setMeta('og:description', data.excerpt);
          setMeta('og:url', pageUrl);
          setMeta('og:image', imgUrl || `${siteUrl}/og-default.png`);
          setMeta('og:site_name', 'D-Kode Era');
          setMeta('og:locale', 'en_US');

          // Article-specific OG tags
          setMeta('article:published_time', data.createdAt);
          setMeta('article:author', data.author);
          setMeta('article:section', data.category);
          if (data.tags) {
            data.tags
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean)
              .forEach((tag: string) => {
                const el = document.createElement('meta');
                el.setAttribute('property', 'article:tag');
                el.content = tag;
                document.head.appendChild(el);
              });
          }

          // Twitter Card
          setMeta('twitter:card', 'summary_large_image', 'name');
          setMeta('twitter:title', `${data.title} | D-Kode Era`, 'name');
          setMeta('twitter:description', data.excerpt, 'name');
          setMeta('twitter:image', imgUrl || `${siteUrl}/og-default.png`, 'name');
          setMeta('twitter:site', '@dkodeera', 'name');

          // Canonical link
          let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
          }
          canonical.href = pageUrl;

          // Meta description & keywords
          setMeta('description', data.excerpt, 'name');
          const keywords = [data.category, ...(data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [])].join(', ');
          setMeta('keywords', keywords, 'name');
        }

        // Restore liked state from localStorage
        try {
          const saved = localStorage.getItem(LS_LIKED_KEY(slug));
          if (saved === 'true') setLiked(true);
        } catch {}

        // Fire view increment once per mount
        if (!viewFired.current) {
          viewFired.current = true;
          apiFetch(`/api/blogs/${slug}/view`, { method: 'POST' })
            .then((d: any) => {
              if (d.views != null) setViews(d.views);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });

    getBlogs()
      .then((d: Blog[]) => {
        if (Array.isArray(d)) setAllBlogs(d);
      })
      .catch(() => {});

    // Fetch comments
    getBlogComments(slug)
      .then((d: Comment[]) => {
        if (Array.isArray(d)) setComments(d);
      })
      .catch(() => {});
  }, [slug]);

  /* Like handler */
  const handleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);

    // Optimistic update
    setLikes((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    // Persist preference
    try {
      localStorage.setItem(LS_LIKED_KEY(slug), nextLiked ? 'true' : 'false');
    } catch {}

    // Server update
    likeBlog(slug, nextLiked)
      .then((d: any) => {
        if (d.likes != null) setLikes(d.likes);
      })
      .catch(() => {});
  };

  /* Share handlers */
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || '');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${blog?.title || ''} ${window.location.href}`)}`, '_blank');
  };

  // Comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    if (!commentName.trim() || !commentText.trim()) {
      setCommentError('Please fill in your name and comment.');
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
      return;
    }
    if (commentText.trim().length < 5) {
      setCommentError('Comment is too short — write at least a few words!');
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
      return;
    }
    setCommentSubmitting(true);
    try {
      const data = await postBlogComment(slug, { name: commentName, email: commentEmail, content: commentText });
      setComments((prev) => [data as Comment, ...prev]);
      setCommentName('');
      setCommentEmail('');
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (err: any) {
      setCommentError(err.message || 'Network error. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const recentArticles = allBlogs.filter((b) => b.slug !== slug).slice(0, 4);
  const relatedArticles = allBlogs.filter((b) => b.slug !== slug && b.category === blog?.category).slice(0, 3);
  const catColor = blog ? CATEGORY_COLORS[blog.category] || tk.cyan : tk.cyan;

  /* Loading State */
  if (loading)
    return (
      <div style={{ minHeight: '100vh', background: tk.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: tk.fontBody }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2.5px solid ${tk.border}`, borderTopColor: tk.cyan, animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: tk.textDim, fontSize: 12, fontFamily: tk.fontMono, letterSpacing: '0.12em' }}>LOADING ARTICLE...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  /* 404 State */
  if (notFound || !blog)
    return (
      <div style={{ minHeight: '100vh', background: tk.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: 40, fontFamily: tk.fontBody }}>
        <div style={{ color: tk.cyan, marginBottom: 8 }}>
          <Inbox size={56} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: tk.fontDisplay, fontSize: 32, fontWeight: 900, color: tk.text, margin: 0 }}>Article Not Found</h1>
        <p style={{ color: tk.textDim, fontSize: 15, maxWidth: 400 }}>This article may have been moved or removed.</p>
        <Link
          href="/pages/blogs"
          style={{
            background: `linear-gradient(135deg,${tk.cyan},${tk.green})`,
            color: '#050810',
            padding: '12px 28px',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: 13,
            fontFamily: tk.fontMono,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* JSON-LD Structured Data Schema for Google Search */}
      {blog && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: blog.title,
              description: blog.excerpt,
              image: [norm(blog.coverImage)],
              datePublished: blog.createdAt,
              dateModified: blog.createdAt,
              author: {
                '@type': 'Person',
                name: blog.author,
                jobTitle: blog.authorRole,
              },
              publisher: {
                '@type': 'Organization',
                name: 'D-Kode Era',
                url: 'https://dkodeera.com',
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://dkodeera.com/pages/blogs/${blog.slug}`,
              },
            }),
          }}
        />
      )}

      {/* Read Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 3,
          zIndex: 9999,
          width: `${readProgress}%`,
          background: `linear-gradient(90deg,${catColor},${tk.green})`,
          boxShadow: `0 0 10px ${catColor}`,
          transition: 'width 0.1s linear',
        }}
      />

      {/* HERO — Responsive Framed Cover Image Banner */}
      <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 20px' }}>
        {blog.coverImage && (
          <div
            className="hero-cover-frame"
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#090d1a',
              border: `1px solid ${tk.borderHover}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              marginBottom: 24,
            }}
          >
            <div style={{ position: 'relative', width: '100%' }} className="hero-cover-aspect">
              <img
                src={norm(blog.coverImage)}
                alt={blog.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to bottom, rgba(5,8,16,0.15) 0%, rgba(5,8,16,0.65) 100%)`,
                }}
              />
              <button
                onClick={() => setZoomImage(norm(blog.coverImage))}
                title="Expand Cover Image"
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  zIndex: 3,
                  background: 'rgba(0,0,0,0.65)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 700,
                }}
              >
                <Maximize2 size={13} />
                <span>Zoom</span>
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            padding: 'clamp(20px, 4vw, 32px)',
            background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`,
            border: `1px solid ${tk.border}`,
            borderRadius: 20,
          }}
        >
          {/* Breadcrumb navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={12} color={tk.textDim} />
            <Link href="/pages/blogs" style={{ color: 'inherit', textDecoration: 'none' }}>
              Blog
            </Link>
            <ChevronRight size={12} color={tk.textDim} />
            <span style={{ color: catColor, fontWeight: 700 }}>{blog.category}</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: 20,
                background: `${catColor}15`,
                color: catColor,
                border: `1px solid ${catColor}35`,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor, display: 'inline-block' }} />
              {blog.category}
            </span>
          </div>

          <h1
            style={{
              fontFamily: tk.fontDisplay,
              fontSize: 'clamp(24px, 4.2vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: tk.text,
              margin: '0 0 16px',
              maxWidth: 900,
              letterSpacing: '-0.02em',
            }}
          >
            {blog.title}
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 1.8vw, 16.5px)',
              color: tk.textMuted,
              lineHeight: 1.7,
              margin: '0 0 22px',
              maxWidth: 820,
            }}
          >
            {blog.excerpt}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: `${catColor}18`,
                  border: `2px solid ${catColor}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: tk.fontDisplay,
                  fontWeight: 900,
                  color: catColor,
                  fontSize: 18,
                }}
              >
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: tk.text }}>{blog.author}</div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>{blog.authorRole}</div>
              </div>
            </div>
            <div style={{ width: 1, height: 24, background: tk.border }} />
            <div style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} /> {formatDate(blog.createdAt)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {blog.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SECTION (2-Column Layout) */}
      <div
        className="blog-detail-layout"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(28px, 4vw, 52px) 20px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 40,
          alignItems: 'start',
        }}
      >
        {/* LEFT: Article Content */}
        <div>
          {/* Top Share Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '14px 20px',
              background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`,
              border: `1px solid ${tk.border}`,
              borderRadius: 16,
              marginBottom: 36,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, fontWeight: 700, marginRight: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Share2 size={13} color={catColor} /> SHARE:
              </span>

              {/* X / Twitter */}
              <button onClick={handleShareTwitter} title="Share on X" style={shareBtnStyle('#111', '1px solid rgba(255,255,255,0.15)', '#fff')}>
                <XTwitterIcon size={14} color="#fff" />
              </button>

              {/* LinkedIn */}
              <button onClick={handleShareLinkedIn} title="Share on LinkedIn" style={shareBtnStyle('#0a66c2', 'none', '#fff')}>
                <LinkedInIcon size={14} color="#fff" />
              </button>

              {/* WhatsApp */}
              <button onClick={handleShareWhatsApp} title="Share on WhatsApp" style={shareBtnStyle('#25d366', 'none', '#fff')}>
                <MessageCircle size={15} color="#fff" />
              </button>

              {/* Copy Link button */}
              <button
                onClick={handleCopyLink}
                style={{
                  background: copied ? `${tk.green}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${copied ? tk.green : tk.border}`,
                  color: copied ? tk.green : tk.textMuted,
                  padding: '0 14px',
                  height: 36,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: tk.fontMono,
                  fontWeight: 700,
                  transition: 'all 0.25s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              {/* Like button in bar */}
              <button
                onClick={handleLike}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: liked ? `${catColor}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${liked ? catColor + '50' : tk.border}`,
                  color: liked ? catColor : tk.textMuted,
                  padding: '0 14px',
                  height: 36,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: tk.fontMono,
                  fontWeight: 700,
                  transition: 'all 0.25s ease',
                  transform: likeAnim ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Heart size={14} color={liked ? catColor : tk.textMuted} fill={liked ? catColor : 'none'} />
                <span>{formatCount(likes)}</span>
              </button>
            </div>

            <Link href="/pages/blogs" style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={13} />
              <span>All Articles</span>
            </Link>
          </div>

          {/* Article Body */}
          <article ref={contentRef}>
            <div
              className="blog-content"
              style={{ fontSize: 17, lineHeight: 1.9, color: tk.text }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(blog.content)) }}
            />
          </article>

          {/* Engagement Footer (Likes & Views) */}
          <div
            style={{
              marginTop: 48,
              padding: '24px 28px',
              background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`,
              border: `1px solid ${tk.border}`,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Eye size={15} color={tk.cyan} />
                <span style={{ color: tk.text, fontWeight: 700 }}>{formatCount(views)}</span> views
              </div>
              <div style={{ width: 1, height: 20, background: tk.border }} />
              <div style={{ fontSize: 13, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Heart size={15} color="#ff6b6b" fill="#ff6b6b" />
                <span style={{ color: tk.text, fontWeight: 700 }}>{formatCount(likes)}</span> likes
              </div>
            </div>

            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: liked ? `linear-gradient(135deg,${catColor}25,${catColor}10)` : 'rgba(255,255,255,0.04)',
                border: `2px solid ${liked ? catColor : tk.border}`,
                color: liked ? catColor : tk.textMuted,
                padding: '10px 24px',
                borderRadius: 14,
                cursor: 'pointer',
                fontSize: 13.5,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: likeAnim ? 'scale(1.06)' : 'scale(1)',
                boxShadow: liked ? `0 4px 20px ${catColor}30` : 'none',
              }}
            >
              <Heart size={18} color={liked ? catColor : tk.textMuted} fill={liked ? catColor : 'none'} />
              <span>{liked ? `You liked this (${formatCount(likes)})` : `Like article (${formatCount(likes)})`}</span>
            </button>
          </div>

          {/* Tags from backend */}
          {(() => {
            const rawTags = blog.tags ? blog.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
            const allTags = [blog.category, ...rawTags].filter((t, i, arr) => t && arr.indexOf(t) === i);
            return allTags.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 32, paddingTop: 24, borderTop: `1px solid ${tk.border}`, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <Tag size={13} color={catColor} /> TAGS:
                </span>
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      padding: '4px 14px',
                      borderRadius: 20,
                      background: `${catColor}12`,
                      border: `1px solid ${catColor}40`,
                      color: catColor,
                      cursor: 'default',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null;
          })()}

          {/* Author Bio Box */}
          <div style={{ marginTop: 36, padding: '28px 30px', background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: `${catColor}20`,
                border: `2px solid ${catColor}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: tk.fontDisplay,
                fontWeight: 900,
                color: catColor,
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {blog.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 800 }}>
                Written by
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: tk.fontDisplay, color: tk.text, marginBottom: 2 }}>
                {blog.author}
              </div>
              <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginBottom: 10 }}>
                {blog.authorRole} · D-Kode Era
              </div>
              <p style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.7, margin: 0 }}>
                Part of the D-Kode Era engineering and design team, building enterprise software, SaaS products, and digital innovations.
              </p>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div style={{ marginTop: 52 }} id="comments">
            <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 22, fontWeight: 800, color: tk.text, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={22} color={catColor} />
              <span>Discussion</span>
              {comments.length > 0 && (
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, fontWeight: 700, color: tk.textDim, background: 'rgba(255,255,255,0.06)', border: `1px solid ${tk.border}`, padding: '3px 10px', borderRadius: 20 }}>
                  {comments.length}
                </span>
              )}
            </h3>

            {/* Write Comment Form */}
            <div style={{ background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '28px 30px', marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                <MessageSquarePlus size={16} /> Leave a Comment
              </div>

              {/* Success Toast */}
              {commentSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${tk.green}15`, border: `1px solid ${tk.green}50`, borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: tk.green, fontFamily: tk.fontMono }}>
                  <CheckCircle2 size={18} />
                  <span>Comment posted! Thank you for joining the discussion.</span>
                </div>
              )}

              {/* Error Message */}
              {commentError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${tk.red}15`, border: `1px solid ${tk.red}40`, borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: tk.red, fontFamily: tk.fontMono }}>
                  <AlertTriangle size={18} />
                  <span>{commentError}</span>
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className={formShake ? 'form-shake' : ''} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="comment-form-row">
                  <div>
                    <label style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>NAME *</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      maxLength={80}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${commentError && !commentName.trim() ? tk.red + '60' : tk.border}`,
                        borderRadius: 12,
                        padding: '12px 16px',
                        fontSize: 14,
                        color: tk.text,
                        fontFamily: tk.fontBody,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>
                      EMAIL <span style={{ opacity: 0.5 }}>(optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      maxLength={120}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${tk.border}`,
                        borderRadius: 12,
                        padding: '12px 16px',
                        fontSize: 14,
                        color: tk.text,
                        fontFamily: tk.fontBody,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>COMMENT *</label>
                  <textarea
                    placeholder="Share your thoughts, questions, or feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${commentError && !commentText.trim() ? tk.red + '60' : tk.border}`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      fontSize: 14,
                      color: tk.text,
                      fontFamily: tk.fontBody,
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: 110,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ fontSize: 12, color: tk.textDim, margin: 0 }}>Be respectful and constructive.</p>
                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    style={{
                      background: commentSubmitting ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${catColor},${tk.green})`,
                      color: commentSubmitting ? tk.textDim : '#050810',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontFamily: tk.fontMono,
                      fontWeight: 800,
                      cursor: commentSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: commentSubmitting ? 'none' : `0 4px 20px ${catColor}40`,
                    }}
                  >
                    <span>{commentSubmitting ? 'Posting...' : 'Post Comment'}</span>
                    <Send size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>

            {/* Comment List */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20 }}>
                <div style={{ color: tk.textDim, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <MessageSquare size={36} />
                </div>
                <p style={{ fontSize: 14.5, color: tk.textDim, margin: 0 }}>No comments yet — be the first to join the conversation!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {comments.map((c, idx) => {
                  const avatarColors = [catColor, tk.purple, tk.green, '#f5c842', '#ff9a3c', '#ff6b6b'];
                  const ac = avatarColors[idx % avatarColors.length];
                  return (
                    <div
                      key={c.id}
                      className="comment-card"
                      style={{
                        background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`,
                        border: `1px solid ${tk.border}`,
                        borderRadius: 18,
                        padding: '22px 24px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 13,
                            flexShrink: 0,
                            background: `${ac}22`,
                            border: `2px solid ${ac}50`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: tk.fontDisplay,
                            fontWeight: 900,
                            color: ac,
                            fontSize: 18,
                          }}
                        >
                          {c.avatar || c.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: tk.text, fontFamily: tk.fontDisplay }}>{c.name}</span>
                            <span style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono }}>
                              {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <p style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {c.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div style={{ marginTop: 52 }}>
              <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 21, fontWeight: 800, color: tk.text, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color={catColor} /> Related in {blog.category}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 18 }}>
                {relatedArticles.map((article) => (
                  <Link key={article.id} href={`/pages/blogs/${article.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="related-card" style={{ background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                      {article.coverImage && (
                        <div style={{ height: 130, overflow: 'hidden' }}>
                          <img src={norm(article.coverImage)} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ padding: 16 }}>
                        <span style={{ fontSize: 9, fontFamily: tk.fontMono, padding: '3px 8px', borderRadius: 10, background: `${CATEGORY_COLORS[article.category] || tk.cyan}18`, color: CATEGORY_COLORS[article.category] || tk.cyan, border: `1px solid ${CATEGORY_COLORS[article.category] || tk.cyan}40`, fontWeight: 700, textTransform: 'uppercase', display: 'inline-block', marginBottom: 8 }}>
                          {article.category}
                        </span>
                        <h4 style={{ fontFamily: tk.fontDisplay, fontSize: 14, fontWeight: 700, color: tk.text, lineHeight: 1.4, margin: '0 0 6px' }}>{article.title}</h4>
                        <span style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {article.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Box */}
          <div style={{ marginTop: 52, padding: '36px 40px', background: `linear-gradient(135deg,${catColor}12,${tk.green}08)`, border: `1px solid ${catColor}30`, borderRadius: 24, textAlign: 'center' }}>
            <div style={{ color: catColor, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <Rocket size={32} />
            </div>
            <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 800 }}>
              Ready to Build Something Great?
            </div>
            <h3 style={{ fontFamily: tk.fontDisplay, fontSize: 23, fontWeight: 900, color: tk.text, marginBottom: 12 }}>Turn Ideas Into Reality with D-Kode Era</h3>
            <p style={{ fontSize: 14, color: tk.textMuted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 24px' }}>
              Our team builds enterprise-grade software, AI-powered products, and custom SaaS platforms.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pages/contact" style={{ background: `linear-gradient(135deg,${tk.cyan},${tk.green})`, color: '#050810', padding: '12px 26px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 13, fontFamily: tk.fontMono, boxShadow: `0 4px 20px ${tk.cyan}40` }}>
                Start a Project →
              </Link>
              <Link href="/pages/services" style={{ background: 'rgba(255,255,255,0.04)', color: tk.text, padding: '12px 26px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 13, fontFamily: tk.fontMono, border: `1px solid ${tk.border}` }}>
                Explore Services
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar Panel */}
        <aside className="blog-sidebar-panel" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Live Stats Widget */}
          <div style={{ background: `linear-gradient(135deg,${catColor}14,${tk.green}08)`, border: `1px solid ${catColor}30`, borderRadius: 20, padding: '22px 24px' }}>
            <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
              <BarChart3 size={14} /> Live Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: `1px solid ${tk.border}` }}>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: tk.fontDisplay, color: tk.text }}>{formatCount(views)}</div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Eye size={12} color={tk.cyan} /> Views
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: `1px solid ${liked ? catColor + '40' : tk.border}` }}>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: tk.fontDisplay, color: liked ? catColor : tk.text }}>{formatCount(likes)}</div>
                <div style={{ fontSize: 11, color: tk.textDim, fontFamily: tk.fontMono, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Heart size={12} color="#ff6b6b" fill="#ff6b6b" /> Likes
                </div>
              </div>
            </div>

            <button
              onClick={handleLike}
              style={{
                width: '100%',
                marginTop: 14,
                background: liked ? `linear-gradient(135deg,${catColor}30,${catColor}15)` : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${liked ? catColor : tk.border}`,
                color: liked ? catColor : tk.textMuted,
                padding: '11px',
                borderRadius: 14,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: tk.fontMono,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <Heart size={16} color={liked ? catColor : tk.textMuted} fill={liked ? catColor : 'none'} />
              <span>{liked ? 'You Liked This!' : 'Like Article'}</span>
            </button>
          </div>

          {/* Article Info Widget */}
          <div style={{ background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '22px 24px' }}>
            <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${tk.border}`, fontWeight: 800 }}>
              Article Metadata
            </div>
            {[
              { icon: <Layers size={13} color={catColor} />, label: 'Category', value: blog.category },
              { icon: <User size={13} color={catColor} />, label: 'Author', value: blog.author },
              { icon: <Calendar size={13} color={catColor} />, label: 'Published', value: formatDate(blog.createdAt) },
              { icon: <Clock size={13} color={catColor} />, label: 'Read Time', value: blog.readTime },
              { icon: <FileText size={13} color={catColor} />, label: 'Word Count', value: `~${estimateWordCount(blog.content).toLocaleString()} words` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: tk.textDim, fontFamily: tk.fontMono, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {icon} {label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: tk.text, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Share Sidebar Widget */}
          <div style={{ background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '22px 24px' }}>
            <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 800 }}>
              Share Article
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleShareTwitter} style={sidebarShareBtnStyle('#111', '1px solid rgba(255,255,255,0.15)', '#fff')}>
                <XTwitterIcon size={14} color="#fff" />
                <span>Share on X</span>
              </button>
              <button onClick={handleShareLinkedIn} style={sidebarShareBtnStyle('#0a66c2', 'none', '#fff')}>
                <LinkedInIcon size={14} color="#fff" />
                <span>Share on LinkedIn</span>
              </button>
              <button onClick={handleShareWhatsApp} style={sidebarShareBtnStyle('#25d366', 'none', '#fff')}>
                <MessageCircle size={15} color="#fff" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={handleCopyLink}
                style={sidebarShareBtnStyle(copied ? `${tk.green}20` : 'rgba(255,255,255,0.04)', `1px solid ${copied ? tk.green : tk.border}`, copied ? tk.green : tk.textMuted)}
              >
                {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
            </div>
          </div>

          {/* Tags Widget */}
          {(() => {
            const rawTags = blog.tags ? blog.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
            const allTags = [blog.category, ...rawTags].filter((t, i, arr) => t && arr.indexOf(t) === i);
            return allTags.length > 0 ? (
              <div style={{ background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '22px 24px' }}>
                <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                  <Tag size={14} /> Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        padding: '5px 13px',
                        borderRadius: 20,
                        background: `${catColor}10`,
                        border: `1px solid ${catColor}35`,
                        color: catColor,
                        cursor: 'default',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Recent Articles Widget */}
          {recentArticles.length > 0 && (
            <div style={{ background: `linear-gradient(135deg,${tk.surface},${tk.surfaceMuted})`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '22px 24px' }}>
              <div style={{ fontSize: 10, fontFamily: tk.fontMono, color: catColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Recent Articles</span>
                <Link href="/pages/blogs" style={{ color: tk.cyan, textDecoration: 'none', fontSize: 9 }}>
                  View All →
                </Link>
              </div>
              <div>
                {recentArticles.map((article, idx) => (
                  <Link key={article.id} href={`/pages/blogs/${article.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="sidebar-article"
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        padding: '12px 0',
                        borderBottom: idx < recentArticles.length - 1 ? `1px solid ${tk.border}` : 'none',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <div style={{ width: 64, height: 48, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#090d1a' }}>
                        {article.coverImage ? (
                          <img src={norm(article.coverImage)} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.cyan }}>
                            <FileText size={16} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontFamily: tk.fontMono, color: CATEGORY_COLORS[article.category] || tk.cyan, marginBottom: 3, fontWeight: 700, textTransform: 'uppercase' }}>
                          {article.category}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: tk.text, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
                          {article.title}
                        </div>
                        <div style={{ fontSize: 10, color: tk.textDim, fontFamily: tk.fontMono, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} /> {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(20px)',
            zIndex: 20000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <button
            onClick={() => setZoomImage(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              width: 44,
              height: 44,
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
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

      {/* Global CSS Styles & Responsive Rules */}
      <style>{`
        .hero-cover-aspect {
          aspect-ratio: 21 / 9;
          max-height: 460px;
        }

        .blog-content { font-size: 17px; line-height: 1.9; color: ${tk.text}; }
        .blog-content h1 { font-family:${tk.fontDisplay}; font-size:2em; font-weight:900; color:${tk.text}; margin:1.8em 0 0.5em; line-height:1.2; }
        .blog-content h2 { font-family:${tk.fontDisplay}; font-size:1.5em; font-weight:800; color:${tk.text}; margin:1.6em 0 0.5em; border-bottom:1px solid ${tk.border}; padding-bottom:10px; line-height:1.25; }
        .blog-content h3 { font-family:${tk.fontDisplay}; font-size:1.2em; font-weight:700; color:${catColor}; margin:1.4em 0 0.4em; }
        .blog-content h4 { font-family:${tk.fontDisplay}; font-size:1.05em; font-weight:700; color:${tk.textMuted}; margin:1.2em 0 0.3em; }
        .blog-content p { margin:0 0 1.3em; }
        .blog-content strong { color:${tk.text}; font-weight:700; }
        .blog-content em { color:${tk.textMuted}; font-style:italic; }
        .blog-content del { color:${tk.textDim}; text-decoration:line-through; }
        .blog-content a { color:${catColor}; text-decoration:underline; text-underline-offset:3px; transition:opacity 0.2s; }
        .blog-content a:hover { opacity:0.75; }
        .blog-content img { max-width:100%; border-radius:14px; margin:1.4em 0; display:block; box-shadow:0 8px 32px rgba(0,0,0,0.4); }
        .blog-content hr { border:none; border-top:1px solid ${tk.border}; margin:2.4em 0; }
        .blog-content code { background:rgba(0,212,255,0.08); border:1px solid rgba(0,212,255,0.2); border-radius:6px; padding:2px 8px; font-family:${tk.fontMono}; font-size:0.86em; color:${tk.cyan}; }
        .blog-content pre { background:#04060f; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px 24px; margin:1.6em 0; overflow-x:auto; }
        .blog-content pre code { background:none; border:none; padding:0; color:#a3e635; font-size:0.88em; line-height:1.7; }
        .blog-content blockquote { border-left:3px solid ${catColor}; padding:14px 0 14px 26px; margin:1.8em 0; color:${tk.textMuted}; font-style:italic; background:${catColor}08; border-radius:0 14px 14px 0; }
        .blog-content blockquote p { margin:0; }
        .blog-content ul { list-style:disc; margin:0 0 1.4em 1.6em; }
        .blog-content ol { list-style:decimal; margin:0 0 1.4em 1.6em; }
        .blog-content li { margin-bottom:0.5em; color:${tk.text}; }
        .blog-content li::marker { color:${catColor}; }

        .related-card:hover { transform:translateY(-4px); border-color:${catColor}!important; box-shadow:0 12px 32px ${catColor}25; }
        .sidebar-article:hover { opacity:0.8; }
        .comment-card:hover { border-color:${catColor}40!important; }
        input:focus, textarea:focus { border-color:${catColor}60!important; box-shadow:0 0 0 3px ${catColor}12!important; }

        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .form-shake { animation:shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97); }

        @media (min-width: 993px) {
          .blog-sidebar-panel { position: sticky; top: 24px; }
        }

        @media (max-width: 992px) {
          .blog-detail-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }

        @media (max-width: 768px) {
          .hero-cover-aspect {
            aspect-ratio: 16 / 9 !important;
            max-height: 320px !important;
          }
        }

        @media (max-width: 600px) {
          .comment-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function shareBtnStyle(bg: string, border: string, color: string): React.CSSProperties {
  return {
    background: bg,
    border,
    color,
    width: 36,
    height: 36,
    borderRadius: 10,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    transition: 'transform 0.2s ease',
  };
}

function sidebarShareBtnStyle(bg: string, border: string, color: string): React.CSSProperties {
  return {
    background: bg,
    border,
    color,
    padding: '10px 16px',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    transition: 'all 0.2s ease',
  };
}

function renderMarkdown(md: string): string {
  if (!md) return '';
  let html = md;

  const htmlBlocks: string[] = [];
  html = html.replace(/<(?:div|ul|ol|li|table|figure|section|article|aside|header|footer|a)[^>]*>[\s\S]*?<\/(?:div|ul|ol|li|table|figure|section|article|aside|header|footer|a)>/gi, (match) => {
    htmlBlocks.push(match);
    return `%%HTML_BLOCK_${htmlBlocks.length - 1}%%`;
  });
  html = html.replace(/<(img|br|hr)[^>]*\/?>/gi, (match) => {
    htmlBlocks.push(match);
    return `%%HTML_BLOCK_${htmlBlocks.length - 1}%%`;
  });

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) =>
    `<pre><code class="language-${lang || 'text'}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`
  );

  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/^---$/gm, '<hr />');

  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^- /, '')}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  });

  const normalizeUrl = (src: string) => {
    if (!src) return '';
    try {
      if (src.startsWith('http')) {
        const s = new URL(src);
        const api = new URL(API_URL);
        if (s.hostname === 'localhost' || s.host === api.host) {
          return `${api.origin}${s.pathname}${s.search || ''}${s.hash || ''}`;
        }
        if (typeof window !== 'undefined' && s.host === window.location.host && s.protocol !== window.location.protocol) {
          return `${window.location.origin}${s.pathname}${s.search || ''}${s.hash || ''}`;
        }
        return src;
      }
      return `${API_URL}${src.startsWith('/') ? src : '/' + src}`;
    } catch {
      return src;
    }
  };

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    const u = normalizeUrl(url || '');
    return `<img src="${u}" alt="${alt}" />`;
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  const blockTags = ['<h1', '<h2', '<h3', '<h4', '<ul', '<ol', '<li', '<blockquote', '<pre', '<hr', '<img', '<div', '%%HTML'];
  html = html
    .split('\n')
    .map((line) => {
      if (!line.trim()) return '';
      if (blockTags.some((t) => line.trim().startsWith(t))) return line;
      return `<p>${line}</p>`;
    })
    .join('\n');

  for (let i = 0; i < htmlBlocks.length; i++) {
    htmlBlocks[i] = htmlBlocks[i].replace(/<img\s+([^>]*?)src=(['"])([^'"\s>]+)\2([^>]*?)>/gi, (_m, pre, q, src, post) => {
      const u = normalizeUrl(src || '');
      return `<img ${pre}src=${q}${u}${q}${post}>`;
    });
  }

  html = html.replace(/%%HTML_BLOCK_(\d+)%%/g, (_m, i) => htmlBlocks[Number(i)]);

  return html;
}
