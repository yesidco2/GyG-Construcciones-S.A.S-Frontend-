import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RiskExplorer from '../components/RiskExplorer';

describe('RiskExplorer local catalog', () => {
  it('renders the expanded labor catalog and its local risk details', () => {
    render(<RiskExplorer />);

    const activityList = document.querySelector('.risk-activity-list');
    expect(activityList).toHaveClass('lg:max-h-[320px]', 'lg:overflow-y-auto');
    expect(activityList.querySelectorAll('.risk-activity-option')).toHaveLength(15);
    expect(screen.getByRole('button', { name: 'Trabajo en Alturas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Demolición' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pintura y recubrimientos' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Demolición' }));

    expect(screen.getByRole('heading', { level: 2, name: 'Demolición' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Caída de materiales' })).toBeInTheDocument();
    expect(screen.getByText('EPP mínimos sugeridos')).toBeInTheDocument();
    const helmet = screen.getByRole('button', { name: /Casco con barbuquejo/ });
    expect(helmet).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(helmet);
    expect(helmet).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/tipo y la clase se seleccionan según los peligros/)).toBeVisible();
  });
});
