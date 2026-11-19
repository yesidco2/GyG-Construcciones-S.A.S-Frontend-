import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock('../services/api', () => ({ apiFetch }));

describe('projectService', () => {
  beforeEach(() => apiFetch.mockReset());

  it('sends the trimmed client name and omits clienteId from creation', async () => {
    apiFetch.mockResolvedValueOnce({ id: 7, nombre: 'Obra A', progreso: 15, estado: 'PLANIFICADA' });
    const { createProject } = await import('../services/projectService');

    await createProject({
      name: 'Obra A',
      clientName: '  Empresa del cliente  ',
      clientId: 42,
      category: 'CIVIL',
      status: 'PLANIFICADA',
      progress: 15,
      description: '',
    });

    const [, options] = apiFetch.mock.calls[0];
    expect(apiFetch.mock.calls[0][0]).toBe('/api/panel/obras');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({
      nombre: 'Obra A',
      cliente: 'Empresa del cliente',
      categoria: 'CIVIL',
      estado: 'PLANIFICADA',
      progreso: 15,
    });
    expect(JSON.parse(options.body)).not.toHaveProperty('codigo');
    expect(JSON.parse(options.body)).not.toHaveProperty('clienteId');
    expect(JSON.parse(options.body)).not.toHaveProperty('fechaInicio');
    expect(JSON.parse(options.body)).not.toHaveProperty('fechaFinEstimada');
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
      clientName: 'Cliente Uno',
      category: 'Civil',
      status: 'PLANIFICADA',
      progress: 101,
    })).rejects.toThrow(/0 y 100/);
  });

  it('requires a numeric work ID instead of a tracking code', async () => {
    const { updateProjectProgress } = await import('../services/projectService');
    await expect(updateProjectProgress({ trackingCode: 'GG-TEST-123' }, 30)).rejects.toThrow(/identificador/);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('rejects categories outside the Spring contract before sending', async () => {
    const { updateProject } = await import('../services/projectService');
    await expect(updateProject({ id: 7 }, { category: 'General' })).rejects.toThrow(/categoría/);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('replaces milestones only when the patch explicitly includes them', async () => {
    apiFetch.mockResolvedValue({ id: 7, nombre: 'Obra A', hitos: [] });
    const { updateProject } = await import('../services/projectService');
    await updateProject({ id: 7 }, {
      milestones: [{ id: 11, nombre: ' Inicio ', descripcion: 'Preparación', completado: true }],
    });
    const [, options] = apiFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      hitos: [{ nombre: 'Inicio', descripcion: 'Preparación', fechaObjetivo: null, completado: true }],
    });
  });
  it('rejects reversed dates on creation and against the unchanged date on PATCH', async () => {
    const { createProject, updateProject } = await import('../services/projectService');
    await expect(createProject({ startDate: '2026-12-01', estimatedEnd: '2026-11-20' })).rejects.toThrow(/anterior/);
    await expect(updateProject({ id: 7, startDate: '2026-12-01' }, { estimatedEnd: '2026-11-20' })).rejects.toThrow(/anterior/);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('rejects blank and overlong client names before posting', async () => {
    const { createProject } = await import('../services/projectService');
    const project = { name: 'Obra válida', category: 'CIVIL', status: 'PLANIFICADA', progress: 15 };
    await expect(createProject({ ...project, clientName: '   ' })).rejects.toThrow(/nombre del cliente/);
    await expect(createProject({ ...project, clientName: 'a'.repeat(256) })).rejects.toThrow(/255/);
    expect(apiFetch).not.toHaveBeenCalled();
  });

});
