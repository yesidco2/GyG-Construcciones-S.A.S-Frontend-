import { useEffect, useRef, useState } from 'react';

const scriptId = 'gg-turnstile-script';
const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadCaptchaScript() {
  let existingScript = document.getElementById(scriptId);
  if (window.turnstile) {
    if (existingScript) existingScript.dataset.loaded = 'true';
    return Promise.resolve();
  }
  if (existingScript?.dataset.loaded === 'true') {
    existingScript.remove();
    existingScript = null;
  }

  return new Promise((resolve, reject) => {
    const script = existingScript || document.createElement('script');
    const handleLoad = () => {
      if (!window.turnstile) {
        script.remove();
        reject(new Error('El script CAPTCHA cargó, pero no inicializó su API.'));
        return;
      }
      script.dataset.loaded = 'true';
      resolve();
    };
    const handleError = () => {
      script.remove();
      reject(new Error('No se pudo cargar el servicio CAPTCHA.'));
    };
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (!existingScript) {
      script.id = scriptId;
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

export default function CaptchaWidget({ siteKey, action, resetKey, onToken, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const retryRef = useRef(null);
  const callbacksRef = useRef({ onToken, onError });
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    callbacksRef.current = { onToken, onError };
  }, [onToken, onError]);

  useEffect(() => {
    if (!siteKey) return undefined;
    let active = true;
    let observer;
    let initializing = false;

    const initializeWidget = () => {
      if (initializing || widgetIdRef.current !== null) return;
      initializing = true;
      loadCaptchaScript()
        .then(() => {
          initializing = false;
          if (!active || !containerRef.current) return;
          const api = window.turnstile;
          if (!api) throw new Error('El servicio CAPTCHA no está disponible.');

          widgetIdRef.current = api.render(containerRef.current, {
            sitekey: siteKey,
            action,
            callback: (token) => {
              if (!active) return;
              setLoadError('');
              callbacksRef.current.onError('');
              callbacksRef.current.onToken(token);
            },
            'expired-callback': () => {
              if (!active) return;
              callbacksRef.current.onToken('');
              callbacksRef.current.onError('La verificación CAPTCHA expiró. Complétala nuevamente.');
            },
            'timeout-callback': () => {
              if (!active) return;
              callbacksRef.current.onToken('');
              const message = 'El desafío CAPTCHA tardó demasiado. Complétalo nuevamente.';
              setLoadError(message);
              callbacksRef.current.onError(message);
            },
            'error-callback': (errorCode) => {
              if (!active) return;
              callbacksRef.current.onToken('');
              const code = typeof errorCode === 'string' ? ` (código ${errorCode})` : '';
              const message = `Turnstile no pudo completar la verificación${code}. Inténtalo nuevamente.`;
              setLoadError(message);
              callbacksRef.current.onError(message);
            },
            size: 'flexible',
          });
        })
        .catch((error) => {
          initializing = false;
          if (!active) return;
          if (import.meta.env.DEV) {
            console.error('[Turnstile] No se pudo cargar o renderizar el widget.', {
              error,
              scriptUrl: scriptUrl,
              online: navigator.onLine,
            });
          }
          const message = 'No se pudo cargar el CAPTCHA. Verifica tu conexión e inténtalo de nuevo.';
          setLoadError(message);
          callbacksRef.current.onError(message);
        });
    };

    retryRef.current = () => {
      setLoadError('');
      callbacksRef.current.onError('');
      callbacksRef.current.onToken('');
      const api = window.turnstile;
      if (widgetIdRef.current !== null && api) {
        api.reset?.(widgetIdRef.current);
      } else {
        initializeWidget();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      initializeWidget();
    } else {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        initializeWidget();
      }, { rootMargin: '200px' });
      if (containerRef.current) observer.observe(containerRef.current);
    }

    return () => {
      active = false;
      observer?.disconnect();
      retryRef.current = null;
      initializing = false;
      if (widgetIdRef.current !== null) {
        const api = window.turnstile;
        api?.remove?.(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (widgetIdRef.current === null) return;
    const api = window.turnstile;
    callbacksRef.current.onToken('');
    api?.reset?.(widgetIdRef.current);
  }, [resetKey]);

  if (!siteKey) {
    return <p role="alert" className="text-xs text-error">CAPTCHA no está configurado. Contacta al administrador.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-secondary">Verificación de seguridad</p>
      <div ref={containerRef} aria-label="Desafío CAPTCHA" />
      {loadError && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-industrial-orange underline"
          onClick={() => retryRef.current?.()}
        >
          Reintentar CAPTCHA
        </button>
      )}
    </div>
  );
}
