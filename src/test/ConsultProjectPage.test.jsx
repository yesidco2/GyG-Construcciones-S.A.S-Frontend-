import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConsultProjectPage from '../pages/ConsultProjectPage';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

function requestError(status) {
  return Object.assign(new Error('request failed'), { status });
}

describe('ConsultProjectPage API states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid codes before making a request', async () => {
    const user = userEvent.setup();
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'bad!');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));

    expect(await screen.findAllByText(/debe tener entre 6 y 40 caracteres/)).not.toHaveLength(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('shows the specific not-found state for a 404 response', async () => {
    const user = userEvent.setup();
    apiFetch.mockRejectedValueOnce(requestError(404));
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'GG-2026-001');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));

    expect(await screen.findAllByText('Código de acceso inválido. Verifica el código e inténtalo de nuevo.')).not.toHaveLength(0);
    expect(apiFetch).toHaveBeenCalledWith('/api/obras/seguimiento', {
      method: 'POST',
      body: JSON.stringify({ codigo: 'GG-2026-001' }),
    });
  });

  it('shows the rate-limit wait message for 429 responses', async () => {
    const user = userEvent.setup();
    apiFetch.mockRejectedValueOnce(requestError(429));
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'GG-2026-001');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));

    expect(await screen.findAllByText('Demasiadas consultas seguidas. Espera un minuto e inténtalo de nuevo.')).not.toHaveLength(0);
  });

  it('offers retry on server errors and retries the POST request', async () => {
    const user = userEvent.setup();
    apiFetch
      .mockRejectedValueOnce(requestError(503))
      .mockResolvedValueOnce({ nombre: 'Obra Central', progreso: 42, fotos: [] });
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'GG-2026-001');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));
    await screen.findByRole('button', { name: /Reintentar/ });

    await user.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByText('Obra Central')).toBeInTheDocument();
    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(2));
  });
});
