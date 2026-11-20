export const POLICY_URL = import.meta.env.VITE_PRIVACY_POLICY_URL || '#politica-datos';
export const POLICY_VERSION = (import.meta.env.VITE_PRIVACY_POLICY_VERSION || '1.0')
  .replace(/[-\s]*borrador/ig, '')
  .trim() || '1.0';
export const EFFECTIVE_DATE = import.meta.env.VITE_PRIVACY_POLICY_EFFECTIVE_DATE || '2026-11-09';
export const EFFECTIVE_DATE_LABEL = /^\d{4}-\d{2}-\d{2}$/.test(EFFECTIVE_DATE)
  ? new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${EFFECTIVE_DATE}T00:00:00Z`))
  : EFFECTIVE_DATE;
export const CONTACT_EMAIL = 'proyectos@gng.co';
