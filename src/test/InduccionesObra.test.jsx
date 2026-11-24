import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import QRCode from 'qrcode';
import InduccionesObra from '../components/dashboard/InduccionesObra';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('qrcode', () => ({ default: { toCanvas: vi.fn() } }));
afterEach(() => vi.unstubAllGlobals());

it('muestra un QR compartido y los PIN individuales solo al emitirlos', async () => {
  vi.stubGlobal('URL', Object.assign(class extends URL {}, {
    createObjectURL: vi.fn(() => 'blob:qr'),
    revokeObjectURL: vi.fn(),
  }));
  QRCode.toCanvas.mockResolvedValue({ toBlob: (callback) => callback(new Blob(['qr'])) });
  const user = userEvent.setup();
  const id = '0c93acbb-4130-4067-9f6c-1ba50519aaac';
  let creada = false;
  apiFetch.mockImplementation(async (path, options) => {
    if (path.endsWith('/catalogo')) return [{ id: 'alturas', titulo: 'Trabajo en alturas', version: 1, ejemplo: true }];
    if (path.endsWith('/trabajadores')) return [
      { id: '1', nombre: 'Ana Pérez', numero: 1, estado: 'PENDIENTE' },
      { id: '2', nombre: 'Juan Ruiz', numero: 2, estado: 'PENDIENTE' },
    ];
    if (options?.method === 'POST') {
      expect(JSON.parse(options.body)).toEqual({ material: 'alturas', version: 1, nombres: ['Ana Pérez', 'Juan Ruiz'] });
      creada = true;
      return { id, pins: [
        { id: '1', nombre: 'Ana Pérez', numero: 1, pin: '123456' },
        { id: '2', nombre: 'Juan Ruiz', numero: 2, pin: '998877' },
      ] };
    }
    return creada ? [{ id, titulo: 'Trabajo en alturas', version: 1, creada_en: '2026-01-01T00:00:00Z' }] : [];
  });
  render(<InduccionesObra obra={{ id: 10, name: 'Obra de prueba' }} />);
  const opcion = await screen.findByRole('option', { name: /Trabajo en alturas/ });
  await user.selectOptions(screen.getByLabelText('Material y versión'), opcion);
  fireEvent.change(screen.getByLabelText('Nombres de trabajadores, uno por línea'), {
    target: { value: 'Ana Pérez\nJuan Ruiz' },
  });
  await user.click(screen.getByRole('button', { name: 'Crear asignación' }));
  expect(await screen.findByAltText('Descargar QR compartido de la asignación')).toBeInTheDocument();
  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(QRCode.toCanvas).toHaveBeenCalledWith(expect.stringMatching(new RegExp('#induccion/' + id + '$')), expect.anything());
  expect(screen.getByText('123456')).toBeInTheDocument();
  expect(screen.getByText('998877')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Ocultar PIN' }));
  expect(screen.queryByText('123456')).not.toBeInTheDocument();
  expect(screen.queryByText('998877')).not.toBeInTheDocument();
});
