import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import InduccionTrabajadorPage from '../pages/InduccionTrabajadorPage';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('busca a la persona, conserva aciertos y reintenta la foto con la misma referencia', async () => {
  vi.stubGlobal('URL', Object.assign(class extends URL {}, {
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: vi.fn(),
  }));
  const referencia = '2e6386c1-cfb7-4ca4-a4d8-404815fdb197';
  vi.stubGlobal('crypto', { randomUUID: () => referencia });
  const user = userEvent.setup();
  let estado = 'PENDIENTE';
  let uploads = 0;
  const respuestas = [{ pregunta: 1, opcion: 0, correcta: true }];
  apiFetch.mockImplementation(async (path, options) => {
    if (path.includes('/nombres')) {
      return { total: 1, personas: [{ id: 'ana', nombre: 'Ana Gómez', numero: 4 }] };
    }
    if (path.endsWith('/acceso')) {
      expect(JSON.parse(options.body)).toEqual({ trabajador: 'ana', pin: '012345' });
      return { token: 'sesion' };
    }
    expect(options.headers['X-Induccion-Token']).toBe('sesion');
    if (path.endsWith('/respuestas')) {
      const { pregunta, opcion } = JSON.parse(options.body);
      expect(pregunta).toBe(0);
      const respuesta = { pregunta, opcion, correcta: opcion === 1 };
      respuestas[1] = respuesta;
      return respuesta;
    }
    if (options.method === 'POST') {
      expect(options.body.get('referencia')).toBe(referencia);
      expect(options.body.get('archivo').name).toBe('foto.png');
      if (++uploads === 1) throw new Error('Falló la carga');
      estado = 'POR_REVISAR';
      return null;
    }
    return {
      titulo: 'Trabajo en alturas', nombre: 'Ana Gómez', estado, version: 1, ejemplo: true,
      secciones: [{ titulo: 'Evidencia segura', texto: 'Revisa el material.' }],
      preguntas: [
        { texto: '¿Cuándo tomas la foto?', opciones: ['Durante la tarea', 'Antes de iniciar'], seccion: 0 },
        { texto: '¿Con quién se revisa?', opciones: ['Con SST', 'Con un visitante'], seccion: 0 },
      ],
      respuestas: [...respuestas], entrega: {},
    };
  });

  render(<InduccionTrabajadorPage asignacion="asignacion-de-prueba" />);
  await user.type(screen.getByLabelText('Busca tu nombre o apellido'), 'gomez');
  await waitFor(() => expect(apiFetch).toHaveBeenCalledWith(expect.stringContaining('buscar=gomez'), expect.anything()));
  await user.click(await screen.findByRole('button', { name: 'Ana Gómez · Nº 4' }));
  await user.type(screen.getByLabelText('PIN de Ana Gómez · Nº 4'), '012345');
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
  expect(await screen.findByText('Correcta · Con SST')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Enviar entrega' })).toBeDisabled();

  await user.click(screen.getByRole('button', { name: 'Durante la tarea' }));
  expect(await screen.findByRole('button', { name: 'Evidencia segura' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Antes de iniciar' }));
  expect(await screen.findByText('Correcta · Antes de iniciar')).toBeInTheDocument();
  expect(screen.getByText('Correcta · Con SST')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Foto del EPP'), {
    target: { files: [new File(['foto'], 'foto.png', { type: 'image/png' })] },
  });
  expect(await screen.findByAltText('Vista previa del EPP')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Enviar entrega' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Falló la carga');
  expect(screen.getByText('Correcta · Antes de iniciar')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Enviar entrega' }));
  expect(await screen.findByText('Por revisar')).toBeInTheDocument();
  expect(uploads).toBe(2);
});
