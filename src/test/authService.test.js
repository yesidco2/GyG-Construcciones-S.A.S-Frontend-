import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch, verifyCaptcha, setPersistence, signInWithEmailAndPassword, signOut } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  verifyCaptcha: vi.fn(),
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../services/api', () => ({ apiFetch }));
vi.mock('../services/firebase', () => ({
  auth: {},
  isFirebaseConfigured: true,
}));
vi.mock('../services/captchaService', () => ({
  verifyCaptcha,
}));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence: {},
  browserSessionPersistence: {},
  signOut,
}));

describe('resetPassword', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('sends password reset requests without requiring a CAPTCHA token', async () => {
    const { resetPassword } = await import('../services/authService');
    apiFetch.mockResolvedValueOnce(null);

    await resetPassword(' user@example.com ');

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/password-reset', {
      method: 'POST',
      timeoutMs: 25000,
      body: JSON.stringify({ email: 'user@example.com' }),
    });
  });

  it('sends verification email through Firebase Auth for the signed-in user', async () => {
    const user = {
      uid: 'firebase-user',
      reload: vi.fn().mockResolvedValue(undefined),
      getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
    };
    const { sendVerificationEmail } = await import('../services/authService');
    apiFetch.mockResolvedValueOnce({ status: 'sent' });

    await sendVerificationEmail(user);

    expect(user.reload).toHaveBeenCalled();
    expect(user.getIdToken).toHaveBeenCalledWith(true);
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/email-verification', {
      method: 'POST',
      headers: { Authorization: 'Bearer firebase-id-token' },
    });
  });

  it('explains Firebase Auth configuration errors', async () => {
    const { friendlyAuthError } = await import('../services/authService');

    expect(friendlyAuthError({ code: 'auth/operation-not-allowed' }))
      .toMatch(/no está habilitado en Firebase/);
    expect(friendlyAuthError({ code: 'auth/unauthorized-continue-uri' }))
      .toMatch(/dominio del enlace no está autorizado/);
    expect(friendlyAuthError({ code: 'auth/invalid-api-key' }))
      .toMatch(/configuración de Firebase Auth no es válida/);
    expect(friendlyAuthError({
      status: 503,
      message: 'No fue posible verificar CAPTCHA. Intenta nuevamente.',
    })).toMatch(/no pudo verificar el CAPTCHA/);
    expect(friendlyAuthError({
      status: 503,
      message: 'No fue posible procesar la solicitud. Intenta nuevamente más tarde.',
    })).toMatch(/Firebase no pudo procesar el restablecimiento/);
  });
});

describe('login with a verified session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetch.mockReset();
    verifyCaptcha.mockResolvedValue({ ticket: 'server-ticket' });
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'firebase-user' } });
  });

  it('exchanges the CAPTCHA once and sends only the ticket to Spring Boot', async () => {
    const { loginWithEmail } = await import('../services/authService');
    const { browserSessionPersistence } = await import('firebase/auth');
    apiFetch.mockResolvedValueOnce({ verified: true });

    await expect(loginWithEmail(' user@example.com ', 'password', false, 'widget-token')).resolves.toMatchObject({
      user: { uid: 'firebase-user' },
    });

    expect(verifyCaptcha).toHaveBeenCalledExactlyOnceWith('widget-token');
    expect(setPersistence).toHaveBeenCalledWith(expect.any(Object), browserSessionPersistence);
    expect(apiFetch).toHaveBeenCalledExactlyOnceWith('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ ticket: 'server-ticket' }),
    });
  });

  it('signs out the local Firebase user if Spring Boot fails to confirm the ticket', async () => {
    const { loginWithEmail } = await import('../services/authService');
    apiFetch.mockResolvedValueOnce({ verified: false });
    await expect(loginWithEmail('user@example.com', 'password', true, 'widget-token')).rejects.toThrow(/confirmó la sesión/);
    expect(signOut).toHaveBeenCalledOnce();
  });
});
