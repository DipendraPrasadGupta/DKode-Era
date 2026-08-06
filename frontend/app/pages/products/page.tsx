'use client';

import { usePages } from '@/context/PagesContext';
import ProductEcosystemSection from '@/components/ProductEcosystemSection';
import { pageTokens as tk } from '@/lib/pageTokens';

export default function ProductsPage() {
  const { colors, t } = usePages();

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', padding: '60px 20px 20px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: tk.fontDisplay, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: tk.text, marginBottom: 16 }}>
          Our <span style={{ color: tk.cyan }}>Products</span>
        </h1>
        <p style={{ fontFamily: tk.fontBody, fontSize: 18, color: tk.textMuted, lineHeight: 1.6 }}>
          Discover the complete software ecosystem engineered by D-Kode Era. We build solutions that scale with your business.
        </p>
      </div>

      {/* Re-use the excellent UI component from the homepage */}
      <ProductEcosystemSection colors={colors} t={t} />
    </div>
  );
}
