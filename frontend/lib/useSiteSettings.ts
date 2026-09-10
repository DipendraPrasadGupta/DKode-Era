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

// Simple module-level cache (shared across all component instances)
let _cachedSettings: SiteSettings | null = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(_cachedSettings ?? ({} as SiteSettings));
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
        _cachedSettings = data as SiteSettings;
        _cacheTime = Date.now();
        setSettings(_cachedSettings);
        setLoading(false);
      })
      .catch(() => {
        setSettings({} as SiteSettings);
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
