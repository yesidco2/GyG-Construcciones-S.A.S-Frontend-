const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL no está configurada en .env');
  }

  const response = await fetch(`${API_URL.replace(/\/+$/, '')}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const responseData = await response.json();
  if (!response.ok) {
    const error = new Error(responseData?.message || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return responseData;
}
