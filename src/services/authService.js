import {
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithRedirect,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from 'firebase/auth';
import { apiFetch } from './api';
import { auth, isFirebaseConfigured } from './firebase';

const EMAIL_FOR_SIGN_IN_KEY = 'gyg_email_for_sign_in';

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('La autenticación no está configurada. Contacta al administrador.');
  }
  return auth;
}

function getEmailLinkSettings() {
  const actionUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  actionUrl.hash = '';
  actionUrl.search = '';

  return {
    url: actionUrl.href,
    handleCodeInApp: true,
  };
}

export async function loginWithEmail(email, password, remember = false) {
  const firebaseAuth = requireAuth();
  await setPersistence(
    firebaseAuth,
    remember ? browserLocalPersistence : browserSessionPersistence,
  );
  return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
}

export function loginWithGoogle() {
  return signInWithRedirect(requireAuth(), new GoogleAuthProvider());
}

export function loginWithMicrosoft() {
  return signInWithRedirect(requireAuth(), new OAuthProvider('microsoft.com'));
}

export function completeProviderRedirectSignIn() {
  return auth ? getRedirectResult(auth) : Promise.resolve(null);
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

export async function sendMagicLink(email) {
  const firebaseAuth = requireAuth();
  const normalizedEmail = email.trim();
  await sendSignInLinkToEmail(firebaseAuth, normalizedEmail, getEmailLinkSettings());
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, normalizedEmail);
}

export async function completeEmailLinkSignIn() {
  if (!isFirebaseConfigured || !auth || !isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
  if (!email) {
    email = window.prompt('Confirma tu correo electrónico para completar el inicio de sesión:');
  }
  if (!email) return null;

  const result = await signInWithEmailLink(auth, email.trim(), window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  window.location.hash = 'login';
  return result;
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
  'auth/popup-blocked': 'El navegador bloqueó la ventana de autenticación. Permite las ventanas emergentes e inténtalo de nuevo.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de autenticación antes de completar el acceso.',
  'auth/cancelled-popup-request': 'La solicitud de autenticación fue cancelada.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en la configuración de Firebase.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado en Firebase.',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método de acceso.',
  'auth/network-request-failed': 'No se pudo conectar con el servicio de autenticación. Verifica tu conexión.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña no cumple con los requisitos mínimos de seguridad.',
  'auth/expired-action-code': 'El enlace expiró. Solicita uno nuevo.',
  'auth/invalid-action-code': 'El enlace no es válido o ya fue utilizado.',
  'auth/quota-exceeded': 'Se alcanzó el límite temporal de solicitudes. Inténtalo más tarde.',
};

export function friendlyAuthError(error) {
  const code = error?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error?.message?.startsWith('La autenticación no está configurada')) return error.message;
  return 'No se pudo completar la autenticación. Inténtalo de nuevo o contacta al administrador.';
}
