import { act, render, screen, waitFor } from '@testing-library/react';
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
    apiFetch.mockReset();
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
});
