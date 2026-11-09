import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import useAuth from '../utils/useAuth';
import { friendlyAuthError, loginWithEmail, logout } from '../services/authService';

vi.mock('../utils/useAuth', () => ({ default: vi.fn() }));
vi.mock('../services/firebase', () => ({ isFirebaseConfigured: true }));
vi.mock('../services/authService', () => ({
  friendlyAuthError: vi.fn(() => 'No se pudo completar la autenticación.'),
  loginWithEmail: vi.fn(),
  logout: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));
vi.mock('../components/auth/CaptchaWidget', () => ({
  default: ({ onToken, resetKey }) => (
    <button type="button" onClick={() => onToken('captcha-test-token')}>
      Completar CAPTCHA {resetKey}
    </button>
  ),
}));
vi.mock('../components/auth/ForgotPasswordModal', () => ({ default: () => null }));
vi.mock('../components/dashboard/EngineerDashboard', () => ({ default: () => <div>Panel</div> }));

describe('LoginPage CAPTCHA flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      loading: false,
      firebaseUser: null,
      profile: null,
      role: '',
      canAccessPanel: false,
      error: '',
      refreshProfile: vi.fn(),
    });
  });

  it('lets an unverified user return to the login form', async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({
      loading: false,
      firebaseUser: {
        email: 'admin@example.com',
        emailVerified: false,
      },
      profile: null,
      role: '',
      canAccessPanel: false,
      error: '',
      refreshProfile: vi.fn(),
    });
    logout.mockResolvedValue(undefined);

    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Verifica tu correo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver al inicio de sesión' }));

    expect(logout).toHaveBeenCalledOnce();
  });

  it('keeps login disabled until CAPTCHA is completed and continues after success', async () => {
    const user = userEvent.setup();
    const refreshProfile = vi.fn();
    useAuth.mockReturnValue({
      loading: false,
      firebaseUser: null,
      profile: null,
      role: '',
      canAccessPanel: false,
      error: '',
      refreshProfile,
    });
    loginWithEmail.mockResolvedValue({ user: { email: 'admin@example.com' } });

    render(<LoginPage />);
    const submit = screen.getByRole('button', { name: 'Iniciar sesión' });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Completar CAPTCHA/ }));
    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'correct-password');
    await user.click(submit);

    await waitFor(() => expect(loginWithEmail).toHaveBeenCalledWith(
      'admin@example.com',
      'correct-password',
      false,
      'captcha-test-token',
    ));
    expect(refreshProfile).toHaveBeenCalled();
  });

  it('shows a generic message and resets the widget when the backend ticket is expired', async () => {
    const user = userEvent.setup();
    loginWithEmail.mockRejectedValue(new Error('expired CAPTCHA ticket'));
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /Completar CAPTCHA/ }));
    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('No se pudo completar la autenticación.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Completar CAPTCHA 1/ })).toBeInTheDocument();
    expect(friendlyAuthError).toHaveBeenCalled();
  });

  it('applies progressive backoff after three failed attempts', async () => {
    const user = userEvent.setup();
    loginWithEmail.mockRejectedValue(new Error('invalid credentials'));
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'admin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await user.click(screen.getByRole('button', { name: /Completar CAPTCHA/ }));
      await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
      if (attempt < 2) await waitFor(() => expect(loginWithEmail).toHaveBeenCalledTimes(attempt + 1));
    }

    expect(await screen.findByText(/Demasiados intentos\. Espera 5 segundos/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Espera para intentar' })).toBeDisabled();
  });
});
