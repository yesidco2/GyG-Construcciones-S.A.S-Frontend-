import { useCallback, useEffect, useRef, useState } from 'react';
import useCookieConsent from '../hooks/useCookieConsent';

const COOKIE_NOTICE = (
  <>
    Usamos cookies necesarias para que el sitio funcione y mantenga tu sesión segura. Con tu autorización también podemos usar cookies de analítica para mejorar el sitio. Puedes cambiar tu decisión cuando quieras. Más información en nuestra{' '}
    <a href="#politica-cookies" className="font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      Política de cookies
    </a>{' '}
    y en la{' '}
    <a href="#politica-datos" className="font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      Política de tratamiento de datos
    </a>.
  </>
);

function PreferenceDialog({ categories, onClose, onSave }) {
  const [analytics, setAnalytics] = useState(categories.analytics);
  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-primary/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 text-on-surface shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-7"
      >
        <h2
          id="cookie-preferences-title"
          ref={titleRef}
          tabIndex="-1"
          className="font-headline-sm text-2xl font-bold text-primary focus:outline-none"
        >
          Preferencias de cookies
        </h2>
        <p className="mt-2 text-sm text-secondary">
          Elige si autorizas el uso de cookies de analítica. Las necesarias permanecen activas para que el sitio funcione.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-outline-variant p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-primary">Necesarias</h3>
              <input
                type="checkbox"
                checked
                disabled
                aria-label="Cookies necesarias, siempre activas"
                className="h-5 w-5 accent-industrial-orange"
              />
            </div>
            <p className="mt-2 text-sm text-secondary">
              Permiten funciones esenciales del sitio, conservar la decisión de consentimiento y mantener la sesión segura.
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant p-4">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="cookie-analytics" className="font-semibold text-primary">Analítica</label>
              <input
                id="cookie-analytics"
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="h-5 w-5 accent-industrial-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
              />
            </div>
            <p className="mt-2 text-sm text-secondary">
              Permitiría medir el uso del sitio para mejorarlo. No hay un proveedor de analítica configurado actualmente.
            </p>
            <p className="mt-1 text-xs text-secondary">Proveedor: [VERIFICAR]</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSave(analytics)}
            className="rounded-lg border-2 border-primary bg-primary px-4 py-3 text-center font-semibold text-white hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
          >
            Guardar preferencias
          </button>
          <button
            type="button"
            onClick={() => onSave(false)}
            className="rounded-lg border-2 border-primary bg-white px-4 py-3 text-center font-semibold text-primary hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
          >
            Rechazar no esenciales
          </button>
        </div>
      </section>
    </div>
  );
}

export default function CookieConsentManager() {
  const { hasDecision, categories, save } = useCookieConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const triggerRef = useRef(null);
  const showBanner = !hasDecision;

  useEffect(() => {
    document.documentElement.classList.toggle('cookie-banner-visible', showBanner);
    return () => document.documentElement.classList.remove('cookie-banner-visible');
  }, [showBanner]);

  useEffect(() => {
    const openPreferences = (event) => {
      triggerRef.current = event.detail?.trigger || document.activeElement;
      setPreferencesOpen(true);
    };
    window.addEventListener('cookie-preferences-open', openPreferences);
    return () => window.removeEventListener('cookie-preferences-open', openPreferences);
  }, []);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus?.());
  }, []);

  const savePreferences = (analytics) => {
    save(analytics);
    setPreferencesOpen(false);
    setConfirmation('Tus preferencias de cookies se guardaron.');
    requestAnimationFrame(() => triggerRef.current?.focus?.());
  };

  return (
    <>
      {showBanner && (
        <section
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/20 bg-primary px-4 py-4 text-white shadow-2xl sm:px-6"
        >
          <div className="mx-auto max-w-container-max">
            <p className="text-sm leading-relaxed">{COOKIE_NOTICE}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => savePreferences(true)}
                className="rounded-lg border-2 border-white bg-white px-4 py-2.5 text-center font-semibold text-primary hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Aceptar todas
              </button>
              <button
                type="button"
                onClick={() => savePreferences(false)}
                className="rounded-lg border-2 border-white bg-primary px-4 py-2.5 text-center font-semibold text-white hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Rechazar no esenciales
              </button>
              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setPreferencesOpen(true);
                }}
                className="rounded-lg border-2 border-white bg-primary px-4 py-2.5 text-center font-semibold text-white hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Configurar
              </button>
            </div>
          </div>
        </section>
      )}
      {preferencesOpen && (
        <PreferenceDialog
          categories={categories}
          onClose={closePreferences}
          onSave={savePreferences}
        />
      )}
      <p className="sr-only" role="status" aria-live="polite">{confirmation}</p>
    </>
  );
}
