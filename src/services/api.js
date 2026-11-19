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
    responseType = 'json',
    ...requestOptions
  } = options;
  const headers = new Headers(requestOptions.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', responseType === 'blob' ? 'image/png, application/json' : 'application/json');
  if (
    requestOptions.body &&
    !(typeof FormData !== 'undefined' && requestOptions.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const protectedRequest = isProtectedPath(path);
  const requestUser = protectedRequest ? auth?.currentUser : null;
  if (requestUser && !headers.has('Authorization')) {
    const idToken = await requestUser.getIdToken();
    headers.set('Authorization', `Bearer ${idToken}`);
  }

  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  let response;
  let responseText;
  try {
    response = await fetch(`${API_URL.replace(/\/+$/, '')}${path}`, {
      ...requestOptions,
      headers,
      signal: controller.signal,
    });
    if (response.ok && responseType === 'blob') return await response.blob();
    responseText = await response.text();
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
        : responseData?.message || responseData?.mensaje || `Error ${response.status}`,
    );
    error.status = response.status;
    error.code = typeof responseData === 'object' ? (responseData?.code ?? responseData?.codigo) : undefined;
    error.responseBody = responseData;
    error.retryAfter = response.status === 429
      ? retryAfterSeconds(response.headers.get('Retry-After'))
      : null;

    const needsLogin = response.status === 401 || (
      response.status === 403 && error.code === 'CAPTCHA_REQUIRED' && panelPathPattern.test(path)
    );
    if (protectedRequest && needsLogin && requestUser === auth?.currentUser) {
      await redirectToLogin();
    }

    throw error;
  }

  return responseData;
}
