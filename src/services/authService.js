import {
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from 'firebase/auth';
import { apiFetch } from './api';
import { auth, isFirebaseConfigured } from './firebase';

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('La autenticación no está configurada. Contacta al administrador.');
  }
  return auth;
}

export async function loginWithEmail(email, password, remember = false) {
  const firebaseAuth = requireAuth();
  await setPersistence(
    firebaseAuth,
    remember ? browserLocalPersistence : browserSessionPersistence,
  );
  return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(requireAuth(), email.trim());
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
  return apiFetch('/api/auth/me');
}

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/invalid-login-credentials': 'El correo o la contraseña no son correctos.',
  'auth/user-not-found': 'El correo o la contraseña no son correctos.',
  'auth/wrong-password': 'El correo o la contraseña no son correctos.',
  'auth/invalid-email': 'El formato del correo electrónico no es válido.',
  'auth/missing-password': 'Ingresa tu contraseña.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada. Contacta al administrador.',
  'auth/too-many-requests': 'Se realizaron demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en la configuración de Firebase.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado en Firebase.',
  'auth/network-request-failed': 'No se pudo conectar con el servicio de autenticación. Verifica tu conexión.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña no cumple con los requisitos mínimos de seguridad.',
  'auth/quota-exceeded': 'Se alcanzó el límite temporal de solicitudes. Inténtalo más tarde.',
};

export function friendlyAuthError(error) {
  const code = error?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error?.message?.startsWith('La autenticación no está configurada')) return error.message;
  return 'No se pudo completar la autenticación. Inténtalo de nuevo o contacta al administrador.';
}
