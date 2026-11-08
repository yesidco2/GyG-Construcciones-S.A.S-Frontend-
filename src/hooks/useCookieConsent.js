import { useCallback, useEffect, useState } from 'react';
import { readCookieConsent, saveCookieConsent } from '../utils/cookieConsent';

export default function useCookieConsent() {
  const [consent, setConsent] = useState(readCookieConsent);
  const [hasDecision, setHasDecision] = useState(() => readCookieConsent() !== null);

  useEffect(() => {
    const updateConsent = (event) => {
      const nextConsent = event.detail || readCookieConsent();
      setConsent(nextConsent);
      setHasDecision(nextConsent !== null);
    };
    window.addEventListener('cookie-consent-changed', updateConsent);
    return () => window.removeEventListener('cookie-consent-changed', updateConsent);
  }, []);

  const save = useCallback((analytics) => {
    const nextConsent = saveCookieConsent({ analytics });
    setConsent(nextConsent);
    setHasDecision(true);
    return nextConsent;
  }, []);

  return {
    consent,
    hasDecision,
    categories: consent?.categorias || { necessary: true, analytics: false },
    save,
  };
}
