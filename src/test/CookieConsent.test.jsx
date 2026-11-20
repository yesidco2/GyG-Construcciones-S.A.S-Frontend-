import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CookieConsentManager from '../components/CookieConsentManager';
import Footer from '../components/Footer';
import CookiePolicyPage from '../pages/CookiePolicyPage';
import {
  COOKIE_CONSENT_NAME,
  COOKIE_POLICY_VERSION,
} from '../config/cookies';
import {
  clearAnalyticsStorage,
  loadIfConsented,
  readCookieConsent,
  saveCookieConsent,
} from '../utils/consentState';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('../components/auth/CaptchaWidget', () => ({
  default: () => <div>CAPTCHA widget</div>,
}));

function setConsentCookie(consent) {
  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Path=/`;
}

function makeConsent({ version = COOKIE_POLICY_VERSION, date = new Date().toISOString(), analytics = false } = {}) {
  return {
    version,
    fecha: date,
    categorias: { necessary: true, analytics },
  };
}

beforeEach(() => {
  document.cookie.split(/;\s*/).forEach((cookie) => {
    const name = cookie.split('=')[0];
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  });
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cookie consent decision and gated loading', () => {
  it('shows the first-visit banner and does not run optional analytics', () => {
    const analyticsLoader = vi.fn();
    render(<CookieConsentManager />);

    expect(screen.getByRole('region', { name: 'Aviso de cookies' })).toBeInTheDocument();
    expect(loadIfConsented('analytics', analyticsLoader)).toBeUndefined();
    expect(analyticsLoader).not.toHaveBeenCalled();
    expect(readCookieConsent()).toBeNull();
  });

  it('stores a rejection and keeps the analytics loader blocked', async () => {
    const user = userEvent.setup();
    const analyticsLoader = vi.fn();
    const changed = vi.fn();
    window.addEventListener('cookie-consent-changed', changed);
    render(<CookieConsentManager />);

    await user.click(screen.getByRole('button', { name: 'Rechazar no esenciales' }));

    expect(screen.queryByRole('region', { name: 'Aviso de cookies' })).not.toBeInTheDocument();
    expect(readCookieConsent()).toMatchObject({
      version: COOKIE_POLICY_VERSION,
      categorias: { necessary: true, analytics: false },
    });
    expect(loadIfConsented('analytics', analyticsLoader)).toBeUndefined();
    expect(analyticsLoader).not.toHaveBeenCalled();
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({
      detail: expect.objectContaining({ categorias: { necessary: true, analytics: false } }),
    }));
    window.removeEventListener('cookie-consent-changed', changed);
  });

  it('stores acceptance and permits analytics loaders only after acceptance', async () => {
    const user = userEvent.setup();
    const analyticsLoader = vi.fn(() => 'loaded');
    render(<CookieConsentManager />);

    await user.click(screen.getByRole('button', { name: 'Aceptar todas' }));

    expect(readCookieConsent()?.categorias.analytics).toBe(true);
    expect(loadIfConsented('analytics', analyticsLoader)).toBe('loaded');
    expect(analyticsLoader).toHaveBeenCalledOnce();
  });

  it('requests a new decision when the policy version changes or consent is older than twelve months', () => {
    setConsentCookie(makeConsent({ version: '0.9', analytics: true }));
    expect(readCookieConsent()).toBeNull();

    setConsentCookie(makeConsent({
      date: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString(),
      analytics: true,
    }));
    expect(readCookieConsent()).toBeNull();
  });

  it('treats Global Privacy Control as a rejection of analytics', () => {
    vi.stubGlobal('navigator', { ...navigator, globalPrivacyControl: true });
    const analyticsLoader = vi.fn();
    saveCookieConsent({ analytics: true });

    expect(readCookieConsent()?.categorias.analytics).toBe(false);
    expect(loadIfConsented('analytics', analyticsLoader)).toBeUndefined();
    expect(analyticsLoader).not.toHaveBeenCalled();
  });

  it('clears recognized analytics cookies and browser storage when analytics is revoked', () => {
    document.cookie = '_ga_test=tracking; Path=/';
    localStorage.setItem('analytics-cache', 'tracking');
    localStorage.setItem('app-preference', 'keep');
    sessionStorage.setItem('_ga_session', 'tracking');

    saveCookieConsent({ analytics: true });
    saveCookieConsent({ analytics: false });
    clearAnalyticsStorage();

    expect(document.cookie).not.toContain('_ga_test');
    expect(localStorage.getItem('analytics-cache')).toBeNull();
    expect(sessionStorage.getItem('_ga_session')).toBeNull();
    expect(localStorage.getItem('app-preference')).toBe('keep');
    expect(readCookieConsent()?.categorias.analytics).toBe(false);
  });
});

describe('cookie preferences accessibility', () => {
  it('allows the Footer to reopen preferences; Escape closes without saving analytics and restores focus', async () => {
    const user = userEvent.setup();
    saveCookieConsent({ analytics: false });
    render(
      <>
        <Footer />
        <CookieConsentManager />
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Preferencias de cookies' });

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Preferencias de cookies' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Preferencias de cookies'));

    fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(
      within(dialog).getByRole('button', { name: 'Rechazar no esenciales' }),
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(readCookieConsent()?.categorias.analytics).toBe(false);
  });

  it('saves configured analytics preferences and announces the result', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Footer />
        <CookieConsentManager />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Configurar' }));

    const dialog = screen.getByRole('dialog', { name: 'Preferencias de cookies' });
    const analytics = within(dialog).getByRole('checkbox', { name: 'Analítica' });
    expect(analytics).not.toBeChecked();
    await user.click(analytics);
    await user.click(within(dialog).getByRole('button', { name: 'Guardar preferencias' }));

    expect(readCookieConsent()?.categorias.analytics).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Tus preferencias de cookies se guardaron.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Preferencias de cookies' })).toHaveFocus());
  });
});

describe('cookie policy page', () => {
  it('displays the published policy, inventory table, and privacy contact link', () => {
    render(<CookiePolicyPage />);

    expect(screen.getByRole('heading', { name: 'Política de cookies', level: 1 })).toBeInTheDocument();
    expect(screen.queryByText(/borrador|pendiente|verificar/i)).not.toBeInTheDocument();
    expect(screen.getByText(COOKIE_POLICY_VERSION)).toBeInTheDocument();
    expect(screen.getByText('9 de noviembre de 2026')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Duración' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'proyectos@gng.co' }))
      .toHaveAttribute('href', 'mailto:proyectos@gng.co');
  });
});
