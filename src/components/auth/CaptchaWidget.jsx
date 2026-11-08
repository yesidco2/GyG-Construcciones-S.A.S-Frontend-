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

function loadCaptchaScript(provider) {
  const scriptId = SCRIPT_IDS[provider];
  const existingScript = document.getElementById(scriptId);
  if (existingScript?.dataset.loaded === 'true') return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = existingScript || document.createElement('script');
    const handleLoad = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    const handleError = () => reject(new Error('No se pudo cargar el servicio CAPTCHA.'));
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

export default function CaptchaWidget({ siteKey, resetKey, onToken, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onToken, onError });
  const [loadError, setLoadError] = useState('');
  callbacksRef.current = { onToken, onError };

  useEffect(() => {
    if (!siteKey) return undefined;
    let active = true;

    loadCaptchaScript(CAPTCHA_PROVIDER)
      .then(() => {
        if (!active || !containerRef.current) return;
        const api = CAPTCHA_PROVIDER === 'recaptcha' ? window.grecaptcha : window.turnstile;
        if (!api) throw new Error('El servicio CAPTCHA no está disponible.');

        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => callbacksRef.current.onToken(token),
          'expired-callback': () => callbacksRef.current.onToken(''),
          'error-callback': () => {
            callbacksRef.current.onToken('');
            callbacksRef.current.onError('No se pudo validar el CAPTCHA. Inténtalo de nuevo.');
          },
          ...(CAPTCHA_PROVIDER === 'recaptcha' ? { theme: 'light', size: 'normal' } : {}),
        });
      })
      .catch(() => {
        if (!active) return;
        setLoadError('No se pudo cargar el CAPTCHA. Verifica tu conexión e inténtalo de nuevo.');
        callbacksRef.current.onError('No se pudo cargar el CAPTCHA.');
      });

    return () => {
      active = false;
      if (widgetIdRef.current !== null) {
        const api = CAPTCHA_PROVIDER === 'recaptcha' ? window.grecaptcha : window.turnstile;
        api?.remove?.(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (widgetIdRef.current === null) return;
    const api = CAPTCHA_PROVIDER === 'recaptcha' ? window.grecaptcha : window.turnstile;
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
      {loadError && <p role="alert" className="mt-2 text-xs text-error">{loadError}</p>}
    </div>
  );
}
