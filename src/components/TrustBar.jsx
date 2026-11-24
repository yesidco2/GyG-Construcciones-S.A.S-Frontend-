import { useEffect, useRef } from 'react';

const metrics = [
  { value: 12500, suffix: '+', label: 'Horas/Hombre sin incidentes' },
  { value: 18, suffix: '+', label: 'Años de experiencia' },
  { value: 350, suffix: '+', label: 'Proyectos entregados' },
  { value: 100, suffix: '%', label: 'Cumplimiento normativo' },
];

const format = new Intl.NumberFormat('es-CO');

export default function TrustBar() {
  const section = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!window.IntersectionObserver || motion?.matches) return;

    const element = section.current;
    const numbers = element.querySelectorAll('[data-metric]');
    let frame;
    let start;
    const render = (progress) => {
      numbers.forEach((number, index) => {
        const { value, suffix } = metrics[index];
        number.textContent = format.format(Math.round(value * progress)) + suffix;
      });
    };
    const tick = (now) => {
      start ??= now;
      const progress = Math.min((now - start) / 900, 1);
      render(1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      render(1);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      render(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.2 });

    observer.observe(element);
    motion?.addEventListener('change', stop);
    return () => {
      stop();
      motion?.removeEventListener('change', stop);
    };
  }, []);

  return (
    <section ref={section} id="indicadores" className="portal-metrics" aria-label="Indicadores de G&G">
      <dl>
        {metrics.map(({ label, value, suffix }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <span className="sr-only">{format.format(value)}{suffix}</span>
              <span data-metric aria-hidden="true">{format.format(value)}{suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
