import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Services from '../components/Services';

describe('Services', () => {
  it('renders the local civil and SST service catalog', () => {
    render(<Services />);

    expect(screen.getByRole('heading', { name: /Bloque 01 — Ingeniería Civil/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bloque 02 — SST Especializada/ })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(12);
    expect(screen.getByRole('heading', { name: 'Diseño Estructural' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Investigación de Accidentes' })).toBeInTheDocument();
  });
});
