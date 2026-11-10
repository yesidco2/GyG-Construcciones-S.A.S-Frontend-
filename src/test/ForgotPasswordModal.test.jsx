import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

const { resetPassword, friendlyAuthError } = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  friendlyAuthError: vi.fn(() => 'No fue posible procesar la solicitud.'),
}));

vi.mock('../services/authService', () => ({ resetPassword, friendlyAuthError }));

describe('ForgotPasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends password recovery without rendering or requiring CAPTCHA', async () => {
    const user = userEvent.setup();
    resetPassword.mockResolvedValueOnce(undefined);
    render(<ForgotPasswordModal isOpen onClose={vi.fn()} />);

    expect(screen.queryByText('Verificación de seguridad')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /CAPTCHA/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Correo Electrónico'), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar Enlace' }));

    expect(resetPassword).toHaveBeenCalledOnce();
    expect(resetPassword).toHaveBeenCalledWith('admin@example.com');
    expect(await screen.findByText(/recibirás instrucciones para restablecer la contraseña/))
      .toBeInTheDocument();
  });
});