import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL no está configurada en .env');
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth?.currentUser) {
    const idToken = await auth.currentUser.getIdToken();
    headers.set('Authorization', `Bearer ${idToken}`);
  }

  const response = await fetch(`${API_URL.replace(/\/+$/, '')}${path}`, {
    ...options,
    headers,
  });

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
    const message =
      typeof responseData === 'string'
        ? responseData
        : responseData?.message || `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return responseData;
}
