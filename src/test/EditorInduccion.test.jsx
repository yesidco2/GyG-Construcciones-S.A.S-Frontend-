import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import EditorInduccion from '../components/dashboard/EditorInduccion';
import { generarBorradorInduccion } from '../content/induccionBorrador';
import { activities, riskCatalog } from '../content/riskCatalog';

it('genera material y preguntas dentro de los límites del contrato de publicación', () => {
  for (const actividad of activities) {
    const { secciones, preguntas, fuentes } = generarBorradorInduccion(actividad);
    expect(secciones[0].texto).toContain(riskCatalog[actividad].risks[0].description);
    expect(secciones.every((s) => s.texto.length <= 1500)).toBe(true);
    expect(fuentes.every((fuente) => secciones.some((s) => s.texto.includes(fuente.url)))).toBe(true);
    for (const pregunta of preguntas) {
      expect(secciones[pregunta.seccion]).toBeDefined();
      expect(pregunta.opciones[pregunta.correcta]).toBeTruthy();
      expect(pregunta.opciones.every((opcion) => opcion.length <= 200)).toBe(true);
    }
  }
});

it('prepara el borrador de alturas y requiere revisión antes de publicarlo', () => {
  const publicar = vi.fn();
  render(<EditorInduccion catalogo={[]} ocupado={false} publicar={publicar} />);
  fireEvent.click(screen.getByText('Preparar material y cuestionario'));
  fireEvent.click(screen.getByRole('button', { name: 'Generar borrador' }));
  expect(screen.getByRole('link', { name: /Resolución 4272/ })).toBeInTheDocument();
  const guardar = screen.getByRole('button', { name: 'Publicar versión' });
  expect(guardar).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(guardar);
  expect(publicar).toHaveBeenCalledWith(expect.objectContaining({
    titulo: 'Trabajo en Alturas',
    contenido: expect.objectContaining({ preguntas: expect.arrayContaining([
      expect.objectContaining({ texto: expect.stringMatching(/permiso/) }),
    ]) }),
  }));
});
