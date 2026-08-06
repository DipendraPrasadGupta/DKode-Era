'use client';

import { useState, useEffect } from 'react';

interface PricingTier {
  tier: string;
  price: string;
  desc?: string;
  highlight?: boolean;
  features: string[];
  notIncluded?: string[];
}

interface Service {
  id: number;
  title: string;
  desc: string;
  icon: string;
  tags: string; // JSON string
  price: string;
  pricing: string; // JSON string of PricingTier[]
}

const TIER_ACCENT_COLORS = [
  { cyan: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)', bg: 'rgba(6, 182, 212, 0.08)' },
  { cyan: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)', bg: 'rgba(168, 85, 247, 0.08)' },
  { cyan: '#eab308', glow: 'rgba(234, 179, 8, 0.25)', bg: 'rgba(234, 179, 8, 0.08)' },
  { cyan: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', bg: 'rgba(16, 185, 129, 0.08)' },
];

function parseSafe<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export default function AdminPricingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Search & Filter State
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Form State for local tier editing of the selected service
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Quick Feature Inputs state per tier
  const [newIncludedText, setNewIncludedText] = useState<Record<number, string>>({});
  const [newExcludedText, setNewExcludedText] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    fetch('http://localhost:5000/admin/api/services', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load services.');
        return res.json();
      })
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          selectService(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const selectService = (service: Service) => {
    if (hasUnsavedChanges && selectedService && selectedService.id !== service.id) {
      if (!confirm(`You have unsaved pricing changes for "${selectedService.title}". Discard changes?`)) {
        return;
      }
    }
    setSelectedService(service);
    try {
      const parsed = typeof service.pricing === 'string' ? JSON.parse(service.pricing) : service.pricing;
      setTiers(Array.isArray(parsed) ? parsed : []);
    } catch {
      setTiers([]);
    }
    setHasUnsavedChanges(false);
  };

  // Add a new pricing plan tier
  const handleAddTier = () => {
    const defaultTierNames = ['Starter', 'Professional', 'Enterprise', 'Custom Tier'];
    const name = defaultTierNames[tiers.length] || `Plan #${tiers.length + 1}`;

    const newTier: PricingTier = {
      tier: name,
      price: tiers.length === 0 ? 'Rs. 15,000' : tiers.length === 1 ? 'Rs. 35,000' : 'Rs. 75,000',
      desc: 'Complete digital solution tailored for expanding business operations.',
      highlight: tiers.length === 1,
      features: ['Full Responsive Web Interface', 'SEO & Performance Optimization', 'Contact & Lead Capture Form'],
      notIncluded: ['Custom Backend API Integration', 'Dedicated 24/7 Support'],
    };
    setTiers([...tiers, newTier]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveTier = (idx: number) => {
    const updated = tiers.filter((_, i) => i !== idx);
    setTiers(updated);
    setHasUnsavedChanges(true);
  };

  const handleUpdateTierField = (idx: number, field: keyof PricingTier, value: any) => {
    const updated = tiers.map((tier, i) => {
      if (i === idx) {
        return { ...tier, [field]: value };
      }
      return tier;
    });
    setTiers(updated);
    setHasUnsavedChanges(true);
  };

  // Feature editing helpers
  const handleAddFeatureItem = (tierIdx: number, isIncluded: boolean) => {
    const text = isIncluded ? newIncludedText[tierIdx]?.trim() : newExcludedText[tierIdx]?.trim();
    if (!text) return;

    const tier = tiers[tierIdx];
    if (isIncluded) {
      const updatedFeatures = [...(tier.features || []), text];
      handleUpdateTierField(tierIdx, 'features', updatedFeatures);
      setNewIncludedText({ ...newIncludedText, [tierIdx]: '' });
    } else {
      const updatedNotIncluded = [...(tier.notIncluded || []), text];
      handleUpdateTierField(tierIdx, 'notIncluded', updatedNotIncluded);
      setNewExcludedText({ ...newExcludedText, [tierIdx]: '' });
    }
  };

  const handleUpdateFeatureText = (tierIdx: number, isIncluded: boolean, featIdx: number, val: string) => {
    const tier = tiers[tierIdx];
    if (isIncluded) {
      const updatedFeatures = tier.features.map((f, i) => (i === featIdx ? val : f));
      handleUpdateTierField(tierIdx, 'features', updatedFeatures);
    } else {
      const updatedNotIncluded = (tier.notIncluded || []).map((f, i) => (i === featIdx ? val : f));
      handleUpdateTierField(tierIdx, 'notIncluded', updatedNotIncluded);
    }
  };

  const handleRemoveFeature = (tierIdx: number, isIncluded: boolean, featIdx: number) => {
    const tier = tiers[tierIdx];
    if (isIncluded) {
      const updatedFeatures = tier.features.filter((_, i) => i !== featIdx);
      handleUpdateTierField(tierIdx, 'features', updatedFeatures);
    } else {
      const updatedNotIncluded = (tier.notIncluded || []).filter((_, i) => i !== featIdx);
      handleUpdateTierField(tierIdx, 'notIncluded', updatedNotIncluded);
    }
  };

  // Toggle feature between included and excluded list
  const handleToggleFeatureType = (tierIdx: number, isIncluded: boolean, featIdx: number) => {
    const tier = tiers[tierIdx];
    if (isIncluded) {
      const itemToMove = tier.features[featIdx];
      const updatedFeatures = tier.features.filter((_, i) => i !== featIdx);
      const updatedNotIncluded = [...(tier.notIncluded || []), itemToMove];
      const nextTiers = tiers.map((t, i) => {
        if (i === tierIdx) {
          return { ...t, features: updatedFeatures, notIncluded: updatedNotIncluded };
        }
        return t;
      });
      setTiers(nextTiers);
    } else {
      const itemToMove = (tier.notIncluded || [])[featIdx];
      const updatedNotIncluded = (tier.notIncluded || []).filter((_, i) => i !== featIdx);
      const updatedFeatures = [...(tier.features || []), itemToMove];
      const nextTiers = tiers.map((t, i) => {
        if (i === tierIdx) {
          return { ...t, features: updatedFeatures, notIncluded: updatedNotIncluded };
        }
        return t;
      });
      setTiers(nextTiers);
    }
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!selectedService) return;
    setFormLoading(true);
    const token = localStorage.getItem('adminToken');

    // Parse tags to make sure we don't clear them
    let parsedTags = [];
    try {
      parsedTags = typeof selectedService.tags === 'string' ? JSON.parse(selectedService.tags) : selectedService.tags;
    } catch {
      parsedTags = [];
    }

    const payload = {
      num: (selectedService as any).num || '',
      icon: selectedService.icon,
      title: selectedService.title,
      titleNp: (selectedService as any).titleNp || '',
      desc: selectedService.desc,
      tags: parsedTags,
      price: selectedService.price,
      pricing: tiers,
    };

    try {
      const res = await fetch(`http://localhost:5000/admin/api/services/${selectedService.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save subscription pricing structure.');

      showNotif('success', `Pricing packages for "${selectedService.title}" updated successfully!`);
      setHasUnsavedChanges(false);

      // Update our local state array of services
      const updatedServices = services.map((s) => {
        if (s.id === selectedService.id) {
          return { ...s, pricing: JSON.stringify(tiers) };
        }
        return s;
      });
      setServices(updatedServices);
    } catch (err: any) {
      showNotif('error', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Overall Stats
  const totalTiersCount = services.reduce((acc, curr) => {
    const parsed = parseSafe<PricingTier[]>(curr.pricing, []);
    return acc + (Array.isArray(parsed) ? parsed.length : 0);
  }, 0);

  const featuredTiersCount = services.reduce((acc, curr) => {
    const parsed = parseSafe<PricingTier[]>(curr.pricing, []);
    return acc + (Array.isArray(parsed) ? parsed.filter((t) => t.highlight).length : 0);
  }, 0);

  if (loading)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #27272a', borderTopColor: '#06b6d4', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>LOADING SUBSCRIPTION CMS...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444' }}>
        <b>Connection Error: </b>{error}
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        .toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 14px 26px; border-radius: 12px;
          font-weight: 700; font-size: 13.5px; z-index: 200;
          animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
          display: flex; align-items: center; gap: 10px;
        }
        .toast-success { background: linear-gradient(135deg, #10b981, #059669); color: #050810; }
        .toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; }

        .stat-badge-box {
          background: linear-gradient(135deg, rgba(16,20,32,0.95) 0%, rgba(22,27,42,0.85) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 200px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .stat-badge-box:hover {
          border-color: rgba(6,182,212,0.4);
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(6,182,212,0.15);
        }

        .service-cat-pill {
          padding: 14px 16px;
          background: #090a10;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #a1a1aa;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: all 0.25s ease;
        }
        .service-cat-pill:hover {
          background: rgba(255,255,255,0.04);
          color: #e4e4e7;
          transform: translateX(4px);
        }
        @media (max-width: 1024px) {
          .admin-pricing-two-col {
            grid-template-columns: 1fr !important;
          }
        }
        .service-cat-pill.active {
          background: rgba(6,182,212,0.12);
          border-color: rgba(6,182,212,0.35);
          color: #06b6d4;
          box-shadow: 0 4px 16px rgba(6,182,212,0.15);
        }

        .btn-save-cms {
          padding: 12px 26px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border: none; border-radius: 10px;
          color: #050810; font-size: 13.5px; font-weight: 800;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 6px 20px rgba(6,182,212,0.3);
          transition: all 0.25s ease;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-save-cms:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(6,182,212,0.45); }
        .btn-save-cms:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-add-tier-cms {
          padding: 10px 18px;
          background: rgba(6,182,212,0.12);
          border: 1px solid rgba(6,182,212,0.3);
          border-radius: 10px;
          color: #06b6d4;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-add-tier-cms:hover {
          background: rgba(6,182,212,0.22);
          box-shadow: 0 4px 14px rgba(6,182,212,0.2);
        }

        .tier-editor-card {
          background: linear-gradient(135deg, #0c0e17 0%, #131622 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 26px;
          position: relative;
          backdrop-filter: blur(14px);
          transition: all 0.3s ease;
        }
        .tier-editor-card:hover {
          border-color: rgba(6,182,212,0.3);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }

        .input-cms {
          width: 100%; box-sizing: border-box;
          padding: 12px 16px;
          background: #090a10; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e4e4e7;
          font-size: 13.5px; font-family: 'Outfit', sans-serif;
          outline: none; transition: all 0.25s ease;
        }
        .input-cms:focus { border-color: #06b6d4; box-shadow: 0 0 0 3.5px rgba(6,182,212,0.2); }

        .feature-row-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #090a10;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      {/* Notification Toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, margin: 0, color: '#f4f4f5' }}>
            Service Subscriptions & Pricing
          </h2>
          <p style={{ fontSize: 13.5, color: '#71717a', margin: '4px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
            Configure starter, professional, and enterprise tiers for each service category
          </p>
        </div>

        {selectedService && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {hasUnsavedChanges && (
              <span style={{ fontSize: 12, color: '#f59e0b', background: 'rgba(245,158,11,0.14)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                ⚠️ Unsaved Changes
              </span>
            )}
            <button onClick={handleSave} disabled={formLoading} className="btn-save-cms">
              <span>{formLoading ? '⏳' : '💾'}</span>
              <span>{formLoading ? 'Saving Plans...' : 'Save Pricing Plans'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Top Metric Stats Overview ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{totalTiersCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Packages</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⭐
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{featuredTiersCount}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Featured Tiers</div>
          </div>
        </div>

        <div className="stat-badge-box">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>{services.length}</div>
            <div style={{ fontSize: 11, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Categories</div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar & Plan Editor ── */}
      <div className="admin-pricing-two-col" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left Column: Service Categories Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, pointerEvents: 'none', color: '#71717a' }}>🔍</span>
            <input
              type="text"
              placeholder="Search category..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="input-cms"
              style={{ paddingLeft: 34, padding: '9px 12px 9px 34px', fontSize: 12.5 }}
            />
          </div>

          <div style={{ fontSize: 10.5, color: '#71717a', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.08em', padding: '4px 4px 0' }}>
            SERVICE CATEGORIES ({filteredServices.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '68vh', overflowY: 'auto' }}>
            {filteredServices.map((s) => {
              const isSelected = selectedService?.id === s.id;
              const tierCount = parseSafe<PricingTier[]>(s.pricing, []).length;

              return (
                <div
                  key={s.id}
                  onClick={() => selectService(s)}
                  className={`service-cat-pill ${isSelected ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{s.title}</span>
                  </div>

                  <span
                    style={{
                      fontSize: 10.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#06b6d4' : '#71717a',
                    }}
                  >
                    {tierCount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Plan Tier Editor & Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {selectedService ? (
            <>
              {/* Category Bar Header & View Switcher */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 100%)',
                  border: '1px solid rgba(6,182,212,0.25)',
                  borderRadius: 16,
                  padding: '20px 26px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      background: 'rgba(6,182,212,0.15)',
                      border: '1px solid rgba(6,182,212,0.3)',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      boxShadow: '0 4px 14px rgba(6,182,212,0.2)',
                    }}
                  >
                    {selectedService.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif" }}>
                      {selectedService.title}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#a1a1aa' }}>
                      {selectedService.desc.slice(0, 110)}...
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* View Mode Toggle */}
                  <div style={{ background: '#090a10', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setActiveTab('editor')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 7,
                        border: 'none',
                        background: activeTab === 'editor' ? '#06b6d4' : 'transparent',
                        color: activeTab === 'editor' ? '#050810' : '#a1a1aa',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit Tiers ({tiers.length})
                    </button>

                    <button
                      onClick={() => setActiveTab('preview')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 7,
                        border: 'none',
                        background: activeTab === 'preview' ? '#06b6d4' : 'transparent',
                        color: activeTab === 'preview' ? '#050810' : '#a1a1aa',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      👁️ Live Client View
                    </button>
                  </div>

                  <button onClick={handleAddTier} className="btn-add-tier-cms">
                    <span>➕</span> Add Tier
                  </button>
                </div>
              </div>

              {/* EDITOR TAB */}
              {activeTab === 'editor' && (
                <>
                  {tiers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 20px', background: '#12121a', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, color: '#71717a' }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>💰</div>
                      <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 16 }}>No Pricing Tiers Defined</div>
                      <p style={{ margin: '4px 0 18px 0', fontSize: 13, opacity: 0.7 }}>Clients visiting this service page will see default custom quote options.</p>
                      <button onClick={handleAddTier} className="btn-add-tier-cms">
                        ➕ Add First Plan Tier
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {tiers.map((tier, tierIdx) => {
                        const accent = TIER_ACCENT_COLORS[tierIdx % TIER_ACCENT_COLORS.length];

                        return (
                          <div
                            key={tierIdx}
                            className="tier-editor-card"
                            style={{
                              borderLeft: `4px solid ${accent.cyan}`,
                            }}
                          >
                            {/* Top Header Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 20 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, background: accent.bg, color: accent.cyan, padding: '3px 10px', borderRadius: 12, border: `1px solid ${accent.cyan}44` }}>
                                  PACKAGE TIER #{tierIdx + 1}
                                </span>
                                {tier.highlight && (
                                  <span style={{ fontSize: 10.5, color: '#f59e0b', background: 'rgba(245,158,11,0.14)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(245,158,11,0.3)', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                                    ⭐ Featured Package
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: tier.highlight ? '#f59e0b' : '#a1a1aa', cursor: 'pointer', margin: 0, fontWeight: 700 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!tier.highlight}
                                    onChange={(e) => handleUpdateTierField(tierIdx, 'highlight', e.target.checked)}
                                    style={{ accentColor: '#f59e0b', width: 16, height: 16 }}
                                  />
                                  <span>★ Most Popular</span>
                                </label>

                                <button
                                  onClick={() => handleRemoveTier(tierIdx)}
                                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}
                                  title="Delete this tier"
                                >
                                  🗑️ Remove Tier
                                </button>
                              </div>
                            </div>

                            {/* Row 1: Name & Price */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                                  Package Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  value={tier.tier}
                                  onChange={(e) => handleUpdateTierField(tierIdx, 'tier', e.target.value)}
                                  placeholder="e.g. Starter, Professional, Enterprise"
                                  className="input-cms"
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                                  Price Display <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  value={tier.price}
                                  onChange={(e) => handleUpdateTierField(tierIdx, 'price', e.target.value)}
                                  placeholder="e.g. Rs. 25,000 or $299/mo"
                                  className="input-cms"
                                />
                              </div>
                            </div>

                            {/* Row 2: Short Description */}
                            <div style={{ marginBottom: 20 }}>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
                                Plan Tagline / Description
                              </label>
                              <input
                                type="text"
                                value={tier.desc || ''}
                                onChange={(e) => handleUpdateTierField(tierIdx, 'desc', e.target.value)}
                                placeholder="e.g. Perfect for small businesses needing a strong online presence fast."
                                className="input-cms"
                              />
                            </div>

                            {/* Dual Features Columns (Included vs. Excluded) */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                              {/* Included Features List (✓) */}
                              <div style={{ background: '#090a10', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>✓</span>
                                  <span>INCLUDED DELIVERABLES ({tier.features.length})</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                  {tier.features.map((feat, featIdx) => (
                                    <div key={featIdx} className="feature-row-box">
                                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: 13 }}>✓</span>
                                      <input
                                        type="text"
                                        value={feat}
                                        onChange={(e) => handleUpdateFeatureText(tierIdx, true, featIdx, e.target.value)}
                                        className="input-cms"
                                        style={{ padding: '6px 10px', fontSize: 12.5 }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFeatureType(tierIdx, true, featIdx)}
                                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 12, padding: 4 }}
                                        title="Move to Excluded list"
                                      >
                                        ✗
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(tierIdx, true, featIdx)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: 4 }}
                                        title="Remove feature"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Included Feature Input */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <input
                                    type="text"
                                    placeholder="Add included item..."
                                    value={newIncludedText[tierIdx] || ''}
                                    onChange={(e) => setNewIncludedText({ ...newIncludedText, [tierIdx]: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddFeatureItem(tierIdx, true);
                                      }
                                    }}
                                    className="input-cms"
                                    style={{ padding: '6px 10px', fontSize: 12 }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddFeatureItem(tierIdx, true)}
                                    style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    + Add
                                  </button>
                                </div>
                              </div>

                              {/* Excluded Features List (✗) */}
                              <div style={{ background: '#090a10', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>✗</span>
                                  <span>EXCLUDED DELIVERABLES ({(tier.notIncluded || []).length})</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                  {(tier.notIncluded || []).map((feat, featIdx) => (
                                    <div key={featIdx} className="feature-row-box">
                                      <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 13 }}>✗</span>
                                      <input
                                        type="text"
                                        value={feat}
                                        onChange={(e) => handleUpdateFeatureText(tierIdx, false, featIdx, e.target.value)}
                                        className="input-cms"
                                        style={{ padding: '6px 10px', fontSize: 12.5, textDecoration: 'line-through', opacity: 0.7 }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFeatureType(tierIdx, false, featIdx)}
                                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: 12, padding: 4 }}
                                        title="Move to Included list"
                                      >
                                        ✓
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(tierIdx, false, featIdx)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: 4 }}
                                        title="Remove feature"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Excluded Feature Input */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <input
                                    type="text"
                                    placeholder="Add excluded item..."
                                    value={newExcludedText[tierIdx] || ''}
                                    onChange={(e) => setNewExcludedText({ ...newExcludedText, [tierIdx]: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddFeatureItem(tierIdx, false);
                                      }
                                    }}
                                    className="input-cms"
                                    style={{ padding: '6px 10px', fontSize: 12 }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddFeatureItem(tierIdx, false)}
                                    style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    + Exclude
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* LIVE PREVIEW TAB */}
              {activeTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontSize: 12, color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    LIVE CLIENT WEBSITE PREVIEW ({selectedService.title})
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                    {tiers.map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: t.highlight ? 'linear-gradient(135deg, #121626 0%, #1a1e36 100%)' : '#0c0e18',
                          border: t.highlight ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 16,
                          padding: 24,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: t.highlight ? '0 16px 40px rgba(6,182,212,0.2)' : 'none',
                          position: 'relative',
                        }}
                      >
                        {t.highlight && (
                          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', color: '#050810', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                            ⭐ Most Popular
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#f4f4f5', fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>
                            {t.tier}
                          </div>

                          <div style={{ fontSize: 24, fontWeight: 800, color: '#06b6d4', fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>
                            {t.price}
                          </div>

                          <p style={{ fontSize: 12.5, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 16 }}>
                            {t.desc || 'Complete solution tailored for business operations.'}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {t.features.map((feat, i) => (
                              <div key={i} style={{ fontSize: 12, color: '#e4e4e7', display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}

                            {(t.notIncluded || []).map((feat, i) => (
                              <div key={i} style={{ fontSize: 12, color: '#71717a', display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'line-through', opacity: 0.6 }}>
                                <span style={{ color: '#ef4444', fontWeight: 800 }}>✗</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: t.highlight ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'rgba(255,255,255,0.06)',
                            border: t.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            color: t.highlight ? '#050810' : '#e4e4e7',
                            fontWeight: 800,
                            fontSize: 12.5,
                            cursor: 'pointer',
                          }}
                        >
                          Choose Package
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 80, background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#71717a' }}>
              Select a service from the left sidebar to edit its subscription pricing structure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
