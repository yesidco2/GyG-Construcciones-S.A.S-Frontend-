import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FaqSection from '../components/FaqSection';

describe('FAQ section disclosures', () => {
  it('reveals the selected answer and allows it to be collapsed', () => {
    render(
      <FaqSection
        id="faq-test"
        title="Preguntas frecuentes"
        items={[{ question: '¿Cómo funciona?', answer: 'Respuesta de prueba.' }]}
      />,
    );

    const question = screen.getByRole('button', { name: '¿Cómo funciona?' });
    expect(question).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Respuesta de prueba.')).toBeVisible();

    fireEvent.click(question);
    expect(screen.getByText('Respuesta de prueba.')).not.toBeVisible();
  });
});
