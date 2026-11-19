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
    apiFetch.mockReset();
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
      signal: expect.any(AbortSignal),
    });
  });

  it('shows the rate-limit wait message for 429 responses', async () => {
    const user = userEvent.setup();
    apiFetch.mockRejectedValueOnce(Object.assign(requestError(429), { retryAfter: 35 }));
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'GG-2026-001');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));

    expect(await screen.findAllByText('Demasiadas consultas seguidas. Espera 35 segundos antes de intentarlo de nuevo.')).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: /Consultar Proyecto/ })).toBeDisabled();
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('offers retry on server errors and retries the POST request', async () => {
    const user = userEvent.setup();
    apiFetch
      .mockRejectedValueOnce(requestError(503))
      .mockResolvedValueOnce({ nombre: 'Obra Central', porcentajeAvance: 42, hitos: [{ nombre: 'Cimentación', completado: true }] });
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'GG-2026-001');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));
    await screen.findByRole('button', { name: /Reintentar/ });

    await user.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByText('Obra Central')).toBeInTheDocument();
    expect(screen.getByText('Cimentación')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
    expect(screen.getByText(/todavía no tiene fotografías/)).toBeInTheDocument();
    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(2));
  });
  it('loads a PNG Blob only on request with the trimmed case-sensitive code and releases the URL', async () => {
    const user = userEvent.setup();
    const NativeURL = URL;
    const revoke = vi.fn();
    vi.stubGlobal('URL', class extends NativeURL {
      static createObjectURL() { return 'blob:work-photo'; }
      static revokeObjectURL = revoke;
    });
    try {
      apiFetch.mockResolvedValueOnce({
        nombre: 'Obra Central', porcentajeAvance: 42, hitos: [],
        fotos: [{ id: 8, nombre: 'Entrada', url: '/archivo-no-usar', fecha: '2026-07-03', descripcion: 'Acceso principal' }],
      });
      const { unmount } = render(<ConsultProjectPage />);
      await user.type(screen.getByLabelText('Código de acceso del proyecto'), '  GG-aBc-123 ');
      await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));
      const photo = await screen.findByRole('button', { name: 'Ver foto: Entrada' });
      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Acceso principal')).toBeInTheDocument();
      expect(screen.getByText('2026-07-03')).toHaveAttribute('datetime', '2026-07-03');
      apiFetch.mockResolvedValueOnce(new Blob(['png'], { type: 'image/png' }));
      await user.click(photo);
      expect(await screen.findByRole('img', { name: 'Entrada' })).toHaveAttribute('src', 'blob:work-photo');
      expect(apiFetch).toHaveBeenLastCalledWith('/api/obras/seguimiento/fotos/8', {
        method: 'POST', body: JSON.stringify({ codigo: 'GG-aBc-123' }), responseType: 'blob',
        signal: expect.any(AbortSignal),
      });
      unmount();
      expect(revoke).toHaveBeenCalledWith('blob:work-photo');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('preserves milestones on a photo 429 and pauses both actions', async () => {
    const user = userEvent.setup();
    apiFetch.mockResolvedValueOnce({
      nombre: 'Obra Central', porcentajeAvance: 42, hitos: [{ nombre: 'Cimentación', completado: true }],
      fotos: [{ id: 8, nombre: 'Entrada' }],
    }).mockRejectedValueOnce(Object.assign(requestError(429), { retryAfter: 20 }));
    render(<ConsultProjectPage />);
    await user.type(screen.getByLabelText('Código de acceso del proyecto'), 'GG-2026-001');
    await user.click(screen.getByRole('button', { name: /Consultar Proyecto/ }));
    const photo = await screen.findByRole('button', { name: 'Ver foto: Entrada' });
    await user.click(photo);
    expect(await screen.findByRole('alert')).toHaveTextContent('Espera 20 segundos');
    expect(screen.getByText('Cimentación')).toBeInTheDocument();
    expect(photo).toBeDisabled();
    expect(screen.getByRole('button', { name: /Consultar Proyecto/ })).toBeDisabled();
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });

});
