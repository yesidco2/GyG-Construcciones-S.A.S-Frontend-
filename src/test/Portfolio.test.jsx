import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Portfolio from '../components/Portafolio';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));

describe('Portfolio project images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the same construction photo when a project image fails to load', async () => {
    apiFetch.mockResolvedValueOnce([{
      id: 1,
      nombre: 'Proyecto de prueba',
      categoria: 'SST',
      imagenUrl: 'https://images.example.com/missing.jpg',
    }]);

    render(<Portfolio />);

    const projectImage = await screen.findByRole('img', { name: 'Proyecto de prueba' });
    const originalImageUrl = projectImage.getAttribute('src');
    fireEvent.error(projectImage);

    const fallbackImage = await screen.findByRole('img', { name: 'Proyecto de prueba' });
    expect(fallbackImage.getAttribute('src')).not.toBe(originalImageUrl);
    expect(fallbackImage.getAttribute('src')).toContain('photo-1504307651254-35680f356dfd');
  });
});
