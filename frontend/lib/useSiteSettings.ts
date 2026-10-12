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

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  agency_name: 'D-Kode Era',
  agency_tagline: "Nepal's Premier Software & IT Company",
  agency_email: 'dkodeera2026@gmail.com',
  support_email: 'dkodeera2026@gmail.com',
  agency_phone: '+977 9807544395',
  agency_website: 'https://dkodeera.com',
  agency_address: 'Manigram, Butwal, Nepal',
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
  whatsapp_number: '+977 9807544395',
  calendly_link: 'https://calendly.com/d-kode-era',
  seo_title: "D-Kode Era — Nepal's Premier Software & IT Company",
  seo_description: 'Transforming businesses with custom software, mobile apps, enterprise SaaS, and AI automation in Nepal.',
  seo_keywords: 'digital agency, web development, software company, Nepal, Butwal',
};

// Module-level cache
let _cachedSettings: SiteSettings | null = null;
let _cacheTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds for responsive updates

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(
    _cachedSettings && Object.keys(_cachedSettings).length > 0
      ? _cachedSettings
      : DEFAULT_SITE_SETTINGS
  );
  const [loading, setLoading] = useState(!_cachedSettings);

  useEffect(() => {
    const now = Date.now();
    if (_cachedSettings && Object.keys(_cachedSettings).length > 0 && now - _cacheTime < CACHE_TTL) {
      setSettings(_cachedSettings);
      setLoading(false);
      return;
    }

    apiFetch('/api/settings')
      .then((data: Record<string, string>) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const merged: SiteSettings = {
            ...DEFAULT_SITE_SETTINGS,
            ...data,
          };
          _cachedSettings = merged;
          _cacheTime = Date.now();
          setSettings(merged);
        } else {
          setSettings(DEFAULT_SITE_SETTINGS);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not fetch remote settings, using default settings:', err);
        setSettings(DEFAULT_SITE_SETTINGS);
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
