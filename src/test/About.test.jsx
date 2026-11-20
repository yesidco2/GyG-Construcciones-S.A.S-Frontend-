import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import About from '../components/About';

describe('About environmental policies', () => {
  it('renders a concise, interactive local environmental policy catalog', async () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: 'Políticas ambientales y mitigación' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(9);
    expect(screen.getByRole('button', { name: /Manejo de residuos de construcción/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Clasificar los residuos de obra/)).not.toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: /Manejo de residuos de construcción/ }));

    expect(screen.getByRole('button', { name: /Manejo de residuos de construcción/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Clasificar los residuos de obra/)).toBeVisible();
  });
});
