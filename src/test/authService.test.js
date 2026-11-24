import { beforeEach, expect, it, vi } from 'vitest';
import { loginWithEmail, sendVerificationEmail } from '../services/authService';

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  verifyCaptcha: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resend: vi.fn(),
  setRememberSession: vi.fn(),
}));

vi.mock('../services/api', () => ({ apiFetch: mocks.apiFetch }));
vi.mock('../services/captchaService', () => ({ verifyCaptcha: mocks.verifyCaptcha }));
vi.mock('../services/supabase', () => ({ auth: mocks, setRememberSession: mocks.setRememberSession }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verifyCaptcha.mockResolvedValue({ ticket: 'ticket' });
  mocks.signInWithPassword.mockResolvedValue({ data: { session: { access_token: 'access' } } });
});

it('requires a server-verified session after Supabase sign-in', async () => {
  mocks.apiFetch.mockResolvedValue({ verified: true });
  await loginWithEmail(' a@example.com ', 'secret', true, 'captcha');
  expect(mocks.setRememberSession).toHaveBeenCalledWith(true);
  expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'a@example.com', password: 'secret' });
  expect(mocks.apiFetch).toHaveBeenCalledWith('/api/auth/session', expect.objectContaining({
    headers: { Authorization: 'Bearer access' },
    body: JSON.stringify({ ticket: 'ticket' }),
  }));
});

it('signs out when the backend rejects the CAPTCHA ticket', async () => {
  mocks.apiFetch.mockRejectedValue(new Error('ticket invalid'));
  await expect(loginWithEmail('a@example.com', 'secret', false, 'captcha')).rejects.toThrow('ticket invalid');
  expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
});

it('resends the Supabase signup email', async () => {
  mocks.resend.mockResolvedValue({ error: null });
  await sendVerificationEmail('a@example.com');
  expect(mocks.resend).toHaveBeenCalledWith({ type: 'signup', email: 'a@example.com' });
});
