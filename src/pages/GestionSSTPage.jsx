import RiskExplorer from '../components/RiskExplorer';
import FaqSection from '../components/FaqSection';
import ServicePromotion from '../components/ServicePromotion';

export default function GestionSSTPage() {
  const overviewCards = [
    {
      icon: 'health_and_safety',
      title: 'Prevención Integral',
      description: 'Minimizamos riesgos antes de que ocurran incidentes.',
    },
    {
      icon: 'favorite',
      title: 'Protección de Vida',
      description: 'La seguridad de su personal es nuestra prioridad absoluta.',
    },
    {
      icon: 'gavel',
      title: 'Cumplimiento Legal',
      description: 'Acompañamos la gestión conforme a los requisitos aplicables.',
    },
    {
      icon: 'trending_up',
      title: 'Productividad',
      description: 'Operaciones seguras aseguran continuidad y eficiencia.',
    },
  ];

  const serviceCards = [
    {
      icon: 'assignment',
      title: 'Implementación SG-SST',
      description:
        'Diseño, implementación y auditoría del Sistema de Gestión de Seguridad y Salud en el Trabajo a la medida de su obra.',
    },
    {
      icon: 'warning',
      title: 'Identificación de Peligros',
      description:
        'Matrices IPVR detalladas y actualizadas para proyectos de infraestructura civil y edificaciones.',
    },
  ];

  const hierarchy = [
    {
      number: '1',
      title: 'Eliminación',
      description: 'Remover físicamente el peligro del lugar de trabajo. La medida más efectiva y prioritaria.',
      active: true,
    },
    {
      number: '2',
      title: 'Sustitución',
      description: 'Sustituir materiales, procesos o condiciones por alternativas menos riesgosas.',
      active: false,
    },
    {
      number: '3',
      title: 'Controles de Ingeniería',
      description: 'Usar barreras físicas y soluciones técnicas para aislar o reducir el riesgo.',
      active: false,
    },
    {
      number: '4',
      title: 'Controles administrativos',
      description: 'Definir procedimientos, permisos, capacitación, señalización y organización del trabajo para reducir la exposición.',
      active: false,
    },
    {
      number: '5',
      title: 'Elementos de protección personal',
      description: 'Seleccionar, entregar y mantener EPP adecuado al riesgo residual; es la última barrera y no sustituye los controles anteriores.',
      active: false,
    },
  ];

  const sstFaqs = [
    {
      question: '¿Qué es el SG-SST?',
      answer: 'Es el proceso organizado, por etapas y de mejora continua mediante el cual se anticipan, reconocen, evalúan y controlan los riesgos que pueden afectar la seguridad y salud en el trabajo.',
    },
    {
      question: '¿Qué normas colombianas sirven de referencia?',
      answer: 'Entre las referencias generales están la Ley 1562 de 2012, el Decreto 1072 de 2015 (Libro 2, Parte 2, Título 4, Capítulo 6) y la Resolución 0312 de 2019 sobre estándares mínimos. La aplicación concreta depende de la actividad, el tamaño y la clase de riesgo de cada empleador.',
    },
    {
      question: '¿Los elementos de protección personal son suficientes para controlar un riesgo?',
      answer: 'No por sí solos. La jerarquía prioriza eliminar el peligro, sustituirlo y aplicar controles de ingeniería y administrativos; el EPP protege frente al riesgo residual y debe elegirse a partir de la evaluación del trabajo.',
    },
    {
      question: '¿El contenido de esta página reemplaza la evaluación de mi obra?',
      answer: 'No. La información es orientativa. Cada empleador debe identificar los peligros y evaluar los riesgos de sus actividades y lugares de trabajo, con apoyo de personal competente y de acuerdo con los requisitos aplicables.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background pt-16">
      <section id="gestion-sst" className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Sitio de construcción con seguridad industrial"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=85"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000a1e]/40 via-[#000a1e]/70 to-[#000a1e]/80" />
        </div>

        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-md w-full text-center md:text-left mt-xl">
          <div className="max-w-3xl">
            <span className="inline-block mb-xs rounded-full bg-on-tertiary-container/20 px-3 py-1 font-label-caps text-label-caps text-tertiary-fixed-dim">
              G&G Construcción y SST S.A.S.
            </span>
            <h1 className="mt-sm mb-md font-headline-xl-mobile text-headline-xl-mobile text-on-primary md:font-headline-xl md:text-headline-xl">
              Liderazgo en Seguridad y Salud para la Construcción
            </h1>
            <p className="mb-lg max-w-2xl font-body-lg text-body-lg text-on-primary/90">
              Protegemos vidas y garantizamos el cumplimiento normativo en sus proyectos. Especialistas en entornos de alto riesgo.
            </p>
            <div className="flex flex-col justify-center gap-sm md:flex-row md:justify-start md:gap-md">
              <a className="rounded bg-on-tertiary-container px-lg py-sm text-center font-label-caps text-label-caps text-on-primary transition-colors hover:bg-tertiary-container" href="#servicios-sst">
                Nuestros Servicios
              </a>
              <a className="rounded border-2 border-primary bg-primary px-lg py-sm text-center font-label-caps text-label-caps text-on-primary transition-colors hover:bg-primary/90" href="#risk-explorer">
                Consultoría Experta
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="vision-prevencion" className="bg-surface py-xl">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-md">
          <div className="mb-lg flex flex-col gap-sm text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">Gestión de riesgos</p>
              <h2 className="mt-xs font-headline-lg text-headline-lg text-primary">Nuestra Visión de la Prevención</h2>
            </div>
            <a className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-md py-xs font-label-caps text-label-caps text-on-primary hover:bg-primary/90" href="#risk-explorer">
              Explorar riesgos
            </a>
          </div>

          <div className="grid grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-4 md:gap-md">
            {overviewCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col items-center border border-surface-variant bg-surface-container-lowest p-md text-center shadow-ambient transition-standard card-hover rounded-lg"
              >
                <div className="mb-sm flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10">
                  <span className="material-symbols-outlined text-3xl text-primary">{card.icon}</span>
                </div>
                <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">{card.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RiskExplorer />

      <section id="marco-legal-sst" className="bg-surface-container-low py-xl">
        <div className="mx-auto max-w-4xl px-margin-mobile md:px-md">
          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
            Referencias oficiales de Colombia
          </p>
          <h2 className="mt-xs font-headline-lg text-headline-lg text-primary">Marco normativo del SG-SST</h2>
          <p className="mt-sm text-secondary">
            Estas normas ofrecen un marco general de consulta; la obligación específica debe verificarse según cada organización y actividad económica.
          </p>
          <ul className="mt-md space-y-sm">
            <li className="rounded-xl border border-surface-variant bg-white p-md">
              <a className="font-semibold text-on-primary-fixed-variant underline" href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=48365" target="_blank" rel="noreferrer">
                Ley 1562 de 2012
              </a>
              <span className="text-secondary"> — modifica el Sistema de Riesgos Laborales y disposiciones de salud ocupacional.</span>
            </li>
            <li className="rounded-xl border border-surface-variant bg-white p-md">
              <a className="font-semibold text-on-primary-fixed-variant underline" href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=72173" target="_blank" rel="noreferrer">
                Decreto 1072 de 2015, capítulo 6 del título 4
              </a>
              <span className="text-secondary"> — compila las disposiciones reglamentarias del sector Trabajo relacionadas con el SG-SST.</span>
            </li>
            <li className="rounded-xl border border-surface-variant bg-white p-md">
              <a className="font-semibold text-on-primary-fixed-variant underline" href="https://www.mintrabajo.gov.co/documents/20147/59995826/Resolucion+0312-2019-+Estandares+minimos+del+Sistema+de+la+Seguridad+y+Salud.pdf" target="_blank" rel="noreferrer">
                Resolución 0312 de 2019
              </a>
              <span className="text-secondary"> — establece estándares mínimos del SG-SST según las condiciones previstas en la norma.</span>
            </li>
          </ul>
          <p className="mt-md text-xs text-secondary">
            Consulta las versiones y modificaciones vigentes en las fuentes oficiales antes de adoptar decisiones de cumplimiento.
          </p>
        </div>
      </section>

      <section id="servicios-sst" className="bg-surface-container-low py-xl">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-md">
          <div className="mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-primary">Servicios Especializados</h2>
          </div>

          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {serviceCards.map((service) => (
              <div
                key={service.title}
                className="group overflow-hidden rounded-lg border border-surface-variant bg-surface-container-lowest shadow-ambient"
              >
                <div className="relative h-48 overflow-hidden bg-surface-variant">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        service.title === 'Implementación SG-SST'
                          ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdOktAPP80zSuKRW1keADAe823SpKaJzi-ST5bFltDtm5cQ9xHwO0QO5Ltgo_m1W4lKiVjaP8tvENsxhHAm3-8RX3FDnm4OYFc8-27hO9vpQ9guqMSzqsTmexlMA7pfGOQqTxyFGKABKAVh7gvrnAFz41cTBJg7BvhwZcvlcHriHd4pIvUHkBJrU1wtIvbnh7uCK9-Of6i-w4B0JbUPqmSkozxDd2blB0ZTXHjjBpc15HsF22G6JDm')"
                          : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIWJa4cbRq9hIF_gFlHKtsCLGUpj82xzd8H09hdA_hoVAP3bxO4wm23xR6vSChDzwn3ExFeZ9JHiu88Bu3hi9ucFH5oSEHhkGtE4cnyZdJhYJopWOq3FgONwZOVf2ssqWIZpquP7MQtvwoxTIdiZPyDfYxVeZCbTm4924ipNm5_JsrB_mZrxopuJ0X8sHc_cbvP4ty6tYsmzOks5MhSuO2DzJ-h3ZnlxU2hYVWxZHNFHrME8uYtk85')",
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/20 transition-colors duration-300 group-hover:bg-primary/10" />
                </div>
                <div className="p-md">
                  <div className="mb-xs flex items-center gap-xs">
                    <span className="material-symbols-outlined text-on-tertiary-container">{service.icon}</span>
                    <h3 className="font-headline-md text-headline-md text-primary">{service.title}</h3>
                  </div>
                  <p className="mb-sm font-body-md text-body-md text-on-surface-variant">{service.description}</p>
                  <a className="inline-flex items-center font-label-caps text-label-caps text-on-tertiary-container transition-colors hover:text-tertiary-container" href="#contacto">
                    Ver Detalles
                    <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jerarquia-controles" className="bg-surface py-xl">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-md">
          <div className="mb-lg text-center">
            <h2 className="font-headline-lg text-headline-lg text-primary">Jerarquía de Controles</h2>
            <p className="mx-auto mt-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Metodología estructurada para la mitigación efectiva de riesgos en obra.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-xs">
            {hierarchy.map((item) => (
              <div
                key={item.number}
                className="overflow-hidden rounded border border-surface-variant bg-surface-container-lowest shadow-sm"
              >
                <div
                  className={`flex cursor-pointer items-center justify-between px-md py-sm ${
                    item.active ? 'bg-primary text-on-primary' : 'bg-primary/90 text-on-primary'
                  }`}
                >
                  <div className="flex items-center gap-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-on-primary/20 font-bold">
                      {item.number}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm">{item.title}</h3>
                  </div>
                  <span className="material-symbols-outlined">{item.active ? 'expand_more' : 'chevron_right'}</span>
                </div>
                <div className="border-t border-surface-variant bg-surface-container-lowest px-md py-sm">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ServicePromotion compact />
      <FaqSection id="faq-sst" eyebrow="Seguridad y salud en el trabajo" title="Preguntas frecuentes sobre SST" items={sstFaqs} />
    </div>
  );
}