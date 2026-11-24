import { apiFetch } from './api';
import { auth, setRememberSession } from './supabase';
import { verifyCaptcha } from './captchaService';

let pendingSessionSetup;

function requireAuth() {
  if (!auth) throw new Error('La autenticación no está configurada.');
  return auth;
}

export async function loginWithEmail(email, password, remember, captchaToken) {
  const client = requireAuth();
  const { ticket } = await verifyCaptcha(captchaToken).catch((error) => {
    throw Object.assign(error, { authStage: 'captcha' });
  });
  setRememberSession(remember);
  const setup = async () => {
    const { data, error } = await client.signInWithPassword({ email: email.trim(), password });
    if (error) throw Object.assign(error, { authStage: 'supabase' });
    try {
      const session = await apiFetch('/api/auth/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ ticket }),
      });
      if (!session?.verified) throw new Error('El servidor no confirmó la sesión.');
      return data;
    } catch (failure) {
      await client.signOut({ scope: 'local' });
      throw Object.assign(failure, { authStage: 'session' });
    }
  };
  pendingSessionSetup = setup();
  try {
    return await pendingSessionSetup;
  } finally {
    pendingSessionSetup = undefined;
  }
}

export function resetPassword(email) {
  return apiFetch('/api/auth/password-reset', {
    method: 'POST',
    timeoutMs: 25000,
    body: JSON.stringify({ email: email.trim() }),
  });
}

export async function sendVerificationEmail(email) {
  const { error } = await requireAuth().resend({ type: 'signup', email });
  if (error) throw error;
}

export async function logout() {
  const result = await auth?.signOut({ scope: 'local' });
  if (result?.error) throw result.error;
}

export function subscribeAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  const { data } = auth.onAuthStateChange((event, session) => {
    if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
      queueMicrotask(() => callback(session?.user ?? null));
    }
  });
  return () => data.subscription.unsubscribe();
}

export async function fetchProfile() {
  if (pendingSessionSetup) await pendingSessionSetup;
  return apiFetch('/api/auth/me');
}

const messages = new Map([
  ['invalid_credentials', 'El correo o la contraseña no son correctos.'],
  ['email_not_confirmed', 'Verifica tu correo antes de iniciar sesión.'],
  ['user_banned', 'Esta cuenta está deshabilitada. Contacta al administrador.'],
  ['weak_password', 'La contraseña no cumple los requisitos de seguridad.'],
]);

export function friendlyAuthError(error) {
  if (error?.status === 429) return 'Demasiados intentos. Espera antes de volver a intentarlo.';
  if (error?.code === 'CAPTCHA_REQUIRED' || error?.code?.startsWith('CAPTCHA_')) {
    return 'Completa un nuevo desafío CAPTCHA e inténtalo de nuevo.';
  }
  const message = messages.get(error?.code);
  if (message) return message;
  if (error?.authStage === 'captcha') {
    return error?.status === 503
      ? 'El servidor no pudo contactar el servicio CAPTCHA. Inténtalo de nuevo en un momento.'
      : 'No se pudo verificar el CAPTCHA con la API. Recarga el portal e inténtalo de nuevo.';
  }
  if (error?.authStage === 'supabase') {
    return 'Supabase no pudo iniciar la sesión. Inténtalo de nuevo en un momento.';
  }
  if (error?.authStage === 'session') {
    return 'Supabase aceptó el ingreso, pero la API no pudo activar la sesión del portal.';
  }
  return 'No se pudo completar la autenticación. Inténtalo de nuevo.';
}
