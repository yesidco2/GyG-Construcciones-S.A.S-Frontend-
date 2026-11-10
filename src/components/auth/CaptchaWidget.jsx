import { useEffect, useRef, useState } from 'react';

export const CAPTCHA_PROVIDER = 'turnstile';

const SCRIPT_IDS = {
  turnstile: 'gg-turnstile-script',
  recaptcha: 'gg-recaptcha-script',
};

function getScriptUrl(provider) {
  return provider === 'recaptcha'
    ? 'https://www.google.com/recaptcha/api.js?render=explicit'
    : 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
}

function getCaptchaApi(provider) {
  return provider === 'recaptcha' ? window.grecaptcha : window.turnstile;
}

function loadCaptchaScript(provider) {
  const scriptId = SCRIPT_IDS[provider];
  const existingScript = document.getElementById(scriptId);
  if (existingScript?.dataset.loaded === 'true' || (existingScript && getCaptchaApi(provider))) {
    if (existingScript) existingScript.dataset.loaded = 'true';
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = existingScript || document.createElement('script');
    const handleLoad = () => {
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
      script.src = getScriptUrl(provider);
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
  const initializingRef = useRef(false);
  const callbacksRef = useRef({ onToken, onError });
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    callbacksRef.current = { onToken, onError };
  }, [onToken, onError]);

  useEffect(() => {
    if (!siteKey) return undefined;
    let active = true;
    let observer;

    const initializeWidget = () => {
      if (initializingRef.current || widgetIdRef.current !== null) return;
      initializingRef.current = true;
      loadCaptchaScript(CAPTCHA_PROVIDER)
        .then(() => {
          initializingRef.current = false;
          if (!active || !containerRef.current) return;
          const api = getCaptchaApi(CAPTCHA_PROVIDER);
          if (!api) throw new Error('El servicio CAPTCHA no está disponible.');

          widgetIdRef.current = api.render(containerRef.current, {
            sitekey: siteKey,
            action,
            callback: (token) => {
              setLoadError('');
              callbacksRef.current.onError('');
              callbacksRef.current.onToken(token);
            },
            'expired-callback': () => {
              callbacksRef.current.onToken('');
              callbacksRef.current.onError('La verificación CAPTCHA expiró. Complétala nuevamente.');
            },
            'timeout-callback': () => {
              callbacksRef.current.onToken('');
              const message = 'El desafío CAPTCHA tardó demasiado. Complétalo nuevamente.';
              setLoadError(message);
              callbacksRef.current.onError(message);
            },
            'error-callback': (errorCode) => {
              callbacksRef.current.onToken('');
              const code = typeof errorCode === 'string' ? ` (código ${errorCode})` : '';
              const message = `Turnstile no pudo completar la verificación${code}. Inténtalo nuevamente.`;
              setLoadError(message);
              callbacksRef.current.onError(message);
            },
            ...(CAPTCHA_PROVIDER === 'recaptcha' ? { theme: 'light', size: 'normal' } : {}),
          });
        })
        .catch(() => {
          initializingRef.current = false;
          if (!active) return;
          const message = 'No se pudo cargar el CAPTCHA. Verifica tu conexión e inténtalo de nuevo.';
          setLoadError(message);
          callbacksRef.current.onError(message);
        });
    };

    retryRef.current = () => {
      setLoadError('');
      callbacksRef.current.onError('');
      callbacksRef.current.onToken('');
      const api = getCaptchaApi(CAPTCHA_PROVIDER);
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
      initializingRef.current = false;
      if (widgetIdRef.current !== null) {
        const api = getCaptchaApi(CAPTCHA_PROVIDER);
        api?.remove?.(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (widgetIdRef.current === null) return;
    const api = getCaptchaApi(CAPTCHA_PROVIDER);
    api?.reset?.(widgetIdRef.current);
    callbacksRef.current.onToken('');
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
