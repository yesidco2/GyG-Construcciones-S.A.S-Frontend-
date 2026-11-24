import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const isAuthConfigured = Boolean(url && key);

const preferenceKey = 'gyg-remember-session';
const storage = {
  getItem(name) {
    return sessionStorage.getItem(name) ?? localStorage.getItem(name);
  },
  setItem(name, value) {
    const remember = sessionStorage.getItem(preferenceKey) === 'true'
      || (sessionStorage.getItem(preferenceKey) === null && localStorage.getItem(name) !== null);
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem(name);
    target.setItem(name, value);
  },
  removeItem(name) {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};

export function setRememberSession(remember) {
  sessionStorage.setItem(preferenceKey, String(remember));
}

export const auth = isAuthConfigured
  ? createClient(url, key, { auth: { storage, detectSessionInUrl: false } }).auth
  : null;
