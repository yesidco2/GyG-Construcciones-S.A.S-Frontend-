import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EngineerDashboard from '../components/dashboard/EngineerDashboard';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

const first = { id: 17, nombre: 'Obra Norte', categoria: 'CIVIL', estado: 'EN_PROGRESO', progreso: 20 };
const second = { id: 23, nombre: 'Obra Sur', categoria: 'SST', estado: 'PLANIFICADA', progreso: 10 };

describe('compatibilidad del panel de obras', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path) => {
      if (path === '/api/panel/obras') return [first, second];
      if (path === '/api/panel/obras/estados') return ['PLANIFICADA', 'EN_PROGRESO', 'PAUSADA', 'FINALIZADA'];
      if (path === '/api/panel/obras/17/progreso') return { ...first, progreso: 80 };
      throw new Error('Solicitud no esperada: ' + path);
    });
  });

  it('mantiene separados los avances de dos obras sin código y omite la lista de clientes para INGENIERO', async () => {
    const user = userEvent.setup();
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    const north = await screen.findByRole('slider', { name: 'Avance de Obra Norte' });
    const south = screen.getByRole('slider', { name: 'Avance de Obra Sur' });
    expect(screen.getByRole('button', { name: /Crear Proyecto/ })).toBeInTheDocument();
    expect(apiFetch.mock.calls.map(([path]) => path)).not.toContain('/api/panel/obras/clientes');

    fireEvent.change(north, { target: { value: '80' } });
    expect(south).toHaveValue('10');
    const northCard = north.closest('.space-y-3');
    await user.click(within(northCard).getByRole('button', { name: 'Guardar avance' }));
    expect(await screen.findByText('Avance de Obra Norte actualizado al 80%.')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/17/progreso', {
      method: 'PATCH', body: JSON.stringify({ progreso: 80 }),
    });
    expect(south).toHaveValue('10');
  });

  it('consulta las fotos de la obra seleccionada al abrir la galería', async () => {
    const user = userEvent.setup();
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    const [photos] = await screen.findAllByRole('button', { name: /Fotos/ });
    apiFetch.mockResolvedValueOnce([]);
    await user.click(photos);
    const dialog = screen.getByRole('dialog', { name: 'Galería fotográfica de la obra' });
    expect(await within(dialog).findByText('Esta obra todavía no tiene fotografías.')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/17/fotos', { signal: expect.any(AbortSignal) });
    await user.keyboard('{Escape}');
    expect(dialog).not.toBeInTheDocument();
  });
  it('confirms deletion by ID and preserves another work', async () => {
    const user = userEvent.setup();
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: 'Eliminar Obra Norte' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Eliminar obra' });
    expect(apiFetch.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);

    apiFetch.mockRejectedValueOnce(Object.assign(new Error('Forbidden'), { status: 403 }));
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar eliminación' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/no tiene permiso/);
    expect(screen.getByRole('heading', { name: 'Obra Norte' })).toBeInTheDocument();

    apiFetch.mockResolvedValueOnce(null);
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar eliminación' }));
    expect(await screen.findByText('Se eliminó Obra Norte.')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/17', { method: 'DELETE' });
    expect(screen.queryByRole('heading', { name: 'Obra Norte' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Obra Sur' })).toBeInTheDocument();
  });

  it('keeps the tracking code in memory when supplied and offers regeneration to ADMIN', async () => {
    apiFetch.mockResolvedValueOnce([{ ...first, codigoSeguimiento: 'JH7MPR4XNTU8W3KDSF9YQVCZ6L2ABEGT' }, second]);
    apiFetch.mockResolvedValueOnce([]);
    render(<EngineerDashboard currentUser={{ role: 'ADMIN' }} onLogout={vi.fn()} />);
    expect(await screen.findByText('JH7MPR4XNTU8W3KDSF9YQVCZ6L2ABEGT')).toBeInTheDocument();
    expect(screen.getByText(/Código de seguimiento no disponible/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Regenerar código/ })).toHaveLength(2);
  });

  it('registers as an engineer with a client name, copies the code and retries only failed files', async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const code = 'JH7MPR4XNTU8W3KDSF9YQVCZ6L2ABEGT';
    let failedOnce = false;
    apiFetch.mockImplementation(async (path, options) => {
      if (path === '/api/panel/obras/clientes') return [{ id: 9, nombre: 'Cliente Uno' }];
      if (path === '/api/panel/obras/estados') return ['PLANIFICADA'];
      if (path === '/api/panel/obras' && options?.method === 'POST') {
        return { id: 30, nombre: 'Obra con fotos', estado: 'PLANIFICADA', progreso: 15, codigoSeguimiento: code };
      }
      if (path === '/api/panel/obras') return [];
      if (path === '/api/panel/obras/30/fotos') {
        const file = options.body.get('archivo');
        if (file.name === 'entrada.png' || failedOnce) return { id: 1, nombre: file.name };
        failedOnce = true;
        throw new Error('Servicio temporalmente no disponible');
      }
      throw new Error('Solicitud no esperada: ' + path);
    });
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Crear Proyecto con Código/ }));
    await user.type(screen.getByLabelText(/Nombre de la Obra/), 'Obra con fotos');
    await user.type(screen.getByLabelText(/Nombre del cliente/), 'Cliente Uno');
    fireEvent.change(screen.getByLabelText(/Fecha de inicio/), { target: { value: '2026-11-20' } });
    fireEvent.change(screen.getByLabelText(/Fecha de fin estimada/), { target: { value: '2026-12-01' } });
    await user.upload(screen.getByLabelText('Fotografías de la obra'), [
      new File(['photo'], 'entrada.png', { type: 'image/png' }),
      new File(['photo'], 'interior.jpg', { type: 'image/jpeg' }),
    ]);
    await user.click(screen.getByRole('button', { name: 'Registrar y generar código' }));
    const codeDialog = await screen.findByRole('dialog', { name: 'Código de seguimiento generado' });
    expect(within(codeDialog).getByText(code)).toBeInTheDocument();
    await user.click(within(codeDialog).getByRole('button', { name: 'Copiar código' }));
    expect(copy).toHaveBeenCalledWith(code);
    await user.click(within(codeDialog).getByRole('button', { name: 'Entendido' }));

    await screen.findByText(/La obra se guardó/);
    expect(screen.getByText(/interior.jpg/)).toBeInTheDocument();
    expect(screen.queryByText(/entrada.png/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Obra con fotos' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar fotos fallidas' }));
    await screen.findByRole('heading', { name: 'Obra con fotos' });
    const creates = apiFetch.mock.calls.filter(([path, options]) => path === '/api/panel/obras' && options?.method === 'POST');
    expect(creates).toHaveLength(1);
    expect(JSON.parse(creates[0][1].body)).toMatchObject({ cliente: 'Cliente Uno', fechaInicio: '2026-11-20', fechaFinEstimada: '2026-12-01' });
    expect(JSON.parse(creates[0][1].body)).not.toHaveProperty('clienteId');
    const uploads = apiFetch.mock.calls.filter(([path]) => path.endsWith('/fotos'));
    expect(uploads.map(([, options]) => options.body.get('archivo').name)).toEqual(['entrada.png', 'interior.jpg', 'interior.jpg']);
    await waitFor(() => expect(screen.queryByText(/La obra se guardó/)).not.toBeInTheDocument());
  });

  it('confirms photo deletion before using the authenticated route and refreshes the gallery', async () => {
    const user = userEvent.setup();
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    const [button] = await screen.findAllByRole('button', { name: /Fotos/ });
    apiFetch.mockResolvedValueOnce([{ id: 5, nombre: 'fachada.png' }]);
    await user.click(button);
    await user.click(await screen.findByRole('button', { name: 'Eliminar foto fachada.png' }));
    expect(apiFetch.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
    apiFetch.mockResolvedValueOnce(null).mockResolvedValueOnce([]);
    await user.click(screen.getByRole('button', { name: 'Confirmar eliminación de foto' }));
    await screen.findByText('Esta obra todavía no tiene fotografías.');
    expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/17/fotos/5', { method: 'DELETE' });
    expect(apiFetch.mock.calls.filter(([path]) => path === '/api/panel/obras/17/fotos')).toHaveLength(2);
  });

  it('does not expose user management in the works panel', async () => {
    render(<EngineerDashboard currentUser={{ role: 'ADMIN' }} onLogout={vi.fn()} />);
    await screen.findByRole('heading', { name: 'Obra Norte' });
    expect(screen.queryByRole('button', { name: 'Gestión de usuarios' })).not.toBeInTheDocument();
    expect(apiFetch.mock.calls.some(([path]) => path === '/api/admin/usuarios')).toBe(false);
  });

  it('shows dates and milestones and clears only the changed date on edit', async () => {
    const user = userEvent.setup();
    const work = {
      ...first, clienteId: 21, cliente: 'Ana Norte', descripcion: 'Cimentación y acabados',
      fechaInicio: '2026-11-20', fechaFinEstimada: '2027-02-07',
      hitos: [{ id: 7, nombre: 'Entrega inicial', descripcion: 'Revisión técnica', fechaObjetivo: '2026-12-01', completado: true }],
    };
    apiFetch.mockImplementation(async (path, options) => {
      if (path === '/api/panel/obras') return [work];
      if (path === '/api/panel/obras/estados') return ['EN_PROGRESO'];
      if (path === '/api/panel/obras/17' && options.method === 'PATCH') return { ...work, cliente: 'Ana Sur', fechaFinEstimada: null };
      throw new Error('Solicitud no esperada: ' + path);
    });
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    await user.click(await screen.findByText('Detalle de Obra Norte'));
    expect(screen.getByText('Cimentación y acabados')).toBeInTheDocument();
    expect(screen.getByText('2026-11-20')).toHaveAttribute('datetime', '2026-11-20');
    expect(screen.getByText('2026-12-01')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Editar/ }));
    const modal = screen.getByRole('dialog', { name: 'Editar datos de la obra' });
    expect(within(modal).getByLabelText('Cliente')).toHaveValue('Ana Norte');
    fireEvent.change(within(modal).getByLabelText('Cliente'), { target: { value: 'Ana Sur' } });
    fireEvent.change(within(modal).getByLabelText(/Fecha de fin estimada/), { target: { value: '' } });
    await user.click(within(modal).getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/17', {
      method: 'PATCH', body: JSON.stringify({ cliente: 'Ana Sur', fechaFinEstimada: null }),
    }));
  });


  it('updates only the trimmed client name as an engineer and keeps the saved account', async () => {
    const user = userEvent.setup();
    const work = { ...first, cliente: 'Cliente inicial', clienteId: 21 };
    apiFetch.mockImplementation(async (route, options) => {
      if (route === '/api/panel/obras') return [work];
      if (route === '/api/panel/obras/estados') return ['EN_PROGRESO'];
      if (route === '/api/panel/obras/17' && options.method === 'PATCH') return { ...work, cliente: 'Empresa actualizada' };
      throw new Error('Solicitud no esperada: ' + route);
    });
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: /Editar/ }));
    const editor = screen.getByRole('dialog', { name: 'Editar datos de la obra' });
    fireEvent.change(within(editor).getByLabelText('Cliente'), { target: { value: '  Empresa actualizada  ' } });
    await user.click(within(editor).getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('Empresa actualizada')).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/17', {
      method: 'PATCH', body: JSON.stringify({ cliente: 'Empresa actualizada' }),
    });
    expect(apiFetch.mock.calls.some(([route]) => route.endsWith('/codigo-seguimiento'))).toBe(false);
  });

  it('lets an engineer explicitly regenerate the tracking code', async () => {
    const user = userEvent.setup();
    const code = 'JH7MPR4XNTU8W3KDSF9YQVCZ6L2ABEGT';
    apiFetch.mockImplementation(async (route) => {
      if (route === '/api/panel/obras') return [first];
      if (route === '/api/panel/obras/estados') return ['EN_PROGRESO'];
      if (route === '/api/panel/obras/17/codigo-seguimiento') return { ...first, codigoSeguimiento: code };
      throw new Error('Solicitud no esperada: ' + route);
    });
    render(<EngineerDashboard currentUser={{ role: 'INGENIERO' }} onLogout={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: 'Regenerar código' }));
    const confirmation = screen.getByRole('alertdialog', { name: 'Regenerar código' });
    expect(within(confirmation).getByText(/dejará de funcionar/)).toBeInTheDocument();
    await user.click(within(confirmation).getByRole('button', { name: 'Cancelar' }));
    expect(confirmation).not.toBeInTheDocument();
    expect(apiFetch.mock.calls.some(([route]) => route.endsWith('/codigo-seguimiento'))).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Regenerar código' }));
    const reopened = screen.getByRole('alertdialog', { name: 'Regenerar código' });
    await user.click(within(reopened).getByRole('button', { name: 'Confirmar regeneración' }));
    const codeDialog = await screen.findByRole('dialog', { name: 'Código de seguimiento generado' });
    expect(within(codeDialog).getByText(code)).toBeInTheDocument();
    expect(apiFetch.mock.calls.filter(([route]) => route.endsWith('/codigo-seguimiento'))).toEqual([
      ['/api/panel/obras/17/codigo-seguimiento', { method: 'POST' }],
    ]);
  });

  it('displays the saved client for each work without a linked account', async () => {
    const user = userEvent.setup();
    apiFetch.mockImplementation(async (route) => {
      if (route === '/api/panel/obras') return [
        { ...first, cliente: 'Empresa Norte' },
        { ...second, cliente: 'Empresa Sur' },
      ];
      if (route === '/api/panel/obras/estados') return ['EN_PROGRESO', 'PLANIFICADA'];
      if (route === '/api/panel/obras/clientes') return [];
      throw new Error('Solicitud no esperada: ' + route);
    });
    render(<EngineerDashboard currentUser={{ role: 'ADMIN' }} onLogout={vi.fn()} />);
    const [editNorth, editSouth] = await screen.findAllByRole('button', { name: /Editar/ });
    await user.click(editNorth);
    let modal = screen.getByRole('dialog', { name: 'Editar datos de la obra' });
    expect(within(modal).getByLabelText('Cliente')).toHaveValue('Empresa Norte');
    await user.click(within(modal).getByRole('button', { name: 'Cancelar' }));
    await user.click(editSouth);
    modal = screen.getByRole('dialog', { name: 'Editar datos de la obra' });
    expect(within(modal).getByLabelText('Cliente')).toHaveValue('Empresa Sur');
  });

  it('lets an administrator create a work even when loading registered clients fails', async () => {
    const user = userEvent.setup();
    apiFetch.mockImplementation(async (route, options) => {
      if (route === '/api/panel/obras/clientes') throw new Error('Error del servidor');
      if (route === '/api/panel/obras/estados') return ['PLANIFICADA'];
      if (route === '/api/panel/obras' && options?.method === 'POST') return { ...first, id: 31, nombre: 'Obra externa' };
      if (route === '/api/panel/obras') return [first];
      throw new Error('Solicitud no esperada: ' + route);
    });
    render(<EngineerDashboard currentUser={{ role: 'ADMIN' }} onLogout={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: /Editar/ }));
    const edit = screen.getByRole('dialog', { name: 'Editar datos de la obra' });
    expect(await within(edit).findByRole('button', { name: 'Recargar clientes' })).toBeInTheDocument();
    await user.click(within(edit).getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: /Crear Proyecto con Código/ }));
    await user.type(screen.getByLabelText(/Nombre de la Obra/), 'Obra externa');
    await user.type(screen.getByLabelText(/Nombre del cliente/), 'Empresa externa');
    await user.click(screen.getByRole('button', { name: /Registrar y generar código/ }));
    await screen.findByRole('heading', { name: 'Obra externa' });
    const [, creation] = apiFetch.mock.calls.find(([route, options]) => route === '/api/panel/obras' && options?.method === 'POST');
    expect(JSON.parse(creation.body)).toMatchObject({ cliente: 'Empresa externa' });
    expect(JSON.parse(creation.body)).not.toHaveProperty('clienteId');
  });

});
