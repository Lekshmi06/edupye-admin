/**
 * API Configuration Helper
 * Resolves API Base URL for local development and production.
 */
export const API_BASE_URL: string = (() => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
})();
