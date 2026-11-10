import {
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from 'firebase/auth';
import { apiFetch } from './api';
import { auth, isFirebaseConfigured } from './firebase';
import { verifyCaptcha } from './captchaService';

let pendingSessionSetup = null;

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('La autenticación no está configurada. Contacta al administrador.');
  }
  return auth;
}

export async function loginWithEmail(email, password, remember = false, captchaToken) {
  const firebaseAuth = requireAuth();
  const { ticket } = await verifyCaptcha(captchaToken);
  let signedInUser = null;
  const setupPromise = (async () => {
    await setPersistence(
      firebaseAuth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
    const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    signedInUser = credential.user;
    await apiFetch('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ ticket }),
    });
    return credential;
  })();

  pendingSessionSetup = setupPromise;
  try {
    return await setupPromise;
  } catch (error) {
    if (signedInUser) await signOut(firebaseAuth);
    throw error;
  } finally {
    if (pendingSessionSetup === setupPromise) pendingSessionSetup = null;
  }
}

export function resetPassword(email) {
  return apiFetch('/api/auth/password-reset', {
    method: 'POST',
    timeoutMs: 25000,
    body: JSON.stringify({ email: email.trim() }),
  });
}

export function sendVerificationEmail(user = auth?.currentUser) {
  if (!user) {
    throw new Error('No hay una sesión autenticada para reenviar la verificación.');
  }
  return sendEmailVerification(user);
}

export function logout() {
  return auth ? signOut(auth) : Promise.resolve();
}

export function subscribeAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function fetchProfile(firebaseUser = auth?.currentUser) {
  if (!firebaseUser) {
    throw new Error('No hay una sesión autenticada para consultar el perfil.');
  }
  return (async () => {
    if (pendingSessionSetup) await pendingSessionSetup;
    return apiFetch('/api/auth/me');
  })();
}

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/invalid-login-credentials': 'El correo o la contraseña no son correctos.',
  'auth/user-not-found': 'El correo o la contraseña no son correctos.',
  'auth/wrong-password': 'El correo o la contraseña no son correctos.',
  'auth/invalid-email': 'El formato del correo electrónico no es válido.',
  'auth/invalid-api-key': 'La configuración de Firebase Auth no es válida. Contacta al administrador.',
  'auth/api-key-not-valid': 'La clave de Firebase no es válida para este proyecto. Contacta al administrador.',
  'auth/operation-not-allowed': 'El envío de correos de autenticación no está habilitado en Firebase.',
  'auth/unauthorized-continue-uri': 'El dominio del enlace no está autorizado en la configuración de Firebase.',
  'auth/invalid-continue-uri': 'El enlace de verificación no está configurado correctamente en Firebase.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada. Contacta al administrador.',
  'auth/missing-password': 'Ingresa tu contraseña.',
  'auth/too-many-requests': 'Se realizaron demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'No se pudo conectar con el servicio de autenticación. Verifica tu conexión.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña no cumple con los requisitos mínimos de seguridad.',
  'auth/quota-exceeded': 'Se alcanzó el límite temporal de solicitudes. Inténtalo más tarde.',
};

export function friendlyAuthError(error) {
  const code = error?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error?.status === 503) {
    if (error.message === 'No fue posible verificar CAPTCHA. Intenta nuevamente.') {
      return 'El servidor no pudo verificar el CAPTCHA. Completa la verificación nuevamente.';
    }
    if (error.message === 'No fue posible procesar la solicitud. Intenta nuevamente más tarde.') {
      return 'Firebase no pudo procesar el restablecimiento. Revisa la clave API y la configuración del proyecto.';
    }
    return 'El servidor no pudo completar la solicitud con Firebase. Contacta al administrador y vuelve a intentarlo más tarde.';
  }
  if (error?.status >= 500) {
    return 'El servicio de autenticación no está disponible temporalmente. Inténtalo más tarde.';
  }
  if (error?.message?.startsWith('La autenticación no está configurada')) return error.message;
  return 'No se pudo completar la autenticación. Inténtalo de nuevo o contacta al administrador.';
}
