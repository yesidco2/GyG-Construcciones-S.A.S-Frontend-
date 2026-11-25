import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import useAuth from '../utils/useAuth';
import { apiFetch } from '../services/api';

vi.mock('../utils/useAuth', () => ({ default: vi.fn() }));
vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('../components/AppShell', () => ({ default: () => <main><section id="servicios">Catálogo local</section></main> }));

describe('navegación por fragmentos', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
    useAuth.mockReturnValue({ loading: false, role: 'INGENIERO' });
    apiFetch.mockReset().mockResolvedValue({ proveedorExternoActivo: false });
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.unstubAllGlobals();
  });

  it('abre el ancla directa de la política y mantiene la página al navegar entre secciones', async () => {
    window.history.replaceState(null, '', '/#section-1');
    const { container } = render(<App />);
    expect(container.querySelector('#section-1')).toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, '', '/#policy-content');
      window.dispatchEvent(new Event('hashchange'));
    });
    expect(container.querySelector('#policy-content')).toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, '', '/#servicios');
      window.dispatchEvent(new Event('hashchange'));
    });
    expect(screen.getByText('Catálogo local')).toBeInTheDocument();
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: expect.any(Number) })));
  });

  it('restringe el historial del chat a ADMIN antes de solicitar datos', () => {
    window.history.replaceState(null, '', '/#admin-faq');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('muestra la política en un diálogo y lo cierra al volver a la página anterior', async () => {
    window.history.replaceState(null, '', '/#politica-datos');
    render(<App />);

    expect(await screen.findByRole('dialog', { name: 'Política de tratamiento de datos personales' }))
      .toHaveAttribute('aria-modal', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(window.location.hash).toBe('#hero');
  });

  it('vuelve al inicio del diálogo antes de imprimir la política', () => {
    window.history.replaceState(null, '', '/#politica-datos');
    vi.stubGlobal('print', vi.fn());
    render(<App />);

    const dialog = document.getElementById('policy-dialog-content');
    const dialogContainer = document.getElementById('policy-dialog-scroll-container');
    dialog.scrollTop = 500;
    dialogContainer.scrollTop = 300;

    fireEvent.click(screen.getByRole('button', { name: 'Imprimir / guardar en PDF' }));

    expect(dialog.scrollTop).toBe(0);
    expect(dialogContainer.scrollTop).toBe(0);
    expect(window.print).toHaveBeenCalledOnce();
  });

  it('permite consultar la política desde el asistente y volver al borrador', async () => {
    window.history.replaceState(null, '', '/#gestion-sst');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Pregúntale al asistente' }));
    const input = screen.getByLabelText('Mensaje para el asistente');
    fireEvent.change(input, { target: { value: 'Consulta pendiente' } });
    const link = screen.getByRole('dialog', { name: 'Asistente de G&G' }).querySelector('a[href="#politica-datos"]');
    expect(link).not.toHaveAttribute('target', '_blank');
    fireEvent.click(link);
    expect(await screen.findByRole('dialog', { name: 'Política de tratamiento de datos personales' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar', exact: true }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Asistente de G&G' })).toBeVisible());
    expect(input).toHaveValue('Consulta pendiente');
  });

  it('muestra preguntas frecuentes y marco normativo en Gestión SST', async () => {
    window.history.replaceState(null, '', '/#faq-sst');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Preguntas frecuentes sobre SST' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ley 1562 de 2012' })).toHaveAttribute(
      'href',
      'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=48365',
    );
    fireEvent.click(screen.getByRole('button', { name: '¿Qué es el SG-SST?' }));
    expect(screen.getByText(/proceso organizado, por etapas y de mejora continua/)).toBeVisible();
  });
});
