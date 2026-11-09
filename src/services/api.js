import { signOut } from 'firebase/auth';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TIMEOUT_MS = 15000;
const protectedPathPattern = /^\/api\/(auth|panel|admin)(\/|$)/;
const publicAuthPathPattern = /^\/api\/auth\/(?:captcha\/verify|password-reset)$/;
const panelPathPattern = /^\/api\/(panel|admin)(\/|$)/;

function isProtectedPath(path) {
  return protectedPathPattern.test(path) && !publicAuthPathPattern.test(path);
}

function retryAfterSeconds(headerValue) {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);
  const timestamp = Date.parse(headerValue);
  return Number.isNaN(timestamp) ? null : Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

async function redirectToLogin() {
  window.location.hash = '#login';
  if (auth?.currentUser) await signOut(auth);
}

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL no está configurada en el entorno.');
  }

  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: callerSignal,
    ...requestOptions
  } = options;
  const headers = new Headers(requestOptions.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (
    requestOptions.body &&
    !(typeof FormData !== 'undefined' && requestOptions.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (isProtectedPath(path) && auth?.currentUser) {
    const idToken = await auth.currentUser.getIdToken();
    headers.set('Authorization', `Bearer ${idToken}`);
  }

  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`${API_URL.replace(/\/+$/, '')}${path}`, {
      ...requestOptions,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      const timeoutError = new Error(
        callerSignal?.aborted ? 'La solicitud fue cancelada.' : 'La solicitud excedió el tiempo de espera.',
      );
      timeoutError.name = callerSignal?.aborted ? 'AbortError' : 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }

  const responseText = await response.text();
  let responseData = null;
  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const error = new Error(
      typeof responseData === 'string'
        ? responseData
        : responseData?.message || `Error ${response.status}`,
    );
    error.status = response.status;
    error.code = typeof responseData === 'object' ? responseData?.code : undefined;
    error.retryAfter = response.status === 429
      ? retryAfterSeconds(response.headers.get('Retry-After'))
      : null;

    if (response.status === 401 && isProtectedPath(path)) {
      await redirectToLogin();
    } else if (
      response.status === 403 &&
      error.code === 'CAPTCHA_REQUIRED' &&
      panelPathPattern.test(path)
    ) {
      await redirectToLogin();
    }

    throw error;
  }

  return responseData;
}
