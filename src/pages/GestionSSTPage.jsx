import RiskExplorer from '../components/RiskExplorer';

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
      description: 'Garantizamos adhesión estricta a normativas vigentes.',
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
  ];

  return (
    <div className="min-h-screen bg-background text-on-background pt-16">
      <section id="gestion-sst" className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Sitio de construcción con seguridad industrial"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AP1WRLtPDNDlIaKq4Z2KB6W0IR5g0rstwQDKHHD3OLJbtS1TiIH8OrQ0wCB771LPuRL4zcguvwywJ02ONjey5pNXOCZqjlHQoNH6-Lr9gM8euM4M7R12DkDc-hGJeCdNsVhBkQzATsMfTCFlpWwpMO86A2VknVDZb2fu_4q3pDWofJdpkSVjZmCK9eyOLbFaTJCPDj1slJVpxwR-AL4gXFz5noMzRDVbOEL41ZTCb4qKK2s3LtGR8fOzrJpTGV4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/25 via-primary/45 to-primary/60" />
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
                <div className="mb-sm flex h-16 w-16 items-center justify-center rounded-full bg-safety-green/10">
                  <span className="material-symbols-outlined text-3xl text-safety-green">{card.icon}</span>
                </div>
                <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">{card.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RiskExplorer />

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

      <section className="bg-surface py-xl">
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

      <section className="relative overflow-hidden bg-primary-container py-xl text-on-primary-container">
        <div className="absolute inset-0 opacity-10" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-margin-mobile text-center md:px-md">
          <div className="mx-auto mb-md flex h-20 w-20 items-center justify-center rounded-full bg-on-tertiary-container shadow-ambient">
            <span className="material-symbols-outlined text-4xl text-on-primary">smart_toy</span>
          </div>
          <h2 className="mb-sm font-headline-md text-headline-md text-on-primary">Asistente Virtual SST</h2>
          <p className="mb-lg font-body-md text-body-md text-on-primary/80">
            ¿Tienes dudas sobre normativa o seguridad? Pregunta a nuestro asistente virtual.
          </p>
          <div className="mx-auto flex max-w-xl flex-col justify-center gap-xs sm:flex-row">
            <input
              aria-label="Pregunta al asistente SST"
              className="flex-1 rounded border-2 border-transparent bg-surface-container-lowest px-md py-sm font-body-sm text-body-sm text-on-surface shadow-inner focus:border-primary"
              placeholder="Ej. ¿Norma para trabajo en alturas?"
              type="text"
            />
            <button className="whitespace-nowrap rounded bg-on-tertiary-container px-lg py-sm font-label-caps text-label-caps text-on-primary transition-colors hover:bg-tertiary-container">
              Preguntar
            </button>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-surface-container-lowest py-xl">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-md">
          <div className="grid grid-cols-1 items-center gap-lg md:grid-cols-2">
            <div>
              <h2 className="mb-sm font-headline-lg text-headline-lg text-primary">Solicitar Diagnóstico Inicial</h2>
              <p className="mb-lg font-body-md text-body-md text-on-surface-variant">
                Contáctenos para evaluar el estado actual de Seguridad y Salud en su obra. Un experto de G&G Construcción y SST S.A.S. se comunicará en breve.
              </p>
              <div className="space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-on-tertiary-container">location_on</span>
                  <span className="font-body-sm text-body-sm text-on-surface">Bogotá, Colombia</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-on-tertiary-container">mail</span>
                  <span className="font-body-sm text-body-sm text-on-surface">contacto@gygsst.com</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-surface-variant bg-surface p-md shadow-sm">
              <form className="space-y-sm">
                <div>
                  <label className="mb-xs block font-label-caps text-label-caps text-primary">Empresa</label>
                  <input className="w-full rounded border-2 border-outline-variant bg-surface-container-lowest px-sm py-xs font-body-sm text-body-sm text-on-surface focus:border-primary" type="text" />
                </div>
                <div>
                  <label className="mb-xs block font-label-caps text-label-caps text-primary">Correo Electrónico</label>
                  <input className="w-full rounded border-2 border-outline-variant bg-surface-container-lowest px-sm py-xs font-body-sm text-body-sm text-on-surface focus:border-primary" type="email" />
                </div>
                <div>
                  <label className="mb-xs block font-label-caps text-label-caps text-primary">Mensaje</label>
                  <textarea className="w-full rounded border-2 border-outline-variant bg-surface-container-lowest px-sm py-xs font-body-sm text-body-sm text-on-surface focus:border-primary" rows="4" />
                </div>
                <button className="mt-sm w-full rounded bg-primary px-lg py-sm font-label-caps text-label-caps text-on-primary transition-colors hover:bg-primary/90" type="submit">
                  Enviar Solicitud
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}