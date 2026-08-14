'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from './api';

export interface SiteSettings {
  agency_name: string;
  agency_tagline: string;
  agency_email: string;
  support_email: string;
  agency_phone: string;
  agency_website: string;
  agency_address: string;
  agency_country: string;
  agency_currency: string;
  agency_founded: string;
  agency_team_size: string;
  social_linkedin: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;
  social_github: string;
  whatsapp_number: string;
  calendly_link: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  [key: string]: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  agency_name: 'D-Kode Era',
  agency_tagline: 'We Build Digital Futures',
  agency_email: 'hello@dkodeera.com',
  support_email: 'support@dkodeera.com',
  agency_phone: '+977-9800000000',
  agency_website: 'https://dkodeera.com',
  agency_address: 'Butwal-10, Rupandehi, Nepal',
  agency_country: 'Nepal',
  agency_currency: 'NPR',
  agency_founded: '2026',
  agency_team_size: '5-10',
  social_linkedin: 'https://linkedin.com/company/d-kode-era',
  social_instagram: 'https://instagram.com/d_kode_era',
  social_facebook: 'https://facebook.com/dkodeera',
  social_twitter: 'https://twitter.com/dkodeera',
  social_youtube: '',
  social_github: 'https://github.com/d-kode-era',
  whatsapp_number: '+977-9800000000',
  calendly_link: 'https://calendly.com/d-kode-era',
  seo_title: 'D-Kode Era — Digital Agency',
  seo_description: 'Nepal\'s fastest-growing IT company based in Butwal.',
  seo_keywords: 'digital agency, web development, Nepal',
};

// Simple module-level cache (shared across all component instances)
let _cachedSettings: SiteSettings | null = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(_cachedSettings ?? DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!_cachedSettings);

  useEffect(() => {
    const now = Date.now();
    if (_cachedSettings && now - _cacheTime < CACHE_TTL) {
      setSettings(_cachedSettings);
      setLoading(false);
      return;
    }

    apiFetch('/api/settings')
      .then((data: Record<string, string>) => {
        const merged: SiteSettings = { ...DEFAULT_SETTINGS, ...data };
        _cachedSettings = merged;
        _cacheTime = Date.now();
        setSettings(merged);
        setLoading(false);
      })
      .catch(() => {
        // fallback to defaults silently
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}

/** Call this after admin saves settings to bust the cache */
export function invalidateSiteSettingsCache() {
  _cachedSettings = null;
  _cacheTime = 0;
}
