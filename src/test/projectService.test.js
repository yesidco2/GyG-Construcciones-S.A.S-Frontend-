import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock('../services/api', () => ({ apiFetch }));

describe('projectService', () => {
  beforeEach(() => apiFetch.mockReset());

  it('creates projects with client IDs and official statuses without generating a code', async () => {
    apiFetch.mockResolvedValueOnce({ id: 7, nombre: 'Obra A', progreso: 15, estado: 'PLANIFICADA' });
    const { createProject } = await import('../services/projectService');

    await createProject({
      name: 'Obra A',
      clientId: 42,
      category: 'Ingeniería Civil',
      status: 'PLANIFICADA',
      progress: 15,
      description: '',
    });

    const [, options] = apiFetch.mock.calls[0];
    expect(apiFetch.mock.calls[0][0]).toBe('/api/panel/obras');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({
      nombre: 'Obra A',
      clienteId: 42,
      categoria: 'Ingeniería Civil',
      estado: 'PLANIFICADA',
      progreso: 15,
    });
    expect(JSON.parse(options.body)).not.toHaveProperty('codigo');
  });

  it('uses PATCH for partial updates and preserves omitted fields', async () => {
    apiFetch.mockResolvedValueOnce({ id: 7, nombre: 'Obra A', estado: 'PAUSADA' });
    const { updateProject } = await import('../services/projectService');

    await updateProject({ id: 7 }, { status: 'PAUSADA' });

    expect(apiFetch.mock.calls[0][0]).toBe('/api/panel/obras/7');
    expect(apiFetch.mock.calls[0][1]).toMatchObject({ method: 'PATCH' });
    expect(JSON.parse(apiFetch.mock.calls[0][1].body)).toEqual({ estado: 'PAUSADA' });
  });

  it('validates progress before creating or updating', async () => {
    const { createProject } = await import('../services/projectService');
    await expect(createProject({
      name: 'Obra',
      clientId: 1,
      category: 'Civil',
      status: 'PLANIFICADA',
      progress: 101,
    })).rejects.toThrow(/0 y 100/);
  });

  it('downloads administrative photos with Blob response mode', async () => {
    apiFetch.mockResolvedValueOnce(new Blob(['image']));
    const { getAdminProjectPhoto } = await import('../services/projectService');
    await getAdminProjectPhoto({ id: 7 }, 9);
    expect(apiFetch).toHaveBeenCalledWith('/api/panel/obras/7/fotos/9', { responseType: 'blob' });
  });

  it('downloads public photos by POSTing the code in the body', async () => {
    apiFetch.mockResolvedValueOnce(new Blob(['image']));
    const { getPublicProjectPhoto } = await import('../services/projectService');
    await getPublicProjectPhoto(9, 'GG-TEST-123');
    expect(apiFetch).toHaveBeenCalledWith('/api/obras/seguimiento/fotos/9', {
      method: 'POST',
      body: JSON.stringify({ codigo: 'GG-TEST-123' }),
      responseType: 'blob',
    });
  });
});
