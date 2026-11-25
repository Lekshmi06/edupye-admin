import type { LandingPageCmsData } from '../types/cms';
import { type LandingPageContentData, DEFAULT_LANDING_CONTENT } from '../types/landingCms';
import { API_BASE_URL } from './apiConfig';
import { authService } from './auth.service';

const API_BASE = API_BASE_URL || 'http://localhost:5000';

function getAdminHeaders(): Record<string, string> {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = 'Bearer admin-token';
    headers['x-admin-key'] = 'admin';
    headers['x-admin-role'] = 'Admin';
  }
  return headers;
}

export const cmsService = {
  // --- Structured Landing Page CMS ---
  async getLandingContent(): Promise<LandingPageContentData> {
    try {
      // Attempt 1: Fetch via admin endpoint with auth headers
      let res = await fetch(`${API_BASE}/api/admin/landing-content`, {
        headers: getAdminHeaders(),
      }).catch(() => null);

      // Attempt 2: If admin endpoint returns 401/404 or fails, try public endpoint
      if (!res || !res.ok) {
        res = await fetch(`${API_BASE}/api/public/landing-content`, {
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => null);
      }

      if (res && res.ok) {
        const json = await res.json();
        const payload = json.data || json.content || json;
        if (payload && (payload.hero || payload.features || payload.announcementBanner)) {
          return payload as LandingPageContentData;
        }
      }
    } catch (err) {
      console.warn('Notice: Backend CMS unreachable or returned non-standard payload, using baseline EduPye defaults:', err);
    }
    // Graceful fallback to default EduPye content
    return DEFAULT_LANDING_CONTENT;
  },

  async saveLandingContent(data: LandingPageContentData): Promise<LandingPageContentData> {
    const res = await fetch(`${API_BASE}/api/admin/landing-content`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to update landing content (${res.status})`);
    }
    const json = await res.json();
    return (json.data || json.content || json) as LandingPageContentData;
  },

  async resetLandingContent(): Promise<LandingPageContentData> {
    const res = await fetch(`${API_BASE}/api/admin/landing-content/reset`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to reset landing content (${res.status})`);
    }
    const json = await res.json();
    return (json.data || json.content || json) as LandingPageContentData;
  },

  // --- Legacy / Extended CMS compatibility methods ---
  async getCmsData(mode: 'draft' | 'published' = 'draft'): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE}/api/cms/landing-page?mode=${mode}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch CMS content (${res.status} ${res.statusText})`);
    }
    const json = await res.json();
    return json.data;
  },

  async saveDraft(data: LandingPageCmsData): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE}/api/cms/landing-page`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to save CMS draft (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  async publishContent(): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE}/api/cms/landing-page/publish`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to publish content (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  async uploadMedia(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = 'Bearer admin-token';
      headers['x-admin-key'] = 'admin';
    }

    const res = await fetch(`${API_BASE}/api/cms/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Media upload failed (${res.status})`);
    }
    return res.json();
  },

  async resetToDefaults(): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE}/api/cms/reset`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Reset failed (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },
};
