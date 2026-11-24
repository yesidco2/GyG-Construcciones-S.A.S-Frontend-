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
    <section id="indicadores" className="bg-primary-container py-lg md:py-xl border-y border-surface-variant">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-md text-left">
              <span className="material-symbols-outlined text-industrial-orange" style={{ fontSize: 32 }}>
                {metric.icon}
              </span>
              <div>
                <p className="font-headline-sm text-headline-sm text-white">{metric.value}</p>
                <p className="mt-xs font-body-sm text-body-sm text-on-primary/70">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}