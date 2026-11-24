import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import VerifyEmailPage from '../pages/VerifyEmailPage';

const auth = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('../services/supabase', () => ({ auth }));

beforeEach(() => {
  vi.resetAllMocks();
  auth.verifyOtp.mockResolvedValue({ error: null });
  auth.updateUser.mockResolvedValue({ error: null });
  window.history.replaceState(null, '', '/?token_hash=example#verify-email');
});

it('confirms the Supabase email after the user clicks', async () => {
  render(<VerifyEmailPage />);
  expect(auth.verifyOtp).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar mi correo' }));
  expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'example', type: 'email' });
  expect(await screen.findByRole('status')).toHaveTextContent('Correo verificado');
  expect(window.location.search).toBe('');
});

it('verifies a recovery token and sets the new password', async () => {
  render(<VerifyEmailPage recovery />);
  await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'strong-password');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
  expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'example', type: 'recovery' });
  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'strong-password' });
  expect(await screen.findByRole('status')).toHaveTextContent('Contraseña actualizada');
});
