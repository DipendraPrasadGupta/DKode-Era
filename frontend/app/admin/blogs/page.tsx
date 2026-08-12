'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { getBlogs } from '@/lib/api/blogs';

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
  allowModal: boolean;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('Dipendra Prasad Gupta');
  const [authorRole, setAuthorRole] = useState('Founder & CEO');
  const [readTime, setReadTime] = useState('5 min read');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [allowModal, setAllowModal] = useState(true);

  // Editor mode: 'edit' or 'preview'
  const [contentTab, setContentTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineImageRef = useRef<HTMLInputElement>(null);

  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [linkTarget, setLinkTarget] = useState('_blank');
  const [linkTitle, setLinkTitle] = useState('');

  // Image dialog state
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imgAlt, setImgAlt] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imgLinkUrl, setImgLinkUrl] = useState('');
  const [imgLinkTarget, setImgLinkTarget] = useState('_blank');
  const [imgAlign, setImgAlign] = useState<'none' | 'left' | 'center' | 'right'>('none');
  const [imgWidth, setImgWidth] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const savedCursorRef = useRef<{ start: number; end: number } | null>(null);

  // List dropdown
  const [ulMenuOpen, setUlMenuOpen] = useState(false);
  const [olMenuOpen, setOlMenuOpen] = useState(false);
  const ulMenuRef = useRef<HTMLDivElement>(null);
  const olMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside their containers
  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (ulMenuRef.current && !ulMenuRef.current.contains(e.target as Node)) {
        setUlMenuOpen(false);
      }
      if (olMenuRef.current && !olMenuRef.current.contains(e.target as Node)) {
        setOlMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to obtain a valid JWT token, with automatic fallback authentication if token expired/missing
  const getAuthToken = async (): Promise<string | null> => {
    let token = localStorage.getItem('adminToken');
    if (token) return token;

    try {
      const data = await apiFetch('/admin/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });
      if (data?.token) {
        localStorage.setItem('adminToken', data.token);
        return data.token;
      }
    } catch { }
    return null;
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setCategory('Engineering');
    setTags('Engineering, SaaS, Tech');
    setAuthor('Dipendra Prasad Gupta');
    setAuthorRole('Founder & CEO');
    setReadTime('5 min read');
    setPublished(true);
    setFeatured(false);
    setAllowModal(true);
    setContentTab('edit');
    setModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setCoverImage(blog.coverImage);
    setCategory(blog.category);
    setTags(blog.tags || '');
    setAuthor(blog.author);
    setAuthorRole(blog.authorRole);
    setReadTime(blog.readTime);
    setPublished(blog.published);
    setFeatured(blog.featured);
    setAllowModal(blog.allowModal !== undefined ? blog.allowModal : true);
    setContentTab('edit');
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = await getAuthToken();
    if (!token) {
      alert('Authentication session required. Please log in.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await apiFetch('/admin/api/upload', {
        method: 'POST',
        body: formData,
      });
      setCoverImage(data.url);
      showToast('Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  // Helper to insert markdown formatting at current cursor position
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = prefix + selectedText + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleInsertImage = (url: string, alt: string) => {
    insertFormatting(`\n![${alt || 'Image'}](${url})\n`, '');
  };

  // Upload image from local disk and insert markdown reference
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = await getAuthToken();
    if (!token) { alert('Auth session required.'); return; }
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const data = await apiFetch('/admin/api/upload', {
        method: 'POST',
        body: formData,
      });
      const alt = file.name.replace(/\.[^.]+$/, '') || 'Image';
      handleInsertImage(data.url, alt);
      showToast('Image inserted into article!');
    } catch {
      alert('Error uploading image');
    } finally {
      setUploading(false);
      if (inlineImageRef.current) inlineImageRef.current.value = '';
    }
  };

  const handleInsertLink = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      savedCursorRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
      const sel = content.substring(textarea.selectionStart, textarea.selectionEnd);
      if (sel) setLinkText(sel);
    }
    setLinkTitle('');
    setLinkDialogOpen(true);
  };

  const commitInsertLink = () => {
    if (!linkUrl || linkUrl === 'https://') { alert('Please enter a valid URL.'); return; }
    const text = linkText.trim() || linkUrl;
    const titleAttr = linkTitle.trim() ? ` title="${linkTitle.trim()}"` : '';
    const html = `<a href="${linkUrl}" target="${linkTarget}" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    insertFormatting(html, '');
    setLinkDialogOpen(false);
    setLinkUrl('https://');
    setLinkText('');
    setLinkTarget('_blank');
    setLinkTitle('');
  };

  const handleOpenImageDialog = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      savedCursorRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
    }
    setImgAlt('');
    setImgUrl('');
    setImgLinkUrl('');
    setImgLinkTarget('_blank');
    setImgAlign('none');
    setImgWidth('');
    setImageDialogOpen(true);
  };

  const handleImgDialogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = await getAuthToken();
    if (!token) { alert('Auth session required.'); return; }
    const formData = new FormData();
    formData.append('image', file);
    try {
      setImgUploading(true);
      const data = await apiFetch('/admin/api/upload', {
        method: 'POST',
        body: formData,
      });
      setImgUrl(data.url);
      if (!imgAlt) setImgAlt(file.name.replace(/\.[^.]+$/, ''));
      showToast('Image uploaded! Fill in details and click Insert.');
    } catch {
      alert('Error uploading image');
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  };

  const commitInsertImage = () => {
    if (!imgUrl.trim()) { alert('Please provide an image URL or upload an image first.'); return; }
    const alt = imgAlt.trim() || 'Image';
    const styleAttrs: string[] = [];
    const w = imgWidth.trim();
    if (w) styleAttrs.push(`max-width:${w.includes('%') || w.includes('px') ? w : w + 'px'}`);
    if (imgAlign === 'center') styleAttrs.push('display:block;margin:1em auto');
    else if (imgAlign === 'left') styleAttrs.push('float:left;margin:0 1.5em 1em 0');
    else if (imgAlign === 'right') styleAttrs.push('float:right;margin:0 0 1em 1.5em');
    else styleAttrs.push('display:block;margin:1em 0');
    styleAttrs.push('border-radius:12px');
    const imgTag = `<img src="${imgUrl.trim()}" alt="${alt}" style="${styleAttrs.join(';')}" />`;
    const finalHtml = imgLinkUrl.trim()
      ? `\n<a href="${imgLinkUrl.trim()}" target="${imgLinkTarget}" rel="noopener noreferrer">${imgTag}</a>\n`
      : `\n${imgTag}\n`;
    const pos = savedCursorRef.current;
    if (pos !== null) {
      setContent(prev => prev.substring(0, pos.start) + finalHtml + prev.substring(pos.end));
    } else {
      setContent(prev => prev + finalHtml);
    }
    setImageDialogOpen(false);
    showToast('Image inserted into article!');
  };

  // Insert list with chosen style. Converts selected lines or inserts new items.
  const handleInsertList = (type: 'ul' | 'ol', style: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const marker = type === 'ul' ? '- ' : '1. ';
      insertFormatting(`\n${marker}`, '', 'List item');
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const lines = selectedText ? selectedText.split('\n') : ['List item'];

    let listMarkdown = '';
    if (type === 'ul') {
      // For ul, we embed the style as an HTML list to support non-disc
      if (style === 'disc') {
        listMarkdown = '\n' + lines.map(l => `- ${l.replace(/^[-*•]\s*/, '')}`).join('\n') + '\n';
      } else {
        const styleMap: Record<string, string> = { circle: 'circle', square: 'square' };
        listMarkdown = `\n<ul style="list-style-type:${styleMap[style]};padding-left:1.5em">\n` +
          lines.map(l => `  <li>${l.replace(/^[-*•]\s*/, '') || 'List item'}</li>`).join('\n') +
          '\n</ul>\n';
      }
    } else {
      // Ordered list
      const styleMap: Record<string, string> = {
        decimal: 'decimal',
        'lower-alpha': 'lower-alpha',
        'upper-alpha': 'upper-alpha',
        'lower-roman': 'lower-roman',
        'upper-roman': 'upper-roman',
      };
      if (style === 'decimal') {
        listMarkdown = '\n' + lines.map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, '') || 'List item'}`).join('\n') + '\n';
      } else {
        listMarkdown = `\n<ol style="list-style-type:${styleMap[style]};padding-left:1.5em">\n` +
          lines.map(l => `  <li>${l.replace(/^\d+\.\s*/, '') || 'List item'}</li>`).join('\n') +
          '\n</ol>\n';
      }
    }
    const newContent = content.substring(0, start) + listMarkdown + content.substring(end);
    setContent(newContent);
    setTimeout(() => textarea.focus(), 50);
  };

  const handleInsertAd = () => {
    const adHtml = `\n<div style="background: rgba(0, 212, 255, 0.08); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 16px; padding: 20px; margin: 24px 0; text-align: center;">\n  <span style="font-size: 11px; font-family: monospace; color: #06b6d4; letter-spacing: 0.1em; text-transform: uppercase;">📢 SPONSORED / FEATURED ANNOUNCEMENT</span>\n  <h4 style="margin: 8px 0; color: #fff; font-size: 18px;">Build Enterprise Software with D-Kode Era</h4>\n  <p style="margin: 0 0 12px; font-size: 13px; color: #a1a1aa;">Custom SaaS products, AI micro-agents, and modern Next.js web applications.</p>\n  <a href="/pages/contact" style="display: inline-block; background: #06b6d4; color: #000; padding: 8px 18px; border-radius: 8px; font-weight: 800; text-decoration: none; font-size: 12px;">Get Started →</a>\n</div>\n`;
    insertFormatting(adHtml, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an Article Title.');
      return;
    }
    if (!excerpt.trim()) {
      alert('Please enter an Excerpt summary.');
      return;
    }
    if (!content.trim()) {
      alert('Please enter Article Content.');
      return;
    }

    setIsSubmitting(true);

    try {
      let token = await getAuthToken();
      if (!token) {
        alert('Authentication session expired. Please log in at /admin/login');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage,
        category,
        tags,
        author,
        authorRole,
        readTime,
        published,
        featured,
        allowModal,
      };

      const endpoint = editingBlog
        ? `/admin/api/blogs/${editingBlog.id}`
        : '/admin/api/blogs';
      const method = editingBlog ? 'PUT' : 'POST';

      try {
        await apiFetch(endpoint, {
          method,
          body: JSON.stringify(payload),
        });
        showToast(editingBlog ? 'Blog article updated successfully!' : 'Blog article published successfully!');
        setModalOpen(false);
        fetchBlogs();
      } catch (err: any) {
        alert(`Failed to save article: ${err.message || 'Server error'}`);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Network error saving blog article: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    const token = await getAuthToken();
    if (!token) return;

    try {
      await apiFetch(`/admin/api/blogs/${id}`, {
        method: 'DELETE',
      });
      showToast('Blog deleted!');
      fetchBlogs();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const togglePublished = async (blog: Blog) => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      await apiFetch(`/admin/api/blogs/${blog.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...blog, published: !blog.published }),
      });
      showToast(blog.published ? 'Blog unpublished (Draft)' : 'Blog published live!');
      fetchBlogs();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const liveCount = blogs.filter((b) => b.published).length;
  const draftCount = blogs.filter((b) => !b.published).length;

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.tags && b.tags.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && b.published) ||
      (statusFilter === 'draft' && !b.published);

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '32px 40px', color: '#e4e4e7', fontFamily: "'Outfit', sans-serif" }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#06b6d4',
            color: '#000',
            padding: '12px 20px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(6,182,212,0.4)',
          }}
        >
          ✓ {toast}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            ✦ CMS CONTENT MANAGEMENT
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, margin: 0, color: '#fff' }}>
            Blog Articles Manager
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #00e5a0 100%)',
            color: '#000',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 10,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Write New Article
        </button>
      </div>

      {/* Search Bar + Status Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search articles by title, category, tags, or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 440,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            color: '#fff',
            fontSize: 13,
            outline: 'none',
          }}
        />

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              background: statusFilter === 'all' ? '#06b6d4' : 'transparent',
              color: statusFilter === 'all' ? '#000' : '#a1a1aa',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            All ({blogs.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            style={{
              background: statusFilter === 'published' ? '#00e5a0' : 'transparent',
              color: statusFilter === 'published' ? '#000' : '#a1a1aa',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ● Published ({liveCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            style={{
              background: statusFilter === 'draft' ? '#ef4444' : 'transparent',
              color: statusFilter === 'draft' ? '#fff' : '#a1a1aa',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ○ Drafts ({draftCount})
          </button>
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
          Loading blog articles...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📰</div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", margin: '0 0 8px 0', color: '#fff' }}>No Blog Articles Found</h3>
          <p style={{ color: '#71717a', fontSize: 14, margin: '0 0 20px 0' }}>Write your first blog post to publish on your website.</p>
          <button onClick={openCreateModal} style={{ background: '#06b6d4', color: '#000', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
            + Create Article
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filtered.map((blog) => (
            <div
              key={blog.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Cover Image Header */}
                <div style={{ height: 180, background: '#090d18', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: 32 }}>
                      🖼️
                    </div>
                  )}

                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(6,182,212,0.85)', color: '#000', padding: '3px 8px', borderRadius: 6, fontWeight: 700, textTransform: 'uppercase' }}>
                      {blog.category}
                    </span>
                    {blog.featured && (
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,200,66,0.9)', color: '#000', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                        ★ FEATURED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => togglePublished(blog)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: blog.published ? 'rgba(0,229,160,0.2)' : 'rgba(239,68,68,0.2)',
                      color: blog.published ? '#00e5a0' : '#ef4444',
                      border: `1px solid ${blog.published ? '#00e5a0' : '#ef4444'}`,
                      padding: '3px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {blog.published ? '● Live' : '○ Draft'}
                  </button>
                </div>

                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#fff', lineHeight: 1.3 }}>
                    {blog.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#a1a1aa', margin: '0 0 14px 0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.excerpt}
                  </p>

                  {/* Render Tags Badges */}
                  {blog.tags && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {blog.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.05)', color: '#06b6d4', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(6,182,212,0.2)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      {blog.author}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {blog.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
                <button
                  onClick={() => openEditModal(blog)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#06b6d4', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Edit Article
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL WITH RICH TEXT TOOLBAR & LIVE PREVIEW */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0c0f1a', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 24, width: '100%', maxWidth: 840, maxHeight: '92vh', overflowY: 'auto', padding: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.85)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {editingBlog ? 'EDIT ARTICLE MODE' : 'CREATE ARTICLE MODE'}
                </span>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: '2px 0 0', color: '#fff' }}>
                  {editingBlog ? editingBlog.title : 'Write New Article'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 22, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>ARTICLE TITLE *</label>
                <input
                  type="text"
                  placeholder="e.g. Building Scalable Next.js 15 Applications in 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, outline: 'none' }}
                />
              </div>

              {/* Category, Read Time, Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#121624', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="AI & Tech">AI & Tech</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Productivity">Productivity</option>
                    <option value="News">News</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>READ TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 min read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>URL SLUG <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <input
                    type="text"
                    placeholder="auto-generated if empty"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>
                  TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, SaaS, Next.js 15, Nepal Tech, AI"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}
                />
                {tags && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                      <span key={i} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(6,182,212,0.15)', color: '#06b6d4', padding: '2px 8px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Image Upload & URL */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>COVER IMAGE</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Paste Image URL or click Upload..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  />
                  <label style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {uploading ? 'Uploading...' : '📁 Upload File'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {coverImage && (
                  <div style={{ marginTop: 8, height: 110, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#090d18' }}>
                    <img src={coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>EXCERPT (CARD SUMMARY) *</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary displayed on article cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* ARTICLE CONTENT WITH FORMATTING TOOLBAR & PREVIEW TAB */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4' }}>
                    ARTICLE CONTENT (MARKDOWN / HTML) *
                  </label>

                  {/* Switch between Edit and Live Preview */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      type="button"
                      onClick={() => setContentTab('edit')}
                      style={{
                        background: contentTab === 'edit' ? '#06b6d4' : 'transparent',
                        color: contentTab === 'edit' ? '#000' : '#a1a1aa',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Edit Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab('preview')}
                      style={{
                        background: contentTab === 'preview' ? '#06b6d4' : 'transparent',
                        color: contentTab === 'preview' ? '#000' : '#a1a1aa',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      Live Preview
                    </button>
                  </div>
                </div>

                {contentTab === 'edit' ? (
                  <div style={{ position: 'relative' }}>
                    {/* Hidden inline image uploader */}
                    <input
                      ref={inlineImageRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleInlineImageUpload}
                    />

                    {/* ── LINK DIALOG OVERLAY ── */}
                    {linkDialogOpen && (
                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 50,
                        background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)',
                        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          background: '#0c0f1a', border: '1px solid rgba(6,182,212,0.4)',
                          borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 420, boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                        }}>
                          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>🔗 Insert Hyperlink</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 4 }}>DISPLAY TEXT</label>
                              <input
                                type="text"
                                placeholder="e.g. Click Here"
                                value={linkText}
                                onChange={e => setLinkText(e.target.value)}
                                style={inputSt}
                                autoFocus
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 4 }}>URL *</label>
                              <input
                                type="url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                                style={inputSt}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 6 }}>OPEN IN</label>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {[['_blank', '🌐 New Tab'], ['_self', '📄 Same Tab']].map(([val, label]) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setLinkTarget(val)}
                                    style={{
                                      flex: 1, padding: '8px 10px', borderRadius: 8,
                                      background: linkTarget === val ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)',
                                      border: `1px solid ${linkTarget === val ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
                                      color: linkTarget === val ? '#06b6d4' : '#a1a1aa',
                                      fontSize: 12, cursor: 'pointer', fontWeight: 600,
                                    }}
                                  >{label}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 4 }}>TOOLTIP / TITLE (optional)</label>
                              <input type="text" placeholder="e.g. Visit our services page" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} style={inputSt} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                              <button type="button" onClick={() => { setLinkDialogOpen(false); setLinkText(''); setLinkUrl('https://'); setLinkTitle(''); }} style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#a1a1aa', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                              <button type="button" onClick={commitInsertLink} style={{ flex: 2, padding: '9px', borderRadius: 8, background: 'linear-gradient(135deg,#06b6d4,#00e5a0)', color: '#000', border: 'none', fontSize: 12, cursor: 'pointer', fontWeight: 800 }}>Insert Link →</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── IMAGE DIALOG OVERLAY ── */}
                    {imageDialogOpen && (
                      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(3,5,12,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <div style={{ background: '#0c0f1a', border: '1px solid rgba(0,229,160,0.35)', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.9)', maxHeight: '90vh', overflowY: 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: '#00e5a0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🖼️ Insert Image</div>
                            <button type="button" onClick={() => setImageDialogOpen(false)} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Image Source */}
                            <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#00e5a0', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Image Source</div>
                              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                <input type="text" placeholder="Paste image URL (https://...)" value={imgUrl} onChange={e => setImgUrl(e.target.value)} style={{ ...inputSt, flex: 1 }} autoFocus />
                                <label style={{ background: 'rgba(0,229,160,0.15)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.3)', padding: '9px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                                  {imgUploading ? '⟳ Uploading…' : '📁 Upload'}
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgDialogUpload} disabled={imgUploading} />
                                </label>
                              </div>
                              {imgUrl && (
                                <div style={{ background: '#04060f', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                                  <img src={imgUrl} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }} />
                                </div>
                              )}
                            </div>
                            {/* Alt Text */}
                            <div>
                              <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 4 }}>ALT TEXT / CAPTION *</label>
                              <input type="text" placeholder="Descriptive text for accessibility & SEO" value={imgAlt} onChange={e => setImgAlt(e.target.value)} style={inputSt} />
                            </div>
                            {/* Layout options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 6 }}>ALIGNMENT</label>
                                <div style={{ display: 'flex', gap: 5 }}>
                                  {(['none', 'left', 'center', 'right'] as const).map(a => (
                                    <button key={a} type="button" onClick={() => setImgAlign(a)} style={{ flex: 1, padding: '6px 2px', borderRadius: 7, background: imgAlign === a ? 'rgba(0,229,160,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${imgAlign === a ? '#00e5a0' : 'rgba(255,255,255,0.1)'}`, color: imgAlign === a ? '#00e5a0' : '#71717a', fontSize: 9, cursor: 'pointer', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
                                      {a === 'none' ? 'Full' : a.charAt(0).toUpperCase() + a.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 6 }}>MAX WIDTH (optional)</label>
                                <input type="text" placeholder="e.g. 100% or 600px" value={imgWidth} onChange={e => setImgWidth(e.target.value)} style={inputSt} />
                              </div>
                            </div>
                            {/* Optional link wrapper */}
                            <div style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#06b6d4', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔗 Make Image Clickable (optional)</div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="url" placeholder="Link URL — leave empty to skip" value={imgLinkUrl} onChange={e => setImgLinkUrl(e.target.value)} style={{ ...inputSt, flex: 1, minWidth: 180 }} />
                                <div style={{ display: 'flex', gap: 6 }}>
                                  {([['_blank', '🌐 New Tab'], ['_self', '📄 Same Tab']] as const).map(([val, lbl]) => (
                                    <button key={val} type="button" onClick={() => setImgLinkTarget(val)} style={{ padding: '8px 10px', borderRadius: 7, background: imgLinkTarget === val ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${imgLinkTarget === val ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`, color: imgLinkTarget === val ? '#06b6d4' : '#71717a', fontSize: 10, cursor: 'pointer', fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{lbl}</button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                              <button type="button" onClick={() => setImageDialogOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#a1a1aa', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                              <button type="button" onClick={commitInsertImage} style={{ flex: 2, padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#00e5a0,#06b6d4)', color: '#000', border: 'none', fontSize: 12, cursor: 'pointer', fontWeight: 800 }}>Insert Image →</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RICH FORMATTING TOOLBAR */}
                    <div style={{
                      display: 'flex', gap: 4, flexWrap: 'wrap',
                      background: 'rgba(12,15,26,0.98)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderBottom: 'none',
                      borderRadius: '10px 10px 0 0',
                      padding: '8px 10px',
                      alignItems: 'center',
                    }}>
                      {/* TEXT FORMAT GROUP */}
                      <span style={toolbarGroupLabel}>Format</span>
                      <button type="button" onClick={() => insertFormatting('**', '**', 'bold text')} title="Bold (Ctrl+B)" style={toolbarBtnStyle}><strong style={{ fontSize: 13 }}>B</strong></button>
                      <button type="button" onClick={() => insertFormatting('*', '*', 'italic text')} title="Italic" style={toolbarBtnStyle}><em style={{ fontSize: 13, fontFamily: 'Georgia, serif' }}>I</em></button>
                      <button type="button" onClick={() => insertFormatting('~~', '~~', 'strikethrough')} title="Strikethrough" style={toolbarBtnStyle}><s style={{ fontSize: 12 }}>S</s></button>
                      <button type="button" onClick={() => insertFormatting('`', '`', 'code')} title="Inline Code" style={{ ...toolbarBtnStyle, fontFamily: 'monospace', color: '#06b6d4' }}>{`<>`}</button>

                      <div style={separator} />

                      {/* HEADINGS */}
                      <span style={toolbarGroupLabel}>Heading</span>
                      <button type="button" onClick={() => insertFormatting('\n# ', '', 'Heading 1')} title="Heading 1" style={{ ...toolbarBtnStyle, fontWeight: 900, fontSize: 12 }}>H1</button>
                      <button type="button" onClick={() => insertFormatting('\n## ', '', 'Heading 2')} title="Heading 2" style={{ ...toolbarBtnStyle, fontWeight: 800, fontSize: 11 }}>H2</button>
                      <button type="button" onClick={() => insertFormatting('\n### ', '', 'Heading 3')} title="Heading 3" style={{ ...toolbarBtnStyle, fontWeight: 700, fontSize: 11 }}>H3</button>

                      <div style={separator} />

                      {/* LISTS — UL dropdown */}
                      <span style={toolbarGroupLabel}>Lists</span>
                      <div ref={ulMenuRef} style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => { setUlMenuOpen(v => !v); setOlMenuOpen(false); }}
                          title="Unordered List (Bullet List)"
                          style={{ ...toolbarBtnStyle, gap: 5, background: ulMenuOpen ? 'rgba(6,182,212,0.18)' : undefined, borderColor: ulMenuOpen ? 'rgba(6,182,212,0.4)' : undefined }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                          <span>UL</span>
                          <span style={{ fontSize: 8, opacity: 0.7, marginLeft: -1 }}>▼</span>
                        </button>
                        {ulMenuOpen && (
                          <div style={dropdownSt}>
                            <div style={dropdownLabel}>UNORDERED LIST STYLE</div>
                            {[['disc', '● Bullet (Disc)'], ['circle', '○ Circle'], ['square', '■ Square']].map(([s, label]) => (
                              <button key={s} type="button" onMouseDown={e => { e.preventDefault(); handleInsertList('ul', s); setUlMenuOpen(false); }} style={dropdownItemSt}>{label}</button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* OL dropdown */}
                      <div ref={olMenuRef} style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => { setOlMenuOpen(v => !v); setUlMenuOpen(false); }}
                          title="Ordered List (Numbered List)"
                          style={{ ...toolbarBtnStyle, gap: 5, background: olMenuOpen ? 'rgba(6,182,212,0.18)' : undefined, borderColor: olMenuOpen ? 'rgba(6,182,212,0.4)' : undefined }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                          <span>OL</span>
                          <span style={{ fontSize: 8, opacity: 0.7, marginLeft: -1 }}>▼</span>
                        </button>
                        {olMenuOpen && (
                          <div style={dropdownSt}>
                            <div style={dropdownLabel}>ORDERED LIST STYLE</div>
                            {[['decimal', '1. 2. 3. Numeric'], ['lower-alpha', 'a. b. c. Lower Alpha'], ['upper-alpha', 'A. B. C. Upper Alpha'], ['lower-roman', 'i. ii. iii. Lower Roman'], ['upper-roman', 'I. II. III. Upper Roman']].map(([s, label]) => (
                              <button key={s} type="button" onMouseDown={e => { e.preventDefault(); handleInsertList('ol', s); setOlMenuOpen(false); }} style={dropdownItemSt}>{label}</button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={separator} />

                      {/* CONTENT ELEMENTS */}
                      <span style={toolbarGroupLabel}>Insert</span>
                      <button type="button" onClick={() => insertFormatting('\n> ', '', 'Quote text')} title="Blockquote" style={toolbarBtnStyle}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                        <span>Quote</span>
                      </button>
                      <button type="button" onClick={() => insertFormatting('\n```javascript\n', '\n```\n', '// code here')} title="Code Block" style={{ ...toolbarBtnStyle, color: '#06b6d4' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                        <span>Code</span>
                      </button>
                      <button type="button" onClick={() => insertFormatting('\n---\n', '')} title="Horizontal Divider Rule" style={toolbarBtnStyle}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /></svg>
                        <span>HR</span>
                      </button>

                      <div style={separator} />

                      {/* MEDIA */}
                      <span style={toolbarGroupLabel}>Media</span>
                      <button
                        type="button"
                        onClick={handleOpenImageDialog}
                        title="Insert Image (upload file or paste URL, with optional clickable link)"
                        style={{ ...toolbarBtnStyle, color: '#00e5a0', borderColor: 'rgba(0,229,160,0.3)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        <span>Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleInsertLink}
                        title="Insert Hyperlink"
                        style={{ ...toolbarBtnStyle, color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        <span>Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleInsertAd}
                        title="Insert Sponsor / Ad Box"
                        style={{ ...toolbarBtnStyle, color: '#f5c842', borderColor: 'rgba(245,200,66,0.3)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <span>Ad Box</span>
                      </button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      rows={14}
                      placeholder="Write full article body here. Select text then click a toolbar button to apply formatting, or place cursor and click to insert..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(6,8,18,0.85)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0 0 10px 10px',
                        color: '#e4e4e7',
                        fontSize: 13.5,
                        outline: 'none',
                        fontFamily: "'JetBrains Mono', monospace",
                        resize: 'vertical',
                        lineHeight: 1.7,
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ fontSize: 10, color: '#52525b', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', marginTop: 4 }}>
                      {content.length} chars · {content.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                ) : (
                  /* ── PROFESSIONAL BLOG PREVIEW ── */
                  <div style={{
                    background: '#07090f',
                    border: '1px solid rgba(6,182,212,0.25)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    minHeight: 320,
                  }}>
                    {/* Preview header */}
                    <div style={{ background: 'rgba(6,182,212,0.06)', borderBottom: '1px solid rgba(6,182,212,0.15)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        Article Preview — As it Appears on Blog
                      </span>
                      {coverImage && <img src={coverImage} alt="cover" style={{ height: 18, width: 30, objectFit: 'cover', borderRadius: 3, marginLeft: 'auto', opacity: 0.7 }} />}
                    </div>
                    {/* Preview article */}
                    <div style={{ padding: '28px 32px', maxHeight: 520, overflowY: 'auto' }}>
                      {/* Cover image */}
                      {coverImage && (
                        <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', maxHeight: 200 }}>
                          <img src={coverImage} alt="cover" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                        </div>
                      )}
                      {/* Category + meta bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", background: 'rgba(6,182,212,0.15)', color: '#06b6d4', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(6,182,212,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>{category}</span>
                        <span style={{ fontSize: 11, color: '#52525b', fontFamily: "'JetBrains Mono',monospace" }}>{readTime}</span>
                        <span style={{ fontSize: 11, color: '#52525b', fontFamily: "'JetBrains Mono',monospace", display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          {author}
                        </span>
                      </div>
                      {/* Title */}
                      <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.25 }}>
                        {title || <span style={{ color: '#3f3f46', fontStyle: 'italic' }}>Article title will appear here…</span>}
                      </h1>
                      {/* Excerpt */}
                      {excerpt && (
                        <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic', borderLeft: '3px solid rgba(6,182,212,0.4)', paddingLeft: 14 }}>{excerpt}</p>
                      )}
                      {/* Body content — rendered */}
                      <div
                        className="blog-preview-content"
                        dangerouslySetInnerHTML={{ __html: content ? renderMarkdown(content) : '<p style="color:#3f3f46;font-style:italic">Start writing content to see a live preview…</p>' }}
                      />
                    </div>
                    {/* Preview styles */}
                    <style>{`
                      .blog-preview-content { font-size:15px; line-height:1.85; color:#d4d4d8; }
                      .blog-preview-content h1 { font-family:'Syne',sans-serif; font-size:2em; font-weight:900; color:#fff; margin:1.6em 0 0.5em; line-height:1.2; }
                      .blog-preview-content h2 { font-family:'Syne',sans-serif; font-size:1.5em; font-weight:800; color:#fff; margin:1.5em 0 0.5em; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; }
                      .blog-preview-content h3 { font-family:'Syne',sans-serif; font-size:1.2em; font-weight:700; color:#06b6d4; margin:1.3em 0 0.4em; }
                      .blog-preview-content h4 { font-size:1em; font-weight:700; color:#e4e4e7; margin:1.1em 0 0.3em; }
                      .blog-preview-content p { margin:0 0 1.2em; }
                      .blog-preview-content strong { color:#fff; font-weight:700; }
                      .blog-preview-content em { color:#d4d4d8; font-style:italic; }
                      .blog-preview-content del { color:#71717a; }
                      .blog-preview-content code { background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.25); border-radius:5px; padding:2px 7px; font-family:'JetBrains Mono',monospace; font-size:0.85em; color:#06b6d4; }
                      .blog-preview-content pre { background:#060810; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:16px 20px; margin:1.2em 0; overflow-x:auto; }
                      .blog-preview-content pre code { background:none; border:none; padding:0; color:#a3e635; font-size:0.88em; }
                      .blog-preview-content blockquote { border-left:3px solid #06b6d4; padding:10px 0 10px 20px; margin:1.4em 0; color:#a1a1aa; font-style:italic; background:rgba(6,182,212,0.05); border-radius:0 10px 10px 0; }
                      .blog-preview-content ul { list-style:disc; margin:0 0 1.2em 1.5em; }
                      .blog-preview-content ol { list-style:decimal; margin:0 0 1.2em 1.5em; }
                      .blog-preview-content li { margin-bottom:0.45em; }
                      .blog-preview-content a { color:#06b6d4; text-decoration:underline; }
                      .blog-preview-content hr { border:none; border-top:1px solid rgba(255,255,255,0.1); margin:2em 0; }
                      .blog-preview-content img { max-width:100%; border-radius:10px; margin:1em 0; display:block; }
                    `}</style>
                  </div>
                )}
              </div>

              {/* Author Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>AUTHOR NAME</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 6 }}>AUTHOR ROLE</label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* PUBLISHING STATUS SELECTOR (DRAFT VS PUBLISHED LIVE) */}
              <div
                style={{
                  background: 'rgba(18, 22, 36, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  marginTop: 10,
                }}
              >
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#06b6d4', marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ARTICLE PUBLISHING STATUS & SETTINGS
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  {/* Option 1: Publish Live */}
                  <div
                    onClick={() => setPublished(true)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: published ? 'rgba(0, 229, 160, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${published ? '#00e5a0' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <input
                      type="radio"
                      name="articleStatus"
                      checked={published}
                      onChange={() => setPublished(true)}
                      style={{ cursor: 'pointer', accentColor: '#00e5a0' }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: published ? '#00e5a0' : '#fff' }}>
                        ● Publish Live
                      </div>
                      <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
                        Visible immediately to all website visitors
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Save as Draft / Unpublished */}
                  <div
                    onClick={() => setPublished(false)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: !published ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${!published ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <input
                      type="radio"
                      name="articleStatus"
                      checked={!published}
                      onChange={() => setPublished(false)}
                      style={{ cursor: 'pointer', accentColor: '#ef4444' }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: !published ? '#ef4444' : '#fff' }}>
                        ○ Save as Draft / Unpublish
                      </div>
                      <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
                        Hidden from public site (Admin only)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Feature & Modal Options */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#e4e4e7' }}>
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                    ★ Feature on Top Hero Banner
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#e4e4e7' }}>
                    <input type="checkbox" checked={allowModal} onChange={(e) => setAllowModal(e.target.checked)} />
                    📖 Allow Lightbox Modal Reader
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '11px 22px',
                    borderRadius: 10,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: published
                      ? 'linear-gradient(135deg, #06b6d4 0%, #00e5a0 100%)'
                      : 'rgba(239, 68, 68, 0.25)',
                    color: published ? '#000' : '#ef4444',
                    border: published ? 'none' : '1px solid #ef4444',
                    padding: '11px 28px',
                    borderRadius: 10,
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    boxShadow: published ? '0 4px 20px rgba(6,182,212,0.35)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isSubmitting ? (
                    <>Saving...</>
                  ) : published ? (
                    <>🚀 {editingBlog ? 'Save & Publish Live' : 'Publish Article Live Now'}</>
                  ) : (
                    <>📁 {editingBlog ? 'Save as Draft / Unpublished' : 'Save Draft (Unpublished)'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling helper for content toolbar buttons
const toolbarBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e4e4e7',
  padding: '5px 10px',
  borderRadius: 7,
  fontSize: 11,
  fontFamily: "'JetBrains Mono', monospace",
  cursor: 'pointer',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap' as const,
};

const toolbarGroupLabel: React.CSSProperties = {
  fontSize: 9,
  fontFamily: "'JetBrains Mono', monospace",
  color: '#3f3f46',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginRight: 2,
  userSelect: 'none' as const,
  alignSelf: 'center',
};

const separator: React.CSSProperties = {
  width: 1,
  height: 20,
  background: 'rgba(255,255,255,0.1)',
  margin: '0 4px',
  alignSelf: 'center',
};

const dropdownSt: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  zIndex: 100,
  background: '#0c0f1a',
  border: '1px solid rgba(6,182,212,0.3)',
  borderRadius: 10,
  padding: '6px',
  minWidth: 180,
  boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
};

const dropdownLabel: React.CSSProperties = {
  fontSize: 9,
  fontFamily: "'JetBrains Mono', monospace",
  color: '#52525b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  padding: '4px 8px 6px',
};

const dropdownItemSt: React.CSSProperties = {
  display: 'block',
  width: '100%',
  background: 'transparent',
  border: 'none',
  color: '#e4e4e7',
  padding: '7px 10px',
  borderRadius: 7,
  fontSize: 12,
  fontFamily: "'JetBrains Mono', monospace",
  cursor: 'pointer',
  textAlign: 'left' as const,
  transition: 'background 0.15s',
};

const inputSt: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

/**
 * Minimal but solid markdown → HTML renderer for the admin article preview.
 * Supports: headings, bold, italic, strikethrough, inline code, code blocks,
 * blockquotes, unordered lists, ordered lists, images, links, and HR.
 * Raw HTML blocks (e.g. <ul style=...>) pass through untouched.
 */
function renderMarkdown(md: string): string {
  if (!md) return '';
  let html = md;

  // Preserve raw HTML blocks (pass through)
  const htmlBlocks: string[] = [];
  html = html.replace(/<(?:div|ul|ol|li|table|figure|section|article|aside|header|footer)[^>]*>[\s\S]*?<\/(?:div|ul|ol|li|table|figure|section|article|aside|header|footer)>/gi, (match) => {
    htmlBlocks.push(match);
    return `%%HTML_BLOCK_${htmlBlocks.length - 1}%%`;
  });

  // Fenced code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) =>
    `<pre><code class="language-${lang || 'text'}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`
  );

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Unordered list — consecutive `- ` lines
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered list — consecutive `1. ` etc. lines
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Images before links to avoid conflict
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold + Italic combined ***text***
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Strikethrough ~~text~~
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Paragraphs: wrap non-empty, non-block lines
  const blockTags = ['<h1', '<h2', '<h3', '<h4', '<ul', '<ol', '<li', '<blockquote', '<pre', '<hr', '<img', '%%HTML'];
  html = html.split('\n').map(line => {
    if (!line.trim()) return '';
    if (blockTags.some(t => line.trim().startsWith(t))) return line;
    return `<p>${line}</p>`;
  }).join('\n');

  // Restore raw HTML blocks
  html = html.replace(/%%HTML_BLOCK_(\d+)%%/g, (_m, i) => htmlBlocks[Number(i)]);

  return html;
}

