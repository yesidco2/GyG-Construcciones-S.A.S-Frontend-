import {
  CONSENT_MAX_AGE_DAYS,
  COOKIE_CONSENT_NAME,
  COOKIE_POLICY_VERSION,
} from '../config/cookies';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ANALYTICS_COOKIE_PATTERN = /^_(ga|gid|gat)(_|$)|^_hj|^_cl(c|s)k|^amp_/i;
const ANALYTICS_STORAGE_PATTERN = /(^|[_-])(analytics|google-analytics|gtm|ga|hotjar|mixpanel|amplitude)([_-]|$)/i;

export function isGlobalPrivacyControlEnabled() {
  return typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
}

function dispatchConsentChanged(consent) {
  window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: consent }));
}

export function readCookieConsent() {
  if (typeof document === 'undefined') return null;

  const rawCookie = document.cookie
    .split(/;\s*/)
    .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_NAME}=`))
    ?.slice(COOKIE_CONSENT_NAME.length + 1);
  if (!rawCookie) return null;

  try {
    const stored = JSON.parse(decodeURIComponent(rawCookie));
    const acceptedAt = Date.parse(stored.fecha);
    if (
      stored.version !== COOKIE_POLICY_VERSION
      || !Number.isFinite(acceptedAt)
      || Date.now() - acceptedAt > CONSENT_MAX_AGE_DAYS * DAY_IN_MS
      || acceptedAt > Date.now()
    ) {
      return null;
    }

    return {
      version: stored.version,
      fecha: new Date(acceptedAt).toISOString(),
      categorias: {
        necessary: true,
        analytics: stored.categorias?.analytics === true && !isGlobalPrivacyControlEnabled(),
      },
    };
  } catch {
    return null;
  }
}

export function hasCookieConsentDecision() {
  return readCookieConsent() !== null;
}

export function saveCookieConsent({ analytics = false } = {}) {
  const consent = {
    version: COOKIE_POLICY_VERSION,
    fecha: new Date().toISOString(),
    categorias: {
      necessary: true,
      analytics: analytics === true && !isGlobalPrivacyControlEnabled(),
    },
  };
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;

  if (!consent.categorias.analytics) clearAnalyticsStorage();
  dispatchConsentChanged(consent);
  return consent;
}

export function clearAnalyticsStorage() {
  if (typeof document === 'undefined') return;

  const hostParts = window.location.hostname.split('.');
  const domains = [window.location.hostname];
  if (hostParts.length > 1) domains.push(`.${hostParts.slice(-2).join('.')}`);

  document.cookie.split(';').forEach((item) => {
    const name = item.split('=')[0]?.trim();
    if (!name || !ANALYTICS_COOKIE_PATTERN.test(name)) return;
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0; Domain=${domain}; SameSite=Lax`;
    }
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  });

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (ANALYTICS_STORAGE_PATTERN.test(key)) storage.removeItem(key);
    }
  }

  if (typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function') {
    indexedDB.databases().then((databases) => {
      databases
        .filter(({ name }) => name && ANALYTICS_STORAGE_PATTERN.test(name))
        .forEach(({ name }) => indexedDB.deleteDatabase(name));
    });
  }
}

export function loadIfConsented(category, loader) {
  if (category === 'necessary') return loader();
  if (category !== 'analytics') return undefined;

  const consent = readCookieConsent();
  if (!consent?.categorias.analytics) return undefined;
  return loader();
}
