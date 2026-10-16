export default function TrustBar() {
  const metrics = [
    {
      icon: 'verified',
      value: '12,500+',
      label: 'Horas/Hombre sin incidentes',
    },
    {
      icon: 'engineering',
      value: '18+',
      label: 'Años de experiencia',
    },
    {
      icon: 'checkmark_circle',
      value: '350+',
      label: 'Proyectos entregados',
    },
    {
      icon: 'security',
      value: '100%',
      label: 'Cumplimiento normativo',
    },
  ];

  return (
    <section className="bg-primary-container py-lg md:py-xl border-y border-surface-variant">
      <div className="max-w-container-max mx-auto px-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-industrial-orange" style={{ fontSize: 32 }}>
                {metric.icon}
              </span>
              <p className="mt-sm font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-white">
                {metric.value}
              </p>
              <p className="mt-xs font-body-sm text-body-sm text-on-primary/70">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}