import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getIdToken, signOut } = vi.hoisted(() => ({
  getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/firebase', () => ({
  auth: { currentUser: { getIdToken } },
}));
vi.mock('firebase/auth', () => ({ signOut }));

let apiFetch;

function response(status, data, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => (data === null ? '' : JSON.stringify(data)),
  };
}

describe('apiFetch', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    vi.stubGlobal('fetch', vi.fn());
    window.location.hash = '';
    ({ apiFetch } = await import('../services/api'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('does not attach Firebase tokens to public API calls', async () => {
    fetch.mockResolvedValueOnce(response(200, []));

    await apiFetch('/api/proyectos');

    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBeNull();
    expect(getIdToken).not.toHaveBeenCalled();
  });

  it('sends password-reset requests publicly with the CAPTCHA token', async () => {
    fetch.mockResolvedValueOnce(response(202, null));
    const { resetPassword } = await import('../services/authService');

    await resetPassword(' user@example.com ', 'captcha-response');

    expect(fetch.mock.calls[0][0]).toBe('https://api.example.test/api/auth/password-reset');
    expect(fetch.mock.calls[0][1].headers.get('X-Captcha-Token')).toBe('captcha-response');
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBeNull();
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ email: 'user@example.com' }));
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(getIdToken).not.toHaveBeenCalled();
  });

  it('does not attach Firebase tokens to public CAPTCHA verification', async () => {
    fetch.mockResolvedValueOnce(response(200, { ticket: 'captcha-ticket' }));

    await apiFetch('/api/auth/captcha/verify', {
      method: 'POST',
      body: JSON.stringify({ captchaToken: 'captcha-response' }),
    });

    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBeNull();
    expect(getIdToken).not.toHaveBeenCalled();
  });

  it('attaches the Firebase token only to protected paths', async () => {
    fetch.mockResolvedValueOnce(response(200, []));

    await apiFetch('/api/panel/obras');

    expect(getIdToken).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer firebase-id-token');
  });

  it('lets the browser set the multipart boundary for FormData', async () => {
    fetch.mockResolvedValueOnce(response(201, { ok: true }));
    const body = new FormData();
    body.append('archivo', new Blob(['image']));

    await apiFetch('/api/panel/obras/1/fotos', { method: 'POST', body });

    expect(fetch.mock.calls[0][1].headers.has('Content-Type')).toBe(false);
  });

  it('aborts requests that exceed the configured timeout', async () => {
    fetch.mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));

    await expect(apiFetch('/api/proyectos', { timeoutMs: 1 })).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  it('exposes 429 status and Retry-After to callers', async () => {
    fetch.mockResolvedValueOnce(response(429, { message: 'Too many requests' }, { 'Retry-After': '30' }));

    await expect(apiFetch('/api/contacto')).rejects.toMatchObject({
      status: 429,
      retryAfter: 30,
    });
  });

  it('preserves the JSON response body for field-level validation errors', async () => {
    const body = {
      code: 'VALIDATION_ERROR',
      message: 'Solicitud inválida',
      camposInvalidos: [{ campo: 'telefono', motivo: 'formato inválido' }],
    };
    fetch.mockResolvedValueOnce(response(400, body));

    await expect(apiFetch('/api/contacto')).rejects.toMatchObject({
      status: 400,
      responseBody: body,
    });
  });

  it('closes the session and routes to login on CAPTCHA_REQUIRED panel responses', async () => {
    fetch.mockResolvedValueOnce(response(403, { code: 'CAPTCHA_REQUIRED', message: 'Verification required' }));

    await expect(apiFetch('/api/panel/obras')).rejects.toMatchObject({ status: 403 });

    expect(signOut).toHaveBeenCalled();
    expect(window.location.hash).toBe('#login');
  });
});
