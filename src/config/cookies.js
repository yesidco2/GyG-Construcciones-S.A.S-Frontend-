export const COOKIE_CONSENT_NAME = 'gg_cookie_consent';
export const COOKIE_POLICY_VERSION = (import.meta.env.VITE_COOKIE_POLICY_VERSION || '1.0')
  .replace(/[-\s]*borrador/ig, '')
  .trim() || '1.0';
export const CONSENT_MAX_AGE_DAYS = 365;

export const COOKIE_CATEGORIES = Object.freeze({
  necessary: true,
  analytics: false,
});
