import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmailPage from '../pages/VerifyEmailPage';

const mocks = vi.hoisted(() => ({
  applyActionCode: vi.fn(),
  checkActionCode: vi.fn(),
}));

vi.mock('firebase/auth', () => mocks);
vi.mock('../services/firebase', () => ({
  auth: {},
  isFirebaseConfigured: true,
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/?mode=verifyEmail&oobCode=action-code');
    mocks.checkActionCode.mockResolvedValue({
      operation: 'VERIFY_EMAIL',
      data: { email: 'person@example.com' },
    });
    mocks.applyActionCode.mockResolvedValue(undefined);
  });

  it('checks the code but only applies it after explicit confirmation', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    expect(await screen.findByText(/person@example.com/)).toBeInTheDocument();
    expect(mocks.checkActionCode).toHaveBeenCalledWith({}, 'action-code');
    expect(mocks.applyActionCode).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirmar mi correo' }));
    expect(await screen.findByRole('heading', { name: 'Correo verificado' })).toBeInTheDocument();
    expect(mocks.applyActionCode).toHaveBeenCalledWith({}, 'action-code');
  });

  it('shows an error and does not apply an expired or previously used code', async () => {
    mocks.checkActionCode.mockRejectedValueOnce({ code: 'auth/expired-action-code' });
    render(<VerifyEmailPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Solicita un nuevo correo/);
    expect(mocks.applyActionCode).not.toHaveBeenCalled();
  });
});
