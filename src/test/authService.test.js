import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch, sendEmailVerification } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

vi.mock('../services/api', () => ({ apiFetch }));
vi.mock('../services/firebase', () => ({
  auth: null,
  isFirebaseConfigured: false,
}));
vi.mock('../services/captchaService', () => ({
  verifyCaptcha: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  sendEmailVerification,
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  browserLocalPersistence: {},
  browserSessionPersistence: {},
  signOut: vi.fn(),
}));

describe('resetPassword', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    sendEmailVerification.mockReset();
  });

  it('allows enough time for CAPTCHA verification and Firebase email delivery', async () => {
    const { resetPassword } = await import('../services/authService');
    apiFetch.mockResolvedValueOnce(null);

    await resetPassword(' user@example.com ', 'captcha-response');

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/password-reset', {
      method: 'POST',
      timeoutMs: 25000,
      headers: { 'X-Captcha-Token': 'captcha-response' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });
  });

  it('sends verification email through Firebase Auth for the signed-in user', async () => {
    const user = { uid: 'firebase-user' };
    const { sendVerificationEmail } = await import('../services/authService');
    sendEmailVerification.mockResolvedValueOnce(undefined);

    await sendVerificationEmail(user);

    expect(sendEmailVerification).toHaveBeenCalledWith(user);
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
