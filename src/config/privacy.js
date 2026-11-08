export const POLICY_URL = import.meta.env.VITE_PRIVACY_POLICY_URL || '#politica-datos';
export const POLICY_VERSION = import.meta.env.VITE_PRIVACY_POLICY_VERSION || '1.0-borrador';
export const EFFECTIVE_DATE = import.meta.env.VITE_PRIVACY_POLICY_EFFECTIVE_DATE || '';
export const IS_DRAFT = POLICY_VERSION.toLowerCase().includes('borrador');
export const CONTACT_EMAIL = 'proyectos@gng.co';
