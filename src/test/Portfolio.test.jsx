import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Portfolio from '../components/Portafolio';

describe('Portfolio project images', () => {
  it('uses the same construction photo when a project image fails to load', async () => {
    render(<Portfolio />);

    const projectImage = await screen.findByRole('img', { name: 'Puente Peatonal Avenida Boyacá' });
    const originalImageUrl = projectImage.getAttribute('src');
    fireEvent.error(projectImage);

    const fallbackImage = await screen.findByRole('img', { name: 'Puente Peatonal Avenida Boyacá' });
    expect(fallbackImage.getAttribute('src')).not.toBe(originalImageUrl);
    expect(fallbackImage.getAttribute('src')).toContain('photo-1504307651254-35680f356dfd');
  });
});
